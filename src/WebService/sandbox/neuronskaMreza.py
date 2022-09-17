import numpy as np
import matplotlib.pyplot as plt
import neurolab as nl

min_val = -30
max_val = 30
num_point = 160
#linspace(ravnoperno rasporedjuje 160 tacaka u intervalu od -30 do 30)
x = np.linspace(min_val,max_val,num_point)
y = 2 * np.square(x) + 8
#dobijaju se vrednosti za y koje su normirane
y /= np.linalg.norm(y)

data = x.reshape(num_point, 1)
labels = y.reshape(num_point, 1)

#vizuelizacija podataka
plt.figure()
plt.scatter(data, labels)
plt.xlabel('Dimenzija 1')
plt.ylabel('Dimenzija 2')
plt.title('Jednacina 2*x^2+8')

# neuronska mreza sa 2 skrivena sloja,prvi skriveni sloj ima 10 neurona,
# drugi skriveni sloj ima 6 i 1 neuron u izlaznom sloju
neural_net = nl.net.newff([[min_val,max_val]], [10, 6, 1])

#upotreba gradient algoritma
neural_net_trainf = nl.train.train_gd

error = neural_net.train(data, labels, epochs = 1000, show = 100, goal = 0.01)


output = neural_net.sim(data)
y_pred = output.reshape(num_point)

plt.figure()
plt.plot(error)
plt.xlabel("Broj epoha")
plt.ylabel("Greska")
plt.title('Napredak trening greske')

#vizuelizacija predvidjenog modela i uporedjivanje sa stvarnim podacima
x_danse = np.linspace(min_val, max_val, num_point * 2)
y_dense_pred = neural_net.sim(x_danse.reshape(x_danse.size,1)).reshape(x_danse.size)
plt.figure()
plt.plot(x_danse,y_dense_pred,'-',x,y,'.',x,y_pred,'p')
plt.title('Stvarno protiv predvidjenog')
plt.show()