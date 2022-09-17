# pip install nltk
# pip install tflearn
import graphlib
from imp import load_module
from statistics import mode
from cv2 import DenseOpticalFlow
from matplotlib.font_manager import json_dump
import nltk
from nltk.stem.lancaster import LancasterStemmer
from pandas import DataFrame


import numpy as np
from tensorboard import summary
from tensorflow_hub import load_module_spec
import tflearn
import tensorflow
import random
import json
import pickle
from sklearn.utils import shuffle

from tensorflow.keras import Model
from tensorflow.keras import Input
from tensorflow.keras import Sequential,regularizers
from tensorflow.keras.layers import Dense,Dropout,BatchNormalization,Concatenate

def procesiraj(data,stemmer):

    reci = []
    labele = []
    dokumenti_x = []
    dokumenti_y = []

    for namera in data['intents']:
        for pitanje in namera['patterns']:

            rec = nltk.word_tokenize(pitanje)
            reci.extend(rec)
            dokumenti_x.append(rec)
            dokumenti_y.append(namera['tag'])

        if namera['tag'] not in labele:
            labele.append(namera['tag'])

    reci = [stemmer.stem(w.lower()) for w in reci if w != "?"]
    reci = sorted(list(set(reci)))

    labele = sorted(labele)

    trening = []
    izlaz = []

    out_empty = [0 for _ in range(len(labele))]
    # print("out_empty : ", out_empty)

    for x, doc in enumerate(dokumenti_x):
        bag = []

        rec = [stemmer.stem(w) for w in doc]

        for w in reci:
            if w in rec:
                bag.append(1)
            else:
                bag.append(0)

        izlaz_red = out_empty[:]
        izlaz_red[labele.index(dokumenti_y[x])] = 1

        trening.append(bag)
        izlaz.append(izlaz_red)

    trening = np.array(trening)
    izlaz = np.array(izlaz)

    return reci, labele, trening, izlaz
    # with open("data.pickle", "wb") as f:
    #     pickle.dump((reci, labele, trening, izlaz), f)



#tensorflow.compat.v1.reset_default_graph()

def trenirajModel(trening,izlaz):
    # net = tflearn.input_data(shape=[None, len(trening[0])])
    # net = tflearn.fully_connected(net, 512)
    # net = tflearn.fully_connected(net, 512)
    # net = tflearn.fully_connected(net, len(izlaz[0]), activation='softmax')
    # net = tflearn.regression(net)

    # model = tflearn.DNN(net)

    # model.fit(trening, izlaz, n_epoch=10, batch_size=10, show_metric=True)

    model = Sequential()
    model.add(Dense(512,input_shape=(len(trening[0]),)))
    model.add(Dense(512))
    model.add(Dense(512))
    model.add(Dense(len(izlaz[0]),activation="softmax"))
    model.compile(loss='binary_crossentropy',optimizer='adam', metrics=['accuracy'])

    model.fit(trening, izlaz, epochs=10, batch_size=10)
    return model


# def pozovi_sve():

#     with open("intents.json") as file:
#         data = json.load(file)

#     stemmer = LancasterStemmer()
#     reci, labele, trening, izlaz = procesiraj(data,stemmer)
#     model = trenirajModel(trening,izlaz)

#     del reci,labele,trening,izlaz
#     del model
#     del stemmer
#     del data

#     #Brisem sve nakon zavrsetka sem data



# model.load("model.tflearn")

def bag_od_reci(s, reci,stemmer):
    bag = [0 for _ in range(len(reci))]

    s_reci = nltk.word_tokenize(s)
    s_reci = [stemmer.stem(rec.lower()) for rec in s_reci]

    for se in s_reci:
        for i, w in enumerate(reci):
            if w == se:
                bag[i] = 1

    return np.array(bag)


def chat(model,reci,labele,stemmer,data, inp):

    niz = bag_od_reci(inp, reci,stemmer).reshape(1,len(reci))
    rezultat = model.predict([niz])[0]
    rezultat_indeks = np.argmax(rezultat)
    tag = labele[rezultat_indeks]

    if rezultat[rezultat_indeks] >=0.5:
        for tg in data['intents']:
            if tg['tag'] == tag:
                odgovori = tg['responses']

        return random.choice(odgovori)
    else:
        return "Ne znam odgovor na to pitanje, pokusaj sa drugim pitanjem."

