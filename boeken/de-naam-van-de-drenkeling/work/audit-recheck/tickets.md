# Tickets om te hercontroleren

De tickets staan hieronder zoals ze geformuleerd waren. Je krijgt geen status of reparatiegeschiedenis.

T-01 | severity: high | class: structural
contract: exact
where: chapter-02, paragraphs 7, 17, 23 to 24; chapter-06, paragraph 28; chapter-11, paragraph 17
quote: "Ik kan gaan waarheen ik wil, behalve naar een dag die ik al geleefd heb. Daar is de deur dicht." (hfst. 2, al. 7) / "Op vrijdag 9 mei 1884 las ik in een krant uit Southampton" (hfst. 2, al. 17) / "Toen het licht werd, ben ik teruggesprongen naar 19 mei, de dag van vertrek. Ik had alle dagen tussen 9 mei en december overgeslagen. Ik had er één nodig." (hfst. 2, al. 23) / "Ik weet nu dat het de enige dag was die ik hem gaf, en dat ik er niet over heb nagedacht of het genoeg was." (hfst. 2, al. 24) / "Ik kon gaan. Op elk moment, in elke nacht, kon ik opstaan van de vloer van de kajuit en weg zijn." (hfst. 11, al. 17)
problem: Het boek beantwoordt Pieters eerste bezwaar ('Waarom springt hij niet gewoon opnieuw?') met de regel dat een beleefde dag dicht is. De eigen tijdlijn laat echter negen onbeleefde dagen vóór de afvaart open: 10 tot en met 18 mei 1884. De graaf leefde tot 9 mei en sprong toen naar december. Op die negen dagen tekende Richard aan, en koos Dudley 'uit de twaalf die hij die week had gezien' (hfst. 6, al. 28). Na de mislukking op 19 mei, en op elke nacht aan boord (hfst. 11, al. 17), kan de graaf dus naar 18 mei springen en het opnieuw proberen. Kanttekening hfst. 2, al. 24 stelt dat 19 mei 'de enige dag was die ik hem gaf'. Volgens de eigen regel is dat onwaar, en de tekst merkt het nergens op. Daarmee vervalt het opnieuw-proberen-contract (02, regel 3) en de motor van 'geen weg terug' (02, beweging 1). Een vijandige lezer stopt hier.
smallest fix: Laat de graaf de dagen tot en met 18 mei zelf beleven. Hij leest het krantenbericht bijvoorbeeld op zondagavond 18 mei, of hij leeft na het bericht nog door tot 18 mei en springt dan pas naar december. Dan is 19 mei werkelijk de enige onbeleefde dag vóór de afvaart. Pas hfst. 2, al. 17 en 23 aan, en daarmee in één beweging register T-03/T-04, de geblokkeerde dagen en 02-tijdlijn ("begin mei"). Laat kanttekening al. 24 daarna kloppen.
preserve: "Ik weet nu dat het de enige dag was die ik hem gaf, en dat ik er niet over heb nagedacht of het genoeg was." (hfst. 2, al. 24)
evidence: pass 0 (0.7) en pass 8; 02-story-engine causaal contract 1 en 3; register W-01 en "Geblokkeerde dagen"; causality.md ("Test exceptions against earlier demonstrations")
```

```text

T-02 | severity: high | class: continuity
where: chapter-21, paragraphs 23 to 24; chapter-05, paragraphs 40 to 44; chapter-21, paragraph 17
quote: "Ik had het daar geschreven omdat ik het in dit boek had gelezen. En het stond in dit boek omdat ik het in deze keuken had verteld, en omdat de man tegenover mij de stilte van een jongen niet kon verdragen en hem een stem had gegeven die niet de zijne was." / "Ik had die zin zesenveertig jaar met me meegedragen. Ik had hem aan de echte jongen toegeschreven. En hij kwam van mij." (hfst. 21, al. 23–24) tegenover "Ik had dat geweten. Ik had het in 1838 opgeschreven, met 'merkwaardig' eronder." (hfst. 5, al. 40) en "Ik had in die nacht aan de Strand twee jongens door elkaar gehaald. Ik had van de echte de dood genomen en van de verzonnen het karakter." (hfst. 5, al. 44)
problem: Dit is de centrale herkenning van het boek, en ze spreekt hfst. 5 op twee punten tegen. (1) Duur. In hfst. 5 schrijft de graaf het offer pas in één nacht in december 1884 toe aan de echte jongen. Zesenveertig jaar lang was Pyms Parker een verzonnen figuur zonder echte tegenhanger: de echte Richard kent hij pas sinds 9 mei 1884. "Zesenveertig jaar […] aan de echte jongen toegeschreven" is dus onwaar. (2) Bron. De graaf heeft Poe juist het tegendeel verteld ('Dat heb ik u verteld. In deze keuken. Hier.', hfst. 21, al. 17). De zin "zal zelf het lot voorstellen" komt van Poe. Van de graaf komen alleen de naam en de jongen. "En hij kwam van mij" klopt alleen voor de naam. De lus Poe – graaf – geschiedenis is de intellectuele belofte van het boek (02, lezersbehoefte), en juist die schakel is hier slordig. De uitleg van twee alinea's komt bovendien na een beeld dat al werkt: de drukproef met Parkers voorstel (al. 13–14).
smallest fix: Maak al. 24 kloppend met hfst. 5. De naam droeg hij zesenveertig jaar mee. De zin schreef hij één nacht toe aan de echte jongen. En hij is de bron van de naam, niet van de zin. Schrap of kort de uitleg in al. 23 in tot de ene correcte schakel: zonder zijn verhaal geen Parker bij Poe.
preserve: "Ik las het een tweede keer. Ik las het zoals Richard las, met mijn vinger onder de regel." (hfst. 21, al. 14)
evidence: pass 8 en pass 10; register K-01 ("De graaf weet het sinds 1838 maar 'ziet' het pas in hfst. 5"); pass 3 (uitleg na het beeld)
```

```text

T-03 | severity: high | class: continuity
where: chapter-03, paragraph 59; chapter-19, paragraph 8; chapter-21, paragraph 37
quote: "'Gij komt niet terug,' zei ik. 'Dat staat vast. Dat heb ik gelezen.'" (hfst. 3, al. 59) tegenover "Ik had het nooit eerder gedaan. Ik had zes weken en twintig dagen 'u' gezegd" (hfst. 19, al. 8) en "Ik had het nooit tegen iemand anders gezegd dan tegen hem." (hfst. 21, al. 37)
problem: Het enige 'ge' van de graaf is het merkteken van de wacht, en de verteller beweert twee keer uitdrukkelijk dat het uniek is. Al op 19 mei spreekt hij Richard echter met 'Gij' aan. Een zorgvuldige lezer ziet het, en dan valt de onthulling in hfst. 21 (het 'ge' in 'Wilt ge dat ik blijf?') plat.
smallest fix: Verander in hfst. 3, al. 59 'Gij komt' in 'U komt'.
preserve: "'Dat staat vast. Dat heb ik gelezen.'" (hfst. 3, al. 59)
evidence: pass 8 en pass 2; 05-voice ("Pas in hoofdstuk 19 zegt de graaf één keer 'ge'"); register C-01 "Spreekt Richard aan met"
```

```text
