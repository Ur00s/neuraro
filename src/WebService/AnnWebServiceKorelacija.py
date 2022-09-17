from flask import Flask, request
from flask import jsonify
import json
import pandas as pd
import numpy as np
from pandas.api.types import is_numeric_dtype, is_categorical_dtype


import sys

#Pozvana dva modela
from pre_proces import *
from modeli import *

from korelacije import *

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    ext = filename.split('.')[1]
    if ext not in ALLOWED_EXTENSIONS:
        return False
    return True

@app.route("/file", methods = ['POST'])
def getFile():
    jsonRequest = request.get_json()
    file = jsonRequest["fileUrl"]
    # if 'file' not in request.files:
    #     return "File not found!"
    
    # file = request.files['file']

    # if file.filename == '':
    #     return "No file!"

    # if not allowed_file(file.filename):
    #     return "Only CSV!"
    df = pd.read_csv(file)
    
    numeric = []
    cat = []

    for col in df.columns:
        if is_numeric_dtype(df[col]):
            dict = df[col].describe().to_dict()
            desc = {'name' : col}
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
    
    df_json = df.to_json(orient = 'split')
    data = json.loads(df_json)

    return jsonify({
        "Columns" : data['columns'],
        "Data" : data['data'],
        "NumericColumns" : numeric,
        "CategoryColumns": cat
    })

@app.route("/ann", methods=['POST'])
def getAllAnn():
    parameters = request.get_json()
    learning_rate = parameters["LearningRate"]
    regularization_rate = parameters["RegularizationRate"]
    number_of_layers = parameters["NumberOfLayers"]
    number_of_neurons = parameters["Layers"] # OVO JE LISTA !!!!!!! 
    noise = parameters["Noise"]
    batch_size = parameters["BatchSize"]
    filePath = parameters["Path"]
    regularization = parameters["Regularization"]
    test_to_train = parameters["TestToTrain"]
    dropout = parameters["Dropout"]
    momentum = parameters["Momentum"]
    prevent_loss = parameters["PreventLossIncreases"]
    epochs = parameters["Epoch"]
    encoding_method = parameters["EncodingMethod"]
    optimizer = parameters["Optimizer"]
    inputs = parameters["Inputs"]
    outputs = parameters["Output"]
    #print(parameters)
    df = pd.read_csv(filePath)
	
    #print(parameters["Layers"])

   #x_train,x_test,y_train,y_test=obradi(df)
    x_train,x_test,y_train,y_test=obradi(df,inputs,outputs,test_to_train,encoding_method)
    print(x_train.shape)
    print(y_test.shape)
   

    # Napravi model po ovim parametrima
    #(votes_loss, val_Votes_loss, metascore_loss, val_Metascore_loss) = functional_model(x_train,x_test,y_train,y_test,learning_rate,activation,regularization_rate,number_of_layers,number_of_neurons,noise,batch_size)
    #Moemnutm ne moze da se konfigurise u Adam optimzatoru Samo SGD
    loss,val_loss,meansq,val_meansq= novi_model(x_train, x_test, y_train, y_test,epochs,optimizer,number_of_neurons, learning_rate, regularization, dropout, momentum, prevent_loss, x_train.columns, outputs, regularization_rate, number_of_layers, noise, batch_size)

    return jsonify({
        "Loss" : loss,
        "ValLoss" : val_loss,
        "MeanSqauredError" : meansq, 
        "ValMeanSqauerdError" : val_meansq
    })


@app.route("/encoding", methods = ['POST'])
def encode():
    parameters = request.get_json()
    data = parameters["Table"]
    df = pd.DataFrame(columns = data["Columns"], data = data["Data"])

@app.route("/corSvi", methods = ['POST'])
def getAllCor():
    parameters = request.get_json()
    file = parameters["file"]

    per, ken = odredi_kor(file)

    per_json = per.to_json()
    ken_json = ken.to_json()

    return {
        "Per_kor" : json.loads(per_json),
        "Kendel_kor" : json.loads(ken_json)
    }

@app.route("/corPos", methods = ['POST'])
def getCofPos():
    parameters = request.get_json()
    file = parameters["file"]
    feature1 = parameters["feature1"]
    feature2 = parameters["feature2"]

    corPer= vrati_per(file, feature1, feature2)
    corKendall = vrati_ken(file, feature1, feature2)

    return jsonify({
        "Pers_kof" : corPer,
        "Kendal_kof" : corKendall
    })

@app.route("/corKategorije", methods = ['POST'])
def getCofKategorije():
    parameters = request.get_json()
    file = parameters["file"]
    feature1 = parameters["feature1"]
    feature2 = parameters["feature2"]

    hiKvadrat = korKategorijske(file, feature1, feature2)

    return jsonify({
        "HikvadratTest" : hiKvadrat
    })

if(__name__ == "__main__"):
    app.run(port=5005)