import numpy as np
from keras.models import Sequential
from keras.layers import LSTM, Input, Dropout
from keras.layers import Dense
from keras.layers import RepeatVector
from keras.layers import TimeDistributed
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.preprocessing import MinMaxScaler, StandardScaler, scale
from keras.models import Model
import seaborn as sns

okvir = pd.read_csv('GE.csv')
#print(okvir.head())
df = okvir[['Date','Close']]
#print(df.head())
df_final = df.copy()
df_final['Date'] = pd.to_datetime(df_final['Date'])
#print(df_final.head())
#print(df_final.shape)

#df_final['Date'].dtype

sns.lineplot(x=df_final['Date'], y=df_final['Close'])
plt.show()

print("Pocetni datum je : ",df_final['Date'].min())
print("Poslednji datum je : ",df_final['Date'].max())


train, test = df_final.loc[df_final['Date'] <= '2021-09-30'], df_final.loc[df_final['Date'] > '2021-09-30']


#Konvertovati pandas dataframe u numpy niz
#dataset = dataframe.values
#dataset = dataset.astype('float32') #Konvertovati vrednosti u float

#LSTM koristi sigmoid i tanh koje su osetljive na velicinu pa vrednosti moraju da se normalizuju
#Normalizujemo dataset
scaler = MinMaxScaler() #Takodje probaj QuantileTransformer
#scaler = StandardScaler()
scaler = scaler.fit(train[['Close']])
#scaler = scaler.fit(test[['Close']])

train_final = train.copy()
test_final = test.copy()

train_final[['Close']] = scaler.transform(train_final[['Close']])
test_final[['Close']] = scaler.transform(test_final[['Close']])

print(train_final)
print(test_final)

seq_size = 20 #Broj vremenskih koraka za pogled u nazad
#Vece sekvencionisanje(pogled vise unazad) moze poboljsati prognoziranje

def to_sequences(x, y, seq_size=1):
    x_vrednosti = []
    y_vrednosti = []

    for i in range(len(x)-seq_size):
        #print(i)
        x_vrednosti.append(x.iloc[i:(i+seq_size)].values)
        y_vrednosti.append(y.iloc[i+seq_size])

    return np.array(x_vrednosti), np.array(y_vrednosti)

trainX, trainY = to_sequences(train_final[['Close']], train_final['Close'], seq_size)
testX, testY = to_sequences(test_final[['Close']], test_final['Close'], seq_size)

#print(trainX)
#print(trainY)

#Pravljenje modela
model = Sequential()
model.add(LSTM(128, input_shape=(trainX.shape[1], trainX.shape[2])))
model.add(Dropout(rate=0.2))

model.add(RepeatVector(trainX.shape[1]))

model.add(LSTM(128, return_sequences=True))
model.add(Dropout(rate=0.2))
model.add(TimeDistributed(Dense(trainX.shape[2])))
model.compile(optimizer='adam', loss='mae')
model.summary()

# fit model
history = model.fit(trainX, trainY, epochs=10, batch_size=32, validation_split=0.1,verbose=1)

plt.plot(history.history['loss'], label='Trening loss')
plt.plot(history.history['val_loss'], label='Validacioni loss')
plt.legend()
plt.show()

# Anomalija je gde je greska rekonstrukcije velika
# Mozemo da definisemo ovu vrednost uprkos tome sto je zovemo anomalija

trainPredict = model.predict(trainX)
trainMAE = np.mean(np.abs(trainPredict - trainX), axis=1)
plt.hist(trainMAE, bins=20)
plt.show()
max_trainMAE = 0.27 #ili definisati 90% vrednosti maksimuma kao prag

testPredict = model.predict(testX)
testMAE = np.mean(np.abs(testPredict - testX), axis=1)
plt.hist(testMAE, bins=20)
plt.show()

# Uhvati sve detalje u DataFrame-u za lako isrctavanje
anomaly_df = pd.DataFrame(test_final[seq_size:])
anomaly_df['testMAE'] = testMAE
anomaly_df['max_trainMAE'] = max_trainMAE
anomaly_df['anomaly'] = anomaly_df['testMAE'] > anomaly_df['max_trainMAE']
anomaly_df['Close'] = test_final[seq_size:]['Close']

#print(anomaly_df['testMAE'])

sns.lineplot(x=anomaly_df['Date'], y=anomaly_df['testMAE'])
sns.lineplot(x=anomaly_df['Date'], y=anomaly_df['max_trainMAE'])
plt.show()

anomalije = anomaly_df.loc[anomaly_df['anomaly'] == True]

# niz = anomaly_df['Date'].values
# print(reshape_niz.shape)
# print(anomaly_df['Date'].shape)
niz_df = anomaly_df['Close'].values
reshape_niz_df = niz_df.reshape((-1,1))

reshape_niz_dfDuzina , _= reshape_niz_df.shape
print(reshape_niz_dfDuzina)

inv_df = scaler.inverse_transform(reshape_niz_df)
inv_df = inv_df.reshape((reshape_niz_dfDuzina,))

niz_anomalije = anomalije['Close'].values
reshape_niz_anomalije = niz_anomalije.reshape((-1,1))
print(reshape_niz_anomalije.shape)

reshape_niz_anomalijeDuzina , _= reshape_niz_anomalije.shape
print(reshape_niz_anomalijeDuzina)

inv_anomalije = scaler.inverse_transform(reshape_niz_anomalije)
inv_anomalije = inv_anomalije.reshape((reshape_niz_anomalijeDuzina,))

#Prikazi anomalije
sns.lineplot(x=anomaly_df['Date'], y=inv_df)
sns.scatterplot(x=anomalije['Date'], y=inv_anomalije, color='r')
plt.show()

