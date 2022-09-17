import pandas as pd
import numpy as np
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder
import re
from sklearn.linear_model import LogisticRegression,LinearRegression
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score

def vrati_ocisceno(x):
    x = str(x).lower().replace('\\','').replace('_', ' ')
    x = re.sub("(.)\\1{2,}", "\\1", x)
    return x

def sentimentAnaliza(file, tekstFeature, izlaz, maksimum):
    
    df = pd.read_csv(file)

    df[tekstFeature] = df[tekstFeature].apply(lambda x: vrati_ocisceno(x))

    tfidf = TfidfVectorizer(max_features=maksimum)
    X = df[tekstFeature]
    y = df[izlaz]

    X = tfidf.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 0)

    clf = LinearSVC()
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    izvestaj = classification_report(y_test, y_pred)

    return izvestaj

# izvestaj = sentimentAnaliza('Train.csv','text','label',10000)
# print(izvestaj)

def labelEnkodiranje(data):
    for feature in data.columns:
        if data[feature].dtypes == 'O':
            labelencode = LabelEncoder()
            data[feature] = labelencode.fit_transform(data[feature])

def pcaRedukcija(file, output):
    
    df = pd.read_csv(file)
    labelEnkodiranje(df)
    df = df.dropna()

    df[output].value_counts()

    y = df[output]
    x = df.drop(output,axis = 1)

    scaler = MinMaxScaler()
    skalirani_df = scaler.fit_transform(x)
    skalirani_df[0:5]

    # Pretvaranje iz niza u dataframe
    imena = x.columns
    skalirani_df = pd.DataFrame(skalirani_df, columns = imena)
    skalirani_df.describe()

    pca = PCA()
    pca.fit(skalirani_df)

    skalirani_df.shape[1]

    varijance = pd.DataFrame(pca.explained_variance_ratio_).iloc[:skalirani_df.shape[1], :]
    niz = varijance.to_numpy()

    brojFeatura = 0
    procenat = 0
    for i in range(len(niz)):
        procenat += niz[i]
        brojFeatura = brojFeatura + 1
        if(procenat>=0.95):
            break

    # plt.figure()
    # plt.plot(np.cumsum(pca.explained_variance_ratio_))
    # plt.xlabel('Broj komponenti')
    # plt.ylabel('Variansa')
    # plt.title('Objasnjenje varijanse')
    # plt.show()

    pca = PCA(n_components=brojFeatura)
    pca.fit(skalirani_df)
    skalirani_df_x = pca.transform(skalirani_df)

    skalirani_df_x = pd.DataFrame(skalirani_df_x)
    skalirani_df_x.head()

    return skalirani_df_x, brojFeatura, x, y

# skal, brojFeatura, x, y = pcaRedukcija('fuel.csv','Cylinders')
# x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=0)
# LR = LogisticRegression()
# LR.fit(x_train, y_train)
# pred = LR.predict(x_test)

# # Tacnost 
# accuracy_score(y_test,pred)