# Mesterséges Intelligencia Etika - Harmadik Óra Összefoglaló 🎓

## Bevezetés és Az Óra Áttekintése 👨‍🏫

Sziasztok! A mai órán mélyebben belemegyünk a gépi tanulási modellek torzításaiba és méltányossági kérdéseibe. Az óra fő célja, hogy:

- Megértsük a különböző típusú torzításokat a modellekben
- Gyakorlati eszközökkel mérjük a méltányosságot
- Kipróbáljuk a **Google PAIR Explorables** interaktív eszközeit
- Megtanuljuk, hogyan lehet manipulálni a nagy nyelvi modelleket

## A Torzítások Háromféle Típusa 🧠

### `1.` Emberi Kognitív Torzítások
Az első típusú torzítás az emberi döntéshozatalból származik:
- Az *troli problémánál* látott etikai dilemmák
- Különböző emberek különbözőképpen döntenek ugyanabban a helyzetben
- Ezek a torzítások beépülnek az adatok gyűjtésébe és címkézésébe

### `2.` RLHF (Reinforcement Learning from Human Feedback) Torzítások
A második típus a modell finomhangolása során keletkezik:
- Az emberek értékelik a modell válaszait
- Saját kulturális és társadalmi torzításaikat beviszik a folyamatba
- A modell "szociálisan érzékenyítetté" válik, de torzított módon

### `3.` Algoritmusspecifikus Torzítások
A harmadik típus magában az algoritmusban rejlik:
- A **Transformer** és **LSTM** modellek működéséből adódik
- Az *attention mechanism* nem egyenletesen súlyoz
- A *pretraining* fázisban már beépülhetnek torzítások

## Google PAIR Explorables - Praktikus Eszközök 🔬

A mai órán a **Google PAIR (People + AI Research)** laboratórium eszközeit használjuk a méltányosság vizsgálatára. Ezek interaktív szimulációk, amelyek segítenek megérteni a bias problémákat.

### Measuring Fairness Tool
Ez az eszköz lehetővé teszi, hogy:
- Különböző méltányossági metrikákat alkalmazunk
- Valós adathalmazokon teszteljük a modelleket
- Megértsük a *precision* és *recall* közötti trade-off-okat

## Rejtett Torzítás a Modellben (Bias Has Hidden) 🕵️‍♂️

### A Mintavételezési Probléma
Egyik leggyakoribb probléma, hogy:
- A tréning adathalmaz nem reprezentatív
- Egyes csoportok alulreprezentáltak
- A modell másképp teljesít különböző csoportokra

### Gyakorlati Példa: Az Amazon-os Játék Visszatérése
Emlékeztek a **Survival of the Best Fit** játékra? Itt egy konkrét példa:
- A modell megtanulta, hogy a CV-ben lévő `1-2` éves szünet negatív jel
- Ez azonban különbözőképpen érint nőket és férfiakat
- Nők esetében ez gyakran gyermekszülés miatti szünet
- A modell így indirekt módon diszkriminált nemek alapján

## Orvosi Diagnosztikai Példa 🏥

### A Probléma Felállítása
Az órán részletesen megnéztünk egy orvosi diagnosztikai esetet:
- Van egy betegség, ami különbözőképpen fordul elő felnőtteknél és gyerekeknél
- Ugyanazt a tesztet alkalmazzuk mindkét korosztályra
- Az eredmények torzítottak lehetnek

### Gyerek vs. Felnőtt Modell Dilemma
- **Gyerekmodell**: `81%`-os pontosság
- **Felnőttmodell**: `57%`-os pontosság
- Kérdés: Melyik legyen agresszívabb?
- Kevésbé agresszív = kevesebb hamis pozitív, de több hamis negatív

### Fairness Mérési Stratégiák
Két fő megközelítés:
1. **Egyéni méltányosság**: Minden egyes ember ugyanolyan kezelést kap
2. **Csoportos méltányosság**: A csoportok között egyenlő az eredmény

## Modellek Komplexitása és Torzítás 📊

### Egyszerű vs. Összetett Modellek
- **Egyszerű modellek** (pl. lineáris regresszió): Könnyebb interpretálni, de korlátozott
- **Összetett modellek** (pl. `5` mélységű döntési fa): Pontosabb, de nehezebb megérteni

### Overfitting és Bias
- A túl összetett modellek *overfitting*-et okozhatnak
- Ez új típusú torzításokat hozhat létre
- Egyensúlyt kell találni a pontosság és méltányosság között

## Korrekciós Faktorok és Megoldások ⚖️

### Google Módszer
A Google egy korrekciós faktort alkalmaz:
- Azonosítják a torzított dimenziókat
- Ellensúlyozó faktort vezetnek be
- Vigyázni kell a túlkorrekcióra is

### Praktikus Megoldások
1. **Szeparált modellek**: Különböző csoportokra különböző modellek
2. **Súlyozott tréning**: Alulreprezentált csoportok nagyobb súlya
3. **Folyamatos monitoring**: Rendszeres bias auditok

## Nagy Nyelvi Modellek Manipulálása 🎯

### A Következő Óra Előkészítése
Holnapra készüljetek fel arra, hogy:
- Megpróbáljunk "becsapni" nagy nyelvi modelleket
- Különböző prompt engineering technikákat használunk
- Megértsük, hogyan lehet a system prompt-ot manipulálni

### Három Kategória
Az előző órán felírt három kategória mindegyikében próbálunk majd torzításokat kiváltani:
1. Emberi kognitív torzítások
2. RLHF torzítások  
3. Algoritmusspecifikus torzítások

## :pencil: Házi Feladat

1. **Google PAIR Explorables Kipróbálása**
   - Lépj be a [PAIR Explorables](https://pair.withgoogle.com/explorables/) oldalra
   - Próbáld ki a "Measuring Fairness" eszközt
   - Készíts jegyzetet arról, milyen fairness metrikákat láttál

2. **Bias Azonosítás**
   - Gondolj egy olyan rendszerre (app, weboldal, szolgáltatás), amit napi szinten használsz
   - Azonosíts legalább `2` potenciális bias forrást
   - Írd le, hogyan befolyásolhatja ez a különböző felhasználói csoportokat

3. **Orvosi Példa Elemzése**
   - Az órán tárgyalt orvosi diagnosztikai példa alapján
   - Döntsd el, melyik stratégiát választanád (agresszívebb vs. kevésbé agresszív)
   - Indokold meg a választásodat etikai szempontból

## :crystal_ball: Következő Óra Előnézet

Holnap:
- **Prompt Engineering**: Hogyan manipuláljunk nagy nyelvi modelleket
- **Jailbreaking technikák**: Biztonsági korlátok megkerülése  
- **Interaktív workshop**: Közösen próbálunk ki különböző technikákat
- **RLHF platformok**: Gyakorlati tapasztalatszerzés

Szerda:
- Közös óra a **Reinforcement Learning** kurzussal
- Rövid előadásom a tanultak összefoglalásáról

## További Erőforrások 🔗

### Google PAIR Eszközök
- [Measuring Fairness](https://pair.withgoogle.com/explorables/measuring-fairness/) - Méltányosság mérésének interaktív eszköze
- [Hidden Bias](https://pair.withgoogle.com/explorables/hidden-bias/) - Rejtett torzítások feltárása
- [PAIR Explorables Main Page](https://pair.withgoogle.com/explorables/) - Az összes interaktív eszköz

### Fairness és Bias Kutatás
- [Fairness in Machine Learning](https://fairmlbook.org/) - Átfogó könyv a gépi tanulás méltányosságáról
- [AI Fairness 360](https://aif360.mybluemix.net/) - IBM nyílt forráskódú fairness eszköztár
- [Google AI Principles](https://ai.google/principles/) - Google AI etikai irányelvei

### Orvosi AI Etika
- [Ethics in Medical AI](https://www.nature.com/articles/s41591-019-0548-6) - Nature Medicine cikk
- [Bias in Healthcare AI](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6347576/) - Orvosi AI torzítások kutatása

### Prompt Engineering és Jailbreaking
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) - Hivatalos útmutató
- [Jailbreaking AI Systems](https://arxiv.org/abs/2307.02483) - Akadémiai kutatás a témában
- [RLHF Paper](https://arxiv.org/abs/2203.02155) - Az RLHF módszer tudományos háttere

### Magyar nyelvű források
- [SZTAKI AI Kutatóközpont](https://www.sztaki.hu/tudomany/osztaly/intelligens-informatikai-rendszerek-laboratorium) - Magyar AI kutatás
- [Digitális Jólét Program - AI Etika](https://digitalisjoletprogram.hu/hu/tartalom/mesterseges-intelligencia-etikai-keretek) - Hivatalos magyar AI etikai irányelvek
- [MTA AI Munkacsoport](https://mta.hu/mta_hirei/mesterseges-intelligencia-munkacsoport-109124) - Magyar Tudományos Akadémia AI kutatásai

---

*Megjegyzés: A mai óra gyakorlati fókuszú volt. A Google PAIR eszközök kipróbálása elengedhetetlen a méltányossági kérdések megértéséhez. Holnap még gyakorlatibb lesz - hozzatok magátokkal kérdéseket és ötleteket a prompt engineering workshophoz!* 