from flask import Flask,request
from flask_sock import Sock
from flask import jsonify
import json
import pandas as pd
import numpy as np
from pandas.api.types import is_numeric_dtype, is_categorical_dtype
from sklearn.model_selection import train_test_split
from sklearn.utils import shuffle
from tensorflow import keras
import gc
import sys

#Pozvana dva modela
from pre_proces import *
from modeli import *

app = Flask(__name__)
sock = Sock(app)

@sock.route('/model')
def echo(ws):
     # while True:
    #     data = sock.receive()
    #     ann = json.loads(data)
    #     df = pd.read_csv(ann["Path"])
    #     df = shuffle(df)
    #     x_train,x_test,y_train,y_test = obradi(df, ann["Inputs"], ann["Output"], ann["TestToTrain"], ann["Encodings"])

    #     for loss,val_loss,mse,val_mse in novi_model_prost(x_train, x_test, y_train, y_test,ann["Epoch"],ann["Optimizer"],ann["Layers"],ann["LearningRate"],ann["Regularization"], ann["Dropout"], ann["Momentum"], ann["PreventLossIncreases"],x_train.columns,ann["Output"],ann["RegularizationRate"],ann["Noise"],ann["BatchSize"]):
            
    #         sock.send(str(loss[0]) + " " + str(val_loss[0]) + " " + str(mse[0]) + " " + str(val_mse[0]))
    data = ws.receive()
    ann1 = json.loads(data)
    print(ann1)
    print(ann1["SavePath"])
    ann = ann1["NeuralNetwork"]
    #print(parameters)
    if ann["ProblemType"] == "regression":
        df = pd.read_csv(ann["Path"], sep=None, engine='python')
        
        df = shuffle(df)

        x_train,x_test,y_train,y_test = obradi(df, ann["Inputs"], ann["Output"], ann["TestToTrain"], ann["Encodings"],ann["ProblemType"])


        model = Sequential()
        i=0

        for dic in ann['Layers']:
            if(i==0):
                model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(ann['RegularizationRate']),input_shape=(x_train.shape[1],)))
            if(i>=1):
                if ann['Regularization']=="L1":
                    model.add(Dense(dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1((ann['RegularizationRate']))))
            
                elif ann['Regularization']=="L2":
                    model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L2((ann["RegularizationRate"]))))
            
                else: model.add(Dense(dic['NumberOfNeurons'],kernel_initializer='he_uniform',activation=dic['Activation']))
                
                model.add(GaussianNoise(ann['Noise']/10))
                model.add(Dropout(ann['Dropout']))
            i+=1

        #Izlaz
        if(np.ndim(y_train)==1):
            model.add(Dense(1,activation="linear"))
        else:
            model.add(Dense(y_train.shape[1]))

    
        if(ann['Optimizer']=='sgd'):
            opt=tf.keras.optimizers.SGD(learning_rate=ann["LearningRate"], momentum=ann["Momentum"])
        elif(ann['Optimizer']=='adamax'):
            opt=tf.keras.optimizers.Adamax(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='rmsprop':
            opt=tf.keras.optimizers.RMSprop(learning_rate=ann["LearningRate"], momentum=ann["Momentum"])
        elif ann['Optimizer']=='adadelta':
            opt=tf.keras.optimizers.Adadelta(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=="adagrad":
            opt=tf.keras.optimizers.Adagrad(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='adam':
            opt=tf.keras.optimizers.Adam(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='nadam':
            opt=tf.keras.optimizers.Nadam(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='ftrl':
            opt=tf.keras.optimizers.Ftrl(learning_rate=ann["LearningRate"])
        else:
            opt=tf.keras.optimizers.Adam(learning_rate=ann["LearningRate"])


        model.compile(loss='mae',optimizer=opt, metrics=['mean_squared_error'])

        if ann["PreventLossIncreases"]==True:
                t=1
                while t<=ann["Epoch"]:
                    if t==1:
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=(int)(ann["BatchSize"]),epochs=t)
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['mean_squared_error'][0]) + " " + str(konacni_model.history["val_mean_squared_error"][0]))
                        #await websocket.send_text(str(model.history['loss'][0]) + " " + str(model.history["val_loss"][0]) + " " + str(model.history['mean_squared_error'][0]) + " " + str(mode.history["val_mean_squared_error"][0]))
                    else:
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=(int)(ann["BatchSize"]),initial_epoch=t-1,epochs=t)
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['mean_squared_error'][0]) + " " + str(konacni_model.history["val_mean_squared_error"][0]))
                        #await websocket.send_text(str(model.history['loss'][0]) + " " + str(model.history["val_loss"][0]) + " " + str(model.history['mean_squared_error'][0]) + " " + str(mode.history["val_mean_squared_error"][0]))
                    t+=1

                    del konacni_model
        else:   
            
                t=1
                while t<=ann["Epoch"]:
                    if t==1:
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test),batch_size=(int)(ann["BatchSize"]),epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['mean_squared_error'][0]) + " " + str(konacni_model.history["val_mean_squared_error"][0]))
                        #await websocket.send_text(str(model.history['loss'][0]) + " " + str(model.history["val_loss"][0]) + " " + str(model.history['mean_squared_error'][0]) + " " + str(mode.history["val_mean_squared_error"][0]))
                    else:   
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=(int)(ann["BatchSize"]),initial_epoch=t-1,epochs=t)
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['mean_squared_error'][0]) + " " + str(konacni_model.history["val_mean_squared_error"][0]))
                        #await websocket.send_text(str(model.history['loss'][0]) + " " + str(model.history["val_loss"][0]) + " " + str(model.history['mean_squared_error'][0]) + " " + str(mode.history["val_mean_squared_error"][0]))
                    t+=1
                    del konacni_model
            
        tf.keras.backend.clear_session()
        # model_json = model.to_json()
        # with open(ann1["SavePath"], "w") as json_file:
        #     json_file.write(model_json)
        # print(str(model.history['loss']))
        # print(str(model.get_weights()))
        # y1 = model.predict(x_test)
        # print(y1)
        model.save(ann1["SavePath"])
        
        # model = keras.models.load_model(ann1["SavePath"])
        # print(str(model.get_weights()))
        # y2 = model.predict(x_test)
        # print(y2)
        del [df, x_train, y_train, x_test, y_test, model, ann, data]
        # new_model = tf.keras.models.load_model(ann1["SavePath"])
        # print(str(new_model.history['loss']))

        gc.collect()
    elif ann["ProblemType"] == "classification":
        df = pd.read_csv(ann["Path"], sep=None, engine='python')
	
        df = shuffle(df)
        #Dodaj ovo
        #tip=ann["Tip"]
    
        x_train,x_test,y_train,y_test = obradi(df, ann["Inputs"], ann["Output"], ann["TestToTrain"], ann["Encodings"],ann["ProblemType"])


        model = Sequential()
        i=0

        Metrika = [ 
        keras.metrics.BinaryAccuracy(name='accuracy')
        #Ostale metrke koje mogu
        #keras.metrics.Precision(name='precision'),
        # keras.metrics.Recall(name='recall'),
        # keras.metrics.AUC(name='auc'),
        # keras.metrics.AUC(name='roc'),
        ]

        for dic in ann['Layers']:
            if(i==0):
                model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(ann['RegularizationRate']),input_shape=(x_train.shape[1],)))
            if(i>=1):
                if ann['Regularization']=="L1":
                    model.add(Dense(dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1((ann['RegularizationRate']))))
            
                elif ann['Regularization']=="L2":
                    model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L2((ann["RegularizationRate"]))))
            
                else: model.add(Dense(dic['NumberOfNeurons'],kernel_initializer='he_uniform',activation=dic['Activation']))
                model.add(GaussianNoise(ann['Noise']/10))
                model.add(Dropout(ann['Dropout']))
            i+=1


    
        if(ann['Optimizer']=='sgd'):
            opt=tf.keras.optimizers.SGD(learning_rate=ann["LearningRate"], momentum=ann["Momentum"])
        elif(ann['Optimizer']=='adamax'):
            opt=tf.keras.optimizers.Adamax(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='rmsprop':
            opt=tf.keras.optimizers.RMSprop(learning_rate=ann["LearningRate"], momentum=ann["Momentum"])
        elif ann['Optimizer']=='adadelta':
            opt=tf.keras.optimizers.Adadelta(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=="adagrad":
            opt=tf.keras.optimizers.Adagrad(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='adam':
            opt=tf.keras.optimizers.Adam(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='nadam':
            opt=tf.keras.optimizers.Nadam(learning_rate=ann["LearningRate"])
        elif ann['Optimizer']=='ftrl':
            opt=tf.keras.optimizers.Ftrl(learning_rate=ann["LearningRate"])
        else:
            opt=tf.keras.optimizers.Adam(learning_rate=ann["LearningRate"])

        
        if(np.ndim(y_train)==1):
            model.add(Dense(1,activation="sigmoid"))
        else:
                model.add(Dense(y_train.shape[1], activation='sigmoid'))
    
        model.compile(loss='binary_crossentropy',optimizer=opt, metrics=Metrika)

        if ann["PreventLossIncreases"]==True:
                t=1
                while t<=ann["Epoch"]:
                    if t==1:
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test),batch_size=(int)(ann["BatchSize"]),epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                        print(konacni_model.history['loss'])
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['accuracy'][0]) + " " + str(konacni_model.history["val_accuracy"][0]))
                        
                    else:
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=(int)(ann["BatchSize"]),initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                        print(konacni_model.history['loss'])
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['accuracy'][0]) + " " + str(konacni_model.history["val_accuracy"][0]))
                        
                    t+=1
        else:   
            
                t=1
                while t<=ann["Epoch"]:
                    if t==1:
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test),batch_size=(int)(ann["BatchSize"]),epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                        print(konacni_model.history['loss'])
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['accuracy'][0]) + " " + str(konacni_model.history["val_accuracy"][0]))
                        
                    else:   
                        konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=(int)(ann["BatchSize"]),initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                        print(konacni_model.history['loss'])
                        ws.send(str(konacni_model.history['loss'][0]) + " " + str(konacni_model.history["val_loss"][0]) + " " + str(konacni_model.history['accuracy'][0]) + " " + str(konacni_model.history["val_accuracy"][0]))
                        
                    t+=1

        #model.save("klas.h5")
        #novi=tf.keras.models.load_model("klas.h5")
        #print(novi.get_config())
        #if os.path.exists("klas.h5"):
        # novi=tf.keras.models.load_model("klas.h5")
        #y_pred=novi.predict(x_test) 
        #y_predict = np.squeeze(y_pred)
        #y_test = np.squeeze(y_test)
        #Za klasifikaciju
        #predictions = (model.predict(x_test) > 0.5).astype(int)
        #print(predictions)
        #Stvarne
        #print(y_test[0])
        #Predvieneje
        #print(predictions[0])
        # print(y_predict)

        #else: model.save("klas.h5")
        model.save(ann1["SavePath"])
        del [df, x_train, y_train, x_test, y_test, model, ann]
        # new_model = tf.keras.models.load_model(ann1["SavePath"])
        gc.collect()


@app.route("/cnn", methods=['POST'])
def cnn():    
    ann = request.get_json()

    df = pd.read_csv(ann["Path"])
	
    df = shuffle(df)
    #Dodaj ovo
    #tip=ann["Tip"]
    tip=ann["ProblemType"]

    x_train,x_test,y_train,y_test = obradi(df, ann["Inputs"], ann["Output"], ann["TestToTrain"], ann["Encodings"],tip)


    model = Sequential()
    i=0

    Metrika = [ 
      keras.metrics.BinaryAccuracy(name='accuracy')
      #Ostale metrke koje mogu
      #keras.metrics.Precision(name='precision'),
     # keras.metrics.Recall(name='recall'),
     # keras.metrics.AUC(name='auc'),
     # keras.metrics.AUC(name='roc'),
    ]

    for dic in ann['Layers']:
        if(i==0):
            model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(ann['RegularizationRate']),input_shape=(x_train.shape[1],)))
        if(i>=1):
            if ann['Regularization']=="L1":
                model.add(Dense(dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1((ann['RegularizationRate']))))
        
            elif ann['Regularization']=="L2":
                model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L2((ann["RegularizationRate"]))))
        
            else: model.add(Dense(dic['NumberOfNeurons'],kernel_initializer='he_uniform',activation=dic['Activation']))

            model.add(Dropout(ann['Dropout']))
        i+=1


   
    if(ann['Optimizer']=='sgd'):
        opt=tf.keras.optimizers.SGD(learning_rate=ann["LearningRate"], momentum=ann["Momentum"])
    elif(ann['Optimizer']=='adamax'):
        opt=tf.keras.optimizers.Adamax(learning_rate=ann["LearningRate"])
    elif ann['Optimizer']=='rmsprop':
        opt=tf.keras.optimizers.RMSprop(learning_rate=ann["LearningRate"], momentum=ann["Momentum"])
    elif ann['Optimizer']=='adadelta':
        opt=tf.keras.optimizers.Adadelta(learning_rate=ann["LearningRate"])
    elif ann['Optimizer']=="adagrad":
        opt=tf.keras.optimizers.Adagrad(learning_rate=ann["LearningRate"])
    elif ann['Optimizer']=='adam':
        opt=tf.keras.optimizers.Adam(learning_rate=ann["LearningRate"])
    elif ann['Optimizer']=='nadam':
        opt=tf.keras.optimizers.Nadam(learning_rate=ann["LearningRate"])
    elif ann['Optimizer']=='ftrl':
        opt=tf.keras.optimizers.Ftrl(learning_rate=ann["LearningRate"])
    else:
        opt=tf.keras.optimizers.Adam(learning_rate=ann["LearningRate"])

    
    if(np.ndim(y_train)==1):
        model.add(Dense(1,activation="sigmoid"))
    else:
            model.add(Dense(y_train.shape[1], activation='sigmoid'))
 
    model.compile(loss='binary_crossentropy',optimizer=opt, metrics=Metrika)

    if ann["PreventLossIncreases"]==True:
            t=1
            while t<=ann["Epoch"]:
                if t==1:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test),batch_size=(int)(ann["BatchSize"]),epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    print(konacni_model.history['loss'])
                else:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=(int)(ann["BatchSize"]),initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    print(konacni_model.history['loss'])
                t+=1
    else:   
        
            t=1
            while t<=ann["Epoch"]:
                if t==1:
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test),batch_size=(int)(ann["BatchSize"]),epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    print(konacni_model.history['loss'])
                else:   
                    konacni_model=model.fit(x_train,y_train,verbose=True,validation_data=(x_test,y_test), batch_size=(int)(ann["BatchSize"]),initial_epoch=t-1,epochs=t,callbacks=[tf.keras.callbacks.TerminateOnNaN()])
                    print(konacni_model.history['loss'])
                t+=1

    #model.save("klas.h5")
    #novi=tf.keras.models.load_model("klas.h5")
    #print(novi.get_config())
    #if os.path.exists("klas.h5"):
    # novi=tf.keras.models.load_model("klas.h5")
    #y_pred=novi.predict(x_test) 
    #y_predict = np.squeeze(y_pred)
    #y_test = np.squeeze(y_test)
    #Za klasifikaciju
    #predictions = (model.predict(x_test) > 0.5).astype(int)
    #print(predictions)
    #Stvarne
    #print(y_test[0])
    #Predvieneje
    #print(predictions[0])
    # print(y_predict)

    #else: model.save("klas.h5")
    del [df, x_train, y_train, x_test, y_test, model, ann]
    # new_model = tf.keras.models.load_model(ann1["SavePath"])
    gc.collect()


@app.route("/predict", methods=['POST'])
def vrati():
    
    #Example postman "Predicted": [{ "ColumnName": "Votes", "Value": 757074 }]

    # Model = experiment.ModelPath,
    # Values = predict.Values,
    # Inputs = neuralNetwork.Inputs,
    # Output = neuralNetwork.Output,
    # ProblemType = neuralNetwork.ProblemType

    ann = request.get_json()
    df = pd.read_csv(ann["FilePath"])
	
    

    model=tf.keras.models.load_model(ann['Model'])

    brojac=0
    for i in ann['Inputs']: 
        if df[i].dtype!='object':
            brojac+=1
  
    #x_train,x_test,y_train,y_test = obradi(df, ann["Inputs"], ann["Output"], ann["TestToTrain"], ann["Encodings"],ann['ProblemType'])
    
    #Example for check in
    #model=novi_model_prost(x_train, x_test, y_train, y_test,ann["Epoch"],ann["Optimizer"],ann["Layers"],ann["LearningRate"],ann["Regularization"],ann["Dropout"],ann["Momentum"],ann["PreventLossIncreases"],x_train.columns,ann["Output"],ann["RegularizationRate"],ann["Noise"],ann["BatchSize"])
    #model=load_module(ann['ModelPath'])
    config = model.get_config() 
    shape=config["layers"][0]["config"]["batch_input_shape"]
    print(shape[1])
 
    s=[]
    k=1

    for dic in ann["Values"]:
        if df[dic["ColumnName"]].dtype=="object":
            if k==1:
                for i in range(0,shape[1]-brojac):
                    if i%2==0:
                        s+=[0]
                    else:
                        s+=[1]
            k+=1
        
        else:
            maximu_ulaz = df[dic["ColumnName"]].max()
            minimum_ulaz = df[dic['ColumnName']].min()
            z=(dic["Value"]-minimum_ulaz)/(maximu_ulaz-minimum_ulaz)
            s+=[z]
        

    s = np.asarray(s)

    s=np.asarray(s.reshape((1,shape[1])))

   # print(s)
    t=model.predict(s)

    if df[ann["Output"]].dtype!="object" and ann["ProblemType"]!="classification":
        if t<0:
            if t<-1:
                t=1
            else:
                t*=-1

        maximu_izlaz = df[ann["Output"]].max()
        minimum_izlaz = df[ann["Output"]].min()
        # pred = (t*(maximu_izlaz - minimum_izlaz)) - minimum_izlaz
        pred = ((maximu_izlaz-minimum_izlaz)*t) + minimum_izlaz
        #Return pred
        #return pred
        return jsonify({
            "Prediction" : str(pred[0][0])
        })

    elif df[ann["Output"]].dtype=="object" and ann["ProblemType"]=="regression":
        #Return
        pred=np.mean(t)
        

        # return (pred)
        return jsonify({
            "Prediction" : str(pred)
        })

    else:
        pred=np.mean(t)
        if pred>0.5:
            pred=1
        else:
            pred=0


        #return pred
        return jsonify({
            "Prediction" : str(pred)
        })
    

if(__name__ == "__main__"):
    app.run(port = 5005)         
        
