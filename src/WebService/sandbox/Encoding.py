from re import X
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.style as style
style.use('ggplot')
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import OneHotEncoder

df = pd.read_csv('final_data.csv')
df.head()

dfOneHot = pd.read_csv('final_data.csv')
dfOneHot

# Koristim label enkodiranje za boje kojih ima ukupno 11
# tako da vrednost enkodiranih boja ide od 0 do 10
le = LabelEncoder()
df['boje_enkodirane'] = le.fit_transform(df['label'])
df

#OneHot enkodiranje
ohe = OneHotEncoder(sparse=False)
dfOneHot = ohe.fit_transform(df[['label']])

dfOneHot = df.copy()
dfOneHot = pd.get_dummies(dfOneHot, columns=['label'], prefix = ['boja'])
print(dfOneHot.head())

df[['label','boje_enkodirane']].value_counts()

x = df[['red','green','blue']]
x

y = df['boje_enkodirane']
y

y_OneHot = dfOneHot['boje_enkodirane']
y_OneHot

train_X, val_X, train_y, val_y = train_test_split(x, y, test_size=0.2, random_state=3)
trainHot_X, valHot_y, trainHot_y, valHot_y = train_test_split(x, y_OneHot,test_size=0.2, random_state=3)

model = KNeighborsClassifier(n_neighbors=7)
model

model.fit(train_X, train_y)

pred_y = model.predict(val_X)
pred_y

accuracy_score(pred_y, val_y)

model.fit(x, y)

def vrati_ImeKolone(label):
    boja_od_labele = df[['label', 'boje_enkodirane']].value_counts().index
    for index, ime in enumerate(boja_od_labele):
        if(boja_od_labele[index][1] == label):
            return str(boja_od_labele[index][0])

vrati_ImeKolone(model.predict([[51,49,54]]))


#Primena statistickih testova nad kategorijskim podacima

import numpy as np
import pandas as pd
import scipy.stats as stats

national = pd.DataFrame(["belci"]*100000 + ["hispanic"]*60000 +\
    ["crnci"]*50000 + ["azijati"]*15000 + ["ostali"]*35000)

minessota = pd.DataFrame(["belci"]*600 + ["hispanic"]*300 +\
    ["crnci"]*250 + ["azijati"]*75 + ["ostali"]*150)

national_table = pd.crosstab(index=national[0], columns="Ukupno")
minessota_table = pd.crosstab(index=minessota[0], columns="Ukupno")

print( "Nacionalno" )
print(national_table)
print(" ")
print( "Minessota" )
print(minessota_table)

posmatrano = minessota_table

national_ratios = national_table/len(national)

print(national_ratios)

ocekivano = national_ratios * len(minessota)

chi_squared_stat = ((posmatrano-ocekivano)**2)/ocekivano.sum()

print(chi_squared_stat)

crit = stats.chi2.ppf(q = 0.95, # Pronaci kriticnu vrednot za 95% sigurnost
                      df = 4) # df - Broj kategorijskih promeljivih - 1

print("Kriticna vrednost")
print(crit)

p_value = 1 - stats.chi2.cdf(x = chi_squared_stat, df = 4)

print("P vrednost")
print(p_value)

stats.chisquare(f_obs = posmatrano,
                f_exp = ocekivano)

np.random.seed(10)

glasaci_trka = np.random.choice(a = ["azijati","crnci","hispanic","ostali","belci"],
                                p = [0.05, 0.15, 0.25, 0.05, 0.5],
                                size = 1000)

glasaci_partije = np.random.choice(a =["demokrate","nezavisni","republikanci"],
                                    p = [0.4, 0.2, 0.4],
                                    size = 1000)

glasaci = pd.DataFrame({"trka":glasaci_trka,
                        "partija":glasaci_partije})

glasac_tab = pd.crosstab(glasaci.trka, glasaci.partija, margins = True)

glasac_tab.columns = ["demokrate","nezavisni","republikanci","ukupno_redovi"]

glasac_tab.index = ["azijati","crnci","hispanic","ostali","belci","ukupno_kolone"]

posmatran = glasac_tab.iloc[0:5,0:3]
glasac_tab

ocekuj = np.outer(glasac_tab["ukupno_redovi"][0:5],
                     glasac_tab.loc["ukupno_kolone"][0:3] ) / 1000

ocekuj = pd.DataFrame(ocekuj)

ocekuj.kolone = ["demokrate","nezavisni","republikanci"]
ocekuj.index = ["azijati","crnci","hispanic","ostali","belci"]

ocekuj

stats.chi2_contingency(observed=posmatran)
# prihvatamo alternativnu hipotezu jer smo na osnovu testa
# zakljucili da su ove dve kategorijske promenljive nezavisne 

