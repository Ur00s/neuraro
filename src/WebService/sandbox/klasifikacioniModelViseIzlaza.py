from tkinter import Label
from cv2 import dft
from sklearn.utils import shuffle
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import confusion_matrix

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Activation, Dense, BatchNormalization, Dropout
from tensorflow.keras import optimizers
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

tf.random.set_seed(13)
tf.debugging.set_log_device_placement(False)

df = pd.read_csv('Iris.csv')
df

df.shape
df.info()

labelencode = LabelEncoder()
df['vrste'] = labelencode.fit_transform(df['Species'])
df.sample(10)

df.isna().sum()
#Promesati podatke tako da ne postoji redosled
df = df.sample(frac = 1) 
df.head(10)

# izbaciti nepotrebne feature
df = df.drop('Species',axis = 1)
df
df = df.drop('Id', axis = 1)
df

train_data, temp_test_data =  train_test_split(df, test_size=0.2)
train_data['SepalLengthCm'].shape

train_data.shape
temp_test_data.shape

test_data, valid_data = train_test_split(temp_test_data, test_size=0.5)
print(train_data.shape)
print(test_data.shape)
print(valid_data.shape)

df.columns

train_data

def prikaziStatistikeFeature(train_data):
    train_stats = train_data.describe()
    train_stats.pop('vrste')
    sns.pairplot(train_stats[train_stats.columns], diag_kind = "kde")
    plt.show()

def vratiStatistiku(train_data):
    train_stats = train_data.describe()
    train_stats.pop('vrste')
    train_stats = train_stats.transpose()
    return train_stats

train_stats = vratiStatistiku(train_data)

train_label1 = train_data.pop('vrste')
test_label1 = test_data.pop('vrste')
valid_label1 = valid_data.pop('vrste')

train_labels = pd.get_dummies(train_label1 )
valid_labels = pd.get_dummies(valid_label1 )
test_labels = pd.get_dummies(test_label1 )

train_label1
train_labels

def norm(x):
    return (x - train_stats['mean']) / train_stats['std']

normiran_train_data = norm(train_data)
normiran_test_data = norm(test_data)
normiran_valid_data = norm(valid_data)

normiran_train_data.shape[1]

def build_model(normiran_train_data,train_label1):
    model = Sequential()
    # Ulazni sloj
    model.add(Dense(16, input_shape= (normiran_train_data.shape[1],)))
    # Izlazni sloj
    model.add(Dense(len(set(train_label1)), activation = 'softmax'))

    learning_rate = 0.0001
    optimizer = optimizers.Adam(learning_rate)
    model.compile(loss = 'categorical_crossentropy',
                optimizer = optimizer,
                metrics = ['accuracy'])
    return model

model = build_model(normiran_train_data,train_label1)
model.summary()

EPOCHS = 100
batch_size = 16

normiran_valid_data
valid_labels.shape

history = model.fit(
    normiran_train_data,
    train_labels,
    batch_size = batch_size,
    epochs = EPOCHS,
    verbose = 1,
    shuffle = True,
    steps_per_epoch = int(normiran_train_data.shape[0] / batch_size),
    validation_data = (normiran_valid_data, valid_labels),
)
valid_labels.shape
normiran_valid_data.shape

history.history

hist = pd.DataFrame(history.history)
hist['epoch'] = history.epoch
hist.tail()

primer_serije = normiran_test_data[:10]
primer_rezultat = model.predict(primer_serije)
primer_rezultat

def tacnostModela():
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Tacnost modela')
    plt.ylabel('tacnost')
    plt.xlabel('epohe')
    plt.legend(['Train', 'Cross-Validation'], loc = 'upper left')
    plt.show()

def greskaModela():
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Greska modela')
    plt.ylabel('Greska')
    plt.xlabel('epohe')
    plt.legend(['Train', 'Cross-Validation'], loc = 'upper left')
    plt.show()

loss, accuracy = model.evaluate(normiran_train_data, train_labels, verbose = 1)
print("Tacnost modela je trening skup: ", accuracy)

loss, accuracy = model.evaluate(normiran_valid_data, valid_labels, verbose = 2)
print("Tacnost modela je validacioni skup : ", accuracy)

loss, accuracy = model.evaluate(normiran_test_data, test_labels, verbose = 2)
print("Tacnost modela je testni skup : ", accuracy)

def prikaziheatMap():
    ax = plt.subplot()
    predikcija_rezultat = model.predict(normiran_test_data)

    predikcija_rezultat = predikcija_rezultat.argmax(axis = 1)

    cm = confusion_matrix(test_label1, predikcija_rezultat)

    sns.heatmap(cm, annot = True, ax = ax)

    ax.set_xlabel('Predikcione labele');ax.set_ylabel('Stvarne labele');
    ax.set_title('Confusion matrix')

    plt.show()

prikaziheatMap()