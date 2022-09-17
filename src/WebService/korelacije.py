import pandas as pd
from sklearn.preprocessing import LabelEncoder
from scipy.stats import chi2_contingency

def odredi_kor(file):

    df = pd.read_csv(file, sep=None, engine='python')
    
    for data in df.columns:
        if df[data].dtypes == 'O':
            labelencode = LabelEncoder()
            df[data] = labelencode.fit_transform(df[data])

    # Pearsonova korelacija za 2 numericka featura 
    pearson = df.corr(method = 'pearson')
    # Kendellova korelacija za numericki i kategorijski feature
    kendal = df.corr(method  = 'kendall')

    return pearson,kendal

per,ken = odredi_kor("IMDB-Movie-Data.csv")

def vrati_per(file, feature1, feature2):

    df = pd.read_csv(file, sep=None, engine='python')

    if df[feature1].dtypes == 'O':
        labelencode = LabelEncoder()
        df[feature1] = labelencode.fit_transform(df[feature1])
    
    if df[feature2].dtypes == 'O':
        labelencode = LabelEncoder()
        df[feature2] = labelencode.fit_transform(df[feature2])
    
    pearson = df.corr(method = 'pearson')
    
    return pearson[feature1][feature2]

def vrati_ken(file, feature1, feature2):

    df = pd.read_csv(file, sep=None, engine='python')
    
    if df[feature1].dtypes == 'O':
        labelencode = LabelEncoder()
        df[feature1] = labelencode.fit_transform(df[feature1])
    
    if df[feature2].dtypes == 'O':
        labelencode = LabelEncoder()
        df[feature2] = labelencode.fit_transform(df[feature2])
    
    kendal = df.corr(method = 'kendall')
    
    return kendal[feature1][feature2]

# per_kor = vrati_per('student-por.csv','sex','age')
# per_kor

# ker_kor = vrati_ken('student-por.csv','sex','age')
# ker_kor


def korKategorijske(file, feature1, feature2):
    
    df = pd.read_csv(file, sep=None, engine='python')
    rezultat =pd.crosstab(index = df[feature1],columns = df[feature2])

    hiKvadrat = chi2_contingency(rezultat)

    # Ukoliko je hiKvadrat vece od 0.05 onda prihvatamo hipotezu
    # H0 to jest ne postoji korelacija izmedju 2 kategorijske varijable
    return hiKvadrat[1]

# kor = korKategorijske('student-por.csv','sex','age')
# print(kor)