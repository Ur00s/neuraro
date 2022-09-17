from multiprocessing.sharedctypes import Value
from xmlrpc.client import boolean
from matplotlib.pyplot import cla
from numpy import double
from pydantic import BaseModel
from typing import Any, List

from pydantic.types import FilePath

class File(BaseModel):
    fileUrl: str

class Layer(BaseModel):
    Activation: str
    NumberOfNeurons: int

class NeuralNetwork(BaseModel):
    LearningRate: float
    RegularizationRate: float
    NumberOfLayers: int
    Layers: List[dict]
    Noise: float
    BatchSize: int
    Regularization: str
    TestToTrain: float
    Dropout: float
    Momentum: float
    PreventLossIncreases: bool
    Inputs: List[str]
    EncodingMethod: str
    Optimizer: str
    Epoch: int
    Output: str
    Path: str
    Encodings: List[dict]

class DataForFeatureSelection(BaseModel):
    FilePath: str
    Output: str
    NumberOfInputs: int

class LoadFile(BaseModel):
    FilePath: str
    From: int
    To: int

class EditFile(BaseModel):
    IndexI: int
    IndexJ: int
    Changes: Any
    FilePath: str

class FileSort(BaseModel):
    FilePath: str
    Column: str
    From: int
    To: int
    Ascending: bool

class MissingColumnValue(BaseModel):
    Name: str
    Value: Any

class MissingValues(BaseModel):
    Method: str
    MissingValueOption: List[MissingColumnValue]
    FilePath: str

class DataForOutliers(BaseModel):
    FilePath: str
    ColumnName: str

class Outliers(BaseModel):
    outliers: List[double]
    indexes: List[int]