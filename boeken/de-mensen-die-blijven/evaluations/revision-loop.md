# Revisielus

## Pass 1 (8 november)

**Aanleiding:** audit_status: revise (2 hoge, 15 middel, 8 lage tickets; zie artifacts/10-adversarial-audit.md) + tickets uit de vier lezerspanels.

**Plan en uitvoering:** per hoofdstuk één revisiekandidaat (`work/attempts/chapter-NN/revision-r1.md`, gestaged in `stage-r1/`), gemaakt met een gecontroleerd vervangingsscript (`work/revision_r1.py`) plus enkele toegevoegde scènes (Sannes jaloezie in hfst. 6 en 10, het familieberaad als scène in hfst. 7, de wc-scène na de zitting in hfst. 11, wrijving op de verhuisdag en Brams kippenfoto in hfst. 12, de directievergadering in hfst. 3, de voicemail in hfst. 8, het keramieken visje in hfst. 9). Hoofdstuk 2 bleef ongewijzigd.

**Vergelijking:** per hoofdstuk vier anonieme A/B-lezers (`evaluations/compare-chNN-r1/`), gevalideerd met validate_blind_reader.py, beslist met decide_comparison.py, gepromoveerd met promote_chapter.py (backups in manuscript/chapters/.chapter-promotion-backups/). De eerste lezers draaiden als book-genesis-blind-reader-subagent; door een gebruikslimiet zijn de meeste lezers daarna als geïsoleerde algemene subagents gedraaid met dezelfde pakketten (zelfde modelfamilie; enkel packet/schema/catalogus gelezen).

| Hfst. | Stemmen (revisie : origineel) | Beslissing |
|---|---|---|
| 1 | 1 : 3 | verworpen (origineel blijft) |
| 3 | 4 : 0 | gepromoveerd |
| 5 | 0 : 4 | verworpen |
| 6 | 4 : 0 | gepromoveerd |
| 7 | 4 : 0 | gepromoveerd |
| 9 | 3 : 1 | gepromoveerd |
| 10 | 4 : 0 | gepromoveerd |
| 11 | 4 : 0 | gepromoveerd |
| 12 | 4 : 0 | gepromoveerd |
| 4, 8 | eerste bundel ongeldig (contexthoofdstuk was intussen gewijzigd); opnieuw gelezen in `-r1b` | zie hieronder |

**Gevolgen voor tickets:**
- Gesloten door gepromoveerde tekst (nog niet onafhankelijk hergecontroleerd): T-01, T-02, T-04, T-05, T-06, T-07, T-08, T-09 (deels), T-10, T-12, T-14, T-15, T-19, T-22, T-23, T-24, T-25, T3-01.
- Open door verwerping: hfst. 1 (T-03 deel, T-11 deel, **T-20 feitelijk: Marc 27 jaar bij de stad**, T1-01 kaft-uitleg), hfst. 5 (T-16).
