Ext.require([
    'GeoExt.component.Map',
    'GeoExt.data.store.LayersTree',
    'Ext.Button',
]);

let mapComponent;
let mapPanel;
let treePanel, timeSlider;

let selectClick;
let startZone = [];
let TIMES = [];
let shapefiles = [], indices = [];
let artifactLayer = [];
let anotationLayer = new ol.layer.Group({name:'Grupo anotaciones'});
let anotatiom= [];
let noCacheHeaders = new Headers(); // HACK: Force disable cache, otherwise timing problem when going back to screen
noCacheHeaders.append('pragma', 'no-cache');
noCacheHeaders.append('cache-control', 'no-cache');
fillShapefiles();
fillAnotations();
fillRasters();
initApp();
//fitMap();
// fetch(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/project_a4029f71-835b-474c-92a3-ccc05ce5de2e/mainortho/wms?service=WMS&version=1.3.0&request=GetCapabilities")
/*fetch(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/" + project_path + "/mainortho/wms?service=WMS&version=1.3.0&request=GetCapabilities",
    {headers: noCacheHeaders})
    .then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
        let times;
        times = data.getElementsByTagName("WMS_Capabilities")[0].getElementsByTagName("Capability")[0].getElementsByTagName("Layer")[0].getElementsByTagName("Dimension")[0].innerHTML;
        TIMES = [];
        for (let time of times.split(",")) {
            TIMES.push(time.substring(0, 10));
        }
    })
    .then(fillShapefiles)
    .then(fillRasters)
    .then(initApp);
*/
let olMap;
proj4.defs('EPSG:32617', '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32717', '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32634', '+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs')
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

let popup;

function initApp() {
    Ext.application({
        launch: function () {
            let rgbLayer;
            let rasterGroup, basemapsGroup, shapefilesGroup, indicesGroup;
            let treeStore;

            let omslayer = new ol.layer.Tile({name: "OpenStreetMap", source: new ol.source.OSM(), visible: false });
            let stamenlayer = new ol.layer.Tile({source: new ol.source.Stamen({layer: 'watercolor'}), name: 'Stamen Watercolor', visible: false });
            let satelitelayer = new ol.layer.Tile({ name: "Satélite (ArcGIS/ESRI)", visible: true,                
                source: new ol.source.XYZ({ attributions: ['Powered by Esri.',
                        'Map sources: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community.',
                        'Icons from Wikimedia Commons',], attributionsCollapsible: false,
                    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',                    
                })});           
            

            basemapsGroup = new ol.layer.Group({
                layers: [omslayer, stamenlayer, satelitelayer],
            });

            rgbLayer = new ol.layer.Tile({
                name: "Ortomosaico RGB",
                source: new ol.source.TileWMS({
                    url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",
                    params: {"LAYERS": project_path + ":mainortho", tiled: true}
                })
            });

            rasterGroup = new ol.layer.Group({
                name: "Imágenes",
                layers: [rgbLayer],
            });

            shapefilesGroup = new ol.layer.Group({                
                layers: shapefiles
            });

            indicesGroup = new ol.layer.Group({
                name: "Índices",
                layers: indices,
            });
            let view = new ol.View({
                //center: ol.proj.fromLonLat(startZone),                    
                zoom: 18,
                minZoom: 2,
            });
            //delete raterGroup review
            olMap = new ol.Map({                
                layers: [basemapsGroup, shapefilesGroup].concat(isMultispectral ? [] : []),
                view: view,
                target: 'map',
            });          

            if(shapefiles.length <= 1){
                fitInit();
            }
            else{
                let layerg = shapefilesGroup.getLayers().getArray().slice(-1); 
                let namelayer = layerg[0].getLayers().getArray()[0].get('name');
                fitMap(namelayer);
            }



            //fitMap(); // Must happen after olMap is defined!
            
            addMeasureInteraction();

            //olMap.addControl(visualizationselector());

            let zoomslider = new ol.control.ZoomSlider();
            olMap.addControl(zoomslider);
            let PointControl = createPointControl();
            olMap.addControl(new PointControl());
            let MeasureLengthControl = createLengthControl();
            olMap.addControl(new MeasureLengthControl());
            let MeasureAreaControl = createAreaControl();
            olMap.addControl(new MeasureAreaControl());
            let SaveMeasurementsControl = createSaveControl();
            olMap.addControl(new SaveMeasurementsControl());
            let ClearMeasurementsControl = createClearControl();
            olMap.addControl(new ClearMeasurementsControl());            
            let FullScreen = new ol.control.FullScreen();
            olMap.addControl(FullScreen);

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
            element.className = 'controls ol-control';
            element.appendChild(selectbase);
            var baseMapSelect= new ol.control.Control({
                element: element
            });
            olMap.addControl(baseMapSelect);

            var x = document.createElement("INPUT");
            x.setAttribute("type", "range");
            x.setAttribute("min", "1");
            x.setAttribute("max", "100");
            x.setAttribute("value", "50");
            var element1 = document.createElement('div');
            element1.className = 'range ol-control';
            element1.appendChild(x);
            var swiper= new ol.control.Control({
                element: element1
            });
            olMap.addControl(swiper);


          
            // Add legend, only if there is at least one index
            if (indices.length > 0) {                
                let LegendControl = function (opt_options) {
                    var options = opt_options || {};
                    var img = document.createElement('img');
                    var someIndexLayer = indices[0].getSource().getParams()["LAYERS"];
                    img.setAttribute("src", window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/styles/gradient.png");
                    var element = document.createElement('div');
                    element.className = 'legend ol-unselectable ol-control';
                    element.appendChild(img);
                    ol.control.Control.call(this, {
                        element: element,
                        target: options.target
                    });
                };
                ol.inherits(LegendControl, ol.control.Control);
                olMap.addControl(new LegendControl());
            }

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


            mapComponent = Ext.create('GeoExt.component.Map', {
                map: olMap
            });

            timeSlider = Ext.create('Ext.slider.Single', {
                //width: 20,
                height: 350,
                value: TIMES.length - 1,
                increment: 1,
                vertical: true,
                minValue: 0,
                maxValue: TIMES.length - 1,
                useTips: true,
                tipText: function (thumb) {
                    return TIMES[thumb.value];
                },
                componentCls: "slider-style",
            });

            const svgUrl = "data:image/svg+xml," + encodeURIComponent(composeSvgTicks(TIMES.length));
            console.log(svgUrl);
            setStyle('.slider-style { background-image:url(/mapper/ticks/' + TIMES.length + '); }');

            let dateLabel = Ext.create('Ext.form.Label', {
                text: "None"
            });

            timeSlider.on("change", function (slider, newValue, thumb, eOpts) {
                updateTime(rgbLayer, dateLabel, newValue);
                for (let index of indices) {
                    updateTime(index, dateLabel, newValue);
                }
            });
            updateTime(rgbLayer, dateLabel, TIMES.length - 1);
            for (let index of indices) {
                updateTime(index, dateLabel, TIMES.length - 1);
            }

            let timePanel;            
            timePanel = Ext.create('Ext.panel.Panel', {
                //bodyPadding: 5,  // Don't want content to crunch against the borders
                width: 250,
                align: 'right',
                //title: 'Línea de tiempo',
                items: [timeSlider, dateLabel],                    
                //renderTo: Ext.getBody()
            });
            

            mapPanel = Ext.create('Ext.panel.Panel', {
                region: 'center',
                border: false,
                layout: 'fit',
                //tbar: [ { type: 'button', text: 'Button 1' } ],
                items: [mapComponent],
               
            });

            let treeLayers = olMap.getLayers().getArray().filter(layer => layer != interactionLayer);
            let treeLayerGroup = new ol.layer.Group();
            treeLayerGroup.setLayers(new ol.Collection(treeLayers));
            treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                layerGroup: shapefilesGroup,// treeLayerGroup
            });

            let btInicio = Ext.create('Ext.Button', {
                text: '🏠 Cerrar',  
                tooltip: 'Cerrar visualizador',
                handler: function() {
                    Ext.Msg.show({
                        title:'Salir',
                        message: 'Desea salir del visualizador?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        fn: function(btn) {
                            if (btn === 'yes') {
                                top.window.location.href='/#/projects/'                            
                            } else {
                                console.log('Cancel pressed');
                            } 
                        }
                    });                    
                }
            });

            let btayuda = Ext.create('Ext.Button', {
                text: '？',  
                tooltip: 'Ayuda',
                handler: function(){
                    var navigate = function(panel, direction){
                        var layout = panel.getLayout();
                        layout[direction]();
                        Ext.getCmp('move-prev').setDisabled(!layout.getPrev());
                        Ext.getCmp('move-next').setDisabled(!layout.getNext());
                    };    
                    let cardHelp = new Ext.create('Ext.panel.Panel', {       
                        width: 500,
                        height: 200,
                        layout: 'card',
                        bodyStyle: 'padding:5px',        
                        bbar: [
                            {
                                id: 'move-prev',
                                text: 'Anterior',
                                handler: function(btn) {
                                    navigate(btn.up("panel"), "prev");
                                },
                                disabled: true
                            },
                            '->', // greedy spacer so that the buttons are aligned to each side
                            {
                                id: 'move-next',
                                text: 'Siguiente',
                                handler: function(btn) {
                                    navigate(btn.up("panel"), "next");
                                }
                            }
                        ],
                        // the panels (or "cards") within the layout
                        items: [{
                            id: 'card-0',
                            html: '<h1> Geoportal Agrins</h1>'+
                                    '<p> A continuación encontrará una guía para el uso de la plataforma.</p>'+
                                    '<ol><li>Agregar capas</li><li>Obtener índices</li><li>Modelo</li>'+
                                    '<li>Mediciones</li><li>Áreas</li><li>Puntos</li><li>Mapa bases</li></ol'+
                                    '<ol><li>Eliminar capa</li><li>Detalle de capa</li><li>Salir del visualizador</li>'
                                    
                        },{
                            id: 'card-1',
                            html:'<h5> Agregar Capa</h5>'+
                                    '<p> En la plataforma puede agregar archivos (multiespectrales, RGB) .tiff deberá especificad el modelo de la cámara para poder obtener los índices así como ejeccutar el modelo.</p>'+
                                    '<p> Además podrá agregar archivos kml y shapefile </p>'+
                                '<h5> Obtener índices</h5>'+
                                    '<p> Seleccione el índice requerido de la lista disponible (GCI, GRRI, MGRVI, NDRE, NDVI, NGRDI)</p>'+
                                '<h5> Modelo</h5>'+
                                    '<p> En el geoportal podrá obtener dos modelos uno para determinar la altura y otro para clorofila.</p>'
                                    
                        },{
                            id: 'card-2',
                            html: '<h3> Continuar..</h3>'+            
                            '<p> Continuar agregando </p>'
                        }],
                    });
                    
                    Ext.create('Ext.window.Window', {
                        title: 'Ayuda',
                        height: 500,
                        width: 310,
                        layout: 'fit',
                        items: [  // Let's put an empty grid in just to illustrate fit layout
                           cardHelp,            
                    ]
                    }).show();
                }
                
            });

            let btExpand = Ext.create('Ext.Button', {
                text: '☰',  
                tooltip: 'Expandir',
                handler: function(){
                    treePanel.expandAll();
                }
            });

            let btColapse = Ext.create('Ext.Button', {
                text: '┇',  
                tooltip: 'Contraer',
                handler: function(){
                    treePanel.collapseAll();
                }
            });

           

            let artifact = Ext.create('Ext.data.Store', {
                fields: ['abbr', 'name'],
                data : [artifactLayer]
                
            });
            
            // Create the combo box, attached to the states data store
            let comboart = new Ext.create('Ext.form.ComboBox', {
                fieldLabel: 'Seleccionar capa',
                store: artifact,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'abbr',
                height: '25',
                //renderTo: Ext.getBody()
            });
            
            let panelindex = Ext.create('Ext.form.Panel', {                
                bodyPadding: 5,
                //width: 350,
                //url: 'save-form.php',
                //layout: 'anchor',                
                //defaultType: 'textfield',
                items: [
                    {
                        xtype: 'label',
                        forId: 'myFieldId',
                        text: 'Indice multiespectral (Green / NIR) - 1',
                        margin: '0 0 0 10'
                    },
                    comboart
                    
                ],            
                buttons: [{
                    text: 'Enviar',
                    formBind: true, //only enabled once the form is valid
                    disabled: true,
                    /*handler: function() {
                        var form = this.up('form').getForm();
                        if (form.isValid()) {
                            form.submit({
                                success: function(form, action) {
                                   Ext.Msg.alert('Success', action.result.msg);
                                },
                                failure: function(form, action) {
                                    Ext.Msg.alert('Failed', action.result.msg);
                                }
                            });
                        }
                    }*/
                }],
                //renderTo: Ext.getBody()
            });



            
            tabMenu = Ext.create('Ext.toolbar.Toolbar', {            
                //renderTo: Ext.getBody(),
                //allowMultiple: true,
                items: [
                {
                    text: '➕ Agregar',
                    width: '95px',
                     //active: true,
                     //tooltip: 'Agregar índices',
                     menu: [
                        {text: 'Vector', handler: function(){ top.window.location.href= "/#/projects/" + uuid + "/upload/shapefile" }},
                        {text: 'Geotiff', handler: function(){ top.window.location.href= "/#/projects/" +uuid + "/upload/geotiff" }},                         
                     ]
                },
                {
                     text: '📊 Índices',
                     width: '88px',
                     menu: [
                        {text: 'GCI', 
                        handler: function(){ 
                            Ext.create('Ext.window.Window', {
                                title: 'Indice CGI',
                                height: 200,
                                width: 400,
                                layout: 'fit',
                                items:[
                                    panelindex
                                ]
                                
                            }).show();
                        }},
                        {text: 'GRRI', handler: function(){ alert("Índice: GRRI \nTipo: Visible \nFunción: \nEstado: En desarrollo..."); }},
                        {text: 'MGRVI', handler: function(){ alert("Índice: MGRVI \nTipo: Visible \nFunción: Captura la diferencia de reflectancia por la absorción de la clorofila a y la clorofila b.\nEstado: En desarrollo..."); }},
                        {text: 'NDRE', handler: function(){ alert("Índice: NDRE \nTipo: Multiespectral \nFunción: Utilizado para identificar las áreas con plantas saludables mediante el monitoreo de la clorofila. Puede detectar el estrés en la planta aún cuando no sea visible en la superficie.\nEstado: En desarrollo..."); }},
                        {text: 'NDVI', handler: function(){ alert("Índice: NDVI \nTipo: Multiespectral \nFunción: Identifica densidad y vitalidad de la vegetación de un área. La vegetación densa y sana tiene valores cercanos al 1 positivo, el suelo tiene valores cercanos a 0 y las nubes, nieve y el agua tienen valores negativos.\nEstado: En desarrollo..."); }},
                        {text: 'NGRDI', handler: function(){ alert("Índice: NGRDI \nTipo: Visible \nFunción: Permite diferenciar entre vegetación (positivos), suelo (negativos) y agua (cero).\nEstado: En desarrollo..."); }},

                     ]
                },
                {
                     text: '🔗 Modelo',
                     width: '90px',
                     menu: [
                        {text: 'Altura', handler: function(){ alert("Modelo: Deep Learning \nFunción: Mediante deep learning detectar la altura de cultivos.\nEstado: En desarrollo...")}},
                        {text: 'Clorofila',handler: function(){ alert("Modelo: Deep Learning \nFunción: Mediante deep learning detectar la clorofila de cultivos.\nEstado: En desarrollo...")}}
                     ]
                }],
                
           });             


            treePanel = Ext.create('Ext.tree.Panel', {
                //viewConfig: {plugins: {ptype: 'treeviewdragdrop'}},
                header:{
                    titlePosition:1,
                    defaults:{ type:'tool'},
                    items:[btInicio]
                },
                store: treeStore,
                rootVisible: false,                
                flex: 1,
                border: false,
                tbar: [{
                    xtype: 'segmentedbutton',                
                    items: isDemo ? [] : [tabMenu],                    
                }],
                fbar:[{ 
                    type: 'button', 
                    text: 'Mapa 3D',                   
                    },
                ],
                tools: [
                    btayuda,
                    btExpand,
                    btColapse,
                ],
                listeners: {
                    itemcontextmenu: {
                        fn:function(tree, record, item, index, e, eOpts ) {
                          // Optimize : create menu once
                          var menu_grid = new Ext.menu.Menu({ items:
                            [
                                { text: 'Descargar', handler: function() {Ext.Msg.alert('Descargar', 'Función descarga.');} },
                                { text: 'Eliminar', handler: function() {Ext.Msg.alert('Eliminar', 'Función eliminar.');} },
                                { text: 'Detalle', handler: function() {Ext.Msg.alert('Detalle', 'Función detalle.');} },
                            ]
                            });
                          // HERE IS THE MAIN CHANGE
                          var position = [e.getX()-10, e.getY()-10];
                          e.stopEvent();
                          menu_grid.showAt(position);
                       }
                    },

                    itemclick: {
                        fn: function(view, record, item, index, event) {
                            if (record.data.text.substring(0, 5) !='Grupo'){
                                fitMap(record.data.text);                            
                            }
                        }
                    }
                
                }
               
            });     

            var elem = document. getElementById("spiner"); 
            elem. parentNode. removeChild(elem);
  
            Ext.create('Ext.Viewport', {
                
                layout: 'border',
                items: [
                    mapPanel,                    
                    {
                        xtype: 'panel',
                        region: 'west',
                        title: project_name,
                        collapsible: true,                        
                        width: 290,
                        split: true,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [treePanel],
                        
                    },
                ]
            });
        },
        name: 'BasicTree'
    });
}


function onConfig(){
    Ext.create('Ext.window.Window', {
        title: project_name,
        height: 500,
        width: 310,
        layout: 'fit',
        items: [  // Let's put an empty grid in just to illustrate fit layout        
        {
            xtype: 'label',
            text: 'project_notes',
            
            margin: '0 0 0 10'
        }       
    ]
    }).show();
}


function fillAnotations(){
    shapefiles.push(anotationLayer);
}

function fillShapefiles() {
    return fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid + "/artifacts",
        {headers: noCacheHeaders})
        .then(response => response.json())
        .then(data => {            
            for (let art of data.artifacts) {   
                let layerfile=[];     
                artifactLayer.push(art.name);            
                if (art.type === "SHAPEFILE"){
                    //console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + art.layer + "&maxFeatures=50&outputFormat=application/json&");      
                    layerfile.push(new ol.layer.Vector({
                        name: art.name,
                        source: new ol.source.Vector({
                            format: new ol.format.GeoJSON({projection: 'EPSG:4326'}),                                
                            url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + art.layer + "&maxFeatures=50&outputFormat=application/json&"
                                //url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:poly&maxFeatures=50&outputFormat=application/json&"
                        })
                }));}
                else if (art.type === "ORTHOMOSAIC"){
                    console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0");
                    layerfile.push(new ol.layer.Image({
                        name: art.name,
                        source: new ol.source.ImageWMS({
                            url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",                                
                            params: {"LAYERS": art.layer}

                        })                            
                }));}
                else if (art.type === "RGB"){
                    console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0");
                    layerfile.push(new ol.layer.Image({
                        name: art.name,
                        source: new ol.source.ImageWMS({
                            url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",                                
                            params: {"LAYERS": art.layer}

                        })                            
                }));}
                else if (art.type === "INDEX"){
                    console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0");
                    layerfile.push(new ol.layer.Image({
                        name: art.name,
                        source: new ol.source.ImageWMS({
                            url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",                                
                            params: {"LAYERS": art.layer}

                        })                            
                }));}
                let layerGroup = new ol.layer.Group({
                    name: 'Grupo '+art.name,
                    leaf: true, 
                    layers: layerfile,
                });
                shapefiles.push(layerGroup)            
                }                
            }
            
        );
}



function fillRasters() {
    return fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid + "/indices",
        {headers: noCacheHeaders})
        .then(response => response.json())
        .then(data => {
                for (let index of data.indices) {
                    indices.push(new ol.layer.Image({
                        name: index.title,
                        source: new ol.source.ImageWMS({
                            url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",
                            params: {"LAYERS": index.layer}
                        })
                    }));
                }
            }
        );
}

function fitMap(name) {
    fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid +"/"+ name+"/bbox",
        {headers: noCacheHeaders,})
        .then(response => response.json())
        .then(data => {
            const minCoords = ol.proj.transform([data.bbox.minx, data.bbox.miny], data.srs, "EPSG:3857");
            const maxCoords = ol.proj.transform([data.bbox.maxx, data.bbox.maxy], data.srs, "EPSG:3857");
            olMap.getView().fit(minCoords.concat(maxCoords), olMap.getSize());
            olMap.getView().fit(minCoords.concat(maxCoords), olMap.getSize());
        });
}
function fitInit(){    
    olMap.getView().setCenter(ol.proj.transform([-78.58031164977537,-0.394260613241795], 'EPSG:4326', 'EPSG:3857'));
    olMap.getView().setZoom(5);
}

/*
//imageSource.once('imageloadend', function(e) {
function fitMap(){
    console.info('image loaded');
    var view = olMap.getView();
    view.fitExtent(layerImage.getExtent(), map.getSize());   
};*/

function _createControl(handler, buttonContent, buttonClass, buttonTooltip) {
    let controlClass = function (opt_options) {
        var options = opt_options || {};
        var button = document.createElement('button');
        button.innerHTML = buttonContent;
        button.setAttribute("type", "button");
        button.setAttribute("title", buttonTooltip);

        button.addEventListener('click', handler, false);
        button.addEventListener('touchstart', handler, false);

        var element = document.createElement('div');
        element.className = buttonClass + ' ol-unselectable ol-control';
        element.appendChild(button);

        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });

    };
    ol.inherits(controlClass, ol.control.Control);
    return controlClass;
}

function createNorthControl() {
    return _createControl(() => olMap.getView().setRotation(olMap.getView().getRotation() == 0 ? 45 : 0),
        "N", "rotate-north", "Rotar mapa");
}

function createPointControl() {
    return _createControl(measurePointListener,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="90%" height="90%" version="1.1">' +
        '<circle cx="25" cy="25" r="10" stroke="#fff" stroke-width="6" fill="#00000000"></circle>' +
        '</svg>',
        "measure-point", "Anotar punto");
}

function createLengthControl() {
    return _createControl(measureLengthListener,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 40" width="90%" height="90%">' +
        '  <path stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none" d="M5,20H45M12,12 4,20 12,28M38,12 46,20 38,28"/>' +
        '</svg>',
        "measure-length", "Medir distancias");
}

function createAreaControl() {
    return _createControl(measureAreaListener,
        '<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 60 588 417" height="90%" width="90%">' +
        '  <path stroke="#fff" stroke-width="50" stroke-linejoin="round" stroke-linecap="round" fill="none" d="M 246.55624,445.55603 C 130.80587,418.39845 35.513972,395.59161 34.796512,394.87415 C 33.744472,393.82211 33.735832,393.25321 34.751832,391.93421 C 35.444712,391.03469 67.302832,366.53016 105.54765,337.4797 C 143.79247,308.42924 175.07668,284.21068 175.06812,283.66068 C 175.05955,283.11068 137.72969,267.03903 92.112862,247.9459 C 46.496032,228.85277 8.8093816,212.65277 8.3647316,211.9459 C 7.4317416,210.46268 204.30692,12.877091 206.05498,13.542291 C 208.09055,14.316891 577.03254,282.35001 578.28364,283.96311 C 578.98324,284.86521 579.30634,286.25314 579.00154,287.04739 C 577.51514,290.9209 462.03434,492.82834 460.68624,493.91068 C 459.82994,494.59818 458.65284,495.10955 458.07044,495.04706 C 457.48804,494.98458 362.30664,472.71361 246.55624,445.55603 z "/>' +
        '</svg>',
        "measure-area", "Medir áreas"
    );
}

function createSaveControl() {
    return _createControl(saveMeasurementsListener,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792" width="90%" height="90%">' +
        '<g transform="matrix(1,0,0,-1,129.08475,1270.2373)">' +
        '  <path fill="#fff" d="m 384,0 h 768 V 384 H 384 V 0 z m 896,0 h 128 v 896 q 0,14 -10,38.5 -10,24.5 -20,34.5 l -281,281 q -10,10 -34,20 -24,10 -39,10 V 864 q 0,-40 -28,-68 -28,-28 -68,-28 H 352 q -40,0 -68,28 -28,28 -28,68 v 416 H 128 V 0 h 128 v 416 q 0,40 28,68 28,28 68,28 h 832 q 40,0 68,-28 28,-28 28,-68 V 0 z M 896,928 v 320 q 0,13 -9.5,22.5 -9.5,9.5 -22.5,9.5 H 672 q -13,0 -22.5,-9.5 Q 640,1261 640,1248 V 928 q 0,-13 9.5,-22.5 Q 659,896 672,896 h 192 q 13,0 22.5,9.5 9.5,9.5 9.5,22.5 z m 640,-32 V -32 q 0,-40 -28,-68 -28,-28 -68,-28 H 96 q -40,0 -68,28 -28,28 -28,68 v 1344 q 0,40 28,68 28,28 68,28 h 928 q 40,0 88,-20 48,-20 76,-48 l 280,-280 q 28,-28 48,-76 20,-48 20,-88 z"/>' +
        '</g></svg>', "save-meas", "Guardar mediciones");
}

function createClearControl() {
    return _createControl(clearMeasurementsListener,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<g>' +
        '  <path stroke="#fff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" fill="none" d="m6 4v24h11v-1h-10v-22h11v7h7v7h1v-8l-7-7h-1z"/>' +
        '  <path stroke="#fff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" fill="none" d="m18 20.707l3.293 3.293-3.293 3.293c.013.025.707.707.707.707l3.293-3.293 3.293 3.293.707-.707-3.293-3.293 3.293-3.293-.707-.707-3.293 3.293-3.293-3.293z"/>' +
        '</g></svg>',
        "clear-meas", "Eliminar mediciones (use Supr para eliminar una sola medición)")
}

let interactionLayer, interactionSource;
var featureType = 'LineString';
var helpTooltipElement, helpTooltip;
var measureTooltipElement, measureTooltip;
var numMeasurement = 0;
var measureTooltips = {};
var draw, listener, isDrawing = false;
var delete_handler;

function removeInteraction() {
    isDrawing = false;
    olMap.removeInteraction(draw);
    olMap.un('pointermove', pointerMoveHandler);
    deleteHelpTooltip();
}

function measurePointListener() {
    featureType = 'Point';
    if (isDrawing) removeInteraction();
    else addInteraction();
}

function measureLengthListener() {
    featureType = 'LineString';
    if (isDrawing) removeInteraction();
    else addInteraction();
}

function measureAreaListener() {
    featureType = 'Polygon';
    if (isDrawing) removeInteraction();
    else addInteraction();
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
    let geojsonFormat = new ol.format.GeoJSON();
    let featArray2 = geojsonFormat.readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
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
    shapefiles.push(vectorLayer);
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
    URL.revokeObjectURL(link.href);
}

function clearMeasurementsListener() {
    interactionSource.clear();
    Object.entries(measureTooltips).forEach((tt) => olMap.removeOverlay(tt[1]));
    selectClick.getFeatures().clear();
}

var drawingFeature = null;
var helpMsg;
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
        })
    }, this)
    draw.on('drawend', (evt) => {
        ans = "";
        Ext.Msg.prompt('Agregar Medición', 'Escriba el nombre de la medición:', function(btn, text){
            if (btn == 'ok'){
                ans = text;
            }
        });
        //ans = prompt("Escriba el nombre de la medición (opcional)");
        if (ans !== null && ans.trim() !== "")
            drawingFeature.set("nombre", ans)
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

function updateTime(layer, label, val) {
    layer.getSource().updateParams({'TIME': TIMES[val]});
    label.setText(TIMES[val]);
}

function addIndex(index) {
    fetch(window.location.protocol + "//" + window.location.host + "/api/rastercalcs/" + uuid, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({index: index})
    }).then(function (response) {
        if (response.status === 200) {
            window.location.reload(true); // Reload page if index created successfully
        } else throw response.text();
    }).catch((msg) => alert(msg));
}

function composeSvgTicks(numTicks) {
    function _tick(pos) {
        return `<line x1="${pos}" y1="0" x2="${pos}" y2="10" style="stroke:black;stroke-width:1" />`
    }

    let svg = '<svg height="30px" width="214px">';
    // Interval [1, 213] must be divided in numTicks spaces, ends are included
    // Fence post problem! :)
    const MARGIN = 7;
    const START = MARGIN, END = 214 - MARGIN;
    const interval = ((END - START) / (numTicks - 1)).toFixed(); // Place tick every interval pixels
    for (var i = 0; i < numTicks; i++) {
        svg += _tick(interval * i + START);
    }
    svg += '</svg>';
    return svg;
}

// https://stackoverflow.com/a/19613731
function setStyle(cssText) {
    var sheet = document.createElement('style');
    sheet.type = 'text/css';
    /* Optional */
    window.customSheet = sheet;
    (document.head || document.getElementsByTagName('head')[0]).appendChild(sheet);
    return (setStyle = function (cssText, node) {
        if (!node || node.parentNode !== sheet)
            return sheet.appendChild(document.createTextNode(cssText));
        node.nodeValue = cssText;
        return node;
    })(cssText);
};