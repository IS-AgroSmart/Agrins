let interactionLayer, interactionSource, popup, selectClick;
var featureType = '';
var helpTooltipElement, helpTooltip;
var measureTooltipElement, measureTooltip;
var numMeasurement = 0;
var measureTooltips = {};
var draw, listener, isDrawing = false;
var delete_handler;
var drawingFeature = null;
var helpMsg;



function addMeasureInteraction() {
    interactionSource = new ol.source.Vector();
    interactionLayer = new ol.layer.Vector({
        source: interactionSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                }),
            }),
        }),
    });
    olMap.addLayer(interactionLayer);
}

function addControlsMap(){
    addMeasureInteraction(); 
    ctrlSwiper= new ol.control.Swipe({position:-0.5});
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

    let Scale = new ol.control.ScaleLine({
        units: 'metric',
        minWidth: 100
    });   
    olMap.addControl(Scale);
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
        isswipervisible = !isswipervisible;
        if (isswipervisible){
            ctrlSwiper.set('position', 0.5);                            
        }
        else{
            ctrlSwiper.set('position', -0.5); 
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
    elementGroup.appendChild(btpoligono);
    elementGroup.appendChild(btdistance);
    elementGroup.appendChild(btpoint);
    elementGroup.appendChild(bterase);
    elementGroup.appendChild(btsave);
    elementGroup.appendChild(btswiper);
    elementGroup.appendChild(btcolorleg);
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

    popup = Ext.create('GeoExt.component.Popup', {
        map: olMap,
        width: 140
    });
    selectClick = new ol.interaction.Select({                
        condition: ol.events.condition.click,                
        layers: (layer) => layer instanceof ol.layer.Vector,
        hitTolerance: 10,
    });
    selectClick.on('select', function (e) {
        console.log("Select layer");
        if (delete_handler)
            document.removeEventListener("keydown", delete_handler);

        if (e.selected.length === 0) {
            popup.hide();
            delete_handler = null;
            return;
        }
        delete_handler = function (evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode === 46) { // Del key
                let feature = e.selected[0];
                if (interactionSource.getFeatures().includes(feature)) {
                    interactionSource.removeFeature(feature);
                    let id = feature.getId();
                    olMap.removeOverlay(measureTooltips[id]);
                    popup.hide();
                    delete measureTooltips[id];
                    selectClick.getFeatures().remove(feature);
                }
            }
        };
        document.addEventListener('keydown', delete_handler, false);
        let coordinate = e.mapBrowserEvent.coordinate;

        let message = "<p>";
        for (const [key, value] of Object.entries(e.selected[0].getProperties())) {
            if (["bbox", "geometry"].includes(key)) continue;
            message += key + " ⟶ " + value + "<br>";
        }
        message += "</p>";
        popup.setHtml(message);
        popup.position(coordinate);
        if (message !== "<p></p>") popup.show();
        else popup.hide();
    });
    olMap.addInteraction(selectClick);
}


function removeInteraction() {
    isDrawing = false;
    olMap.removeInteraction(draw);
    olMap.un('pointermove', pointerMoveHandler);
    deleteHelpTooltip();
}

function measurePointListener() {
    if (featureType == 'Point' || featureType == ''){
        featureType = 'Point';
        if (isDrawing) removeInteraction();
        else addInteraction();
    }
    else{
        changeFeature('Point');
    }    
    
}

function changeFeature(feature_up){
    Ext.Msg.show({
        title:'Nueva medición',
        message: 'Medición actual: '+featureType+' ¿Desea eliminar e inicar una medición de '+feature_up+'?',
        buttonText: {
            yes: 'Si',
            no: 'No'
        },
        buttons: Ext.Msg.YESNO,
        icon: Ext.Msg.QUESTION,
        fn: function(btn) {
            if (btn === 'yes') {
                featureType = feature_up;
                clearMeasurementsListener();
            } else {
                
            } 
        }
    });

}

function measureLengthListener() {    
    if (featureType == 'LineString' || featureType == ''){
        featureType='LineString';
        if (isDrawing) removeInteraction();
        else addInteraction();
    }
    else{
        changeFeature('LineString');
    }
}

function measureAreaListener() {
    if (featureType == 'Polygon' || featureType == ''){
        featureType='Polygon';
        if (isDrawing) removeInteraction();
        else addInteraction();
    }
    else{
        changeFeature('Polygon');
    }
}

function saveMeasurementsListener() {
    let serializer = new ol.format.GeoJSON();
    let features = interactionLayer.getSource().getFeatures();

    if (features.length === 0) {
        alert("Realice alguna medición antes de guardar");
        return;
    }
    
    let geojson = serializer.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: olMap.getView().getProjection()
    });
    console.log(geojson);
    
    var formaddgeo = Ext.create('Ext.form.Panel', {                
        id: 'formIdAddgeo',
        width: '100%', 
        height: '100%',
        bodyPadding: 10,    
        border:false,
        defaultType: 'textfield',
        items: [{
            xtype: 'textfield',
            name: 'name',
            id: 'namegeo',
            width:'100%',     
            fieldLabel: 'Nombre',
            labelAlign: 'top',
            allowBlank: false,  // requires a non-empty value            
            blankText: 'El campo nombre es necesario',
            msgTarget: 'under' ,
        },
        ],
            // Reset and Submit buttons
        buttons: [{
            text: 'Borrar',
            iconCls: 'icon-eraser',
            cls: 'btnform',
            handler: function() {
                this.up('form').getForm().reset();
            }
        }, {
            text: 'Guardar',
            formBind: true, //only enabled once the form is valid
            disabled: true,
            iconCls: 'icon-save',
            cls:'btnform',
            handler: function() {
                var form = this.up('form').getForm();                
                if (form.isValid()) {
                    form.submit({
                        method: 'POST',
                        url : '/api/uploads/' + uuid + '/measure',
                        params: {
                            'json': geojson,
                        },
                        headers: {
                            Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                        },
                        waitMsg:'Cargando medición espere por favor...',
                        success: function(fp, o) {
                            Ext.getCmp('formIdAddgeo').reset();
                            initLayers();
                            Ext.Msg.alert('Detalle', 'Capa agregada correctamente.');                                                   
                            clearMeasurementsListener();
                            featureType = '';
                            Ext.getCmp('wndowupload').close();
                        },
                        failure: function(fp, o) {
                            Ext.Msg.alert('Error', 'Error al subir capa.');
                        }
                    });
                }
                
            }
        }],        
    });
    console.log('items')
    Ext.create('Ext.window.Window', {
        title: 'Crear nueva capa',
        id: 'wndowupload',
        height: 180,
        width: 300,
        layout: 'vbox',
        modal: true,
        resizable   : false,
        items:
        {
            xtype: 'panel',
            height: '100%',
            width: '100%',                
            items:[                    
                
                    formaddgeo
                
            ]
        }
    }).show();


/*


    let geojsonFormat = new ol.format.GeoJSON();
    let featArray2 = geojsonFormat.readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    console.log(geojsonFormat);
    let redStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
                color: '#8B0000'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2
            })
        })
    });
    let featColl2 = new ol.Collection(featArray2);
    let vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: featColl2
        }),
        style: redStyle
    });
    layers.push(vectorLayer);
    olMap.addLayer(vectorLayer);
    treePanel.layer.add(vectorLayer);



    let link = document.createElement('a');
    let filename = prompt("Escriba un nombre para el archivo (opcional)", "Mediciones " + project_name);
    if (filename !== null && filename.trim() !== "") link.download = filename + ".geojson";
    else link.download = "measurements.geojson";
    let blob = new Blob([geojson], {type: "application/geo+json;charset=utf-8"});
    console.log(blob); 

    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);*/
}

function clearMeasurementsListener() {
    interactionSource.clear();
    Object.entries(measureTooltips).forEach((tt) => olMap.removeOverlay(tt[1]));
    selectClick.getFeatures().clear();
}

var pointerMoveHandler = (evt) => {
    if (evt.dragging) return;
    if (drawingFeature) helpMsg = "Doble clic para terminar de dibujar";

    helpTooltipElement.innerHTML = helpMsg
    helpTooltip.setPosition(evt.coordinate)
    helpTooltipElement.classList.remove('hidden');
}

function formatLength(line) {
    let length = ol.Sphere.getLength(line);
    if (length > 100) return (length / 1000).toFixed(2) + ' km';
    else return length.toFixed(2) + ' m';
}

function formatArea(polygon) {
    let area = ol.Sphere.getArea(polygon);
    let hectares = area / 10000;
    if (area > 10000) return (area / 1000000).toFixed(2) + ' km<sup>2</sup> (' + hectares.toFixed(2) + ' ha)';
    else return area.toFixed(2) + ' m<sup>2</sup>'
}

function addInteraction() {
    helpMsg = 'Clic para comenzar a dibujar';
    isDrawing = true;

    olMap.getViewport().addEventListener('mouseout', () => {
        if (helpTooltipElement) helpTooltipElement.classList.add('hidden');
    });
    olMap.on('pointermove', pointerMoveHandler);

    draw = new ol.interaction.Draw({
        source: interactionSource,
        type: featureType,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(125, 125, 125, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    })
    olMap.addInteraction(draw)

    try {
        createMeasureTooltip()
        createHelpTooltip()
    } catch (error) {
        console.log('error', error)
    }
    let Medition='1';
    draw.on('drawstart', (evt) => {
        numMeasurement++;
        drawingFeature = evt.feature
        let tooltipCoord = evt.coordinate
        listener = drawingFeature.getGeometry().on('change', (evt) => {
            let geom = evt.target;
            let output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
            selectClick.getFeatures().clear();
            Medition= output;
        })
    }, this)
    draw.on('drawend', (evt) => {
        ans = prompt("Nombre de la medición para metadata (opcional)");
        if (ans !== null && ans.trim() !== ""){
            drawingFeature.set("Nombre", ans);
            drawingFeature.set("Total", Medition);
            drawingFeature.set("Fecha", new Date().toLocaleDateString());
        }
        else{
            drawingFeature.set("Nombre", featureType);
            drawingFeature.set("Total", Medition);
            drawingFeature.set("Fecha", new Date().toLocaleDateString());
        }
        measureTooltipElement.className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);
        drawingFeature.setId(numMeasurement);
        measureTooltips[numMeasurement] = measureTooltip;
        drawingFeature = null
        measureTooltipElement = null
        ol.Observable.unByKey(listener);
        removeInteraction();
        selectClick.getFeatures().clear();
    }, this)
}

function deleteHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        helpTooltipElement = null;
    }
}

function createHelpTooltip() {
    deleteHelpTooltip();
    helpTooltipElement = document.createElement('div')
    helpTooltipElement.className = 'tooltip hidden'
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    })
    olMap.addOverlay(helpTooltip)
}

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement)
    }
    measureTooltipElement = document.createElement('div')
    measureTooltipElement.className = 'tooltip tooltip-measure'
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    })
    olMap.addOverlay(measureTooltip)
}

