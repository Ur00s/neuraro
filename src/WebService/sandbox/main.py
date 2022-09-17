import requests
import matplotlib
import numpy as np
import pandas as pd 
from sklearn.model_selection import train_test_split
import seaborn as sns
import matplotlib.pyplot as plt
from tensorflow.keras import Input

#Test_Probno
EPOCHS=100
STEPEN_UCENJA=0.0001
BATCH_SIZE=32
VERBOSE=2
MOMENTUM=0.8
NOIZ=1

from pre_proces import *
from modeli import *

path=putnja(".","IMDB-Movie-Data.csv")
movie=vrat_dataset(path)
#print(movie.head(10))
movie=nan_to_mean(movie)
num,kat=tip_promenljivhi(movie)

#Jedan Tip enkidiranja
movie=BinaryEncode(movie, kat)
#Drugi Tip eknoriranja
max,min=max_min(movie,num)
#e=One_Hot_of(movie,"Genre")
#movie=movie.select_dtypes(exclude="object")
movie=predProcesiraj(movie)
#print(movie.head(10))
#Primer


x,y=zavisne_nezavine(movie,["Votes","Metascore"])

x_train,x_test,y_train,y_test=split_data(x,y,20)




ulazne_vrednost=broj_ulaznih_promeljvih(x_train)

print(y_test.shape)
print(y_train.shape)
#print(x.dtypes)
print(ulazne_vrednost)
#Pravljene osnovnog modela

model=get_model([8],ulazne_vrednost,STEPEN_UCENJA,MOMENTUM,EPOCHS,BATCH_SIZE,x_train,y_train,x_test,y_test)

print(model.summary())


# #Vise outputa probno 
#x_train,val=train_test_split(x_train,test_size=0.2,random_state=1)
train_stats=x_train.describe()
train_stats=train_stats.transpose()


#Dimenzija traina 52 feautra


functional_model(x_train,y_train,x_test,y_test,EPOCHS,STEPEN_UCENJA,MOMENTUM)
print(x_test.shape)
print(y_test.shape)

print(y_train.shape)




