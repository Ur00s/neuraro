import seaborn as sns
import pandas as pd
import numpy as np

import tensorflow as tf
from tensorflow import keras
from pre_proces import *

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import IsolationForest

from sklearn.neighbors import LocalOutlierFactor
import seaborn as sns


def z_score(fajl, featureName):
    
    data =pd.read_csv(fajl, sep=None, engine='python')

    outlajeri = []
    indeksi_outlajera = []
    threshold = 3

    if data[featureName].dtypes == 'O':
        labelencode = LabelEncoder()
        data[featureName] = labelencode.fit_transform(data[featureName])

    srednja_vr = np.mean(data[featureName])
    std = np.std(data[featureName])
    indeks = 0
    for i in data[featureName]:
        z_score = (i - srednja_vr)/std
        if np.abs(z_score) > threshold:
            outlajeri.append(i)
            indeksi_outlajera.append(indeks)
        indeks = indeks + 1
    return outlajeri,indeksi_outlajera

def outlajeri_iqr(fajl, featureName):

    data =pd.read_csv(fajl, sep=None, engine='python')

    data[featureName] = data[featureName].astype(float)

    if data[featureName].dtypes == 'O':
        labelencode = LabelEncoder()
        data[featureName] = labelencode.fit_transform(data[featureName])

    outlajeri = []
    indeksi_outlajera = []
    
    q25, q75 = np.quantile(data[featureName], 0.25), np.quantile(data[featureName], 0.75)

    # Racunamo IQR
    iqr = q75 - q25
    # Izracunavamo granicnu vrednost
    izbaci = iqr * 1.5
    # Izracunavamo donju i gornju granicnu vrednost
    donja_granica, gornja_granica = q25 - izbaci, q75 + izbaci

    outlajeri_dole = data[data[featureName] < donja_granica]
    outlajeri_gore = data[data[featureName] > gornja_granica]
    
    kolona_dole = outlajeri_dole[featureName]
    kolona_gore = outlajeri_gore[featureName]

    kolona_dole_indeksi = outlajeri_dole[featureName].index.values.astype(int)
    kolona_gore_indeksi = outlajeri_gore[featureName].index.values.astype(int)

    kolona_dole_indeksi = list(kolona_dole_indeksi)
    kolona_gore_indeksi = list(kolona_gore_indeksi)

    kolona_dole = kolona_dole.to_numpy()
    kolona_gore = kolona_gore.to_numpy()

    kolona_dole = list(kolona_dole)
    kolona_gore = list(kolona_gore)

    outlajeri += kolona_gore
    outlajeri += kolona_dole

    indeksi_outlajera += kolona_dole_indeksi
    indeksi_outlajera += kolona_gore_indeksi

    return outlajeri,indeksi_outlajera


def isolation_forest(fajl, featureName):

    data = pd.read_csv(fajl, sep=None, engine='python')
    
    if data[featureName].dtypes == 'O':
        labelencode = LabelEncoder()
        data[featureName] = labelencode.fit_transform(data[featureName])

    model = IsolationForest(n_estimators=100, max_samples='auto',contamination=float(0.02), max_features=1.0)
    model.fit(data[[featureName]])

    data['anomalije-vrednost'] = model.decision_function(data[[featureName]])
    data['anomalije'] = model.predict(data[[featureName]])
    data.head(20)

    anomalije = data[data['anomalije'] == -1]
    
    outlajeri = anomalije[featureName].tolist()
    outlajeri_indeksi = anomalije[featureName].index.values.astype(int)

    return outlajeri, outlajeri_indeksi


def localOutlierFactor(fajl, featureName):

    data = pd.read_csv(fajl, sep=None, engine='python')

    if data[featureName].dtypes == 'O':
        labelencode = LabelEncoder()
        data[featureName] = labelencode.fit_transform(data[featureName])

    niz_df = data[featureName].values
    niz_df

    reshape_niz_df = niz_df.reshape((-1,1))
    reshape_niz_df

    model = LocalOutlierFactor(n_neighbors = 100, metric = "manhattan", contamination=0.02)

    y_pred = model.fit_predict(reshape_niz_df)

    outlier_index = np.where(y_pred == -1)

    outlier_values = data.iloc[outlier_index]

    outlajeri = outlier_values[featureName].tolist()
    indeksi = outlier_values[featureName].index.values.astype(int)

    return  outlajeri, indeksi

# outlajeri_isolation_forest, indeksi_isolation_forest = isolation_forest('IMDB-Movie-Data.csv','Rank')
# out_iqr,indeksi_iqr = outlajeri_iqr('IMDB-Movie-Data.csv','Rank')
# out_zScore, indeksi_zScore = z_score('IMDB-Movie-Data.csv', 'Rank')
# outlajeriLOF, indeksiLOF = localOutlierFactor('IMDB-Movie-Data.csv','Rank')

# print(out_iqr)
# print(out_zScore)
# print(outlajeri_isolation_forest)
# print(outlajeriLOF)
# print(indeksi_iqr)
# print(indeksi_zScore)
# print(indeksi_isolation_forest)
# print(indeksiLOF)

def izbrisi_outlajere(fajl, kolona, indeksi):
    
    data = pd.read_csv(fajl, sep=None, engine='python')
    # data[kolona].drop(indeksi,data ,inplace=True)

    feature = data[kolona]
    feature[indeksi] = np.nan
    data[kolona] = feature
    return data

# data = izbrisi('fuel.csv', indeksi_isolation_forest)
# data.shape