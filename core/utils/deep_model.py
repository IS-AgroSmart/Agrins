from osgeo import gdal
import tifffile
from skimage.transform import resize
import numpy as np
import cv2
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
import os

ALTURA_MAX = 266.80
ALTURA_MIN = 0.0

CLOROFILA_MAX = 980.993
CLOROFILA_MIN = 0.0

MODELOS={
        'ALTURA': 'core/utils/modelo_altura.h5',
        'CLOROFILA': 'core/utils/modelo_clorofila.h5',
    }

SIZE_MODEL ={
    'ALTURA':{'MAX':266.80,'MIN':0.0},
    'CLOROFILA':{'MAX':980.993,'MIN':0.0}
}

def estandarizar_bandas(img, bands):    
    img = np.moveaxis(img, 2, 0)
    verde = img[bands['G']-1]
    rojo = img[bands['R']-1]
    rededge = img[bands['RDG']-1]
    nir = img[bands['NIR']-1]
    bandas = [verde, rojo, rededge, nir]

    bandas_norm = []
    for banda in bandas:
        mean = banda.mean()
        std = banda.std()
        banda = (banda-mean)/std
        bandas_norm.append(banda)

    img_norm = np.array(bandas_norm)
    img_norm = np.moveaxis(bandas_norm, 0, 2)
    return img_norm

def recortar(img, h, w):
    cropped_images = []
    for r in range(h):
        for c in range(w):
            i1 = int(r*(img.shape[0]/h))
            i2 = int((r+1)*(img.shape[0]/h))
            
            j1 = int(c*(img.shape[1]/w))
            j2 = int((c+1)*(img.shape[1]/w))
            
            im = img[i1:i2, j1:j2]
            cropped_images.append(im)
    return cropped_images

def write_geotiff(filename, arr, in_ds):
    if arr.dtype == np.float32:
        arr_type = gdal.GDT_Float32
    else:
        arr_type = gdal.GDT_Int32

    driver = gdal.GetDriverByName("GTiff")
    out_ds = driver.Create(filename, arr.shape[1], arr.shape[0], 1, arr_type)
    out_ds.SetProjection(in_ds.GetProjection())
    out_ds.SetGeoTransform(in_ds.GetGeoTransform())
    band = out_ds.GetRasterBand(1)
    band.WriteArray(arr)
    band.FlushCache()
    band.ComputeStatistics(False)

def generateModel(path,filename, outputPath, model, bands):

    try:
        v_max = SIZE_MODEL.get(model)['MAX']
        v_min = SIZE_MODEL.get(model)['MIN']
        tif = tifffile.imread(path+filename+'.tiff')
        resized_tif = resize(tif, (2240, 2240))
        norm_tif = estandarizar_bandas(resized_tif, bands)
        cropped_tif = recortar(norm_tif, 10, 10)
        X = np.array(cropped_tif)
        model_path = os.path.abspath(MODELOS.get(model))
        modelo = load_model(model_path)
        y_pred = modelo.predict(X)
        resultados = []
        for i in range(100):
            img = y_pred[i]
            img = np.argmax(img, axis=-1)
            resultados.append(img)
        fragments = []
        for i in range(10):
            initial = i*10
            final = (i+1)*10
            fragment = np.concatenate(resultados[initial:final], axis=1)
            fragments.append(fragment)
        img = np.concatenate(fragments)
        inputPath = path+filename+'.tiff'
        ds = gdal.Open(inputPath)
        array = ds.ReadAsArray()
        x, y = array.shape[1], array.shape[2]
        resized_img = resize(img, (x, y))
        scaled_img = resized_img*(v_max-v_min) + v_min
        out = path+outputPath+'.tiff'
        write_geotiff(out, scaled_img, ds)
        return True

    except:
        return False
