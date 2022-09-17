import numpy as np
import pandas as pd

from keras.datasets import mnist
from keras.models import Sequential
from keras.layers.core import Dense, Dropout, Activation, Flatten, Reshape
from keras.layers.convolutional import Convolution1D, Convolution2D, MaxPooling2D
from keras.utils import np_utils
from sklearn.preprocessing import LabelEncoder

def labelEnkodiranje(data):
    for feature in data.columns:
        if data[feature].dtypes == 'O':
            labelencode = LabelEncoder()
            data[feature] = labelencode.fit_transform(data[feature])

data = np.random.rand(200,2)
expected = np.random.randint(2, size=200).reshape(-1,1)

dataFrame = pd.DataFrame(data, columns = ['a','b'])
expectedFrame = pd.DataFrame(expected, columns = ['expected'])

dataFrameTrain, dataFrameTest = dataFrame[:100],dataFrame[-100:]
expectedFrameTrain, expectedFrameTest = expectedFrame[:100],expectedFrame[-100:]

def generator(X_data, y_data, batch_size):

    samples_per_epoch = X_data.shape[0]
    number_of_batches = samples_per_epoch/batch_size
    counter=0

    while 1:

        X_batch = np.array(X_data[batch_size*counter:batch_size*(counter+1)]).astype('float32')
        y_batch = np.array(y_data[batch_size*counter:batch_size*(counter+1)]).astype('float32')
        counter += 1
        yield X_batch,y_batch

    # restartuj brojac da bismo dobili podatke u sledecoj epohi
        if counter >= number_of_batches:
            counter = 0
    
def napravi_model(dataFrame, dataFrameTrain, expectedFrameTrain, dataFrameTest, expectedFrameTest, batch_size, epohe):

    model = Sequential()
    model.add(Dense(12, activation='relu', input_dim=dataFrame.shape[1]))
    model.add(Dense(1, activation='sigmoid'))

    model.compile(loss='binary_crossentropy', optimizer='adadelta', metrics=['accuracy'])

    model.fit_generator(
        generator(dataFrameTrain,expectedFrameTrain,batch_size),
        epochs = epohe,
        steps_per_epoch = dataFrame.shape[0]/batch_size,
        validation_data = generator(dataFrameTest,expectedFrameTest,batch_size*2),
        validation_steps = dataFrame.shape[0]/batch_size*2
    )

    return model

napravi_model(dataFrame, dataFrameTrain, expectedFrameTrain, dataFrameTest, expectedFrameTest, 8, 5)