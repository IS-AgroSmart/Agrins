import matplotlib as mpl
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.figure import Figure
import cv2
import matplotlib.pyplot as plt

STYLE_COLOR ={
        'NDVI':[[0,   0,   2],[0,   0,   255],[110,   71, 149], [255, 0, 255],[255, 0, 0],[255, 141, 10],
                [233, 229, 0], [0, 255, 0],[31, 138, 0], [31, 138, 0]],
        'GCI':[[0,   0,   2],[0,   0,   255],[110,   71, 149], [255, 0, 255],[255, 0, 0],[255, 141, 10],
                [233, 229, 0], [0, 255, 0],[31, 138, 0], [31, 138, 0]],
        'GRRI':[[0,   0,   2],[0,   0,   255],[110,   71, 149], [255, 0, 255],[255, 0, 0],[255, 141, 10],
                [233, 229, 0], [0, 255, 0],[31, 138, 0], [31, 138, 0]],
        'NGRDI':[[0,   0,   2],[0,   0,   255],[110,   71, 149], [255, 0, 255],[255, 0, 0],[255, 141, 10],
                [233, 229, 0], [0, 255, 0],[31, 138, 0], [31, 138, 0]],
        'MGRVI':[[0,   0,   2],[0,   0,   255],[110,   71, 149], [255, 0, 255],[255, 0, 0],[255, 141, 10],
                [233, 229, 0], [0, 255, 0],[31, 138, 0], [31, 138, 0]],
        'NDRE':[[0,   0,   2],[0,   0,   255],[110,   71, 149], [255, 0, 255],[255, 0, 0],[255, 141, 10],
                [233, 229, 0], [0, 255, 0],[31, 138, 0], [31, 138, 0]],
    }

BOUNDS = {
        'NDVI':[0, 31, 63, 95, 127, 159, 191, 223, 255],
        'GCI':[0, 31, 63, 95, 127, 159, 191, 223, 255],
        'GRRI':[0, 31, 63, 95, 127, 159, 191, 223, 255],
        'NGRDI':[0, 31, 63, 95, 127, 159, 191, 223, 255],
        'MGRVI':[0, 31, 63, 95, 127, 159, 191, 223, 255],
        'NDRE':[0, 31, 63, 95, 127, 159, 191, 223, 255],
    }

XTICKS = {
        'NDVI':[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.50, 0.75, 1],
        'GCI':[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.50, 0.75, 1],
        'GRRI':[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.50, 0.75, 1],
        'NGRDI':[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.50, 0.75, 1],
        'MGRVI':[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.50, 0.75, 1],
        'NDRE':[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.50, 0.75, 1],
    }
    #color = COLORTXT.get(request.POST["index"])

def create_legend_image(path, filename, index):    
    img = cv2.imread(path+filename+'.tiff')
    bounds = BOUNDS.get(index)
    style_color = STYLE_COLOR.get(index)
    color_arr = []
    for color in style_color:
        rgb = [float(value)/255 for value in color]
        color_arr.append(rgb)
    
    norm = mpl.colors.Normalize(vmin=min(bounds), vmax=max(bounds))
    normed_vals = norm(bounds)
    cmap = LinearSegmentedColormap.from_list('color',list(zip(normed_vals, color_arr[:-1])),N=256)

    fig, axs = plt.subplots(2, figsize=(6, 0.8), sharex=True,gridspec_kw={'height_ratios': [0.5, 0.05]})
    cb = mpl.colorbar.ColorbarBase(axs[1],cmap=cmap,norm=norm,orientation='horizontal',ticks=bounds,)
    b, n, patches = axs[0].hist(img.ravel(), 256,[1,256])
    col = (n-n.min())/(n.max()-n.min())
    atotal= []
    for c, p in zip(col, patches):    
        atotal.append(p.get_height())    
        plt.setp(p, 'facecolor', cmap(c))
        
    axs[0].set_axis_off()
    fig.set_facecolor("#f7f7f7")
    axs[0].axvline(0,color="gray", linestyle=":", )
    axs[0].axvline(127,color="gray", linestyle=":", )
    axs[0].axvline(159,color="gray", linestyle=":", )
    axs[0].axvline(191,color="gray", linestyle=":", )
    axs[0].axvline(255,color="gray", linestyle=":", )

    plt.xticks([0, 31, 63, 95, 127, 159, 191, 223, 255], [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.50, 0.75, 1])
    text_dict = dict(boxstyle = "round", fc = "#e5e5e5", alpha=.1)
    axs[0].annotate(str(round(sum(atotal[0:127])*100/sum(atotal),2))+'%',bbox = text_dict, xy=(2, max(atotal)*0.85), fontsize=7)
    axs[0].annotate(str(round(sum(atotal[127:159])*100/sum(atotal),2))+'%',bbox = text_dict, xy=(129, max(atotal)*0.85), fontsize=7)
    axs[0].annotate(str(round(sum(atotal[159:191])*100/sum(atotal),2))+'%',bbox = text_dict, xy=(161, max(atotal)*0.85), fontsize=7)
    axs[0].annotate(str(round(sum(atotal[191:-1])*100/sum(atotal),2))+'%',bbox = text_dict,  xy=(193, max(atotal)*0.85), fontsize=7)
    fig.savefig('staticfiles/'+filename+'.png',bbox_inches='tight',pad_inches=0)
    return filename+'.png'
