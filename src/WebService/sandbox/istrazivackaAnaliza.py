import re
from typing import Counter
from debugpy import connect
import matplotlib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn import svm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelBinarizer
import tokenizer
from skracenice import *

import plotly as py
import cufflinks as cf
# pip install nltk
import nltk
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('tagsets')
from nltk.corpus import stopwords
from nltk.tokenize.toktok import ToktokTokenizer
from sklearn.preprocessing import LabelBinarizer
from sklearn.naive_bayes import MultinomialNB

import plotly.express as px
import plotly.graph_objects as go

from plotly.offline import iplot
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression,SGDClassifier
from sklearn.metrics import classification_report,confusion_matrix,accuracy_score

py.offline.init_notebook_mode(connected=True)
cf.go_offline()

df = pd.read_csv("Womens-Clothing-E-Commerce-Reviews.csv",index_col=0)
df.head()

df.drop(labels=['Title', 'Clothing ID'], axis = 1, inplace = True)
df.head()

# Proverimo koliko svaka kolona ima null vrednosti
df.isnull().sum()

df.dropna(subset=['Review Text', 'Division Name'], inplace = True)

' '.join(df['Review Text'].tolist())

tokenizer=ToktokTokenizer()
stopword_list=nltk.corpus.stopwords.words('english')

def strip_html(text):
    soup = BeautifulSoup(text, "html.parser")
    return soup.get_text()

def remove_between_square_brackets(text):
    return re.sub('\[[^]]*\]','',text)

# Otklomi sve nepotrebne elemente u tekstu
def denoise_text(text):
    text = strip_html(text)
    text = remove_between_square_brackets(text)
    return text

text_primer = "Uros  zabusava] <br>Uros</br>"
denoise_text(text_primer)

train_rviews = df['Review Text'][:18000]
train_IND = df['Recommended IND'][:18000]

test_review = df['Review Text'][18000:]
test_IND = df['Recommended IND'][18000:]

print(train_rviews.shape, train_IND.shape)
print(test_review.shape, test_IND.shape)

# Primeniti funkciju na kolonu sa tekstom
df['Review Text'] = df['Review Text'].apply(denoise_text)

def otkloni_spec_karaktere(text, remove_digits = True):
    pattern = r'[^a-zA-Z0-9\s]'
    text = re.sub(pattern,'',text)
    return text

df['Review Text'] = df['Review Text'].apply(otkloni_spec_karaktere)

df['Review Text'].describe

stop = set(stopwords.words('english'))
print(stop)

def otkloni_stopwords(text, is_lower_case = False):
    tokens = tokenizer.tokenize(text)
    tokens = [token.strip() for token in tokens]
    if is_lower_case:
        filtrirani_tokeni = [token for token in tokens if token not in stopword_list]
    else:
        filtrirani_tokeni = [token for token in tokens if token.lower() not in stopword_list]
    filtrirani_text = ' '.join(filtrirani_tokeni)
    return filtrirani_text

df['Review Text'] = df['Review Text'].apply(otkloni_stopwords)

norm_train_reviews = df['Review Text'][:18000]
norm_train_reviews[0]

norm_test_reviews = df['Review Text'][18000:]
norm_train_reviews[18546]



skracenice = skrac_prod()

def skrac_produzene(x):
    if type(x) is str:
        x = x.replace('\\','')
        for kljuc in skracenice:
            vrednost = skracenice[kljuc]
            x = x.replace(kljuc, vrednost)
        return x
    else:
        return x

x_primer = "i don't know what date is today, I am 5'8\""
print(skrac_produzene(x_primer))

df['Review Text'] = df['Review Text'].apply(lambda x: skrac_produzene(x))

print(' '.join(df['Review Text'].tolist())[:1000])

df['polarity'] = df['Review Text'].apply(lambda x: TextBlob(x).sentiment.polarity)
df['review_duzina'] = df['Review Text'].apply(lambda x: len(x))
df['broj_reci'] = df['Review Text'].apply(lambda x: len(x.split()))

def get_avg_word_len(x):
    reci = x.split()
    duzina_rec = 0
    for rec in reci:
        duzina_rec = duzina_rec + len(rec)
    
    return duzina_rec/len(reci)

df['pros_duzina_reci'] = df['Review Text'].apply(lambda x: get_avg_word_len(x))

df.describe()
df.columns

df.groupby('Department Name')
df['Department Name'].value_counts()
df.groupby('Department Name').count()

x = 'Ovo je mali test primer'

# unigram = Ovo, je, mali, test, primer
# biagram = Ovo je, je mali, mali test, test primer
# triagram = Ovo je mali, je mali test, mali test primer

#Unigram
def uzmi_n_reci_vrh(x, n):
    vec = CountVectorizer().fit(x)
    bow = vec.transform(x)
    sum_words = bow.sum(axis = 0)
    reci_frek = [(rec, sum_words[0, ind]) for rec, ind in vec.vocabulary_.items()]
    reci_frek = sorted(reci_frek, key=lambda x: x[1],reverse = True)
    return reci_frek[:n]

reci = uzmi_n_reci_vrh(df['Review Text'], 20)
reci

df1 = pd.DataFrame(reci, columns = ['Unigram','Frekfencija'])
df1

# Bigram
def uzmi_n_reci_vrhBigram(x, n):
    vec = CountVectorizer(ngram_range=(2,2)).fit(x)
    bow = vec.transform(x)
    sum_words = bow.sum(axis = 0)
    reci_frek = [(rec, sum_words[0, ind]) for rec, ind in vec.vocabulary_.items()]
    reci_frek = sorted(reci_frek, key=lambda x: x[1],reverse = True)
    return reci_frek[:n]

reciBiagram = uzmi_n_reci_vrhBigram(df['Review Text'],20)
reciBiagram

df2 = pd.DataFrame(reciBiagram, columns = ['Bigram','Frekfencija'])
df2

#Trigram
def uzmi_n_reci_vrhTrigram(x, n):
    vec = CountVectorizer(ngram_range=(3,3)).fit(x)
    bow = vec.transform(x)
    sum_words = bow.sum(axis = 0)
    reci_frek = [(rec, sum_words[0, ind]) for rec, ind in vec.vocabulary_.items()]
    reci_frek = sorted(reci_frek, key=lambda x: x[1],reverse = True)
    return reci_frek[:n]

reciTrigram = uzmi_n_reci_vrhTrigram(df['Review Text'],20)
reciTrigram

df3 = pd.DataFrame(reciTrigram, columns = ['Trigram','Frekfencija'])
df3

# Unigram sa stop_words
def uzmi_n_reci_vrh(x, n):
    vec = CountVectorizer(ngram_range=(1,1), stop_words='english').fit(x)
    bow = vec.transform(x)
    sum_words = bow.sum(axis = 0)
    reci_frek = [(rec, sum_words[0, ind]) for rec, ind in vec.vocabulary_.items()]
    reci_frek = sorted(reci_frek, key=lambda x: x[1],reverse = True)
    return reci_frek[:n]

reci = uzmi_n_reci_vrh(df['Review Text'], 20)
dfUni = pd.DataFrame(reci, columns = ['Unigram','Frekfencija'])
dfUni

blob = TextBlob(str(df['Review Text']))
blob
print(nltk.help.upenn_tagset())
blob.tags

pos_df = pd.DataFrame(blob.tags, columns = ['reci','pos'])
pos_df = pos_df['pos'].value_counts()
pos_df

cv = CountVectorizer(min_df = 0,max_df = 1,binary = False,ngram_range=(1,3))
cv_train_review = cv.fit_transform(norm_train_reviews)
cv_test_review = cv.transform(norm_test_reviews)

print('BOW_cv_train: ',cv_train_review.shape)
print('BOW_cv_test: ',cv_test_review.shape)

tv = TfidfVectorizer(min_df=0,max_df=1,use_idf=True,ngram_range=(1,3))
tv_train_review = tv.fit_transform(norm_train_reviews)
tv_test_review = tv.transform(norm_test_reviews)

print('TfidF_train: ',tv_train_review.shape)
print('Tfidf_test: ',tv_test_review.shape)

lb = LabelBinarizer()
IND_data = lb.fit_transform(df['Recommended IND'])

train_IND = IND_data[:18000]
test_IND = IND_data[18000:]

#Treniranje modela
lr = LogisticRegression(penalty='l2',max_iter=500,C=1,random_state=42)
lr_bow = lr.fit(cv_train_review,train_IND)
print(lr_bow)

lr_tfiddf = lr.fit(tv_train_review, train_IND)
print(lr_tfiddf)

swm_bow_predik = lr.predict(cv_test_review)
print(swm_bow_predik[1000:2000])

swm_tfiddf_pred = lr.predict(tv_test_review)
print(swm_bow_predik)

# Tacnost modela
swm_bow_score = accuracy_score(test_IND,swm_bow_predik)
print("bow_score :",swm_bow_score)

svm_tfidf_score = accuracy_score(test_IND,swm_tfiddf_pred)
print("tfidf_score :",svm_tfidf_score)

def prikaz_kategorija(df, kateg_vred, kontinualna):
    sns.catplot(x = kateg_vred, y =kontinualna, data =df)
    sns.catplot(x = kateg_vred, y =kontinualna, data =df, kind = 'box')
    plt.show()

# prikaz_kategorija(df,'Department Name', 'review_duzina')

x1 = df[df['Recommended IND'] == 1]['polarity']
x0 = df[df['Recommended IND'] == 0]['polarity']

trace0 = go.Histogram(x = x0, name = 'Ne preporuceni', opacity =0.7)
trace1 = go.Histogram(x = x1, name = 'Preporuceni', opacity =0.7)

data = [trace0, trace1]
layout = go.Layout(barmode = 'overlay', title = 'Distribucija polariteta sentimenta recenzija baziranog na preporuci')
fig = go.Figure(data = data, layout = layout)
fig


def prikazi_plot(df, x, y):
    sns.jointplot(x = x, y = y, data =df)
    plt.show()

# prikazi_plot(df,"polarity","Age")