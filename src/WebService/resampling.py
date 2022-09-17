from errno import ENOKEY
from statistics import LinearRegression
from tkinter import Menu
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
import numpy as np

from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
from sklearn.model_selection import KFold, LeaveOneOut
from sklearn.utils import resample
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

def get_score(model, X_train, x_test, y_train, y_test):
    model.fit(X_train, y_train)
    return model.score(x_test, y_test)

def enkodiranje(data):
    for kolona in data.columns:
        if data[kolona].dtypes == 'O':
            labelencode = LabelEncoder()
            data[kolona] = labelencode.fit_transform(data[kolona])

# get_score(SVC(), X_train, X_test, y_train, y_test)

# argument ulazi predstavlja listu
def KFoldCrossValidationLinRegresija(fajl, ulazi, izlaz):

    data = pd.read_csv(fajl)

    X = data[ulazi]
    y = data[izlaz]

    X = X.fillna(0)
    y = y.fillna(0)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    cv = KFold(n_splits = 10, random_state = 1, shuffle=True)

    model = LinearRegression()

    scores = cross_val_score(model, X, y, scoring='neg_mean_absolute_error', cv = cv, n_jobs=-1)

    return np.absolute(scores)

# argument ulazi predstavlja listu
def KFoldCrossValidationKlasifikacija(fajl, ulazi, izlaz):

    data = pd.read_csv(fajl)

    X = data[ulazi]
    y = data[izlaz]

    X = X.fillna(0)
    y = y.fillna(0)
    enkodiranje(data)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    cv = KFold(n_splits = 10, random_state = 1, shuffle=True)

    model = LogisticRegression()

    scores = cross_val_score(model, X, y, scoring='neg_mean_absolute_error', cv = cv, n_jobs=-1)

    return np.absolute(scores)

def bootstrapResampling(fajl):

    data = pd.read_csv(fajl)

    for kolona in data.columns:
        if data[kolona].dtypes == 'O':
            labelencode = LabelEncoder()
            data[kolona] = labelencode.fit_transform(data[kolona])
    
    data = data.fillna(0)

    vrednosti = data.values

    n_iteracija = 10
    n_velicina = int(len(data) * 0.8) 

    stats = list()
    for i in range(n_iteracija):

        #Uzorkujemo sa zamenom...koji god podaci nisu korisceni u trening skupu koriste se u testnom skupu
        train = resample(vrednosti, n_samples = n_velicina)

        # Pokupiti ostatak podataka koji nisu u trening skupu
        test = np.array([x for x in vrednosti if x.tolist() not in train.tolist()])

        model = DecisionTreeClassifier()
        model.fit(train[:,:-1], train[:,-1])

        predikcije = model.predict(test[:,:-1])
        
        score = accuracy_score(test[:,-1], predikcije)

        stats.append(score)
    
    return stats

# rezulati = KFoldCrossValidationLinRegresija('student-por.csv', ['Fedu','Medu'], 'studytime')
# rezulati
# rez = bootstrapResampling('IMDB-Movie-Data.csv')
# rez
