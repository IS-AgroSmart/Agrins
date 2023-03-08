from osgeo import gdal
import tifffile
from skimage.transform import resize
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model

clorofila_model = load_model('modelo_clorofila.h5')
altura_model = load_model('modelo_altura.h5')

ALTURA_MAX = 266.80
ALTURA_MIN = 0.0

CLOROFILA_MAX = 980.993
CLOROFILA_MIN = 0.0

def estandarizar_bandas(img):
    banda1, banda2, banda3, banda4 = np.moveaxis(img, 2, 0)
    bandas = [banda1, banda2, banda3, banda4]
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

def predecir(input_tif_path):
    tif = tifffile.imread(input_tif_path)
    resized_tif = resize(tif, (2240, 2240))
    norm_tif = estandarizar_bandas(resized_tif)
    cropped_tif = recortar(norm_tif, 10, 10)
    X = np.array(cropped_tif)
    clorofila_pred = clorofila_model.predict(X)
    altura_pred = altura_model.predict(X)
    altura_results = []
    clorofila_results = []
    for i in range(100):
        img_altura = altura_pred[i]
        img_altura = np.argmax(img_altura, axis=-1)
        altura_results.append(img_altura)
        img_clorofila = clorofila_pred[i]
        img_clorofila = np.argmax(img_clorofila, axis=-1)  
        clorofila_results.append(img_clorofila)

    return clorofila_results, altura_results

def guardar_tif(results, output_path, input_tif_path, v_max, v_min):

    fragments = []
    for i in range(10):
        initial = i*10
        final = (i+1)*10
        fragment = np.concatenate(results[initial:final], axis=1)
        fragments.append(fragment)

    img = np.concatenate(fragments)
    ds = gdal.Open(input_tif_path)
    array = ds.ReadAsArray()
    x, y = array.shape[1], array.shape[2]
    resized_img = resize(img, (x, y))
    scaled_img = resized_img*(v_max-v_min) + v_min
    write_geotiff(output_path, scaled_img, ds)

#Ejemplo------------------
clorofila_pred, altura_pred = predecir('input.tif')
guardar_tif(clorofila_pred, 'clorofila.tif', 'input.tif', CLOROFILA_MAX, CLOROFILA_MIN)
guardar_tif(altura_pred, 'altura.tif', 'input.tif', ALTURA_MAX, ALTURA_MIN)