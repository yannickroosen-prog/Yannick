/*
 * Warme Babbel – embed helper voor WordPress (of elke andere site).
 *
 * Gebruik in een "Aangepaste HTML"-blok:
 *
 *   <iframe id="warme-babbel" src="https://app.warmebabbel.be/profielen?embed=1"
 *           title="Warme Babbel" style="width:100%;border:0;min-height:600px" allow="clipboard-write"></iframe>
 *   <script src="https://app.warmebabbel.be/embed.js" data-iframe="warme-babbel" defer></script>
 *
 * Het script luistert naar hoogte-berichten van de app en past de iframe-hoogte aan, zodat er geen
 * dubbele scrollbalk ontstaat. Het accepteert enkel berichten van het domein van de iframe zelf.
 */
(function () {
  var script = document.currentScript;
  var id = (script && script.getAttribute("data-iframe")) || "warme-babbel";
  var frame = document.getElementById(id);
  if (!frame) return;
  var origin;
  try { origin = new URL(frame.getAttribute("src"), location.href).origin; } catch (e) { return; }

  window.addEventListener("message", function (event) {
    if (event.origin !== origin || !event.data || event.data.source !== "warme-babbel") return;
    if (event.data.type === "height" && typeof event.data.height === "number") {
      frame.style.height = Math.max(400, Math.ceil(event.data.height) + 8) + "px";
    }
    if (event.data.type === "scroll-top") {
      var top = frame.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: top < 0 ? 0 : top, behavior: "smooth" });
    }
    if (event.data.type === "navigate-top" && typeof event.data.url === "string" && event.data.url.indexOf(origin) === 0) {
      // De app vraagt om buiten de iframe te openen (bv. voor inloggen wanneer cookies geblokkeerd zijn).
      window.open(event.data.url, "_blank", "noopener");
    }
  });
})();
