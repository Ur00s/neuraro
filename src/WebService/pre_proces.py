import os
import pandas as pd
from scipy import stats
import numpy as np
import category_encoders as ce
from sklearn.preprocessing import OneHotEncoder,LabelEncoder,OrdinalEncoder
from sklearn.model_selection import train_test_split
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score
from sklearn import linear_model, tree, ensemble
from modeli import *
from matplotlib import pyplot
import seaborn as sns
from sklearn.model_selection import KFold
import math
from sklearn.preprocessing import minmax_scale
from sklearn.preprocessing import PowerTransformer
from sklearn import preprocessing
from sklearn.preprocessing import MultiLabelBinarizer
from collections import Counter 


#Vrati dataframe
def vrat_dataset(putanja):
    return pd.read_csv(putanja)

#Razdvoj kat_numericke promenljive
def tip_promenljivhi(df):
    numerickaKolona = df.select_dtypes("number").columns
    kategorijskaKolona = df.select_dtypes("object").columns
    numCols= list(set(numerickaKolona))
    catCols= list(set(kategorijskaKolona))

    return numCols,catCols


def bool_to_int(df):
    #variable_name = {'True' : 0 , 'False' : 1 }

    for i in df.columns:
        if(df[i].dtype=='bool'):
             df[i] = df[i].astype(int)  
    return df


#srednje vrednosti
def mean_vrednosti(dt,num):
    srednja=dict()
    for i in dt.columns:
        if i in num:
            srednja[i]=dt[i].mean()
    return pd.DataFrame([srednja])

#vrati min max vrdnosti za svaki 
def max_min(dt,num):
    srednja=dict()
    max=dt.max()
    min=dt.min()
    return max,min

def nan_to_mean(df):
    for i in df.columns[df.isnull().any(axis=0)]:     #---Applying Only on variables with NaN values
        df[i].fillna(df[i].mean(),inplace=True)
    return df

#Min and Max skaliranje
def predProcesiraj(df):
    d=pd.DataFrame()
    for i in df.columns:
        max = df[i].max()
        min = df[i].min()
        df[i] = (df[i] - min) / (max - min)
    return df


def z_score_detcet(df):
    treashold=3 
    z=np.abs(stats.zscore(df))
    df=df[(z<3).all(axis=1)]
    return df

def LabelEncode(df,kat):
    enc=ce.BinaryEncoder(cols=kat,return_df=True)
    df=enc.fit_transform(df['Genre'])
    return df

def OrdinalEndode(df,kat):
    enc=OrdinalEncoder()
    enc.fit(df[kat])
    df[kat]=enc.transform(df[kat])
    return df

def BinaryEncode(df,kat):
    enc=ce.BinaryEncoder(cols=kat,return_df=True)
    df=enc.fit_transform(df)
    return df


def LeavOneOutEncode(x_train,y_train,x_test):
    encoder=ce.LeavOneOutEncoder(return_df=True)
    x_train_l=encoder.fit(x_train,y_train)
    #print(x_train_l.describe())
    x_test_l=encoder.transform(x_test)
    #print9(x_test_l.describe())

def One_Hot_Encode(df,kat):
    enc=ce.OneHotEncoder(cols=kat,return_df=True)
    df=enc.fit_transform(df)
    return df


def izabci_objects(df):
    return df.select_dtypes(exclude="object")

#Vracam feature koje su korelisane sa promenljivom
def correlatin_feature(df,feature):
    corr=df.corr()
    return df[feature].sort_values(ascending=False)


#Pretvaram sve vrednosti u float32 potrebno za tensor i izdvajam numericke prom
def to_f32(df,kat):
    prvi=dict()
    for i in df.columns:
        if(df[i].dtypes!=np.float32 and i in kat):
            prvi[i]=df[i].astype(np.float32)
    return pd.DataFrame(prvi)    

#Vraca dataframe bez dva feaur-a
def formatiarj_izalz(df,feature,feature1):
    feature=df.pop(feature)
    feature=np.array(feature)
    feature1=df.pop(feature1)
    feature1=np.array(feature1)
    return (feature,feature1)

def train_test_vad(df,split):
    train,test=train_test_split(df,test_size=split/10,random_state=1)
    train,val=train_test_split(train,test_size=split/10,random_state=1)
    return train,test,val
    
#Izdvoj feature
def zavisne_nezavine(df,inputs,features):

      x=df[inputs]
      y=df[features]
      return x,y

#Izdvoj promenljive
def split_data(x,y,size):
    if(size/100>1):
        return "Mora vrednost manja od 1"
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=((100-size)/100),shuffle=True,random_state=42)
    return [x_train,x_test,y_train,y_test]


#Funkcija koja vraca obradjni csv fajl
def obradi(df,inputs,output,test_train_ratio,encoding,tip):

    for i in df.columns:
        if df[i].dtype!='object' and df[i].isnull().sum()>0:
            df[i].fillna(df[i].mean(),inplace=True)

        elif df[i].dtype=='object' and df[i].isnull().sum()>0:
            df[i].fillna('Other', inplace=True)

    df = df.sample(frac = 1) 


    x,y=zavisne_nezavine(df, inputs, output)

    num,kat=tip_promenljivhi(x)


    #Ako liste ima elemnata odradi enkodiranje i konkatenaciju sa num u suprodom
    #Radi predprocesiranje na num
    if len(encoding)>0:
        dfenc=vrati_enkodiran_dataframe(df, encoding,y)
        df=pd.concat([dfenc,x[num]], axis=1,join='inner')
        df=predProcesiraj(df)
        del dfenc

    else:
        df=predProcesiraj(x[num])

    # x,y=zavisne_nezavine(df,inputs,output)
    if(y.dtype=='object'):
        # s = pd.Series(y)
        # s=s.to_frame()
        # encoder= ce.OrdinalEncoder(cols=s,return_df=True)
        # data=encoder.fit_transform(s['Actors'])
        # y=minmax_scale(data)
        #print(data)

        mlb = MultiLabelBinarizer()
        #y = pd.get_dummies(y)
        y=mlb.fit_transform(y)
    elif y.dtype!='object' and tip=="classification":
        s=pd.Series(y)
        encoder = LabelEncoder()
        encoder.fit(y)
        encoded_Y = encoder.transform(y)
    # convert integers to dummy variables (i.e. one hot encoded)
        data = tf.keras.utils.to_categorical(encoded_Y)
        y=data
    else:
        y=minmax_scale(y)
   

    x_train,x_test,y_train,y_test=split_data(df,y,test_train_ratio)
   
    #Brisem dataframe
    del df

    return [x_train,x_test,y_train,y_test]
    
def vrati_sa_null_vrednsotima(df):
	cols_with_missing = [col for col in df.columns if df[col].isnull().any()]
	return cols_with_missing


def save_model(n_epcohs,n_sacvuaj_posle,x_train,y_train):

	if os.path.isdir("modeli_h5")==False:
		os.mkdir("modeli_h5")
	#os.mkdir("modeli_h5")

	for i in range(n_epcohs):
		model.fit(x_train, y_train, epochs=1, verbose=0)
	# check if we should save the model
		if i>=n_sacvuaj_posle:
			model.save('modeli_h5/model_' + str(i) + '.h5')

def cuvaj_tezine(model,x_train,y_train,x_test,y_test,epoch,batch_size):

		path="modeli_cpkt/tezine.cpkt"
		#pozivam callback MOdel checkpoint
		call=callback("modeli_cpkt")
		model.save_weights(path.format(epoch=0))

		# Treniraj model sa novim pozivom
		model.fit(x_train, 
		  y_train,
		  epochs=epoch, 
		  batch_size=batch_size, 
		  callbacks=[call],		
          validation_data=(x_test, y_test),
		  verbose=1)
        

#Vrati tezinu za sloj
def  vrat_tezinu_za_sloj(ime_sloja):
	with tf.variable_scope(ime_sloja, reuse=True):
		variable = tf.get_variable('weights')

	return variable

def vrati_skewd_df(df):
	iskrivljenost=df.dtypes[df.dtypes!='object'].index
	skew_feats=df[iskrivljenost].skew().sort_values(ascending=False)
	skew=pd.DataFrame({'Iskrivljenost':skew_feats})
	return skew


# Resava problem iskirljenosti
def iskrivljenost_transofrmacija(df,ukljuci=None,graf=False,tip=False,granica=1.65):
    

    if ukljuci is None:
        colnames=(df.columns.values)
    
    if(ukljuci is not None):
        colnames=ukljuci

    def provera_pozitivne(skup):
        minimum=np.amin(skup)
        if minimum<=0:
            skup=skup+abs(minimum)+0.01
        return skup 
    
    for col in colnames:
        iskrivljen=df[col].skew()
        transformacija=True
        #Ovo mora da se proba u notbuku
        if graf:
            fig,osnova=pyplot.subplot(1,2,figsize=(25,5))
            x1=sns.distplot(df[col],ax=osnova[0])
        
        if abs(iskrivljen)>granica and iskrivljen>0:
            tip_Iskrivljenosti="Pozitovna iskrivlenost"

            df[col]=provera_pozitivne(df[col])
             
            if tip:
                #print("A") log transormaci
                #Iz nekog razlog nece da odradi promenu na sqrt
                df[col]=np.sqrt(df[col])
               # print(df[col].skew())
            else:
                #BoxCox iz stats
                df[col]=stats.boxcox(df[col])[0]
            
            iskrivlenost_nova=df[col].skew()
            
        #Moram apsolutno je u modelu imam negativnu iskrivlenost
        elif abs(iskrivljen)>granica and skew<0:
            skewType="Negativna iskrivljenost"

            df[col]=provera_pozitivne(df[col])
            if tip:
                
                df[col]=df[col].pow(10)
            else:
                df[col]=stats.boxcox(df[col])[0]
            iskrivlenost_nova=df[col].skew()

        else:
            iskrivlenost_nova=iskrivljen

        if graf:
            if transformacija:
                print('%r iskrvljenost %f'%(tip_Iskrivljenosti,iskrivljen))
                print("\n Nova iskrivljenost %4.2f" %(iskrivlenost_nova))
            else:
                print("Nema transofrmacije")

    return df



def kumulacija_kategorije(kolona,granica=0.75,vrati_list=True):
    #Granica za treashold za datu kolonu
    granica=int(granica*len(koliona))
    lista_kategorija=[]

    count=Counter(kolona)

    for i,j in count.most_common():
        s+=dict(count)[i]
        lista_kategorija.append(i)

        #Ako prelazi zadatu granicu
        if s>=granica:
            break

    lista_kategorija.Append("Other")
    nove_kolone=kolona.apply(lambda x: x if x in lista_kategorija else "Other")

    if(vrati_list==False):
        return nove_kolone
    else:
        return liste_kolona,nove_kolone


def vrati_enkodiran_dataframe(df,encoding,y):
    #enkodiram vrednostima
    d_skup_svih_vrednosti=[]

    for dic in encoding:
        #print (dic['input'])
        if(dic['EncodingMethod']=='binaryencoder'):
            encoder= ce.BinaryEncoder(cols=dic['ColumnName'],return_df=True)
            data=encoder.fit_transform(df[dic['ColumnName']])
            d_skup_svih_vrednosti+=[data]
        elif(dic['EncodingMethod']=='onehotencoder'):
            encoder= ce.OneHotEncoder(cols=dic['ColumnName'],return_df=True)
            data=encoder.fit_transform(df[dic['ColumnName']])
            d_skup_svih_vrednosti+=[data]
        elif(dic['EncodingMethod']=='labelencoder'):
            encoder= ce.OrdinalEncoder(cols=dic['ColumnName'],return_df=True)
            data=encoder.fit_transform(df[dic['ColumnName']])
            d_skup_svih_vrednosti+=[data]
        elif(dic['EncodingMethod']=='hashencoder'):
            encoder= ce.HashingEncoder(cols=dic['ColumnName'],return_df=True)
            data=encoder.fit_transform(df[dic['ColumnName']])
            d_skup_svih_vrednosti+=[data]
        elif(dic['EncodingMethod']=='targetencoder'):
            encoder= ce.TargetEncoder(cols=dic['ColumnName'],return_df=True)
            data=encoder.fit_transform(df[dic['ColumnName']],y) 
            d_skup_svih_vrednosti+=[data]
        
        
    dd=pd.concat(d_skup_svih_vrednosti, axis=1, join="inner")

    return dd

#Dodati vise razlictih metoda za  outlajere
def outlier_detection(tipovi,x_train,x_test,y_train,y_test):

    if tipovi=="IsolationForest":
        clf=IsolationForest(random_state=0)
        clf.fit(x_train)
        y_pred=clf.predict(x_test)
        pred=pd.DataFrame({'pred':y_pred})
        y_pred=pred['y_pred']
        prezicnost=precision_score(y_test,y_pred)

    elif tipovi=="oneclasssvm":
        clf_svm=OneClassSVM(gamma="auto")
        clf_svm.fit(x_train)
        y_pred=clf_svm.predict(x_test)
        pred=pd.DataFrame({'pred':y_pred})
        y_pred=pred['y_pred']
        prezicnost=precision_score(y_test,y_pred)

    elif tipovi=="dbscan":

        dbsDBSCAN(eps=epsilon,min_samples=10)
        dbs.fit(x_train)
        y_pred=dbs.predict(x_test)
        pred=pd.DataFrame({'pred':y_pred})
        y_pred=pred['y_pred']
        prezicnost=precision_score(y_test,y_pred)

    return prezicnost


def outlier_column_number(df,column):
    q25,q75=np.quantile(df[column],0.25),np.quantile(df[column],0.75)
    iqr=q75-q25
    presek=iqr*1.5
    donja,gonja=q25-presek,q75+presek
    df1=df[df[column]>gornja]
    df2=df[df[column]<donja]
    return df1.shape[0]+df2.shape[0]
