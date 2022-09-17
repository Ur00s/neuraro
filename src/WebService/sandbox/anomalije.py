import pandas as pd
import matplotlib as mpl
from matplotlib import pyplot as plt

import seaborn as sns
import tensorflow as tf
from tensorflow.keras.models import Model
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, StandardScaler, scale

from keras.models import Sequential
from keras.layers import LSTM, Input, Dropout
from keras.layers import Dense
from keras.layers import RepeatVector
from keras.layers import TimeDistributed


data = pd.read_csv("Weather.csv")
data.sample(5)
data.dtypes

data.describe()
data.shape
data.describe()
data.isna().sum()
data.isna().mean()

# Posto u skupu podataka postoje kolone koje sadrza veliki broj NULL vrednosti
# potrebno je izbrisati sve kolone koje sadrze vise od 70% nedostajucih vrednosti 
data.columns[data.isna().mean() < 0.7]
data = data[data.columns[data.isna().mean() < 0.7]]

data.shape
data.describe()
data.dtypes
data['Date'] = pd.to_datetime(data['Date'])

data_final = data.copy()

# sns.lineplot(x=data_final['Date'], y=data_final['MinTemp'])
# plt.show()

print("Pocetni datum je : ",data_final['Date'].min())
print("Poslednji datum je : ",data_final['Date'].max())

def tip_promenljivhi(df):
    numerickaKolona = df.select_dtypes("number").columns
    kategorijskaKolona = df.select_dtypes("object").columns
    numCols= list(set(numerickaKolona))
    catCols= list(set(kategorijskaKolona))

    return numCols,catCols

numericke, kategorijske = tip_promenljivhi(data)
kategorijske

# Izbacili smo sve kategorijske promenljive
data = data.drop(columns=kategorijske)
data.shape

data.describe()
train, test = data.loc[data['Date'] <= '1944-12-31'], data.loc[data['Date'] > '1944-12-31']

def detect_anomalije(featureName):
    anomalije = []
    indeksi_anomalije = []
    threshold = 3

    srednja_vr = np.mean(data[featureName])
    std = np.std(data[featureName])
    indeks = 0
    for i in data[featureName]:
        z_score = (i - srednja_vr)/std
        if np.abs(z_score) > threshold:
            anomalije.append(i)
            indeksi_anomalije.append(indeks)
        indeks = indeks + 1
    return anomalije,indeksi_anomalije

ukupno = 0
# Brisanje anomalija 
for feature in data[numericke].columns:
    anomalije,indeksi_anomalija = detect_anomalije(feature)
    print("Broj anomalija : ",feature , len(anomalije))
    ukupno += len(anomalije)
    data = data.drop(data.index[indeksi_anomalija])

print("Ukupan broj anomalija : ",ukupno)

for feature in data[kategorijske].columns:
    print(pd.value_counts(feature))