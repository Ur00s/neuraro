from collections import UserDict
from flask import Flask
from flask import jsonify
from flask import request

app = Flask(__name__)

userDB = [
    {
        'id' : '1',
        'FirstName' : 'Ivan',
        'LastName': 'Jovanovic',
        'Username': 'ivan_00',
        'Email': 'ivan.jovanovic@gmail.com',
        'PasswordHash': 'et52ed',
        'PasswordSalt': 'lvn49sa'
    },
    {
        'id' : '2',
        'FirstName' : 'Lazar',
        'LastName': 'Stojic',
        'Username': 'laki395',
        'Email': 'lazar.stojic27@yahoo.com',
        'PasswordHash': 'ye5sf8',
        'PasswordSalt': 'z32i6t0'
    }
]

userLoginDB = [
    {
        'id': '1',
        'Username': 'Ana.Ristic75@gmail.com',
        'Password': 'CistiRAA'
    },
    {
        'id': '2',
        'Username': 'Filip.Stanic42@gmail.com',
        'Password': 'student#pmf'
    },
    {
        'id': '3',
        'Username': 'Trajko.Lakic42@yahoo.com',
        'Password': 'poweRS2!'
    }
]

UserRegistrationDB = [
    {
        'id': '1',
        'Username': '__0Ana0__',
        'FirstName': 'Ana',
        'LastName': 'Spiric',
        'Email': 'ana.spi32@pmf.kg.ac.rs',
        'Password': 'BAsRT!e'
    },
    {    
        'id': '2',
        'Username': 'ur_99_s',
        'FirstName': 'Uros',
        'LastName': 'Petronijevic',
        'Email': 'uros.petronijevic73@gmail.com',
        'Password': '_SevisSeviourm_'
    },
]

NeuralNetworkDB = [
    {
        'id': '1',
        'BrojNeuronaUlazniSloj': '2',
        'BrojSkrivenihSlojeva' : '4',
        'BrojNeuronaIzlazniSloj': '1',
        'Tacnost': '0.47'
    },
    {
        'id': '2',
        'BrojNeuronaUlazniSloj': '3',
        'BrojSkrivenihSlojeva' : '6',
        'BrojNeuronaIzlazniSloj': '2',
        'Tacnost': '0.98'
    },
    {
        'id': '3',
        'BrojNeuronaUlazniSloj': '4',
        'BrojSkrivenihSlojeva' : '5',
        'BrojNeuronaIzlazniSloj': '1',
        'Tacnost': '0.64'
    }    
]

#UserDB

@app.route("/user/getUsers",methods=['GET'])
def getUsers():
    return jsonify({"user":userDB})

@app.route("/user/getUser/<id>",methods=['GET'])
def getUserDetails(id):
    u = [user for user in userDB if(user['id'] == id)]
    print(u)
    return jsonify({"user" : u})

@app.route("/user/updateUsername/<id>",methods=['PUT'])
def updateUserDetails(id):
    u = [user for user in userDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnik")
    if('Username' in request.json):
        u[0]['Username'] = request.json['Username']
        return jsonify({"user":u[0]})

@app.route("/user/updateEmail/<id>",methods=['PUT'])
def updateUserDetailsEmail(id):
    u = [user for user in userDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnik")
    if('Email' in request.json):
        u[0]['Email'] = request.json['Email']
        return jsonify({"user":u[0]})

@app.route("/user/updatePasswordHash/<id>",methods=['PUT'])
def updateUserDetailsPasHash(id):
    u = [user for user in userDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnik")
    if('PasswordHash' in request.json):
        u[0]['PasswordHash'] = request.json['PasswordHash']
        return jsonify({"user":u[0]})

@app.route("/user/updatePasswordSalt/<id>",methods=['PUT'])
def updateUserDetailsPasSalt(id):
    u = [user for user in userDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnik")
    if('PasswordSalt' in request.json):
        u[0]['PasswordSalt'] = request.json['PasswordSalt']
        return jsonify({"user":u[0]})

@app.route("/user/addUser",methods=['POST'])
def addUser():
    user = {
        'id' : request.json['id'],
        'FirstName' : request.json['FirstName'],
        'LastName': request.json['LastName'],
        'Username': request.json['Username'],
        'Email': request.json['Email'],
        'PasswordHash': request.json['PasswordHash'],
        'PasswordSalt': request.json['PasswordSalt']
    }
    userDB.append(user)
    return jsonify({"user":userDB})

@app.route("/user/removeUser/<id>",methods=['DELETE'])
def removeUser(id):
    u = [user for user in userDB if(user['id'] == id)]
    if(len(u) > 0):
        userDB.remove(u[0])
    return jsonify({"user" : u})


#USerLoginDB

@app.route("/user/getUsersLogin",methods=['GET'])
def getUsersLogin():
    return jsonify({"userLogin":userLoginDB})

@app.route("/user/getUserLogin/<id>",methods=['GET'])
def getUserDetailsLogin(id):
    u = [user for user in userLoginDB if(user['id'] == id)]
    print(u)
    return jsonify({"user" : u})

@app.route("/user/updateUsernameLogin/<id>",methods=['PUT'])
def updateUserDetailsLogin(id):
    u = [user for user in userLoginDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('Username' in request.json):
        u[0]['Username'] = request.json['Username']
        return jsonify({"userLogin":u[0]})

@app.route("/user/updatePasswordLogin/<id>",methods=['PUT'])
def updateUserPasswordLogin(id):
    u = [user for user in userLoginDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('Password' in request.json):
        u[0]['Password'] = request.json['Password']
        return jsonify({"userLogin":u[0]})

@app.route("/user/addUserLogin",methods=['POST'])
def addUserLogin():
    user = {
        'id' : request.json['id'],
        'Username': request.json['Username'],
        'Password': request.json['Password']
    }
    userLoginDB.append(user)
    return jsonify({"user":userLoginDB})

@app.route("/user/removeUserLogin/<id>",methods=['DELETE'])
def removeUserLogin(id):
    u = [user for user in userLoginDB if(user['id'] == id)]
    if(len(u) > 0):
        userLoginDB.remove(u[0])
    return jsonify({"user" : u})

#UserRegistrationDB

@app.route("/user/getUsersRegistration",methods=['GET'])
def getUsersRegistration():
    return jsonify({"userRegistration":UserRegistrationDB})

@app.route("/user/getUserRegistration/<id>",methods=['GET'])
def getUserDetailsRegistration(id):
    u = [user for user in UserRegistrationDB if(user['id'] == id)]
    print(u)
    return jsonify({"userRegistration" : u})

@app.route("/user/updateUserNameRegistration/<id>",methods=['PUT'])
def updateUserNameRegistartion(id):
    u = [user for user in UserRegistrationDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('Username' in request.json):
        u[0]['Username'] = request.json['Username']
        return jsonify({"userRegistration":u[0]})

@app.route("/user/updateFirstNameRegistration/<id>",methods=['PUT'])
def updateFirstNameRegistartion(id):
    u = [user for user in UserRegistrationDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('FirstName' in request.json):
        u[0]['FirstName'] = request.json['FirstName']
        return jsonify({"userRegistration":u[0]})

@app.route("/user/updateLastNameRegistration/<id>",methods=['PUT'])
def updateLastNameRegistartion(id):
    u = [user for user in UserRegistrationDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('LastName' in request.json):
        u[0]['LastName'] = request.json['LastName']
        return jsonify({"userRegistration":u[0]})

@app.route("/user/updateEmailRegistration/<id>",methods=['PUT'])
def updateEmailRegistartion(id):
    u = [user for user in UserRegistrationDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('Email' in request.json):
        u[0]['Email'] = request.json['Email']
        return jsonify({"userRegistration":u[0]})

@app.route("/user/updatePasswordRegistration/<id>",methods=['PUT'])
def updatePasswordRegistartion(id):
    u = [user for user in UserRegistrationDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('Password' in request.json):
        u[0]['Password'] = request.json['Password']
        return jsonify({"userRegistration":u[0]})

@app.route("/user/addUserRegistration",methods=['POST'])
def addUserRegistration():
    user = {
        'id' : request.json['id'],
        'Username': request.json['Username'],
        'FirstName': request.json['FirstName'],
        'LastName': request.json['LastName'],
        'Email': request.json['Email'],
        'Password': request.json['Password']
    }
    UserRegistrationDB.append(user)
    return jsonify({"userRegistration":UserRegistrationDB})

@app.route("/user/removeUserRegistration/<id>",methods=['DELETE'])
def removeUserRegistration(id):
    u = [user for user in UserRegistrationDB if(user['id'] == id)]
    if(len(u) > 0):
        UserRegistrationDB.remove(u[0])
    return jsonify({"UserRegistration" : u})

#NeuralNetworkDB

@app.route("/user/getNeuralNetworks",methods=['GET'])
def getNeuralNetworks():
    return jsonify({"NeuralNetwork":NeuralNetworkDB})

@app.route("/user/getNeuralNetwork/<id>",methods=['GET'])
def getNeuralNetwork(id):
    u = [user for user in NeuralNetworkDB if(user['id'] == id)]
    print(u)
    return jsonify({"NeuralNetwork" : u})

@app.route("/user/updateNeuralNetworkInput/<id>",methods=['PUT'])
def updateNeuralNetworkInput(id):
    u = [user for user in NeuralNetworkDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('BrojNeuronaUlazniSloj' in request.json):
        u[0]['BrojNeuronaUlazniSloj'] = request.json['BrojNeuronaUlazniSloj']
        return jsonify({"NeuralNetwork":u[0]})

@app.route("/user/updateNeuralNetworkHidden/<id>",methods=['PUT'])
def updateNeuralNetworkHidden(id):
    u = [user for user in NeuralNetworkDB if(user['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('BrojNeuronaUlazniSloj' in request.json):
        u[0]['BrojSkrivenihSlojeva'] = request.json['BrojSkrivenihSlojeva']
        return jsonify({"NeuralNetwork":u[0]})

@app.route("/user/updateNeuralNetworkAccuracy/<id>",methods=['PUT'])
def updateNeuralNetworkAccuracy(id):
    u = [network for network in NeuralNetworkDB if(network['id'] == id)]

    if('id' in request.json):
        print("Dostupan korisnikLogin")
    if('BrojNeuronaUlazniSloj' in request.json):
        u[0]['Tacnost'] = request.json['Tacnost']
        return jsonify({"NeuralNetwork":u[0]})

@app.route("/user/addNeuralNetwork",methods=['POST'])
def addNeuralNetwork():
    user = {
        'id' : request.json['id'],
        'BrojNeuronaUlazniSloj': request.json['BrojNeuronaUlazniSloj'],
        'BrojSkrivenihSlojeva': request.json['BrojSkrivenihSlojeva'],
        'BrojNeuronaIzlazniSloj': request.json['BrojNeuronaIzlazniSloj'],
        'Tacnost': request.json['Tacnost']
    }
    NeuralNetworkDB.append(user)
    return jsonify({"NeuralNetwork":NeuralNetworkDB})

@app.route("/user/removeNeuralNetwork/<id>",methods=['DELETE'])
def removeNeuralNetwork(id):
    u = [network for network in NeuralNetworkDB if(network['id'] == id)]
    if(len(u) > 0):
        NeuralNetworkDB.remove(u[0])
    return jsonify({"NeuralNetwork" : u})


if(__name__=="__main__"):
    app.run()
