function addControlsMap(){
    addMeasureInteraction();
    ctrlSwiper = new ol.control.Swipe({position: -0.5});

    // Current selection
    var sLayer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke ({
            color: 'rgb(255,165,0)',
            width: 3
            }),
            fill: new ol.style.Fill({
            color: 'rgba(255,165,0,.3)'
            })
        }),
        stroke: new ol.style.Stroke ({
            color: 'rgb(255,165,0)',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,165,0,.3)'
        })
        })
    });
    olMap.addLayer(sLayer);

    // Set the search control 
    var search = new ol.control.SearchNominatim({
        //target: $(".options").get(0),
        id:'searchBar',
        polygon: $("#polygon").prop("checked"),
        reverse: true,
        position: true	// Search, with priority to geo position
    });
    olMap.addControl (search);

    
    olMap.addControl(ctrlSwiper);

    // Select feature when click on the reference index
    search.on('select', function(e) {
        // console.log(e);
        sLayer.getSource().clear();
        // Check if we get a geojson to describe the search
        if (e.search.geojson) {
        var format = new ol.format.GeoJSON();
        var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: olMap.getView().getProjection() });
        sLayer.getSource().addFeature(f);
        var view = olMap.getView();
        var resolution = view.getResolutionForExtent(f.getGeometry().getExtent(), olMap.getSize());
        var zoom = view.getZoomForResolution(resolution);
        var center = ol.extent.getCenter(f.getGeometry().getExtent());
        // redraw before zoom
        setTimeout(function(){
            view.animate({
            center: center,
            zoom: Math.min (zoom, 16)
        });
        }, 100);
        } else {
            olMap.getView().animate({
                center:e.coordinate,
                zoom: Math.max (olMap.getView().getZoom(),16)
            });
        }
    });

    var searchBarlocal= document.getElementById('searchBar')


    //let SaveMeasurementsControl = createSaveControl();
    //olMap.addControl(new SaveMeasurementsControl());
    //let ClearMeasurementsControl = createClearControl();
    //olMap.addControl(new ClearMeasurementsControl());            
    //let FullScreen = new ol.control.FullScreen();
    //olMap.addControl(FullScreen);
    let Scale = new ol.control.ScaleLine({
        units: 'metric',
        minWidth: 100
    });   
    olMap.addControl(Scale);
    var selectbase = document.createElement('select');
    const op1 = document.createElement('option');
    op1.textContent = 'Satélite (ArcGIS/ESRI';
    const op2 = document.createElement('option');
    op2.textContent = 'OpenStreetMap';
    const op3 = document.createElement('option');
    op3.textContent = 'Stamen Watercolor';
    selectbase.appendChild(op1);
    selectbase.appendChild(op2);
    selectbase.appendChild(op3);  
    var handleSelectBase = function(e) {
        const idx = selectbase.selectedIndex;
        switch(idx) {
            case 0:
                satelitelayer.setVisible(true);
                omslayer.setVisible(false);
                stamenlayer.setVisible(false);
              break;
            case 1:
                satelitelayer.setVisible(false);
                omslayer.setVisible(true);
                stamenlayer.setVisible(false);
              break;
            case 2:
                satelitelayer.setVisible(false);
                omslayer.setVisible(false);
                stamenlayer.setVisible(true);
                break;                    
          }
    };
    selectbase.addEventListener('change', handleSelectBase, false);
    var element = document.createElement('div');
    element.className = 'btn btn-small';
    element.appendChild(selectbase);
    
    
    var btzoomin = document.createElement('button');
    btzoomin.className = "btn btn-small icon-zoom-in";
    btzoomin.setAttribute("title","Acercar");
    var handleZoomin = function(e) {
        olMap.getView().animate({
            zoom: olMap.getView().getZoom() + 1,
            duration: 250
          })    
    };
    btzoomin.addEventListener("click", handleZoomin);
    var btzoomout = document.createElement('button');
    btzoomout.className = "btn btn-small icon-zoom-out";
    btzoomout.setAttribute("title","Alejar");
    var handleZoomout = function(e) {
        olMap.getView().animate({
            zoom: olMap.getView().getZoom() - 1,
            duration: 250
          })    
    };
    btzoomout.addEventListener("click", handleZoomout);
    var btnorth = document.createElement('button');
    btnorth.className = "btn btn-small icon-location-arrow";
    btnorth.setAttribute("title","Norte");
    var handleRotateNorth = function(e) {
        olMap.getView().setRotation(0);
    };
    btnorth.addEventListener('click', handleRotateNorth, false);
    btnorth.addEventListener('touchstart', handleRotateNorth, false);
    var btpoligono = document.createElement("button");
    btpoligono.className = "btn btn-small icon-crop";
    btpoligono.setAttribute("title","Dibujar poligono");
    btpoligono.addEventListener('click', measureAreaListener);
    var btdistance = document.createElement("button");
    btdistance.className = "btn btn-small icon-resize-horizontal";
    btdistance.setAttribute("title","Medir distancia");
    btdistance.addEventListener("click", measureLengthListener)
    var btpoint = document.createElement("button");
    btpoint.className = "btn btn-small icon-map-marker";
    btpoint.setAttribute("title","Anotar punto");
    btpoint.addEventListener("click",measurePointListener)
    var btprint = document.createElement("button");
    btprint.className = "btn btn-small icon-print";
    btprint.setAttribute("title","Imprimir capa");
    var btcolorleg = document.createElement("button");
    btcolorleg.className = "btn btn-small icon-bar-chart";
    btcolorleg.setAttribute("title","Ver leyenda");       
    
    var bterase = document.createElement("button");
    bterase.className = "btn btn-small icon-eraser";
    bterase.setAttribute("title","Borrar anotaciones");
    bterase.addEventListener("click",clearMeasurementsListener)

    var btswiper = document.createElement("button");
    btswiper.className = "btn btn-small icon-exchange";
    btswiper.setAttribute("title","Dividir mapa");
    var handleSwiper = function(e) {  
        value = ctrlSwiper.get('position');             
        if (value<0){
            ctrlSwiper.set('position', value*-1);                
        }
        else{
            ctrlSwiper.set('position', value*-1);                
            ctrlSwiper.removeLayers();
        }
        
    };
    btswiper.addEventListener("click", handleSwiper);   


    
    var btsave = document.createElement("button");
    btsave.className = "btn btn-small icon-cloud-upload";
    btsave.setAttribute("title","Guardar anotaciones");
    btsave.addEventListener("click",saveMeasurementsListener)

    var elementGroup = document.createElement('div');
    elementGroup.className = 'btcontrols btn-group';         
    elementGroup.setAttribute("id","idcontrols");
    
    
    elementGroup.appendChild(btzoomin);
    elementGroup.appendChild(btzoomout);            
    elementGroup.appendChild(btnorth);
    
    
    //elementGroup.appendChild(searchBarlocal);
    elementGroup.appendChild(btpoligono);
    elementGroup.appendChild(btdistance);
    elementGroup.appendChild(btpoint);
    elementGroup.appendChild(bterase);
    elementGroup.appendChild(btsave);
    
    //elementGroup.appendChild(btprint);
    
    elementGroup.appendChild(btswiper);
    elementGroup.appendChild(btcolorleg);
    //elementGroup.appendChild(element);
    var groupControl = new ol.control.Control({
        element: elementGroup
    });
    olMap.addControl(groupControl);  
    var att = new ol.control.Attribution();
    olMap.addControl(att);

    var logo = document.createElement("div");
    logo.className = "img-logo";

    var controllogo = new ol.control.Control({
        element: logo
    });
    olMap.addControl(controllogo);  

    var switcher = new ol.control.LayerSwitcherImage({
        layerGroup: basemapsGroup
    });
    olMap.addControl(switcher);
}
