# 📊 Adatvizualizáció és Gépi Tanulás - Órai Összefoglaló

## 🎯 Fő Témák

### 📁 Adatbeolvasás és Előfeldolgozás
Az órán a [Google Colab](https://colab.research.google.com/) platformon folytattuk a munkát, ahol Excel fájlokat olvastunk be `pandas` segítségével. A fő hangsúly az adattípusok helyes beállításán volt:

- **Folytonos változók**: számértékek megfelelő típusként
- **Rendezett változók**: ordinális adatok kezelése  
- **Névleges változók**: kategoriális adatok objektum típusként

```python
import pandas as pd
df = pd.read_excel('összesített_rangsorok.xlsx', sheet_name='rangsorok')
df.info()  # Adattípusok ellenőrzése
```

### 🔢 Dimenziócsökkentés PCA-val
Bemutattuk a *Principal Component Analysis* (PCA) módszerét `64` dimenziós adatok `2` dimenzióra történő leképezésére:

- **Felügyeletlen tanulás** alkalmazása
- **X mátrix**: numerikus adatok oszlopai
- **Labels**: csapat azonosítók címkézéshez
- Adatstruktúra átalakítás `.values` módszerrel

```python
from sklearn.decomposition import PCA
X = df2.drop('ID', axis=1).values
labels = df2['ID'].values
pca = PCA(n_components=2)
```

### 🎨 Adatvizualizáció és Plotolás
Az órán részletesen foglalkoztunk a dimenziócsökkentett adatok vizualizációjával:

- **Scatter plot** készítése a PCA komponensekkel
- **Színkódolás** csapatok szerint
- **Matplotlib** és **seaborn** használata

### 🤖 Felügyelt Tanulás Pipeline-jai
Bemutattuk a gépi tanulási pipeline építését:

- **Train-test split** alkalmazása
- **Predict** műveletek végrehajtása
- **Modell teljesítmény** értékelése
- **`2024`-es adatok** predikciója `2019-2022`-es adatokból

### 📈 Predikciós Modellek Fejlesztése
Az órán tárgyaltuk a modellek javításának lehetőségeit:

- **Csapatnevek normalizálása** a konzisztencia érdekében
- **Több év adatainak** integrálása
- **Hiányos adatok** kezelése (csak összpontszám vagy helyezés)
- **Modell komplexitás** optimalizálása

## 🔧 Gyakorlati Eszközök és Technikák

### Használt Könyvtárak
- [`pandas`](https://pandas.pydata.org/docs/) - adatkezelés és analízis
- [`scikit-learn`](https://scikit-learn.org/stable/) - gépi tanulási algoritmusok
- [`matplotlib`](https://matplotlib.org/) - alapvető plotolás
- [`numpy`](https://numpy.org/doc/) - numerikus számítások

### Adatkezelési Műveletek
- `df.drop()` - oszlopok eltávolítása
- `df.info()` - adatstruktúra vizsgálata
- `.values` - DataFrame array-vé konvertálása
- Évszámok ordinális változókká alakítása

### Platformok
- **[Google Colab](https://colab.research.google.com/)** - felhőalapú notebook környezet
- **[Discord](https://discord.com/)** - kurzus kommunikáció

## 📝 Házi Feladat :pencil:

Készítsetek egy teljes gépi tanulási projektet a következő lépésekkel:

1. **Adatok normalizálása**: 
   - Csapatnevek egységesítése az évek között
   - Hiányos adatok kezelési stratégiájának kidolgozása

2. **Komplex modell építése**:
   - Több év adatainak integrálása (2006-2024)
   - Felügyeletlen és felügyelt tanulás kombinálása
   - PCA dimenziócsökkentés + predikciós modell

3. **Dokumentáció készítése**:
   - Google Colab notebook létrehozása
   - Részletes kommentekkel ellátott kód
   - Vizualizációk és eredmények értelmezése
   - Modell teljesítmény elemzése

4. **Prezentáció előkészítése**:
   - Eredmények összegzése
   - Módszertan bemutatása
   - Jövőbeli fejlesztési lehetőségek

**Határidő**: A következő órára, amikor közösen bemutatjuk a projekteket.

## 🔮 Következő Óra Témái :crystal_ball:

- **Projekt bemutatók** értékelése és megbeszélése
- **Ensemble modellek** bevezetése (Random Forest, Gradient Boosting)
- **Hiperparaméter optimalizálás** technikái
- **Cross-validation** és **overfitting** kezelése
- **Feature engineering** speciális technikái sportadatokhoz
- **Idősor elemzés** és trendek azonosítása

## 🌐 Hasznos Források

### Dokumentációk
- [Pandas User Guide](https://pandas.pydata.org/docs/user_guide/index.html)
- [Scikit-learn Tutorials](https://scikit-learn.org/stable/tutorial/index.html)
- [PCA magyarázat](https://scikit-learn.org/stable/modules/decomposition.html#pca)

### Adatvizualizáció
- [Matplotlib Tutorials](https://matplotlib.org/stable/tutorials/index.html)
- [Seaborn Gallery](https://seaborn.pydata.org/examples/index.html)
- [Plot.ly Python](https://plotly.com/python/)

### Gépi Tanulás
- [Machine Learning Mastery](https://machinelearningmastery.com/)
- [Towards Data Science](https://towardsdatascience.com/)
- [Kaggle Learn](https://www.kaggle.com/learn)

### Gyakorlati Példák
- [Google Colab Notebooks](https://colab.research.google.com/notebooks/intro.ipynb)
- [Sklearn Examples](https://scikit-learn.org/stable/auto_examples/index.html)

---

## 📋 Összefoglaló

Ezen az órán átfogó képet kaptatok a gépi tanulás gyakorlati alkalmazásáról sportadatok elemzésében. Megismerkedtetek a **Google Colab** platformmal, gyakoroltátok az adatok előfeldolgozását **pandas**-szal, alkalmaztátok a **PCA dimenziócsökkentést**, és építettetek predikciós modelleket. A következő lépés egy komplex projekt elkészítése lesz, amely kombinálja a felügyeletlen és felügyelt tanulási módszereket. Ez kiváló alapot ad a modern adattudományi munka megértéséhez és a valós problémák megoldásához. 