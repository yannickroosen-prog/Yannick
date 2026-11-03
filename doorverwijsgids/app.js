/* Doorverwijsgids Similes: viewer voor de beslissingsboom.
   Leest window.DG_FICHES (data/fiches.js) en window.DG_BOOM (data/boom.js).
   Geen externe afhankelijkheden; werkt op elke statische webserver en lokaal. */
(function () {
  "use strict";

  var DATA = window.DG_FICHES || { meta: {}, fiches: [] };
  var BOOM = window.DG_BOOM || { start: "start", stappen: {} };

  var FICHE = {};
  DATA.fiches.forEach(function (f) {
    (f.ids || [f.id]).forEach(function (id) { FICHE[id] = f; });
  });

  var STATUS_OK = { "Bevestigd": "ok", "Deels bevestigd": "deels", "Tegenstrijdige informatie": "rood" };

  var el = {
    stap: document.getElementById("stap"),
    kruimels: document.getElementById("kruimels"),
    zoekveld: document.getElementById("zoekveld"),
    zoekresultaat: document.getElementById("zoekresultaat"),
    acties: document.getElementById("acties"),
    terug: document.getElementById("knop-terug"),
    opnieuw: document.getElementById("knop-opnieuw"),
    kopieer: document.getElementById("knop-kopieer"),
    print: document.getElementById("knop-print"),
    voetInfo: document.getElementById("voet-info"),
    melding: document.getElementById("melding")
  };

  var pad = [];

  /* ---------- hulpfuncties ---------- */

  function h(tag, attrs, kinderen) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.indexOf("on") === 0) node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) node.setAttribute(k, attrs[k]);
      });
    }
    (kinderen || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function isUrl(s) { return /^https?:\/\//i.test(s || ""); }
  function isMail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || ""); }

  function korteUrl(u) {
    try {
      var x = new URL(u);
      var p = x.pathname.replace(/\/$/, "");
      var s = x.host.replace(/^www\./, "") + p;
      return s.length > 48 ? s.slice(0, 45) + "…" : s;
    } catch (e) { return u; }
  }

  /* "0800 13 500. Na je postcode ..." -> { nummer: "0800 13 500", nota: "Na je postcode ..." } */
  function splitsTelefoon(t) {
    var m = /^([0-9][0-9 .\/]*[0-9])(?:\.\s*|\s+)?(.*)$/.exec(t || "");
    if (!m) return { nummer: null, nota: t };
    return { nummer: m[1].trim(), nota: (m[2] || "").trim() };
  }

  function telHref(n) { return "tel:" + n.replace(/[^0-9+]/g, ""); }

  function meld(tekst) {
    el.melding.textContent = tekst;
    el.melding.classList.add("zichtbaar");
    clearTimeout(meld.t);
    meld.t = setTimeout(function () { el.melding.classList.remove("zichtbaar"); }, 2200);
  }

  function statusBadge(f) {
    var soort = STATUS_OK[f.status];
    var tekst = f.status;
    var klasse = "status-neen";
    if (soort === "ok") klasse = "status-ok";
    else if (soort === "deels") klasse = "status-deels";
    else if (soort === "rood") klasse = "status-rood";
    else tekst = "Nog niet nagekeken";
    return h("span", { class: "status " + klasse, text: tekst });
  }

  function contactLink(klasse, ikoon, label, href) {
    return h("a", { class: klasse, href: href, target: isUrl(href) ? "_blank" : null, rel: isUrl(href) ? "noopener" : null }, [
      h("span", { class: "contact-ikoon", "aria-hidden": "true", text: ikoon }), label
    ]);
  }

  /* ---------- fiche-kaart ---------- */

  function ficheKaart(f, volledig) {
    var kaart = h("li", { class: "fiche" + (volledig ? "" : " fiche-nn"), id: "fiche-" + f.id });

    kaart.appendChild(h("div", { class: "fiche-kop" }, [
      h("h3", { class: "fiche-naam", text: f.naam }),
      statusBadge(f),
      f.soort ? h("span", { class: "fiche-soort", text: f.soort }) : null
    ]));

    if (!volledig) {
      /* Niet nagekeken: alleen naam, website en de waarschuwing. Geen gegevens van 2023. */
      if (f.voorWie) kaart.appendChild(h("p", { class: "fiche-waarvoor", text: "Voor wie, volgens de gids van 2023: " + f.voorWie }));
      var c0 = h("div", { class: "contact" });
      (f.websites || (f.website ? [f.website] : [])).forEach(function (w) {
        if (isUrl(w)) c0.appendChild(contactLink("web", "↗", korteUrl(w), w));
      });
      if (c0.childNodes.length) kaart.appendChild(c0);
      kaart.appendChild(h("p", { class: "letop", text: f.letOp || "Nog niet nagekeken. Niet gebruiken om door te verwijzen." }));
      return kaart;
    }

    if (f.waarvoor) kaart.appendChild(h("p", { class: "fiche-waarvoor", text: f.waarvoor }));

    if (f.voorNaasten) {
      var positief = /^ja/i.test(f.voorNaasten) || /kan|kunnen|welkom|hoofddoelgroep/i.test(f.voorNaasten);
      var onbekend = /niet vermeld|te bevestigen|niet expliciet/i.test(f.voorNaasten) && !/^ja/i.test(f.voorNaasten);
      kaart.appendChild(h("p", { class: "fiche-naasten" + (onbekend || !positief ? " onbekend" : ""), text: "Voor naasten: " + f.voorNaasten }));
    }

    var contact = h("div", { class: "contact" });
    var telNota = null;
    if (f.telefoon) {
      var t = splitsTelefoon(f.telefoon);
      if (t.nummer) {
        contact.appendChild(contactLink("tel", "☎", t.nummer, telHref(t.nummer)));
        if (t.nota) telNota = t.nota;
      } else {
        contact.appendChild(h("span", { class: "contact-tekst", text: f.telefoon }));
      }
    }
    if (f.chat && isUrl(f.chat)) contact.appendChild(contactLink("chat", "💬", "Chat", f.chat));
    if (f.mail) {
      if (isMail(f.mail)) contact.appendChild(contactLink("mail", "✉", f.mail, "mailto:" + f.mail));
      else if (isUrl(f.mail)) contact.appendChild(contactLink("mail", "✉", "Mail", f.mail));
    }
    (f.websites || (f.website ? [f.website] : [])).forEach(function (w) {
      if (isUrl(w)) contact.appendChild(contactLink("web", "↗", korteUrl(w), w));
    });
    if (contact.childNodes.length) kaart.appendChild(contact);
    if (telNota) kaart.appendChild(h("span", { class: "tel-nota", text: telNota }));

    var feiten = h("dl", { class: "feiten" });
    [["Uren", f.uren], ["Kosten", f.kosten], ["Anoniem", f.anoniem], ["Regio", f.regio]].forEach(function (p) {
      if (!p[1]) return;
      feiten.appendChild(h("dt", { text: p[0] }));
      feiten.appendChild(h("dd", {}, linkify(p[1])));
    });
    if (feiten.childNodes.length) kaart.appendChild(feiten);

    if (f.letOp) kaart.appendChild(h("p", { class: "letop" }, [h("strong", { text: "Let op" }), f.letOp]));

    var meer = h("dl", { class: "feiten" });
    [["Voor wie", f.voorWie], ["Fiche", (f.ids || [f.id]).join(", ")], ["Nagekeken op", f.gecontroleerd],
     ["Trefwoorden", (f.trefwoorden || []).join(", ")]].forEach(function (p) {
      if (!p[1]) return;
      meer.appendChild(h("dt", { text: p[0] }));
      meer.appendChild(h("dd", { text: p[1] }));
    });
    if (f.bron && f.bron.length) {
      meer.appendChild(h("dt", { text: "Bron" }));
      var dd = h("dd");
      f.bron.forEach(function (b, i) {
        if (i) dd.appendChild(document.createTextNode(" · "));
        dd.appendChild(isUrl(b) ? h("a", { href: b, target: "_blank", rel: "noopener", text: korteUrl(b) }) : document.createTextNode(b));
      });
      meer.appendChild(dd);
    }
    kaart.appendChild(h("details", {}, [h("summary", { text: "Meer over deze fiche" }), meer]));

    return kaart;
  }

  /* Maakt van URL's in een tekst klikbare links. */
  function linkify(tekst) {
    var delen = String(tekst).split(/(https?:\/\/[^\s]+)/g);
    return delen.map(function (d) {
      if (isUrl(d)) {
        var schoon = d.replace(/[.,;:]+$/, "");
        return h("a", { href: schoon, target: "_blank", rel: "noopener", text: korteUrl(schoon) });
      }
      return d;
    });
  }

  function fichesLijst(ids, volledig) {
    var ul = h("ul", { class: "fiches" });
    ids.forEach(function (id) {
      var f = FICHE[id];
      if (!f) { ul.appendChild(h("li", { class: "fiche fiche-nn", text: "Fiche " + id + " ontbreekt in data/fiches.js." })); return; }
      var mag = !!STATUS_OK[f.status];
      ul.appendChild(ficheKaart(f, volledig && mag));
    });
    return ul;
  }

  /* ---------- stap tonen ---------- */

  function huidigeStap() { return BOOM.stappen[pad[pad.length - 1]]; }

  function toonStap() {
    var id = pad[pad.length - 1];
    var s = BOOM.stappen[id];
    el.zoekresultaat.hidden = true;
    el.stap.hidden = false;
    el.stap.innerHTML = "";

    if (!s) {
      el.stap.appendChild(h("div", { class: "kaart" }, [h("h1", { text: "Stap niet gevonden" }), h("p", { class: "uitleg", text: "De stap '" + id + "' bestaat niet in data/boom.js." })]));
      return;
    }

    var kaart = h("div", { class: "kaart" });
    kaart.appendChild(h("h1", { text: s.vraag }));
    if (s.uitleg) kaart.appendChild(h("p", { class: "uitleg", text: s.uitleg }));
    if (s.alert) {
      kaart.appendChild(h("div", { class: "alert alert-" + (s.alert.soort || "letop"), role: "alert" }, [
        h("span", { class: "alert-ikoon", "aria-hidden": "true", text: "!" }), h("span", { text: s.alert.tekst })
      ]));
    }
    if (s.vraagTip) {
      kaart.appendChild(h("div", { class: "vraagtip" }, [h("span", { class: "etiket", text: "Wat je kan vragen" }), h("p", { text: s.vraagTip })]));
    }
    if (s.nood && s.nood.length) {
      var nl = h("ul", { class: "nood-lijst" });
      s.nood.forEach(function (n) {
        nl.appendChild(h("li", {}, [h("a", { class: "nood-kaart", href: telHref(n.nummer) }, [
          h("span", { class: "nood-nummer", text: n.nummer }), h("span", { class: "nood-tekst", text: n.tekst })
        ])]));
      });
      kaart.appendChild(nl);
    }
    if (s.zeg) {
      kaart.appendChild(h("div", { class: "zeg" }, [h("span", { class: "etiket", text: "Wat je kan zeggen" }), h("p", { text: s.zeg })]));
    }

    var heeftResultaat = (s.fiches && s.fiches.length) || (s.nietNagekeken && s.nietNagekeken.length);
    var opties = s.opties || [];

    if (opties.length && !heeftResultaat) {
      kaart.appendChild(optiesLijst(opties, false));
    }
    el.stap.appendChild(kaart);

    if (s.fiches && s.fiches.length) {
      el.stap.appendChild(h("h2", { text: "Verwijs door naar" }));
      el.stap.appendChild(fichesLijst(s.fiches, true));
    }

    if (s.nietNagekeken && s.nietNagekeken.length) {
      var d = h("details", { class: "nn-kader" }, [
        h("summary", { text: "Nog niet nagekeken (" + s.nietNagekeken.length + ")" }),
        h("p", { class: "nn-waarschuwing", text: "Deze gegevens komen uit de gids van 2023 en zijn nog niet nagekeken. Verwijs er niet actief naar. Zeg dat het nog niet is nagekeken en verwijs naar de website van de organisatie." }),
        fichesLijst(s.nietNagekeken, false)
      ]);
      el.stap.appendChild(d);
    }

    if (opties.length && heeftResultaat) {
      var vervolg = h("div", { class: "kaart opties-vervolg" }, [h("h2", { text: "Verder" }), optiesLijst(opties, true)]);
      el.stap.appendChild(vervolg);
    }

    el.kopieer.hidden = !(s.fiches && s.fiches.length);
    el.terug.disabled = pad.length <= 1;
    toonKruimels();
    schrijfHash();
    el.stap.focus({ preventScroll: true });
    var top = el.kruimels.getBoundingClientRect().top + window.scrollY - 60;
    if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function optiesLijst(opties, klein) {
    var ul = h("ul", { class: "opties" });
    opties.forEach(function (o, i) {
      var knop = h("button", { type: "button", class: "optie", "data-naar": o.naar, onclick: function () { kies(o.naar); } }, [
        h("span", { class: "optie-nr", "aria-hidden": "true", text: String(i + 1) }),
        h("span", { class: "optie-tekst" }, [
          h("span", { class: "optie-label", text: o.label }),
          o.uitleg ? h("span", { class: "optie-uitleg", text: o.uitleg }) : null
        ]),
        h("span", { class: "optie-pijl", "aria-hidden": "true", text: "›" })
      ]);
      ul.appendChild(h("li", {}, [knop]));
    });
    return ul;
  }

  function toonKruimels() {
    el.kruimels.innerHTML = "";
    pad.forEach(function (id, i) {
      var s = BOOM.stappen[id];
      var laatste = i === pad.length - 1;
      if (i) el.kruimels.appendChild(h("span", { class: "kruimel-pijl", "aria-hidden": "true", text: "›" }));
      el.kruimels.appendChild(h("button", {
        type: "button", class: "kruimel", "aria-current": laatste ? "step" : null,
        text: s ? s.vraag : id,
        onclick: function () { if (!laatste) { pad = pad.slice(0, i + 1); toonStap(); } }
      }));
    });
  }

  function kies(naar) {
    if (!BOOM.stappen[naar]) { meld("Stap '" + naar + "' bestaat niet."); return; }
    pad.push(naar);
    toonStap();
  }

  function terug() {
    if (pad.length > 1) { pad.pop(); toonStap(); }
  }

  function opnieuw() {
    pad = [BOOM.start];
    el.zoekveld.value = "";
    toonStap();
  }

  /* ---------- URL-hash: pad delen en herladen ---------- */

  function schrijfHash() {
    var nieuw = "#" + pad.join("/");
    if (location.hash !== nieuw) history.replaceState(null, "", nieuw);
  }

  function leesHash() {
    var hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!hash) return [BOOM.start];
    var delen = hash.split("/").filter(Boolean);
    var geldig = delen.every(function (d) { return !!BOOM.stappen[d]; });
    return geldig && delen.length ? delen : [BOOM.start];
  }

  /* ---------- samenvatting kopiëren ---------- */

  function samenvatting() {
    var s = huidigeStap();
    var regels = ["Doorverwijzing (" + s.vraag + "):"];
    (s.fiches || []).forEach(function (id) {
      var f = FICHE[id];
      if (!f || !STATUS_OK[f.status]) return;
      var delen = [f.naam];
      if (f.telefoon) delen.push(splitsTelefoon(f.telefoon).nummer || f.telefoon);
      if (f.website) delen.push(f.website);
      regels.push("- " + delen.join(" · "));
    });
    regels.push("Bron: Doorverwijsgids Similes, versie " + (DATA.meta.versiedatum || ""));
    return regels.join("\n");
  }

  function kopieer() {
    var tekst = samenvatting();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(function () { meld("Samenvatting gekopieerd"); }, function () { fallbackKopie(tekst); });
    } else fallbackKopie(tekst);
  }

  function fallbackKopie(tekst) {
    var ta = h("textarea", { style: "position:fixed;left:-9999px" });
    ta.value = tekst;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); meld("Samenvatting gekopieerd"); } catch (e) { meld("Kopiëren lukte niet"); }
    document.body.removeChild(ta);
  }

  /* ---------- zoeken ---------- */

  function normaliseer(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function zoek(q) {
    var n = normaliseer(q).trim();
    if (n.length < 2) {
      el.zoekresultaat.hidden = true;
      el.stap.hidden = false;
      return;
    }
    var termen = n.split(/\s+/);
    var treffers = DATA.fiches.map(function (f) {
      var velden = [f.naam, (f.trefwoorden || []).join(" "), f.waarvoor, f.voorWie, f.soort, f.thema, f.regio, f.telefoon].map(normaliseer).join(" | ");
      var naam = normaliseer(f.naam);
      var score = 0;
      var alles = termen.every(function (t) {
        if (naam.indexOf(t) >= 0) score += 3;
        else if (velden.indexOf(t) >= 0) score += 1;
        else return false;
        return true;
      });
      if (!alles) return null;
      if (STATUS_OK[f.status]) score += 2;
      return { f: f, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; });

    el.stap.hidden = true;
    el.zoekresultaat.hidden = false;
    el.zoekresultaat.innerHTML = "";
    el.zoekresultaat.appendChild(h("h1", { text: treffers.length ? "Zoekresultaat voor “" + q.trim() + "”" : "Niets gevonden voor “" + q.trim() + "”" }));
    if (!treffers.length) {
      el.zoekresultaat.appendChild(h("p", { class: "leeg", text: "Staat het niet in de gids? Zeg dat dan en verwijs naar de website van de organisatie. Of volg de beslissingsboom: wis het zoekveld." }));
      return;
    }
    var ok = treffers.filter(function (t) { return STATUS_OK[t.f.status]; });
    var nn = treffers.filter(function (t) { return !STATUS_OK[t.f.status]; });
    if (ok.length) el.zoekresultaat.appendChild(fichesLijst(ok.map(function (t) { return t.f.id; }), true));
    if (nn.length) {
      el.zoekresultaat.appendChild(h("details", { class: "nn-kader", open: ok.length ? null : "" }, [
        h("summary", { text: "Nog niet nagekeken (" + nn.length + ")" }),
        h("p", { class: "nn-waarschuwing", text: "Gegevens van 2023, nog niet nagekeken. Verwijs er niet actief naar." }),
        fichesLijst(nn.map(function (t) { return t.f.id; }), false)
      ]));
    }
  }

  /* ---------- toetsen ---------- */

  document.addEventListener("keydown", function (e) {
    var inVeld = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.key === "/" && !inVeld) { e.preventDefault(); el.zoekveld.focus(); el.zoekveld.select(); return; }
    if (e.key === "Escape") {
      if (inVeld && el.zoekveld.value) { el.zoekveld.value = ""; zoek(""); el.zoekveld.blur(); return; }
      if (!inVeld) { opnieuw(); }
      return;
    }
    if (inVeld) return;
    if (e.key === "Backspace") { e.preventDefault(); terug(); return; }
    if (/^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var knoppen = el.stap.querySelectorAll(".optie");
      var k = knoppen[parseInt(e.key, 10) - 1];
      if (k) { e.preventDefault(); k.click(); }
    }
  });

  el.zoekveld.addEventListener("input", function () { zoek(el.zoekveld.value); });
  el.terug.addEventListener("click", terug);
  el.opnieuw.addEventListener("click", opnieuw);
  el.kopieer.addEventListener("click", kopieer);
  el.print.addEventListener("click", function () {
    el.stap.querySelectorAll("details").forEach(function (d) { d.open = true; });
    window.print();
  });
  window.addEventListener("hashchange", function () {
    var nieuw = leesHash();
    if (nieuw.join("/") !== pad.join("/")) { pad = nieuw; toonStap(); }
  });

  /* ---------- start ---------- */

  var aantalOk = DATA.fiches.filter(function (f) { return !!STATUS_OK[f.status]; }).length;
  el.voetInfo.textContent = (DATA.meta.titel || "Doorverwijsgids Similes") + " · versie " + (DATA.meta.versiedatum || "?") +
    " · " + aantalOk + " nagekeken fiches, " + (DATA.fiches.length - aantalOk) + " nog niet nagekeken · " +
    (DATA.meta.status || "") + " · Vragen over deze gids: info@similes.be";

  pad = leesHash();
  toonStap();
})();
