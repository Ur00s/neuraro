import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import  keras 
from sklearn.model_selection import train_test_split
from numpy import sqrt


from pre_proces import *
from keras.backend import sigmoid
from keras.utils.generic_utils import get_custom_objects
from keras.layers import Activation
from keras.callbacks import LearningRateScheduler


# example of a model defined with the functional api
from tensorflow.keras import Model
from tensorflow.keras import Input
from tensorflow.keras import Sequential,regularizers
from tensorflow.keras.layers import Dense,Dropout,BatchNormalization,Concatenate
from sklearn.preprocessing import OneHotEncoder,LabelEncoder
from tensorflow.keras.initializers import RandomNormal,Constant
from tensorflow.keras.optimizers import SGD
from sklearn.model_selection import train_test_split
from keras import regularizers
from keras.layers.noise import GaussianNoise
import seaborn as sns
from keras.callbacks import ModelCheckpoint,EarlyStopping,Callback,CSVLogger
from tensorflow.keras.layers import Embedding,Flatten,Concatenate
from tensorflow.keras import initializers
from tensorflow.keras import regularizers
from tensorflow.keras.layers import Layer

from mlxtend.evaluate import bias_variance_decomp
from sklearn.metrics import mean_squared_error,r2_score
from tensorflow.python.keras.metrics import Metric

#Callback zaustavlja treiranje ako je veliki loss probno
class zautaviLosttValue(Callback):

        def on_epoch_start(self, batch, logs={}):
            GRANICA = 1500
            if logs.get('loss') > 120:
                print("Zaustavljen trening")
                self.model.stop_training = True

class zautaviLosttValue(Callback):

    def __init__(self, loss_lista={}):
        self.loss_lista=[]

    def on_epoch_end(self, epoch, logs={}):
        self.loss_lista.append(logs['loss'])

#Probni regularizator
class Regularizator(regularizers.Regularizer):
    def __init__(self, snaga):
        self.snaga = snaga
    def __call__(self, x):
        return self.snaga * tf.reduce_sum(tf.square(x))
    def konfiguracija(self):
        return {'Snaga': self.snaga}
 
#Probno Sloj kome se zadaje tezina i vrednosti za klasifikaciju 
class LogLayer(keras.layers.Layer):
	def __init__(self,name=None):
		super(LogLayer, self).__init__(name=name)
		#funkcija gubitka za klasfikacuju
		self.loss_fun = keras.losses.BinaryCrossentropy(from_logits=True)
		#metrika preziconsti
		self.funkcija_prec = keras.metrics.BinaryAccuracy()
	def call(self, feature, log, tezina=None):
		loss=self.loss_fun(feature,log,tezina)
		self.add_loss()
		acc = self.funkcija_prec(feature, log, tezina)
        #Dodaj metriku
		self.add_metric(acc, name="accuracy")
        #Vraca tensor 
		return tf.nn.softmax(log)

class IsoritjVremea(keras.callbacks.Callback):
    def on_train_begin(self, logs={}):
        self.times = []

    def on_epoch_begin(self, batch, logs={}):
        self.epoch_time_start = time.time()

    def on_epoch_end(self, batch, logs={}):
        self.times.append(time.time() - self.epoch_time_start)


#U nasem slucaj uzimam poslednji vrednost za nezavisnu
def zavisne_nezavine_1(df):
      x, y = df.values[:, :-1], df.values[:, -1]
      return x,y


#ulazni featuri
def broj_ulaznih_promeljvih(x_train):
    return x_train.shape[1]

#Sequential model
def get_model(broj_slojeva,ulazne_vrednost,stepen_ucenja,momentum,epochs,barth_size,x_train,y_train,x_test,y_test):

    model=Sequential()
    #Input 0 of layer "dense" is incompatible with the layer: expected axis -1 of input shape to have value 54, but received input with shape (None, 1) moram
    model.add(Dense(10, activation='relu', kernel_initializer='he_normal', input_shape=(ulazne_vrednost,), activity_regularizer=regularizers.l1_l2(l1=0.01, l2=0.01)))
    for i in broj_slojeva:
        #Batch normlizacija moze da utice na pooljanje samog modela
        model.add(BatchNormalization())
        model.add(Dense(i, activation='relu', kernel_initializer='he_normal',activity_regularizer=regularizers.l1_l2(l1=0.01, l2=0.01)))
        model.add(Dropout(0.2))
    model.add(Dense(1, activation='relu'))

    #Optimizator
    sgd = SGD(learning_rate=stepen_ucenja, momentum=momentum)
    #model.compile(optimizer=sgd, loss='binary_crossentropy')
# fit the model
    model.compile(optimizer=sgd, loss='binary_crossentropy', metrics=['accuracy'])

    mse, mae = model.evaluate(x_test, y_test, verbose=0)
    print('MSE: %.3f, RMSE: %.3f, MAE: %.3f' % (mse, sqrt(mse), mae))
    
  # print("Probaj na testnom skupu")

    train_mse = model.evaluate(x_train, y_train, verbose=0)
    test_mse = model.evaluate(x_test, y_test, verbose=0) 
    print(train_mse)
    print(test_mse)

    return model

#uzimam moj callback
class MojCallBack(Callback):    
    def on_epoch_end(self, epoch, logs={}): 
        if(logs.get('loss')>25):   
            self.model.stop_training = True

class IstorijaTezine(Callback):
    def __init__(self):
        self.tezine = []
        
    def on_epoch_end(self, batch, logs={}):
        self.tezine.append(self.model.get_weights()[0])

#Radimo bez tensor_borada
class Prikazi_Loss_MSE(Callback):

    def on_train_batch_end(self, batch, log=None):
        print('Za batch {} , loss is {:3.2f}.'.format(batch, log['loss']))

    def on_test_batch_end(self, batch, log=None):
        print('Za batch {},loss is {:3.2f}.'.format(batch, log['loss']))

    def on_epoch_end(self, epoch, log=None):
        print('Prosecan loss for epoch {} is {:3.2f} and MSE is {:3.2f}.'.format(epoch, log['loss'], log['mean_squared_error']))

class Rano_stop_min_lossu(Callback):
    #default=0
    def __init__(self,preciznost=0):  
        super(Rano_stop_min_lossu,self).__init__()

        self.preciznost=preciznost

        #Tezina je nula za pocetni
        self.naj_tezina=None

    def on_train_begin(self,log=None):
        #Inicalizujem 
        self.cekaj=0
        self.zautstavljen_epoc=0
        self.najbolji=np.Inf

    def on_epoch_end(self,epcoh,log=None):
        #Uzimam los
        trenutno=log.get('loss')
        if np.less(trenutno,self.najbolji):
            najbolji=trenutno
            self.cekaj=0
            #Uzimam tezinu za naljbolji
            self.naj_tezina=self.model.get_weights()
        #U drugom slcaju uvecavam preizmost
        else:
            self.cekaj=self.cekaj+1
            if self.cekaj>=self.preciznost:
                self.zautstavljen_epoc=epoch 
                self.model.stop_training=True

                print("Zaustavljam trening modela\n")
                self.model.set_weights(self.naj_tezina)
        
    def on_train_end(self,log=None):
        if self.zautstavljen_epoc>0:
            print("Epoch %01d: zaustavljen"% (self.zautstavljen_epoc+1))



def drugi_novi_model_prost(x_train,x_test,y_train,y_test,epochs,optimizer,number_of_neurons,learning_rate,Regularization,Dropout,Momentum,PreventLossIncreases,ulazi,outputs,regularization_rate,noise,batch_size):
   
    i_shape=[]
    ds=[]
    dt=[]

    for i in ulazi:
        feature=Input(shape=(1, ), name='Prvi '+i)
        ds+=[x_train[i]]
        dt+=[x_test[i]]
        i_shape+=[feature]

    #Prvo je odradjen konkatenacija pa treniran model
    merged = Concatenate(axis=1) (i_shape)
    
    #Treniranje modela
    x=novi_osnovni_model(merged,number_of_neurons,Regularization,regularization_rate,Dropout,noise)


    out = Dense(units=1)(x)

    model=Model(inputs=i_shape, outputs=out)
    
    #Svi optimizatori
    if(optimizer=='sgd'):
        opt=tf.keras.optimizers.SGD(learning_rate=learning_rate, momentum=Momentum)
    elif(optimizer=='adamax'):
        opt=tf.keras.optimizers.Adamax(learning_rate=learning_rate)
    elif optimizer=='rmsprop':
        opt=tf.keras.optimizers.RMSprop(learning_rate=learning_rate, momentum=Momentum)
    elif optimizer=='adadelta':
        opt=tf.keras.optimizers.Adadelta(learning_rate=learning_rate)
    elif optimizer=="adagrad":
        opt=tf.keras.optimizers.Adagrad(learning_rate=learning_rate)
    elif optimizer=='adam':
        opt=tf.keras.optimizers.Adam(learning_rate=learning_rate)
    elif optimizer=='nadam':
        opt=tf.keras.optimizers.Nadam(learning_rate=learning_rate)
    elif optimizer=='ftrl':
        opt=tf.keras.optimizers.Ftrl(learning_rate=learning_rate)
    else:
        opt=tf.keras.optimizers.Adam(learning_rate=learning_rate)

   
    model.compile(optimizer=opt, loss='mean_absolute_error',metrics=['mean_squared_error','mae',tf.keras.metrics.RootMeanSquaredError()] )
    zs=zautaviLosttValue()

    #Prikaz modela
    #print(model.summary())

    if PreventLossIncreases==True:
            k=1
            while k<=epochs:
                if k==1:
                    konacni_model=model.fit([ds],y_train,verbose=True,validation_data=(dt,y_test), batch_size=batch_size,epochs=k,callbacks=[tf.keras.callbacks.TerminateOnNaN(),zs])
                    yield konacni_model.history['loss'], konacni_model.history['val_loss'],konacni_model.history['mean_squared_error'],konacni_model.history['val_mean_squared_error']
                else:
                    konacni_model=model.fit([ds],y_train,verbose=True,validation_data=(dt,y_test), batch_size=batch_size,initial_epoch=k-1,epochs=k,callbacks=[tf.keras.callbacks.TerminateOnNaN(),zs])
                    yield konacni_model.history['loss'], konacni_model.history['val_loss'],konacni_model.history['mean_squared_error'],konacni_model.history['val_mean_squared_error']
                k+=1
    else:
            k=1
            while k<=epochs:
                if k==1:
                    konacni_model=model.fit([ds],y_train,verbose=True,validation_data=(dt,y_test), batch_size=batch_size,epochs=k,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model.history['loss'], konacni_model.history['val_loss'],konacni_model.history['mean_squared_error'],konacni_model.history['val_mean_squared_error']
                else:   
                    konacni_model=model.fit([ds],y_train,verbose=True,validation_data=(dt,y_test), batch_size=batch_size,initial_epoch=k-1,epochs=k,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model.history['loss'], konacni_model.history['val_loss'],konacni_model.history['mean_squared_error'],konacni_model.history['val_mean_squared_error']
                k+=1

    test_results=pd.DataFrame()
    test_results['basic_model']=model.evaluate(dt,y_test,verbose=0)


    if(np.ndim(y_test)==1):
        y_test=y_test.reshape((-1,1))
        y_predict=model.predict(dt)
        #R2_score
        #print(r2_score(y_test,y_predict))


    #Vidimo stvarne i predvienje vrednosti
        y_predict = np.squeeze(y_predict)
        y_test = np.squeeze(y_test)
        dfK=pd.DataFrame({'Acutal:': y_test,"Predicted":y_predict})


#Osnovni funkcionalni model za svaki sloj drugacija aktivaciona i br neurona
def novi_osnovni_model(feature,d,Regularization,regularization_rate,dropout,noise):

    i=0

    for dic in d:
        if(i==0):
            x=Dense(units=dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_normal')(feature)

        if(i>=1):
            # #Dodao batch normailzation
            #x=BatchNormalization()(x)

            if Regularization=="L1":
                x=Dense(units=dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_normal',activity_regularizer=tf.keras.regularizers.L1(regularization_rate))(x)
        
            elif Regularization=="L2":
                x=Dense(units=dic['NumberOfNeurons'], activation=dic['Activation'], kernel_initializer='he_normal',activity_regularizer=tf.keras.regularizers.L2(regularization_rate))(x)
        
            else: x=Dense(units=dic['NumberOfNeurons'], activation=dic['Activation'], kernel_initializer='he_normal')(x)

            #Droput je preporucljiv za veci broj neurona da postoji
            x = Dropout(dropout)(x)

            #Gausov noiz
            if x!=None:
                x = GaussianNoise(noise/100)(x)
        i+=1
    return x


#Ovaj model na kraju odradjuje konkatenaciju(slozeniji model
def novi_model(x_train,x_test,y_train,y_test,epochs,optimizer,number_of_neurons,learning_rate,Regularization,Dropout,Momentum,PreventLossIncreases,ulazi,outputs,regularization_rate,noise,batch_size):
    
    #Ulazni featuri provera
    inputs=tf.keras.layers.Input(shape=(x_train.shape[-1],))

    #Liste
    d_modeli=[]
    i_shape=[]
    ds=[]
    dt=[]

    for i in ulazi:
        #Pravim feature sa nazivom Prvi + ime featurea
        feature=Input(shape=(1, ), name='Prvi '+i)
        #U ds pakujem x_train['Raiting']  x_train['Votes'] itd. zavisi od samih input vrednosti
        ds+=[x_train[i]]
        #Isto radim i za x_test
        dt+=[x_test[i]]
        #Ovde pakujem shapove za model lakse za povezivanje
        i_shape+=[feature]
        #Pozivam treniranje modela za prvi shape itd.
        x=novi_osnovni_model(feature,number_of_neurons,Regularization,regularization_rate,Dropout,noise)
        #Lista modela nad koijma odradjujem konkatenaciju
        d_modeli+=[x]
    
    #Konkatenacija
    out = Concatenate()(d_modeli)
    
    #Jedan izlaz
    out = Dense(units=1)(out)
 

    #Pozivam model i i_shape u kome se nalaze svi shapovi
    model=Model(inputs=i_shape,outputs=out)
    
    #Izlged modela 
    #print(model.summary())  

    #Optimizatori neki imaju neki ne momentum
    if(optimizer=='sgd'):
        opt=tf.keras.optimizers.SGD(learning_rate=learning_rate, momentum=Momentum)
    elif(optimizer=='adamax'):
        opt=tf.keras.optimizers.Adamax(learning_rate=learning_rate)
    elif optimizer=='rmsprop':
        opt=tf.keras.optimizers.RMSprop(learning_rate=learning_rate, momentum=Momentum)
    elif optimizer=='adadelta':
        opt=tf.keras.optimizers.Adadelta(learning_rate=learning_rate)
    elif optimizer=="adagrad":
        opt=tf.keras.optimizers.Adagrad(learning_rate=learning_rate)
    elif optimizer=='nadam':
        opt=tf.keras.optimizers.Nadam(learning_rate=learning_rate)
    elif optimizer=='ftrl':
        opt=tf.keras.optimizers.Ftrl(learning_rate=learning_rate)
    else:
        opt=tf.keras.optimizers.Adam(learning_rate=learning_rate)
   
    #Mozemo pozivati bilo koje metriku za regersiju i opt
    model.compile(optimizer=opt, loss='mean_absolute_error',metrics=['mean_squared_error'] )



    #Risajpovo 
    y_train=y_train.reshape((-1,1))
    y_test=y_test.reshape((-1,1))


    #[ds] sadrzi [x_train['Raiting'],x_train['Votes']] itd.
    #Validatsioni skup je x_test[input],y_test,dva callbacka prekida na Nan i iznad odredjen granica
    #Mozemo staviti i validation_split=0.NN da korisnik izabere koliko ce uzeti od training skupa
    if PreventLossIncreases==True:
        konacni_model=model.fit([ds],y_train,verbose=True, validation_data=(dt,y_test), batch_size=batch_size,epochs=epochs,callbacks=[tf.keras.callbacks.TerminateOnNaN()])

    else:
        konacni_model=model.fit([ds],y_train,verbose=True, validation_data=(dt,y_test), batch_size=batch_size,epochs=epochs)



    #Procena modela
    results = model.evaluate(dt, y_test, batch_size=batch_size)

    #Predikcija nad x_test
    y_predict=model.predict(dt)

    #Predivjne od stane modela
    y_predict = np.squeeze(y_predict)
    #Testni skup
    y_test = np.squeeze(y_test)
    dfK=pd.DataFrame({'Acutal:': y_test,"Predicted":y_predict})
    #print(dfK.head(10))

    #print(r2_score(y_predict,y_test))

    return (konacni_model.history['loss'], konacni_model.history['val_loss'],konacni_model.history['mean_squared_error'],konacni_model.history['val_mean_squared_error'])


#U ovom modelu konkatenacija je odradjena prvo pa je onda treniran model
def novi_model_prost(x_train,x_test,y_train,y_test,epochs,optimizer,number_of_neurons,learning_rate,Regularization,dropout,Momentum,PreventLossIncreases,ulazi,outputs,regularization_rate,noise,batch_size):
   
    model = Sequential()
    i=0

    for dic in number_of_neurons:
        if(i==0):
            model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(regularization_rate),input_shape=(x_train.shape[1],)))
        if(i>=1):
            if Regularization=="L1":
                model.add(Dense(dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(regularization_rate)))
        
            elif Regularization=="L2":
                model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L2(regularization_rate)))
        
            else: model.add(Dense(dic['NumberOfNeurons'],kernel_initializer='he_uniform',activation=dic['Activation']))

            model.add(Dropout(dropout))
        i+=1

    #Izlaz
    if(np.ndim(y_train)==1):
        model.add(Dense(1,activation="linear"))
    else:
        model.add(Dense(y_train.shape[1]))


    if(optimizer=='sgd'):
        opt=tf.keras.optimizers.SGD(learning_rate=learning_rate, momentum=Momentum)
    elif(optimizer=='adamax'):
        opt=tf.keras.optimizers.Adamax(learning_rate=learning_rate)
    elif optimizer=='rmsprop':
        opt=tf.keras.optimizers.RMSprop(learning_rate=learning_rate, momentum=Momentum)
    elif optimizer=='adadelta':
        opt=tf.keras.optimizers.Adadelta(learning_rate=learning_rate)
    elif optimizer=="adagrad":
        opt=tf.keras.optimizers.Adagrad(learning_rate=learning_rate)
    elif optimizer=='adam':
        opt=tf.keras.optimizers.Adam(learning_rate=learning_rate)
    elif optimizer=='nadam':
        opt=tf.keras.optimizers.Nadam(learning_rate=learning_rate)
    elif optimizer=='ftrl':
        opt=tf.keras.optimizers.Ftrl(learning_rate=learning_rate)
    else:
        opt=tf.keras.optimizers.Adam(learning_rate=learning_rate)


    model.compile(loss='mae',optimizer=opt, metrics=['mean_squared_error'])

    if PreventLossIncreases==True:
            t=1
            while t<=epochs:
                if t==1:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                else:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                t+=1
    else:   
        
            t=1
            while t<=epochs:
                if t==1:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                else:   
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                t+=1

    #Obrisao
    del konacni_model,model,x_train,y_train,x_test,y_test
    


#Klasifikacioni model
def klasifikacioni_model(x_train,x_test,y_train,y_test,epochs,optimizer,number_of_neurons,learning_rate,Regularization,dropout,Momentum,PreventLossIncreases,ulazi,outputs,regularization_rate,noise,batch_size):
   
    model = Sequential()

    Metrika = [ 
      keras.metrics.BinaryAccuracy(name='accuracy'),
      keras.metrics.Precision(name='precision'),
      keras.metrics.Recall(name='recall'),
      keras.metrics.AUC(name='auc'),
      keras.metrics.AUC(name='roc'),
    ]

    i=0

    for dic in number_of_neurons:
        if(i==0):
            model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(regularization_rate),input_shape=(x_train.shape[1],)))
        if(i>=1):
            if Regularization=="L1":
                model.add(Dense(dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(regularization_rate)))
        
            elif Regularization=="L2":
                model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L2(regularization_rate)))
        
            else: model.add(Dense(dic['NumberOfNeurons'],kernel_initializer='he_uniform',activation=dic['Activation']))

            model.add(Dropout(dropout))
        i+=1


    ##Izlaz
    model.add(Dense(y_train.shape[1], activation='sigmoid'))



    if(optimizer=='sgd'):
        opt=tf.keras.optimizers.SGD(learning_rate=learning_rate, momentum=Momentum)
    elif(optimizer=='adamax'):
        opt=tf.keras.optimizers.Adamax(learning_rate=learning_rate)
    elif optimizer=='rmsprop':
        opt=tf.keras.optimizers.RMSprop(learning_rate=learning_rate, momentum=Momentum)
    elif optimizer=='adadelta':
        opt=tf.keras.optimizers.Adadelta(learning_rate=learning_rate)
    elif optimizer=="adagrad":
        opt=tf.keras.optimizers.Adagrad(learning_rate=learning_rate)
    elif optimizer=='adam':
        opt=tf.keras.optimizers.Adam(learning_rate=learning_rate)
    elif optimizer=='nadam':
        opt=tf.keras.optimizers.Nadam(learning_rate=learning_rate)
    elif optimizer=='ftrl':
        opt=tf.keras.optimizers.Ftrl(learning_rate=learning_rate)
    else:
        opt=tf.keras.optimizers.Adam(learning_rate=learning_rate)

    

    model.compile(loss='binary_crossentropy',optimizer=opt, metrics=Metrika)

    if PreventLossIncreases==True:
            t=1
            while t<=epochs:
                if t==1:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                else:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                t+=1
    else:   
        
            t=1
            while t<=epochs:
                if t==1:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                else:   
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=batch_size,initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    yield konacni_model
                t+=1


    del konacni_model,model,x_train,y_train,x_test,y_test
