/*CEPRA 2019
    Authors: Danny Ucho - Jeremy Godoy
    Date: 10/10/2022
    Summary: Javascript file for GEOEXT-EXTJS loading layers from geoserver, using openlayers v7
    
*/

Ext.require([
    'GeoExt.component.Map',
    'GeoExt.data.store.LayersTree',
    'Ext.Button',
]);

/* Mapas Base (Satellite dafult) */
let omslayer = new ol.layer.Tile({diplayInlayerSwitcher:true, name: "OpenStreetMap",title: "OpenStreetMap", source: new ol.source.OSM(),baseLayer: true,type:'base', visible: false });
let stamenlayer = new ol.layer.Tile({source: new ol.source.Stamen({layer: 'watercolor'}),title:'Watercolor', name: 'Stamen Watercolor',baseLayer: true,type:'base', visible: false });
let satelitelayer = new ol.layer.Tile({ name: "Satélite (ArcGIS/ESRI)", title: 'Satélite',visible: true,baseLayer: true,type:'base',                
    source: new ol.source.XYZ({ attributions: ['Powered by Esri.',
        'Map sources: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community.',
        'Icons from Wikimedia Commons',], attributionsCollapsible: true,
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',                    
})});       


/* Initial values*/
let mapComponent, mapPanel, olMap, basemapsGroup, layersGroup;
let startPanel, treePanel, addPanel, helpPanel, configPanel;
let artifactLayer = [];
let ctrlSwiper, legend;
let anotationLayer = new ol.layer.Group({name:'Grupo anotaciones'});
let isLayerSelect = false;let isswipervisible = false;
let noCacheHeaders = new Headers(); // HACK: Force disable cache, otherwise timing problem when going back to screen
noCacheHeaders.append('pragma', 'no-cache');
noCacheHeaders.append('cache-control', 'no-cache');

proj4.defs('EPSG:32617', '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32717', '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32634', '+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs')
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

initApp();

function initApp() {
    Ext.application({
        launch: function () {            
            basemapsGroup = new ol.layer.Group({
                title:'Mapas Base',
                layers: [omslayer, stamenlayer, satelitelayer],
            });                     
           
            let view = new ol.View({               
                center: [0, 0],
                zoom: 1,
                maxZoom: 24,
            });
            
            olMap = new ol.Map({                
                layers: [basemapsGroup],
                view: view,
                target: 'map',
                controls:[]
            });           

            addControlsMap();       
                                     

            mapComponent = Ext.create('GeoExt.component.Map', {
                map: olMap
            });                   
 
            mapPanel = Ext.create('Ext.panel.Panel', {
                region: 'center',
                border: false,
                layout: 'fit',
                items: [mapComponent],
               
            });            
            var elem = document. getElementById("spiner"); 
            elem. parentNode. removeChild(elem);            
            createViewPort();
            
        },
        name: 'BasicTree'
    });
}

function createaddPanel(){    
    var camera = Ext.create('Ext.form.ComboBox', {
        fieldLabel: 'Elegir cámara',
        name: 'camera',
        id: 'camera',
        msgTarget: 'under' ,
        store: dataCamera,
        width: '100%',
        queryMode: 'local',
        allowBlank : false,
        blankText: 'Seleccione el modelo de la cámara',
        forceSelection: true,
        displayField: 'name',
        valueField: 'name',
        value:'1',
        labelAlign: 'top'
    });
    var typeImage = Ext.create('Ext.form.ComboBox', {
        fieldLabel: 'Tipo de imagen',
        name: 'type',
        id: 'type',
        store: dataTypeImage,
        width: '100%',
        msgTarget: 'under' ,
        queryMode: 'local',
        allowBlank : false,
        blankText: 'Seleccione el tipo de Imagen',
        forceSelection: true,
        displayField: 'name',
        valueField: 'name',
        labelAlign: 'top'
    });
    var formaddTiff = Ext.create('Ext.form.Panel', {                
        id: 'formIdAdd',
        width: '100%', 
        height: '100%',
        bodyPadding: 10,    
        border:0,
        defaultType: 'textfield',
        items: [{
            xtype: 'textfield',
            name: 'title',
            id: 'title',
            width:'100%',     
            fieldLabel: 'Nombre',
            labelAlign: 'top',
            allowBlank: false,  // requires a non-empty value            
            blankText: 'El campo nombre es necesario',
            msgTarget: 'under' ,
        },
        {
            xtype: 'filefield',
            name: 'geotiff',
            id: 'geotiff',
            fieldLabel: 'Archivo .tif',
            width:'100%',                                
            msgTarget: 'side',
            labelAlign: 'top',
            allowBlank: false,
            blankText: 'Selecciones un archivo en formato .tif',
            anchor: '100%',
            buttonText: 'Abrir',
            regex     : (/.(tif|tiff)$/i),
            regexText : 'Solo se acepta imagenes en formato .tif',
            msgTarget : 'under',
            buttonConfig:{
                iconCls:'icon-folder-open',
                cls: 'btnform',
            }
            
        },
        
            camera
        ,
            typeImage
        ,
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
                        url : '/api/uploads/' + uuid + '/geotiff',
                        params: {
                            data: form.getValues(),
                        },
                        headers: {
                            Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                        },
                        waitMsg:'Cargando archivo espere por favor...',
                        success: function(fp, o) {
                            Ext.getCmp('formIdAdd').reset();
                            initLayers();
                            Ext.Msg.alert('Detalle', 'Capa agregada correctamente.');                                                   
                        },
                        failure: function(fp, o) {
                            Ext.Msg.alert('Error', 'Error al subir capa.');
                        }
                    });
                }
                
            }
        }],        
    });    

    var formaddshapefile = Ext.create('Ext.form.Panel', {                
        id: 'formIdAddshp',
        width: '100%', 
        height: '100%',
        bodyPadding: 10,    
        border:0,
        defaultType: 'textfield',
        items: [            
            {
            xtype: 'textfield',
            name: 'title',
            id: 'titleshp',
            width:'100%',     
            fieldLabel: 'Nombre',
            labelAlign: 'top',
            allowBlank: false,  // requires a non-empty value            
            blankText: 'El campo nombre es necesario',
            msgTarget: 'under' ,
        },
        {
            xtype: 'filefield',
            name: 'file',
            fieldLabel: 'Shapefile (dbf,shp, shx, prj)',                                   
            labelAlign: 'top',            
            allowBlank: false,
            blankText: 'Seleccione el conjunto de archivos shapefile',
            anchor: '100%',        
            buttonText: 'Abrir',
            msgTarget : 'under',  
            buttonConfig:{
                iconCls:'icon-folder-open',
                cls: 'btnform',
            },
            listeners: {
                change: function(fld, value) {
                    var extension = ['shp', 'dbf', 'shx', 'prj'];
                    var upload = fld.fileInputEl.dom;
                    var files = upload.files;
                    var names = [];                    
                    if (files) {                        
                        for (var i = 0; i < files.length; i++){                            
                            var namfile = files[i].name.split('.').shift();
                            var extention = files[i].name.split('.').pop();
                            if(extension.indexOf(extention) != -1){
                                extension=extension.filter(function (letter) {
                                    return letter !== extention;
                                });
                            }
                            else{
                                fld.setRawValue('');
                                return;
                            }                          
                            names.push(files[i].name)
                        }
                        if(extension.length == 0){
                            fld.setRawValue(names);return;
                        }                            
                        else{
                            fld.setRawValue('');return
                        }                      

                    }
                    fld.setRawValue('');return;
                    
                },
            focus:function(cmp){
                    cmp.fileInputEl.set({
                        multiple:'multiple',
                        regex     : (/.(cpg|dbf|prj|shp|shx)$/i),
                        regexText : 'Solo se acepta archivos shapefile',
                    });
                }
            }
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
                        url : '/api/uploads/' + uuid + '/vectorfile',
                        params: {           
                            'datatype': 'shp',
                        },
                        headers: {
                            Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                        },
                        waitMsg:'Cargando archivo espere por favor...',
                        success: function(fp, o) {
                            Ext.getCmp('formIdAddshp').reset();                            
                            initLayers();
                            Ext.Msg.alert('Detalle', 'Capa agregada correctamente.');                                                   
                        },
                        failure: function(fp, o) {                            
                            Ext.Msg.alert('Error', 'Error al subir capa.');
                        }
                    });
                }
                
            }
        }],        
    });

    var formaddkml = Ext.create('Ext.form.Panel', {                
        id: 'formIdAddkml',
        width: '100%', 
        height: '100%',
        bodyPadding: 10,    
        border:false,
        defaultType: 'textfield',
        items: [{
            xtype: 'textfield',
            name: 'title',
            id: 'titlekml',
            width:'100%',     
            fieldLabel: 'Nombre',
            labelAlign: 'top',
            allowBlank: false,  // requires a non-empty value            
            blankText: 'El campo nombre es necesario',
            msgTarget: 'under' ,
        },
        {
            xtype: 'filefield',
            name: 'file',
            id: 'filekml',
            fieldLabel: 'Archivo .kml',
            width:'100%',                                
            msgTarget: 'side',
            labelAlign: 'top',
            allowBlank: false,
            blankText: 'Selecciones un archivo en formato .kml',
            anchor: '100%',
            buttonText: 'Abrir',
            regex     : (/.(kml)$/i),
            regexText : 'Solo se acepta archivos en formato .kml',
            msgTarget : 'under',
            buttonConfig:{
                iconCls:'icon-folder-open',
                cls: 'btnform',
            }
            
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
                        url : '/api/uploads/' + uuid + '/vectorfile',
                        params: {
                            'datatype': 'kml',
                        },
                        headers: {
                            Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                        },
                        waitMsg:'Cargando archivo espere por favor...',
                        success: function(fp, o) {
                            Ext.getCmp('formIdAddkml').reset();
                            initLayers();
                            Ext.Msg.alert('Detalle', 'Capa agregada correctamente.');                                                   
                        },
                        failure: function(fp, o) {
                            Ext.Msg.alert('Error', 'Error al subir capa.');
                        }
                    });
                }
                
            }
        }],        
    });



    var tabMenu = Ext.create('Ext.tab.Panel', {
        width: '100%',        
        height: '100%',    
        border: false,            
        layout : 'vbox',
        plain: true,
        region: 'center',
        tabBar: {
            defaults: {
            flex: 1, // if you want them to stretch all the way
            },
            dock: 'top'
        },
        items: [{
            title: 'GeoTiff',            
            
            
            items:[ formaddTiff ]
        }, 
        {
            title: 'ShapeFile',
            flex: 2,
            items:[ formaddshapefile ]
        },
        {
            title: 'KML',
            flex: 2,
            items:[ formaddkml ]
        },
    ]
    });

    addPanel = new Ext.create('Ext.panel.Panel', {                
        width: '100%',
        autoScroll: true,
        overflowY: 'scroll',
        height: '100%',         
        border:false,
        cls:'myWhiteCls',
        items:[
            tabMenu
        ],
        
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
    
function createTree(){    
    tablbar  = Ext.create('Ext.toolbar.Toolbar', {   
        border: false,    
        items: [ 
            {
                xtype: 'button',
                id: 'btinfolayer',
                iconCls: 'fa-circle-info',   
                cls: 'fa-solid',
                hidden: true,
                tooltip: 'Información capa',
                handler: function(){
                    var lname= record.data.text;
                    var lcamera= dataLayers.findRecord('title', record.data.text).get('camera');
                    var ltype= dataLayers.findRecord('title', record.data.text).get('type');
                    var ldate =  new Date(dataLayers.findRecord('title', record.data.text).get('date'));                  
                    Ext.Msg.alert(lname,
                     'Cámara: '+lcamera+
                     '<br/>Tipo:   '+ltype+
                     '<br/>Fecha:  '+ldate
                     , Ext.emptyFn);

                }
            }
        ]});
        

    treePanel = Ext.create('Ext.tree.Panel', {
        id:'treePanelId',
        autoScroll: true,
        rootVisible: true,                
        autoScroll: true,
        flex: 1,
        layout: 'fit',
        border: false,               
        height:'100%',
        style: {
            backgroundColor: 'white',
        },                
        listeners: {
            render: function(){
                Ext.getBody().on("contextmenu", Ext.emptyFn, null, {preventDefault: true});
            },
            itemcontextmenu: function(tree, record, item, index, e, eOpts ) {
                var m_item = [];
                if(record.data.leaf){                                        
                    if (record.data.N.type == 'MULTIESPECTRAL' || record.data.N.type == 'RGB'){                                             
                        m_item = [
                            { text: 'Descargar', iconCls:'fa-solid fa-file-arrow-down',hidden : isDemo,
                                handler: function() {
                                    windowDownloadImage(record); }},                            
                            { text: 'Eliminar', iconCls:'fa-solid fa-trash-can', hidden : isDemo,
                                    handler: function() {deleteItem(record.data.text, record.data.N.id)} },  
                            { text: 'Información', iconCls:'fa-solid fa-circle-info', 
                                    handler: function() {
                                        Ext.Msg.alert(record.data.text,
                                            'Cámara: '+record.data.N.camara+
                                            '<br/>Tipo de Capa: '+record.data.N.type+
                                            '<br/>Creado:  '+new Date(record.data.N.date).toLocaleDateString('en-US')
                                            , Ext.emptyFn);
                                    } },
                            { text: 'Modelo', iconCls:'fa-solid fa-kaaba', hidden : isDemo,
                                handler: function() {windowModel(record);} },
                            { text: 'Índice', iconCls:'fa-solid fa-images', hidden : isDemo,
                                handler: function() {windowIndex(record);} },
                            { text: 'Portada', iconCls:'fa-solid fa-panorama',hidden : isDemo,
                                handler: function() {portadaImage(record); }},  
                        ]
                    }
                    else{                                                               
                        if (record.data.N.type == 'INDEX' || record.data.N.type == 'MODEL'){
                            m_item = [
                                { text: 'Descargar', iconCls:'fa-solid fa-file-arrow-down',hidden : isDemo,
                                handler: function() {
                                    windowDownloadImage(record);} },
                                { text: 'Eliminar', iconCls:'fa-solid fa-trash-can', hidden : isDemo,
                                    handler: function() {deleteItem(record.data.text, record.data.N.id)} },  
                                { text: 'Información', iconCls:'fa-solid fa-circle-info', 
                                        handler: function() {
                                            Ext.Msg.alert(record.data.text,
                                                'Tipo de Capa: '+record.data.N.type+
                                                '<br/>Creado:  '+new Date(record.data.N.date).toLocaleDateString('en-US')
                                                , Ext.emptyFn);
                                        } },
                                { text: 'Portada', iconCls:'fa-solid fa-panorama',hidden : isDemo,
                                    handler: function() {portadaImage(record); }},  
                            ]
                        }
                        else{
                            m_item = [
                                { text: 'Descargar', iconCls:'fa-solid fa-file-arrow-down',hidden : isDemo,
                                handler: function() { 
                                    windowDownloadVector(record)}},
                                { text: 'Eliminar', iconCls:'fa-solid fa-trash-can', hidden : isDemo,
                                    handler: function() {deleteItem(record.data.text, record.data.N.id)} },  
                                { text: 'Información', iconCls:'fa-solid fa-circle-info', 
                                        handler: function() {
                                            Ext.Msg.alert(record.data.text,
                                                'Tipo de Capa: '+record.data.N.type+
                                                '<br/>Creado:  '+new Date(record.data.N.date).toLocaleDateString('en-US')
                                                , Ext.emptyFn);
                                        } },
                                { text: 'Portada', iconCls:'fa-solid fa-panorama',hidden : isDemo,
                                    handler: function() {portadaImage(record); }},  
                            ]
                        }                        
                    }
                    
                }
                else{
                    if (index == 0){
                        m_item =[{ text: 'Expandir', iconCls:'fa-solid fa-arrow-down-short-wide', handler: function() {treePanel.expandAll();} },
                                { text: 'Contraer', iconCls:'fa-solid fa-arrow-up-short-wide', handler: function() {treePanel.collapseAll();} },
                                { text: 'Recargar', iconCls:'fa-solid fa-rotate', handler: function() {initLayers();} },]
                    }
                    else{                        
                        m_item =[{ text: 'Información', iconCls:'fa-solid fa-circle-info', 
                        handler: function() {
                            var type = '';
                            if(record.data.N.type == 'IMAGE')
                                type = 'Imagen formato .tiff'
                            else
                                type = 'Vector'
                            Ext.Msg.alert(record.data.text,
                                'Grupo de capas: '+record.data.text+
                                '<br/>Capa principal: '+type+
                                '<br/>Creado:  '+new Date(record.data.N.date).toLocaleDateString('en-US')
                                , Ext.emptyFn);
                        } },];
                    }
                }

                // Optimize : create menu once
                var menu_grid = new Ext.menu.Menu({ items:m_item });
                var position = e.getXY();
                e.stopEvent();
                menu_grid.showAt(position);
             },
            
            itemclick: {
                fn: function(view, record, item, index, event) {  
                    ctrlSwiper.removeLayers();
                    if(record.data.leaf){
                        isLayerSelect = true;
                        fitMap(record.data.N.id);
                        ctrlSwiper.removeLayers();        
                        if (isswipervisible)
                            ctrlSwiper.addLayer(record.data,true);                        
                        
                        legend.getItems().clear()
                        var layerLegend = new ol.legend.Legend({ layer: record.data })  
                        var src = '';
                        if (record.data.N.legend == '' ){
                            src= window.location.protocol + "//" + window.location.host + '/geoserver/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=40&HEIGHT=20&STYLE='+record.data.N.stylelayer+'&LAYER=project_'+uuid+':'+record.data.N.title+'&format_options=layout:legend&LEGEND_OPTIONS=countMatched:true;fontAntiAliasing:true'
                        }
                        else{
                            src = window.location.protocol + "//" + window.location.host + '/static/'+record.data.N.legend                            
                        }
                        layerLegend.addItem(new ol.legend.Image({
                            title: record.data.text,
                            src: src
                        }))                            
                        legend.addItem(layerLegend)
                    }
                    else{
                        isLayerSelect = false;
                        ctrlSwiper.removeLayers();
                    }
                    
                }
            }               
        }               
    });
}

function windowIndex(layer){
    var index=[];
    if(layer.data.N.camara === 'RGB'){
        index=["GRRI","MGRVI","NGRDI"];
    }
    else{
        index=["GCI","GRRI","MGRVI","NDRE","NDVI","NGRDI"];
    }    
    var parentGroup = Ext.getCmp('treePanelId').getStore().getNodeById(layer.data.parentId);    
    var indices = parentGroup.data.N.indices;
    var result = index.filter(el => !indices.includes(el));
    if (result.length === 0){
        Ext.Msg.alert(layer.data.text,
            'No existen indices disponibles'
            , Ext.emptyFn);
    }
    else {
        var indexstore = []
        for(let i of result){
            indexstore.push({'id':i, 'name':i})
        }
        var dataIndex = Ext.create('Ext.data.Store', {
            storeId: 'dataIndex',
            fields: ['id', 'index'],
            data : indexstore
        });

        var indice = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Seleccionar índice',
            name: 'index',
            id: 'index',
            msgTarget: 'under' ,
            store: dataIndex,
            width: '100%',
            queryMode: 'local',
            allowBlank : false,
            blankText: 'Seleccione el índice que desea crear',
            forceSelection: true,
            displayField: 'name',
            valueField: 'name',
            value:'1',
            labelAlign: 'top'
        });

        Ext.create('Ext.window.Window', {
            id: 'windowIndexId',
            title: layer.data.text,
            height: 180,
            width: 300,
            layout: 'vbox',
            modal: true,
            resizable   : false,
            items:
                {
                    xtype: 'form',
                    id: 'formIdIndex',
                    width: '100%', 
                    height: '100%',
                    bodyPadding: 10,    
                    border:0,
                    defaultType: 'textfield',
                    items: [                
                        indice,            
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
                    text: 'Crear índice',
                    formBind: true, //only enabled once the form is valid
                    disabled: true,
                    iconCls: 'icon-save',
                    cls:'btnform',
                    handler: function() {
                        var form = Ext.getCmp('formIdIndex').getForm();                
                        if (form.isValid()) {
                            form.submit({
                                method: 'POST',
                                url : '/api/rastercalcs/' + uuid ,
                                params: {
                                    'layer': layer.data.N.title,
                                    'title': layer.data.N.name,
                                    'camera': layer.data.N.camara,
                                    'type': layer.data.N.type
                                }
                                ,
                                headers: {
                                    Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                                },
                                waitMsg:'Creando índice espere por favor...',
                                success: function(fp, o) {
                                    Ext.getCmp('formIdIndex').reset();
                                    Ext.Msg.alert('Detalle', 'Índice creado correctamente.');                                                   
                                    Ext.getCmp('windowIndexId').close();
                                    initLayers();
                                },
                                failure: function(fp, o) {                            
                                    Ext.Msg.alert('Error', 'Error al crear el índice.');
                                }
                            });
                        }
                    }
                }],        
                }
                    
                
        }).show();
    }
}

function windowModel(layer){
    var model = ["ALTURA","CLOROFILA"];
    var parentGroup = Ext.getCmp('treePanelId').getStore().getNodeById(layer.data.parentId);    
    var modelos = parentGroup.data.N.modelos;
    var result = model.filter(el => !modelos.includes(el));
    if (result.length === 0){
        Ext.Msg.alert(layer.data.text,
            'No existen modelos disponibles'
            , Ext.emptyFn);
    }
    else if (layer.data.N.type === 'RGB'){
        Ext.Msg.alert(layer.data.text,
            'El modelo no aplica a imágenes RGB'
            , Ext.emptyFn);
    }
    else {
        var modelstore = []
        for(let i of result){
            modelstore.push({'id':i, 'name':i})
        }
        var dataModel = Ext.create('Ext.data.Store', {
            storeId: 'dataModel',
            fields: ['id', 'name'],
            data : modelstore
        });

        var indice = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Seleccionar modelo Deeplearning',
            name: 'model',
            id: 'model',
            msgTarget: 'under' ,
            store: dataModel,
            width: '100%',
            queryMode: 'local',
            allowBlank : false,
            blankText: 'Seleccione el modelo deeplearning',
            forceSelection: true,
            displayField: 'name',
            valueField: 'name',
            value:'1',
            labelAlign: 'top'
        });

        Ext.create('Ext.window.Window', {
            id: 'windowModelId',
            title: layer.data.text,
            height: 180,
            width: 300,
            layout: 'vbox',
            modal: true,
            resizable   : false,
            items:
                {
                    xtype: 'form',
                    id: 'formIdModel',
                    width: '100%', 
                    height: '100%',
                    bodyPadding: 10,    
                    border:0,
                    defaultType: 'textfield',
                    items: [                    
                        indice,            
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
                    text: 'Obtener Modelo',
                    formBind: true, //only enabled once the form is valid
                    disabled: true,
                    iconCls: 'icon-save',
                    cls:'btnform',
                    handler: function() {
                        var form = this.up('form').getForm();                
                        if (form.isValid()) {
                            form.submit({
                                method: 'POST',
                                url : '/api/rastermodel/' + uuid ,
                                params: {
                                    'layer': layer.data.N.title,
                                    'title': layer.data.N.name,
                                    'camera': layer.data.N.camara,
                                    'type': layer.data.N.type
                                },
                                headers: {
                                    Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                                },
                                waitMsg:'Creando modelo espere por favor...',
                                success: function(fp, o) {
                                    Ext.getCmp('formIdModel').reset();
                                    Ext.Msg.alert('Detalle', 'Modelo creado correctamente.');                                                   
                                    Ext.getCmp('windowModelId').close();
                                    initLayers();
                                },
                                failure: function(fp, o) {
                                    Ext.Msg.alert('Error', 'Error al crear el modelo.');
                                }
                            });
                        }
                    }
                }],        
                
            }      
                
        }).show();
    }
}

function windowDownloadVector(layer){
    Ext.create('Ext.window.Window', {
        title: layer.data.text,
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
                    {
                        padding:5,
                        xtype      : 'fieldcontainer',
                        id: 'idgroupformat',
                        fieldLabel : 'Formato',
                        labelAlign: 'top',
                        defaultType: 'radiofield',                        
                        layout: 'hbox',
                        items: [
                            {
                                padding: 5,
                                boxLabel  : 'kml',
                                checked: true,
                                name      : 'format',
                                inputValue: 'kml',
                                id        : 'radio1'
                            }, {
                                padding: 5,
                                boxLabel  : 'shape-zip',
                                name      : 'format',
                                inputValue: 'sape-zip',
                                id        : 'radio2'
                            }, {
                                padding: 5,
                                boxLabel  : 'csv',
                                name      : 'format',
                                inputValue: 'csv',
                                id        : 'radio3'
                            }
                        ]
                    },
                    {
                        margin: '8%',      
                        
                        xtype:'button',
                        width:'95%',
                        buttonAlign: 'center',
                        text:'Descargar',
                        handler: function(){ 
                            var formartDW = '';
                            if(Ext.getCmp('radio1').getValue())formartDW='kml';
                            if(Ext.getCmp('radio2').getValue())formartDW='shape-zip';
                            if(Ext.getCmp('radio3').getValue())formartDW='csv';                            
                            window.location = window.location.protocol + "//" + window.location.host + '/geoserver/geoserver/project_'+uuid+'/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=project_'+uuid+':'+layer.data.N.title+'&maxfeatures=50&outputformat='+formartDW;
                            this.up('window').close();
                        }
                    }
                ],
               
    }}).show();
}

function windowDownloadImage(layer){
    fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid +"/"+ layer.data.N.id+"/bbox",
        {headers: noCacheHeaders,})
        .then(response => response.json())
        .then(data => {
            Ext.create('Ext.window.Window', {
                title: layer.data.text,
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
                            {
                                padding:5,
                                xtype      : 'fieldcontainer',
                                id: 'idgroupformat',
                                fieldLabel : 'Formato',
                                labelAlign: 'top',
                                defaultType: 'radiofield',                        
                                layout: 'hbox',
                                items: [
                                    {
                                        padding: 5,
                                        boxLabel  : 'jpeg',
                                        checked: true,
                                        name      : 'format',
                                        inputValue: 'jpeg',
                                        id        : 'radio1'
                                    }, {
                                        padding: 5,
                                        boxLabel  : 'png',
                                        name      : 'format',
                                        inputValue: 'png',
                                        id        : 'radio2'
                                    }, {
                                        padding: 5,
                                        boxLabel  : 'tiff',
                                        name      : 'format',
                                        inputValue: 'tiff',
                                        id        : 'radio3'
                                    }
                                ]
                            },
                            {
                                margin: '8%',      
                                xtype:'button',
                                width:'95%',
                                buttonAlign: 'center',
                                text:'Descargar',
                                handler: function(){ 
                                    var formartDW = '';
                                    if(Ext.getCmp('radio1').getValue())formartDW='jpeg';
                                    if(Ext.getCmp('radio2').getValue())formartDW='png';
                                    if(Ext.getCmp('radio3').getValue())formartDW='tiff';                            
                                    let url = window.location.protocol + "//" + window.location.host + '/geoserver/geoserver/project_'+uuid+'/wms?service=WMS&version=1.1.0&request=GetMap&layers=project_'+uuid+':'+layer.data.N.title+'&styles='+layer.data.N.stylelayer+'&bbox='+data.bbox.minx +','+ data.bbox.miny+','+data.bbox.maxx +','+data.bbox.maxy+'&width='+data.size.split(' ')[0]+'&height='+data.size.split(' ')[1]+'&srs='+data.srs+'&format=image%2F'+formartDW;
                                    window.open(url, '_blank');
                                    this.up('window').close();
                                }
                            }
                        ],
            }}).show();

        });
    
}

function portadaImage(layer){
    fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid +"/"+ layer.data.N.id+"/bbox",
        {headers: noCacheHeaders,})
        .then(response => response.json())
        .then(data => {
            var heightSize = 0
            var widthSize = 0
            var styleLayer = ''
            if(layer.data.N.type == "SHAPEFILE" || layer.data.N.type == "KML"){
                heightSize = 150;
                widthSize = 280;
            }
            else{
                heightSize = data.size.split(' ')[1];
                widthSize = data.size.split(' ')[0];
                if (heightSize > 1000 || widthSize > 1000){
                    heightSize = Math.trunc(heightSize /10);
                    widthSize = Math.trunc(widthSize /10);
                }
                styleLayer = layer.data.N.stylelayer;
            }
            let url = window.location.protocol + "//" + window.location.host + '/geoserver/geoserver/project_'+uuid+'/wms?service=WMS&version=1.1.0&request=GetMap&layers=project_'+uuid+':'+layer.data.N.title+'&styles='+styleLayer+'&bbox='+data.bbox.minx +','+ data.bbox.miny+','+data.bbox.maxx +','+data.bbox.maxy+'&width='+widthSize+'&height='+heightSize+'&srs='+data.srs+'&format=image%2Fpng';
            
            Ext.Msg.show({
                title:layer.data.text,
                message: 'Desea convertir '+layer.data.text+' en portada del proyecto?',
                buttonText: {
                    yes: 'Si',
                    no: 'No'
                },
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        fetch(window.location.protocol + "//" + window.location.host + "/api/wallpaper/" + uuid, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({url: url })
                        }).then(function (response) {
                            if (response.status === 200) {
                                window.location.reload(true); // Reload page
                            } else if (response.status === 402) {
                                throw "Su almacenamiento está lleno, no puede crear nuevos índices";
                            } else throw response.text();
                        }).catch((msg) => alert(msg));                           
                    } else {
                    } 
                }
            });           


        });
}

function createconfigPanel(){
    var badge = '<span class="badge btn-success">PROPIETARIO</span>';
    if (isDemo){
        badge = '<span class="badge btn-warning">DEMO</span>';
    }
    configPanel = new Ext.create('Ext.panel.Panel', {       
        width:'100%',
        autoScroll: true,
        border:0,
        layout: 'vbox',        
        bodyStyle: 'padding:5px',        
        autoScroll: true,
        padding:10,
        items:[
            {
                html:badge
            },
            {
                html:'<h3>'+project_name+'</h2>'
            },
            {
                html:'<img src="'+project_wallpaper+'" style="object-fit:scale-down; object-position: center; width:280px; height:150px; "/>'
            },
            {
                html:'<h5>Descripción</h5><p>'+project_notes+'</p>'
            }
        ]

    });
}

function createViewPort(){    
    createaddPanel();
    createconfigPanel();
    createhelpPanel();
    createTree();    
    initLayers();             

    Ext.create('Ext.Viewport', {                
        id: 'mainWin',
        layout: 'border',
        items: [
            mapPanel,       
            {                   
                xtype: 'panel',
                id:'viewpanel',
                region: 'west',
                autoScroll: true,
                border:0,
                title: project_name,
                titleAlign: 'center',
                width: 310,                
                collapsible: true,
                cls:'myCls',
                height: '100%',
                layout: 'fit',
                header: {                    
                    titlePosition: 1,    
                    height: 50,
                    items: [
                        {
                            iconCls:'fa-up-right-from-square',
                            cls: 'fa-solid',
                            tooltip: 'Cerrar',
                            handler: function() {
                                Ext.Msg.show({
                                    title:'Salir',
                                    message: 'Desea salir del visualizador?',
                                    buttonText: {
                                        yes: 'Si',
                                        no: 'No'
                                    },
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.Msg.QUESTION,
                                    fn: function(btn) {
                                        if (btn === 'yes') {
                                            history.back()
                                        } else {
                                        } 
                                    }
                                });                    
                            }
                        },
                    ]
                },
                collapsible: true,                                        
                split: true,
                layout:'fit',
                items: [{
                    xtype: 'tabpanel',
                    cls:'myCls',
                    id: 'tabPanel',   
                    autoScroll: true,
                    layout : 'fit',
                    plain: true,
                    border: false,
                    region: 'center',
                    height:'100%',
                    tabBar: {
                            defaults: {
                                flex: 1, // if you want them to stretch all the way
                            },
                        },
                    items: [{
                            tooltip:'Capas',
                            layout : 'fit',
                            iconCls: "fa-solid fa-layer-group btn-white-back",
                            iconAlign: 'top',
                            items: [treePanel]
                        }, 
                        {
                            layout : 'fit',
                            tooltip: 'Agregar',
                            hidden: isDemo,
                            iconCls: 'fa-solid fa-file-circle-plus btn-white-back',                                                  
                            iconAlign: 'top',
                            height:'100%',
                            items: [addPanel]
                        },
                        {
                            layout : 'fit',
                            tooltip: 'Proyecto',
                            iconCls: 'fa-solid fa-briefcase',                                                  
                            iconAlign: 'top',
                            items: [configPanel]
                        }
                        ,
                        {
                            layout : 'fit',
                            tooltip: 'Ayuda',
                            iconCls: 'fa-solid fa-circle-question btn-white-back',                                                  
                            iconAlign: 'top',
                            height:'100%',
                            items: [helpPanel]
                        }
                    ]
                }],

                
            },
        ]
    });
   
}

function deleteItem(layer, pk){   
    Ext.Msg.show({
        title:'Eliminar',
        message: 'Desea eliminar la capa '+layer+'?',
        buttonText: {
            yes: 'Si',
            no: 'No'
        },
        buttons: Ext.Msg.YESNO,
        fn: function(btn) {
            if (btn === 'yes') {
                fetch(window.location.protocol + "//" + window.location.host + "/api/artifacts/"+pk, {
                    method: "DELETE",
                    headers: {
                        Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                    },
                }).then(function (response) {
                    if (response.status === 204) {
                        Ext.Msg.alert('Detalle', 'capa eliminada.');
                        initLayers();
                    } else throw response.text();
                }).catch((msg) => Ext.Msg.alert('Error', 'Error al eliminar la capa.'));
            } else {
            } 
        }
    });                    
}

function initLayers() {    
    let layers = [];    
    olMap.removeLayer(layersGroup);
    layersGroup = [];
    fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid + "/layers",
        {headers: noCacheHeaders})
        .then(response => response.json())
        .then(value => {                           
            for (let lyr of value.layers){                
                fetch(window.location.protocol + "//" + window.location.host + "/mapper/"+lyr.pk+"/artifacts",
                    {headers: noCacheHeaders})
                    .then(respons => respons.json())
                    .then(data => {                   
                        let layerfiles=[];   
                        let indices=[];     
                        let modelos=[];   
                        for (let art of data.artifacts) {                                                           
                            if (art.type === 'INDEX'){
                                let valor = art.name.split('-').slice(-1)[0];
                                indices.push(valor)
                            }
                            if (art.type === 'MODEL'){
                                let valor = art.name.split('-').slice(-1)[0];
                                modelos.push(valor)
                            }
                            if (lyr.type === "IMAGE"){
                                layerfiles.push(new ol.layer.Image({
                                    id: art.pk,
                                    cls: 'layer-item',
                                    title: art.name,
                                    name: art.title,
                                    date: lyr.date,
                                    camara: art.camera,
                                    stylelayer: art.style,
                                    legend: art.legend,
                                    type: art.type,
                                    source: new ol.source.ImageWMS({
                                        url: window.location.protocol + "//" + window.location.host + art.source,
                                        params: {
                                            "LAYERS": art.layer,
                                            "STYLES":art.style,
                                        }

                                    })                            
                                }));
                            }
                            else if(lyr.type === "VECTOR"){
                                layerfiles.push(new ol.layer.Vector({
                                    id: art.pk,
                                    title: art.name,
                                    name: art.title,
                                    date: lyr.date,
                                    camara: art.camera,
                                    stylelayer: art.style,
                                    type: art.type,
                                    legend: art.legend,
                                    source: new ol.source.Vector({
                                        format: new ol.format.GeoJSON(),
                                        url: window.location.protocol + "//" + window.location.host + art.source+ art.layer                                            
                                    }),                                    
                                   
                                }));
                            }                            
                        }                        
                        let layerGroup = new ol.layer.Group({
                            id: lyr.pk,
                            name: lyr.title,                            
                            title: lyr.name,
                            date: lyr.date,
                            type: lyr.type,
                            indices: indices,
                            modelos: modelos,
                            layers: layerfiles,
                        });                        
                        layers.push(layerGroup); 
                    }).finally(() => { 
                        layersGroup = new ol.layer.Group({                
                            layers: layers
                        });
                        olMap.addLayer(layersGroup);
                        var treeStore;
                        if(layers.length > 0){                        
                            let layerg = layersGroup.getLayers().getArray().slice(-1); 
                            let namelayer = layerg[0].getLayers().getArray()[0].get('id');
                            fitMap(namelayer);                            
                            treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                                layerGroup: layersGroup,
                                root: {
                                    expanded: true,
                                    text: project_name,
                                },
                                
                            });
                        }else{
                        
                            treeStore = Ext.create('GeoExt.data.store.LayersTree', {                               
                                root: {
                                    expanded: true,
                                    text: project_name,
                                },
                                
                            });
                        }                        
                        Ext.getCmp('treePanelId').setStore(treeStore);                                               
                    });
            }
            }            
        ).finally(() => { 
            if(layers.length == 0){
                var emptyStore =  Ext.create('Ext.data.TreeStore',{
                    root: {
                        text: project_name
                    }
                })
                Ext.getCmp('treePanelId').setStore(emptyStore);
            }                        
        });
}

function fitMap(pk) {
    fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid +"/"+ pk+"/bbox",
        {headers: noCacheHeaders,})
        .then(response => response.json())
        .then(data => {
            const minCoords = ol.proj.transform([data.bbox.minx, data.bbox.miny], data.srs, "EPSG:3857");
            const maxCoords = ol.proj.transform([data.bbox.maxx, data.bbox.maxy], data.srs, "EPSG:3857");
            olMap.getView().fit(minCoords.concat(maxCoords), olMap.getSize());
            olMap.getView().fit(minCoords.concat(maxCoords), olMap.getSize());
        });
}

