from tabnanny import verbose
from textwrap import wrap
from time import time
from turtle import forward
import numpy as np
import pandas as pd
import seaborn as sns

from sklearn import preprocessing
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier,RandomForestRegressor
from sklearn.metrics import accuracy_score
from sklearn.feature_selection import SelectFromModel, VarianceThreshold, mutual_info_classif, mutual_info_regression
from sklearn.feature_selection import SelectKBest, SelectPercentile
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectFromModel

# pip install mlxtend
from mlxtend.feature_selection import SequentialFeatureSelector

def labelEnkodiranje(data):
    for feature in data.columns:
        if data[feature].dtypes == 'O':
            labelencode = LabelEncoder()
            data[feature] = labelencode.fit_transform(data[feature])

def otklanjanje_featura_konstante(file,outputs):
    
    data = pd.read_csv(file, sep=None, engine='python')
    data.dropna(inplace = True)
    labelEnkodiranje(data)

    X = data.drop(outputs,axis = 1)
    y = data[outputs]

    X_train,X_test,y_train,y_test = train_test_split(X, y, test_size=0.2, random_state = 0)

    # Oklanjanje konstatntnih featura
    konstant_filter = VarianceThreshold(threshold=0)
    konstant_filter.fit(X_train)

    konstant_lista = [not temp for temp in konstant_filter.get_support()]
    # print(konstant_lista)

    X_train_filter = konstant_filter.transform(X_train)
    X_test_filter = konstant_filter.transform(X_test)

    # Otklanjanje kvazi konstant featura
    kvazi_konstant_filter = VarianceThreshold(threshold=0.01)
    kvazi_konstant_filter.fit(X_train_filter)
    X_train_kvazi_filter = kvazi_konstant_filter.transform(X_train_filter)
    X_test_kvazi_filter = kvazi_konstant_filter.transform(X_test_filter)

    # Otklanjanje dupliranih podataka
    # Transponovanje 
    X_train_T = X_train_kvazi_filter.T
    X_test_T = X_test_filter.T
    # print(type(X_train_T)) #pretvoreno u niz
    # Pretvoriti niz u datframe 
    X_train_T = pd.DataFrame(X_train_T)
    X_test_T = pd.DataFrame(X_test_T)
    #print(X_train_T.shape,X_test_T.shape)
    #print(X_train_T.duplicated().sum())
    duplirani_featuri = X_train_T.duplicated()
    # print(duplirani_featuri)
    feature_zadrzani = [not index for index in duplirani_featuri]
    
    X_train_unikati = X_train_T[feature_zadrzani].T
    X_test_unikati = X_test_T[feature_zadrzani].T
    # print(X_train.shape,X_train_unikati.shape)

    return X_train_unikati,X_test_unikati

# X_train_unikati, X_test_unikati = otklanjanje_featura_konstante('fuel.csv',['Weight','Horsepower'])

# Selekcija featura na osnovu medjusobnog informisanja
def mutual_information_klasifikacija(file, output, udeo):
    data = pd.read_csv(file, sep=None, engine='python')    
    data.dropna(inplace = True)
    labelEnkodiranje(data)

    X = data.drop(output,axis = 1)
    y = data[output]

    X_train, X_test, y_train,y_test = train_test_split(X, y, test_size=0.2, random_state=0)

    X_train_unikati, X_test_unikati = otklanjanje_featura_konstante(file,output)

    # percentila oznacava koliki broj featura ce se preuzeti(procenti)
    sel = SelectPercentile(mutual_info_classif, percentile=udeo).fit(X_train_unikati, y_train)
    X_train_unikati.columns[sel.get_support()]
    kolone = X_train.columns[sel.get_support()]   

    X_train_mi = sel.transform(X_train_unikati)
    X_test_mi = sel.transform(X_test_unikati)

    return X_train_mi,X_test_mi,kolone

# X_train, x_test, kolone = mutual_information_klasifikacija('student-por.csv','sex',10)

def mutual_information_regresija(file,output,broj_featura):    
    
    data = pd.read_csv(file, sep=None, engine='python')
    data.dropna(inplace = True)
    labelEnkodiranje(data)
    X_train_unikati, X_test_unikati = otklanjanje_featura_konstante(file,output)

    X = data.drop(output,axis = 1)
    y = data[output]

    X_train, X_test, y_train,y_test = train_test_split(X, y, test_size=0.2, random_state=0)

    X_train.dtypes

    mi = mutual_info_regression(X_train, y_train)
    mi = pd.Series(mi)
    mi.index = X_train.columns
    mi.sort_values(ascending=False, inplace = True)

    sel = SelectKBest(mutual_info_regression, k = broj_featura).fit(X_train, y_train)
    kolone = X_train.columns[sel.get_support()]   
    
    x_train_k = sel.transform(X_train)
    x_test_k = sel.transform(X_test)

    return x_train_k, x_test_k, kolone

# X_train, x_test, kolone = mutual_information_regresija('fuel.csv','Weight',4)

from mlxtend.feature_selection import SequentialFeatureSelector

# Wrapper metod
def wrapper_metod_regresija(file, outputs, broj_featura):

    data = pd.read_csv(file, sep=None, engine='python')
    data.dropna(inplace = True)
    labelEnkodiranje(data)

    X = data.drop(outputs,axis = 1)
    y = data[outputs]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,random_state=0)
    # print(X_train.shape,X_test.shape) 
    # Step forward feature selection
    feature_select = SequentialFeatureSelector(LinearRegression(),
                                           k_features=broj_featura,
                                           forward=True,
                                           floating=False,
                                           scoring='r2'
                                           )
    feature_select.fit(X_train, y_train)
        
    dataframe = pd.DataFrame.from_dict(feature_select.get_metric_dict()).T

    return dataframe

# df = wrapper_metod_regresija('fuel.csv','Weight',4)
# df['feature_names']

def wrapper_metod_klasifikacija(file, outputs, broj_featura):

    data = pd.read_csv(file, sep=None, engine='python')
    data.dropna(inplace = True)
    labelEnkodiranje(data)

    if data[outputs].dtypes == 'O':
        labelencode = LabelEncoder()
        data[outputs] = labelencode.fit_transform(data[outputs])

    X = data.drop(outputs,axis = 1)
    y = data[outputs]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,random_state=0)
    # print(X_train.shape,X_test.shape) 
    # Step forward feature selection

    feature_select = SequentialFeatureSelector(LogisticRegression(),
                                           k_features=broj_featura,
                                           forward=True,
                                           floating=False,
                                           scoring='r2'
                                           )
    
    feature_select.fit(X_train, y_train)

    dataframe = pd.DataFrame.from_dict(feature_select.get_metric_dict()).T
    
    return dataframe

# df=wrapper_metod_klasifikacija('student-por.csv','Medu',3)
# print(df['feature_names'])

# Regresija
def LinearRegularization(file,outputs):
    
    data = pd.read_csv(file, sep=None, engine='python')
    data.dropna(inplace = True)
    labelEnkodiranje(data)

    X = data.drop(outputs,axis = 1)
    y = data[outputs]

    X_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state = 43)

    sel = SelectFromModel(LinearRegression())
    sel.fit(X_train, y_train)
    sel.get_support()
    sel.estimator_.coef_

    mean = np.mean(np.abs(sel.estimator_.coef_))

    featuri = X_train.columns[sel.get_support()]

    X_train_reg = sel.transform(X_train)
    x_test_reg = sel.transform(x_test)

    X_train_df = pd.DataFrame(X_train_reg,columns=[featuri])
    X_test_df = pd.DataFrame(x_test_reg,columns=[featuri])

    lista_featura = []

    for col in X_train_df.columns:
        lista_featura = lista_featura + [col]

    return X_train_df, X_test_df, lista_featura

# train, test, lista = LinearRegularization('fuel.csv','Weight')

# Logisticka regresija koeficijent sa L1 regularizacijom
def l1_l2_regularizacija(file,outputs):
    
    data = pd.read_csv(file, sep=None, engine='python')
    data.dropna(inplace = True)
    labelEnkodiranje(data)

    X = data.drop(outputs,axis = 1)
    y = data[outputs]

    X_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state = 43)

    sel = SelectFromModel(LogisticRegression(penalty='l1', C = 0.1, solver = 'liblinear'))
    sel.fit(X_train, y_train)
    sel.get_support()
    sel.estimator_.coef_

    sel2 = SelectFromModel(LogisticRegression(penalty='l2', C = 0.1, solver = 'liblinear'))
    sel2.fit(X_train, y_train)
    sel2.get_support()
    sel2.estimator_.coef_

    featuri = X_train.columns[sel.get_support()]
    featuri2 = X_train.columns[sel2.get_support()]

    X_train_l1 = sel.transform(X_train)
    X_test_l1 = sel.transform(x_test)

    X_train_l2 = sel2.transform(X_train)
    X_test_l2 = sel2.transform(x_test)

    X_train_dfL1 = pd.DataFrame(X_train_l1,columns=[featuri])
    X_test_dfL1 = pd.DataFrame(X_test_l1,columns=[featuri])
    
    X_train_dfL2 = pd.DataFrame(X_train_l2,columns=[featuri2])
    X_test_dfL2 = pd.DataFrame(X_test_l2,columns=[featuri2])

    return X_train_dfL1, X_test_dfL1, X_train_dfL2, X_test_dfL2

# trainL1, testL1, trainL2, testL2 = l1_l2_regularizacija('student-por.csv','sex')

# Napraviti model i uporedi performanse
# def run_randomForest(X_train, X_test,y_train, y_test):
#     klf = RandomForestClassifier(n_estimators=100, random_state=0, n_jobs=-1)
#     klf.fit(X_train, y_train)
#     y_pred = klf.predict(X_test)
#     print('Tacnost na test skupu: ')
#     print(accuracy_score(y_test, y_pred))

# run_randomForest(X_train_reg, x_test_reg,y_train,y_test)
# run_randomForest(X_train, x_test,y_train,y_test)
