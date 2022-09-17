from numpy import unique
from numpy import argmax
from pandas import read_csv
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import plot_model
import tensorflow as tf
from tensorflow.keras.layers import Layer

import utils

# ucitaj set podataka
url = 'https://raw.githubusercontent.com/jbrownlee/Datasets/master/abalone.csv'
dataframe = read_csv(url, header=None)
dataset = dataframe.values

# podeliti na ulazne (X) i izlazne (y) promenljive
X, y = dataset[:, 1:-1], dataset[:, -1]
X, y = X.astype('float'), y.astype('float')
n_features = X.shape[1]

# enkodirati string u integer pomocu label enkodiranja
y_class = LabelEncoder().fit_transform(y)
n_class = len(unique(y_class))

# podeli podatke na testni i trening skup
X_train, X_test, y_train, y_test, y_train_class, y_test_class = train_test_split(X, y, y_class, test_size=0.33, random_state=1)

# ulaz
visible = Input(shape=(n_features,))
hidden1 = Dense(30, activation='relu', kernel_initializer='he_normal')(visible)
hidden2 = Dense(20, activation='relu', kernel_initializer='he_normal')(hidden1)

# izlaz regresija
out_reg = Dense(1, activation='linear')(hidden2)

# izlaz klasifikacija
out_clas = Dense(n_class, activation='softmax')(hidden2)

# definisati model
model = Model(inputs=visible, outputs=[out_reg, out_clas])

# kompajliraj keras model
model.compile(loss=['mse','sparse_categorical_crossentropy'], optimizer='adam')

model.fit(X_train, [y_train,y_train_class], epochs=150, batch_size=32, verbose=2)

# Napraviti predvidaj na testnom skupu
yhat1, yhat2 = model.predict(X_test)

# Izracunati gresku za regresioni model
error = mean_absolute_error(y_test, yhat1)
print('MAE: %.3f' % error)

# Izracunati gresku za klasifikacioni model
yhat2 = argmax(yhat2, axis=-1).astype('int')
acc = accuracy_score(y_test_class, yhat2)
print('Tacnost: %.3f' % acc)

class kvadratnaFunkcija(Layer):

    def __init__(self, units=32, activation=None):
        
        super(kvadratnaFunkcija, self).__init__()
        self.units = units
        self.activation = tf.keras.activations.get(activation)
    
    def build(self, ulazni_oblik):

        # a i b bi trebalo da se inicijalizuju slucajno normalno, c(ili bias) sa zeros
        # zapamtiti da se postave kao pogodne za obuku
        a_init = tf.random_normal_initializer()
        b_init = tf.random_normal_initializer()
        c_init = tf.zeros_initializer()
        
        self.a = tf.Variable(name = "kernel", initial_value = a_init(shape= (ulazni_oblik[-1], self.units), 
                                                                    dtype= "float32"), trainable = True)
        
        self.b = tf.Variable(name = "kernel", initial_value = b_init(shape= (ulazni_oblik[-1], self.units), 
                                                                    dtype= "float32"), trainable = True)
        
        self.c = tf.Variable(name = "bias", initial_value = c_init(shape= (self.units,), 
                                                                    dtype= "float32"), trainable = True)
   
    def call(self, ulazi):
        
        result = tf.matmul(tf.math.square(ulazi), self.a) + tf.matmul(ulazi, self.b) + self.c
        return self.activation(result)  


