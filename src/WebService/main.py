from fastapi import FastAPI, WebSocket
from pyexpat import model
from sklearn import neural_network
from sqlalchemy import true
from service_models import * 
import json
import pandas as pd
import numpy as np
from pandas.api.types import is_numeric_dtype
from pre_proces import *
from modeli import *
from sklearn.utils import shuffle
from korelacije import *
from featureSelection import wrapper_metod_regresija
from tensorflow.keras import layers
from sklearn import metrics
import gc
from sklearn.model_selection import train_test_split
from chatbot import chat, procesiraj, trenirajModel
from nltk.stem.lancaster import LancasterStemmer
from fastapi.encoders import jsonable_encoder
from tensorflow.keras.models import load_model
from detekcijaOutlajera import *

app = FastAPI()

@app.post("/sort")
async def sort_table(file: FileSort):
    df = pd.read_csv(file.FilePath, sep=None, engine='python')

    df.sort_values(by=file.Column, ascending=file.Ascending, inplace=True)

    df_list = df.values.tolist()
    if len(df_list) < file.To + 1:
        file.To = len(df_list) - 1
    

    # print(df_list[file.From : file.To])

    return df_list[file.From : file.To + 1]

@app.post("/file")
async def read_file(file: File):
    # sep1 = r'(?:(?<=^\d)|(?<=^\d{2})|(?<=^\d{3}))\s+|\s+(?=\S+\s*$)'
    df = pd.read_csv(file.fileUrl, sep=None, engine='python')
    print(df.head(10))
    numeric = []
    cat = []
    columns = []
    category_stats = []
    for col in df.columns:
        columns.append(col)
        desc = {'name' : col}
        desc['numberOfNan'] = int(df[col].isna().sum())
        df[col] = df[col].fillna(' ')
        if is_numeric_dtype(df[col]):
            dict = df[col].describe().to_dict()
            
            for key in dict.keys():
                if key == '25%':
                    desc['firstQuartile'] = dict[key]
                    if np.isnan(desc['firstQuartile']):
                        desc['firstQuartile'] = 0
                elif key == '50%':
                    desc['median'] = dict[key]
                    if np.isnan(desc['median']):
                        desc['median'] = 0
                elif key == '75%':
                    desc['thirdQuartile'] = dict[key]
                    if np.isnan(desc['thirdQuartile']):
                        desc['thirdQuartile'] = 0
                else:
                    desc[key] = dict[key]
                    if np.isnan(desc[key]):
                        desc[key] = 0
        
            desc['numberOfNan'] = int(df[col].isna().sum())
            numeric.append(desc)

        if df[col].dtype == 'object':
            
            cat.append(col)
            dict = df[col].describe().to_dict() 
            desc["values"] = df[col].unique().tolist()
            if ' ' in desc["values"]:
                desc["values"].remove(' ')
            for key in dict.keys():
                if key != 'Name':
                    desc[key] = dict[key]
            
            category_stats.append(desc)
            desc['top'] = str(desc['top'])
            # print(desc)

            # print(df[col].describe())
    
    # df_json = df.to_json(orient = 'split')
    # data = json.loads(df_json)

    rows = df.shape[0]
    page_numbers = round(rows / 100)

    
    return {
        "Columns" : columns,
        "Rows" : rows,
        "PageNumbers" : page_numbers,
        "NumericColumns" : numeric,
        "CategoryColumns": cat,
        "CategoryStats": category_stats
    }

@app.post("/missingval")
async def fill(missingValues: MissingValues):
    # print(missingValues)
    df = pd.read_csv(missingValues.FilePath, sep=None, engine='python')
    if missingValues.Method != 'none':
        df = df.fillna(method=missingValues.Method)
        df.to_csv(missingValues.FilePath, index=False)
        return {
            "Done" : True
        }
    else:
        for mv in missingValues.MissingValueOption:
            df[mv.Name] = df[mv.Name].fillna(mv.Value)
        df.to_csv(missingValues.FilePath, index=False)
        return {
            "Done" : True
        }
    return {
        "Done" : False
    }

@app.post("/file/load")
async def load_file(file: LoadFile):

    df = pd.read_csv(file.FilePath, nrows = file.To, sep=None, engine='python')
    df = df.fillna(" ")
    # print(df.shape)

    df_list = df.values.tolist()

    # if file.To + 1 > len(df_list):
    #     file.To = len(df_list)

    return df_list[file.From:]


@app.post("/file/edit")
async def edit_file(file: EditFile):
    
    df = pd.read_csv(file.FilePath, sep=None, engine='python')
    df.iat[file.IndexI, file.IndexJ] = file.Changes

    df.to_csv(file.FilePath, index=False)
    
    return True


#Check fast api to see how much RAM memory model use
#compare with Flask
@app.post("/ann")
async def create_ann_model(ann: NeuralNetwork):
    
    df = pd.read_csv(ann.Path)
    df = shuffle(df)

    #print(df)
    #print(ann.Encodings)
    #if (len(ann.Encodings) > 0):
        #print(ann.Encodings[0]['ColumnName'])

    # [{"ColumnName": "gender", "EncodingMethod": "labelencoder"}] - LISTA RECNIKA

    
    x_train,x_test,y_train,y_test = obradi(df, ann.Inputs, ann.Output, ann.TestToTrain,ann.Encodings)
    #Uzimam 33 za vlidationi od preosalotg training skupa
    x__train,x_val,y_train,y_val= train_test_split(x_train,y_train,test_size=0.33,shuffle=True)

    model = Sequential()
    i=0

    for dic in ann.Layers:
        if(i==0):
            model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(ann.RegularizationRate),input_shape=(x_train.shape[1],)))
        if(i>=1):
            if ann.Regularization=="L1":
                model.add(Dense(dic['NumberOfNeurons'],activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L1(ann.RegularizationRate)))
        
            elif ann.Regularization=="L2":
                model.add(Dense(dic['NumberOfNeurons'], activation=dic['Activation'],kernel_initializer='he_uniform',activity_regularizer=tf.keras.regularizers.L2(ann.RegularizationRate)))
        
            else: model.add(Dense(dic['NumberOfNeurons'],kernel_initializer='he_uniform',activation=dic['Activation']))
        i+=1

    model.add(Dense(1))

    batch_size = ann.BatchSize

    train_dataset = tf.data.Dataset.from_tensor_slices((x_train, y_train))
    train_dataset = train_dataset.shuffle(buffer_size=1024).batch(batch_size)
   


    
    train_mse =keras.metrics.MeanSquaredError()

    # val_acc_metric = keras.metrics.mean_squared_error()

    val_dataset = tf.data.Dataset.from_tensor_slices((x_val, y_val))
    val_dataset = val_dataset.batch(batch_size)
    
    loss_fn = keras.losses.MeanAbsoluteError()

    #model.trainable = False


    epochs = ann.Epoch

    for epoch in range(1,epochs,1):
        print("\nStart of epoch %d" % (epoch,))
        lisa=[]
        lisa_val=[]

    # Iterate over the batches of the dataset.
        for step, (x_batch_train, y_batch_train) in enumerate(train_dataset):

        # Open a GradientTape to record the operations run
        # during the forward pass, which enables auto-differentiation.
            with tf.GradientTape() as tape:

                logits = model(x_batch_train, training=True)  # Logits for this minibatch

            # Compute the loss value for this batch
                loss_value = loss_fn(y_batch_train, logits)

                lisa+=[loss_value]
            
            grads = tape.gradient(loss_value, model.trainable_weights)
            optimizer.apply_gradients(zip(grads, model.trainable_weights))
            train_mse.update_state(y_batch_train, logits)
        
        
        train_loss = tf.keras.metrics.Mean()(lisa).numpy()
        train_mse_value = train_mse.result()
        train_mse.reset_states()

      
        for x_batch_val, y_batch_val in val_dataset:
            val_logits = model(x_batch_val, training=True)
            loss_value_val=loss_fn(y_batch_val,val_logits)
            lisa_val+=[loss_value_val]
            train_mse.update_state(y_batch_val,val_logits)
        
        test_mse_value = train_mse.result()

        
        val_loss = tf.keras.metrics.Mean()(lisa_val).numpy()
      

        # val_loss=tf.keras.metrics.Mean()(lisa_val).numpy()
        print(train_mse_value.numpy())
        print(test_mse_value.numpy())


        train_mse.reset_states()

        #model.save("prvi.h5")

        del val_loss,logits,loss_value,lisa_val,lisa
        gc.collect()
    #print(model.get_weights())

    # Prvo radi konkatenaciju pa trenira model vracam ceo model
    #loss,val_loss,meansq,val_meansq = novi_model_prost(x_train, x_test, y_train, y_test,ann.Epoch,ann.Optimizer,ann.Layers,ann.LearningRate,ann.Regularization,ann.Dropout,ann.Momentum,ann.PreventLossIncreases,x_train.columns,ann.Output,ann.RegularizationRate,ann.Noise,ann.BatchSize)

    

    # return {
    #     "Loss" : loss,
    #     "ValLoss" : val_loss,
    #     "MeanSqauredError" : meansq, 
    #     "ValMeanSqauerdError" : val_meansq
    # }

@app.post("/cnn")
async def create_ann_model(ann: NeuralNetwork):
    
    df = pd.read_csv(ann.Path)
    df = shuffle(df)

    x_train,x_test,y_train,y_test = obradi(df, ann.Inputs, ann.Output, ann.TestToTrain,ann.Encodings)

    print(x_train.shape)
    print(y_train.shape)


    #Ako izlaz nije numericki resejpuj
    # if(df[ann.Output].dtype!='object'):
    #     y_train=y_train.reshape((-1,1))

    #Vracam i ceo model
    for model in klasifikacioni_model(x_train, x_test, y_train, y_test,ann.Epoch,ann.Optimizer,ann.Layers,ann.LearningRate,ann.Regularization,ann.Dropout,ann.Momentum,ann.PreventLossIncreases,x_train.columns,ann.Output,ann.RegularizationRate,ann.Noise,ann.BatchSize):
        print(model.history['accuracy'])
 
    del df,x_train,y_train,x_test,y_test

@app.post("/test")
async def test():
    return True

class Pitanje(BaseModel):
    pitanje: str

class Odgovor(BaseModel):
    Odgovor: str

@app.post('/chatbot')
async def chatbot(pitanjee: Pitanje):
    pitanje = pitanjee.pitanje

    sacuvan = False

    with open("intents.json") as file:
        data = json.load(file)

    stemmer = LancasterStemmer()

    reci, labele, trening, izlaz = procesiraj(data,stemmer)

    if os.path.isfile('moj_model.h5') is True:
        model = load_model('moj_model.h5')

    if os.path.isfile('moj_model.h5') is False:
        model = trenirajModel(trening,izlaz)
        model.save('moj_model.h5')

    odgovor = chat(model, reci, labele, stemmer, data, pitanje)

    del reci,labele,trening,izlaz
    del model
    del stemmer
    del data
    gc.collect()
    return {"Odgovor": odgovor}

@app.post("/socket")
async def create_ann_model(ann: NeuralNetwork):
    
    df = pd.read_csv(ann.Path)
    df = shuffle(df)

    x_train,x_test,y_train,y_test = obradi(df, ann.Inputs, ann.Output, ann.TestToTrain,ann.Encodings)
    print(x_train.shape)
    print(y_train.shape)


    for model in novi_model_prost(x_train, x_test, y_train, y_test,ann.Epoch,ann.Optimizer,ann.Layers,ann.LearningRate,ann.Regularization,ann.Dropout,ann.Momentum,ann.PreventLossIncreases,x_train.columns,ann.Output,ann.RegularizationRate,ann.Noise,ann.BatchSize):
        print(model.history['loss'])
        


@app.post("/cor")
async def get_cor_matrix(file: File):
    
    filePath = file.fileUrl
    pearson, kendall = odredi_kor(filePath)
    pearson_matrix = pearson.to_numpy().tolist()
    kendall_matrix = kendall.to_numpy().tolist()
    
    pearson_columns = list(pearson.columns)
    kendall_columns = list(kendall.columns)

    return {
        "PearsonColumns" : pearson_columns,
        "KendallColumns" : kendall_columns,
        "Pearson" : pearson_matrix,
        "Kendall": kendall_matrix
    }

@app.post("/feature-regression")
async def get_feature_regression(data: DataForFeatureSelection):
    df = wrapper_metod_regresija(data.FilePath, data.Output, data.NumberOfInputs)
    return {
        "ListOfInputs" : df["feature_names"].tolist(),
        "AvgScore" : df["avg_score"].tolist(),
        "StandardError" : df["std_err"].tolist()
    }

@app.websocket("/model")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        ann = json.loads(data)
        df = pd.read_csv(ann["Path"])
        df = shuffle(df)
        # print(ann)

        x_train,x_test,y_train,y_test = obradi(df, ann["Inputs"], ann["Output"], ann["TestToTrain"], ann["Encodings"])

        for model in novi_model_prost(x_train, x_test, y_train, y_test,ann["Epoch"],ann["Optimizer"],ann["Layers"],ann["LearningRate"],ann["Regularization"], ann["Dropout"], ann["Momentum"], ann["PreventLossIncreases"],x_train.columns,ann["Output"],ann["RegularizationRate"],ann["Noise"],ann["BatchSize"]):
            # print("loss is on Train {} and Test {}".format(loss, val_loss))
            # print("Total mse is on Train {} and Test {}".format(mse, val_mse))
            await websocket.send_text(str(model.history['loss'][0]) + " " + str(model.history["val_loss"][0]) + " " + str(model.history['mean_squared_error'][0]) + " " + str(mode.history["val_mean_squared_error"][0]))

    #Nisam hteo ovde da brisem
    # del df,x_train,y_train,x_test,y_test

@app.post('/outliers')
async def get_outliers(data: DataForOutliers):
    outliers, indexes = outlajeri_iqr(data.FilePath, data.ColumnName)
    return {
        "OutliersList": outliers
    }

@app.post('/outliers/delete')
async def delete_outliers(data: DataForOutliers):
    # POZIV FUNKCIJE ZA BRISANJE OUTLIER-A
    # data.FilePath - putanja do fajla
    # data.ColumnName - naziv kolone
    outliers, indexes = outlajeri_iqr(data.FilePath, data.ColumnName)
    izbrisan_data = izbrisi_outlajere(data.FilePath, data.ColumnName, indexes)
    #izbrisan_data = izbrisan_data.fillna('')

    #izbrisano = izbrisan_data.values.tolist()
    izbrisan_data.to_csv(data.FilePath,index = False)
    return {
        "Deleted" : True
    }