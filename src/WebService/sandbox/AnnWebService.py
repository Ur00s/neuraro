from flask import Flask, request
from flask import jsonify

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

    # Napravi model po ovim parametrima

    return jsonify({
        "LearningRate" : learning_rate,
        "Activation" : activation,
        "RegularizationRate" : regularization_rate,
        "NumberOfLayers" : number_of_layers,
        "NumberOfNeurons" : number_of_neurons,
        "Noise" : noise,
        "BatchSize" : batch_size
    })

if(__name__ == "__main__"):
    app.run(port=5005)