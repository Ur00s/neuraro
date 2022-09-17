#AnnWebService_1

from flask import Flask, request
from flask import jsonify

import sys

#Pozvana dva modela
from pre_proces import *
from Modeli import *
import numpy as np
from regresionModel import *


app = Flask(__name__)

@app.route("/ann", methods=['POST'])
def getAllAnn():
    parameters = request.get_json()
    learning_rate = parameters["LearningRate"]
    activation = parameters["Activation"]
    regularization_rate = parameters["RegularizationRate"]
    number_of_layers = parameters["NumberOfLayers"]
    number_of_neurons = parameters["NumberOfNeurons"] # OVO JE LISTA !!!!!!! 
    noise = parameters["Noise"]
    batch_size = parameters["BatchSize"]
	
    
    x_train,x_test,y_train,y_test=obradi()
    print("Traing skup ima 53 feaura")
    print(x_train.shape)
    print("Testnki skup ima 2")
    print(x_test.shape)
   
    # Napravi model po ovim parametrima
    (votes_loss, val_Votes_loss, metascore_loss, val_Metascore_loss) = functional_model(x_train,x_test,y_train,y_test,learning_rate,activation,regularization_rate,number_of_layers,number_of_neurons,noise,batch_size)

    # return jsonify({
    #     "LearningRate" : parameters ,
    #     "Activation" : learning_rate ,
    #     "RegularizationRate" : activation ,
    #     "NumberOfLayers" : regularization_rate ,
    #     "NumberOfNeurons" : number_of_layers ,
    #     "Noise" : noise ,
    #     "BatchSize" :batch_size 
    # })

    return jsonify({
        "VoteLoss" : votes_loss,
        "ValVotesLoss" : val_Votes_loss,
        "MetascoreLoss" : metascore_loss, 
        "ValMetascoreLoss" : val_Metascore_loss
    })

@app.route("/outlier", methods=['POST'])
def getOutlier():
    parameters = request.get_json()
    feature = parameters["feature"]

    outlajeri ,indeksi_outlajera = detect_outliers(feature)

    return jsonify({
        "outlier" : outlajeri,
        "indexs" : indeksi_outlajera
    }
    )


if(__name__ == "__main__"):
    app.run(port=5005)