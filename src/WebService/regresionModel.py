from __future__ import absolute_import, division, print_function
from cv2 import threshold
import seaborn as sns
import pandas as pd
import numpy as np

import tensorflow as tf
from tensorflow import keras
from pre_proces import *
from tensorflow.keras import layers
from tensorflow.keras.layers import Dense,Dropout,BatchNormalization,Concatenate
import scipy.stats as stats

from matplotlib import pyplot as plt

data = pd.read_csv('IMDB-Movie-Data.csv',delimiter=',',usecols=['Rank','Year','Runtime (Minutes)','Rating','Votes','Revenue (Millions)','Metascore'])
data.head()
data.shape
# fig = plt.figure()
# ax = Axes3D(fig)
# ax.scatter(data['Votes'],data['Revenue (Millions)'],data['Metascore'],c = 'blue', marker = 'o', alpha = 0.5)
# ax.set_xlabel('Votes')
# ax.set_ylabel('Revenue (Millions)')
# ax.set_zlabel('Metascore')
# plt.show()

data.isna().sum()
data = data.dropna()
data.shape
data.columns

np.std(data['Rating'])

# def detect_outliers(data_niz):
#     outlajeri = []
#     indeksi_outlajera = []
#     threshold = 3
#     srednja_vr = np.mean(data_niz)
#     std = np.std(data_niz)

#     indeks = 0
#     for i in data_niz:
#         z_score = (i - srednja_vr)/std
#         if np.abs(z_score) > threshold:
#             outlajeri.append(i)
#             indeksi_outlajera.append(indeks)
#         indeks = indeks + 1
#     return outlajeri,indeksi_outlajera


def detect_outliers(featureName):
    outlajeri = []
    indeksi_outlajera = []
    threshold = 3

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



outlajeri,indeksi_outlajera = detect_outliers("Rating")
print("Outlajeri : ",outlajeri)
print("Indeksi outlajera : ", indeksi_outlajera)

for podaci in data.columns:
    otkloni_outlier(data,podaci)

def split_data(data):
    train_data = data.sample(frac=0.8,random_state=0)
    test_data = data.drop(train_data.index)

    train_data = train_data[['Votes','Revenue (Millions)','Metascore']]
    test_data = test_data[['Votes','Revenue (Millions)','Metascore']]

    train_label = train_data.pop("Metascore")
    test_label = test_data.pop("Metascore")
    
    return train_data, test_data, train_label, test_label

train_data, test_data, train_label, test_label = split_data(data)
train_dataProba, test_dataProba, train_labelProba, test_labelProba = split_data(data)

train_data

def statistika(train_data,feature):
    train_stats = train_data.describe()
    for stats in train_stats.columns:
        if stats != feature:
            train_stats.pop(stats)
    train_stats = train_stats.transpose()

    return train_stats

def normalize(df):
    result = df.copy()
    for feature_name in df.columns:
        max_value = df[feature_name].max()
        min_value = df[feature_name].min()
        result[feature_name] = (df[feature_name] - min_value) / (max_value - min_value)
    return result

normiran_train_data = normalize(train_data)
normiran_test_data = normalize(test_data)

normiran_train_data
normiran_test_data

def build_model():
    model = keras.Sequential([
        layers.Dense(64, activation=tf.nn.relu, input_shape=[len(train_data.keys())]),
        layers.Dense(64, activation=tf.nn.relu)
    ])
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(Dense(1))

    optimizer = tf.keras.optimizers.RMSprop(0.01)
    
    model.compile(loss='mse',
                  optimizer='adam',
                  metrics=['mae','mse'])
    
    return model

model = build_model()

model.summary()

primer_serije = normiran_train_data[:10]
primer_rezultat = model.predict(primer_serije)
primer_rezultat

class PrintDot(keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs):
        if epoch % 100 ==0: print('')
        print('.',end = '')

EPOCHS = 100

history = model.fit(
    normiran_train_data, train_label,
    epochs = EPOCHS, validation_split = 0.2, verbose = 0,
    callbacks=[PrintDot()]
)

hist = pd.DataFrame(history.history)
hist['epoch'] = history.epoch
hist.tail()

def plot_history(history):
    hist = pd.DataFrame(history.history)
    hist['epoch'] = history.epoch

    plt.figure()
    plt.xlabel('Epohe')
    plt.ylabel('Srednja apsolutna greska [Rank]')
    plt.plot(hist['epoch'], hist['mae'],
            label = 'Train Error')
    plt.plot(hist['epoch'], hist['val_mae'],
            label = 'Val error')
    plt.legend()
    plt.ylim([0,70])
    plt.show()

plot_history(history)

model = build_model()

early_stop = keras.callbacks.EarlyStopping(monitor='val_loss', patience=10)

history = model.fit(normiran_train_data, train_label, epochs = EPOCHS,
                    validation_split = 0.2, callbacks = [early_stop, PrintDot()])

loss, mae, mse = model.evaluate(normiran_test_data, test_label, verbose = 0)

print("Testni skup srednja apsolutna greska: {:5.2f} Metascore".format(mae))

# Prikazi predvidjene vrednosti za Metascore
test_predicts =model.predict(normiran_test_data).flatten()
test_predicts

def lin_regresija():
    plt.scatter(test_label, test_predicts)
    plt.xlabel("Stvarne vrednosti [Metascore]")
    plt.ylabel("Predvidjene vrednosti [Metascore]")
    plt.axis('equal')
    plt.axis('square')
    plt.xlim([0,plt.xlim()[1]])
    plt.ylim([0,plt.ylim()[1]])
    _ = plt.plot([-100,100], [-100, 100])
    plt.show()

lin_regresija()
def prikazi_gresku():
    greska = test_predicts - test_label
    plt.hist(greska, bins = 25)
    plt.xlabel("Predikciona greska [Metascore]")
    _ = plt.ylabel("Broj")
    plt.show()
