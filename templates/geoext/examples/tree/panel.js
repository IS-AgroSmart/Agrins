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
        //renderTo: Ext.getBody()
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
        //value:'1'
        //renderTo: Ext.getBody()
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
        items: [{
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
            //buttonOnly: true,
            fieldLabel: 'Shapefile (dbf,shp, shx, prj)',                                   
            labelAlign: 'top',            
            allowBlank: false,
            blankText: 'Seleccione el conjunto de archivos shapefile',
            anchor: '100%',        
            buttonText: 'Abrir',
            //regex     : (/.(cpg|dbf|prj|shp|shx)$/i),
            //regexText : 'Solo se acepta archivos shapefile',
            msgTarget : 'under',  
            buttonConfig:{
                iconCls:'icon-folder-open',
                cls: 'btnform',
            },
            /*validator: function(value){
                if (value == '')
                    return 'Seleccione el conjunto de archivos shapefile';
                console.log('ingeso validator: '+ value);
                return 'error en el archivo';
            },*/
            listeners: {
                change: function(fld, value) {
                    //var newValue = value.replace(/C:\\fakepath\\/g, '');
                    //fld.setRawValue(newValue);
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
                afterrender:function(cmp){
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
            //height: 20, // set the height
            //padding: 6 // set the padding
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
        //padding:'5 5 5 5',
        /*tbar:[
            {xtype: 'tbtext', html: 'Agregar Capa'},'->',
        ],*/
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


    /* filtro

                artifactLayer.push(art.title);   
                console.log("Nombre: "+ art.name);
                console.log("Tipo: "+art.type);
                console.log("Fecha: "+art.date);
                console.log("Fecha: "+art.camera);
                console.log("Camera MArca: "+ dataCamera.findRecord('id', art.camera).get('name'));
                console.log("Cuenta filtro antes: "+dataCamera.getCount());
                dataCamera.filter('id', 'PARROT');
                console.log("Cuenta filtro despues: "+dataCamera.getCount());
                console.log("filtro: "+ dataCamera.data.getAt(0).get('name'));
                const d = new Date(art.date);
                var i = simpleCombo.getValue();-------------

                var stateId = 1; // your value
                cityStore.clearFilter(true);
                cityStore.filter('StateId', stateId);
                --------
                console.log("fecha: "+d);
    */
    
function createTree(){    
    tablbar  = Ext.create('Ext.toolbar.Toolbar', {   
        border: false,    
        //cls: 'tbar-menu',          
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
        //padding:6,
        height:'100%',
        /*tbar: [
            tablbar,
        ],*/
        style: {
            backgroundColor: 'white',
        },                
        listeners: {
            render: function(){
                Ext.getBody().on("contextmenu", Ext.emptyFn, null, {preventDefault: true});
            },
            itemcontextmenu: function(tree, record, item, index, e, eOpts ) {
                console.log(item)
                console.log(record.data.text)
                console.log(record.data)
                console.log(index)                
                
                var m_item = [];
                if(record.data.leaf){                    
                    var lcamera= dataLayers.findRecord('title', record.data.text).get('camera');
                    var ltype= dataLayers.findRecord('title', record.data.text).get('type');
                    var ldate =  new Date(dataLayers.findRecord('title', record.data.text).get('date'));                  
                    var lname= record.data.text;
                    if (ltype == 'MULTIESPECTRAL' || ltype == 'RGB'){
                        var pk = dataLayers.findRecord('title', record.data.text).get('pk');                                                                        
                        m_item = [
                            { text: 'Descargar', iconCls:'fa-solid fa-file-arrow-down',handler: function() {console.log("More details");} },                            
                            { text: 'Eliminar', iconCls:'fa-solid fa-trash-can', 
                                    handler: function() {deleteItem(record.data.text, 'delete_artifact', pk)} },  
                            { text: 'Información', iconCls:'fa-solid fa-circle-info', handler: function() {console.log("Delete");} },
                            { text: 'Modelo', iconCls:'fa-solid fa-kaaba', 
                                handler: function() {windowModel(record.data.text, dataLayers.findRecord('title', record.data.text).get('name'));} },
                            { text: 'Índice', iconCls:'fa-solid fa-images', 
                                handler: function() {windowIndex(record.data.text, dataLayers.findRecord('title', record.data.text).get('name'));} }
                        ]
                    }
                    else{
                        var pk = dataLayers.findRecord('title', record.data.text).get('pk');                                                                        
                        console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/rest/layers.xml");
                        console.log(window.location.protocol + "//" + window.location.host + '/geoserver/geoserver/project_cc00afb7-b59c-4b58-b421-cb4478a9688b/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=project_cc00afb7-b59c-4b58-b421-cb4478a9688b:Poligono3&maxfeatures=50&outputformat=kml');
                        if (ltype == 'INDEX' || ltype == 'MODEL'){
                            m_item = [
                                { text: 'Descargar', iconCls:'fa-solid fa-file-arrow-down',handler: function() {console.log("More details");} },
                                { text: 'Eliminar', iconCls:'fa-solid fa-trash-can', 
                                    handler: function() {deleteItem(record.data.text, 'delete_artifact', pk)} },  
                                { text: 'Información', iconCls:'fa-solid fa-circle-info', handler: function() {console.log("Delete");} },
                            ]
                        }
                        else{
                            m_item = [
                                { text: 'Descargar', iconCls:'fa-solid fa-file-arrow-down',
                                handler: function() { 
                                    windowDownload(dataLayers.findRecord('title', record.data.text).get('title'), dataLayers.findRecord('title', record.data.text).get('name'))}},
                                { text: 'Eliminar', iconCls:'fa-solid fa-trash-can', 
                                    handler: function() {deleteItem(record.data.text, 'delete_artifact', pk)} },  
                                { text: 'Información', iconCls:'fa-solid fa-circle-info', handler: function() {console.log("Delete");} },
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
                            if(dataGroup.findRecord('title', record.data.text).get('type') == 'IMAGE')
                                type = 'Imagen formato .tiff'
                            else
                                type = 'Vector'
                            Ext.Msg.alert(record.data.text,
                                'Grupo de capas: '+record.data.text+
                                '<br/>Capa principal: '+type+
                                '<br/>Creado:  '+new Date(dataGroup.findRecord('title', record.data.text).get('date')).toLocaleDateString('en-US')
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
                        console.log('datavalue: ', record.data.text);                     
                        fitMap(record.data.text);  
                        ctrlSwiper.removeLayers();        
                        if (isswipervisible)
                            ctrlSwiper.addLayer(record.data,true);                        
                        legend.getItems().clear()
                        var layerLegend = new ol.legend.Legend({ layer: record.data })
                        layerLegend.addItem(new ol.legend.Image({
                            title: record.data.text,
                            src: 'agrins/lndvi.png'
                        }))                            
                        legend.addItem(layerLegend)
                                                
                    }
                    else{
                        isLayerSelect = false;
                        //isswipervisible = false
                        ctrlSwiper.removeLayers();
                        //ctrlSwiper.set('position', -0.5);                
                        
                    }
                    
                }
            }               
        }               
    });
}

function windowIndex(layer, path){
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
        //renderTo: Ext.getBody()
    });

    Ext.create('Ext.window.Window', {
        id: 'windowIndexId',
        title: layer,
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
                    console.log('camara capa: '+dataLayers.findRecord('title', layer).get('camera'));  
                    console.log('tipo capa: '+dataLayers.findRecord('title', layer).get('type'));
                    if (form.isValid()) {
                        form.submit({
                            method: 'POST',
                            url : '/api/rastercalcs/' + uuid ,
                            params: {
                                'layer': path,
                                'title': layer,
                                'camera': dataLayers.findRecord('title', layer).get('camera'),
                                'type': dataLayers.findRecord('title', layer).get('type')
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

function windowModel(layer, path){
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
        //renderTo: Ext.getBody()
    });

    Ext.create('Ext.window.Window', {
        id: 'windowModelId',
        title: layer,
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
                    //console.log('camara capa: '+dataLayers.findRecord('title', Ext.getCmp('layerm').getRawValue()).get('camera'));  
                    //console.log('tipo capa: '+dataLayers.findRecord('title', Ext.getCmp('layerm').getRawValue()).get('type'));
                    if (form.isValid()) {
                        form.submit({
                            method: 'POST',
                            url : '/api/rastermodel/' + uuid ,
                            params: {
                                'layer': path,
                                'title': layer,
                                'camera': dataLayers.findRecord('title', layer).get('camera'),
                                'type': dataLayers.findRecord('title', layer).get('type')
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

function windowDownload(layer, path){
    Ext.create('Ext.window.Window', {
        title: layer,
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
                            window.location = window.location.protocol + "//" + window.location.host + '/geoserver/geoserver/project_'+uuid+'/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=project_'+uuid+':'+path+'&maxfeatures=50&outputformat='+formartDW;
                            this.up('window').close();
                        }
                    }
                ],
               
    }}).show();
}

function createconfigPanel(){
    configPanel = new Ext.create('Ext.panel.Panel', {       
        width:'100%',
        autoScroll: true,
        border:0,
        //height: '100%',        
        layout: 'vbox',        
        bodyStyle: 'padding:5px',        
        autoScroll: true,
        padding:10,
        items:[
            {
                html:'<h3>'+project_name+'</h2'
            },
            {
                html:'<p>'+project_notes+'</p'
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
    

    let btModelo  = Ext.create('Ext.Button', {
        //text: 'Modelo',
        iconCls: 'fa-kaaba',
        cls: 'fa-solid',
        tooltip: 'Modelos deep learning',
        handler: function(){
            createmodelPanel();
            var p = Ext.getCmp('viewportPanelId');
            p.removeAll();
            p.updateLayout();
            p.add(modelPanel);
        }
    });

    Ext.create('Ext.Viewport', {                
        id: 'mainWin',
        layout: 'border',
        items: [
            mapPanel,       
            {                   
                xtype: 'panel',
                //id: 'viewportPanelId',
                id:'viewpanel',
                region: 'west',
                autoScroll: true,
                border:0,
                title: project_name,
                titleAlign: 'center',
                width: 320,                
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
                                            top.window.location.href='/#/projects/'                            
                                        } else {
                                            console.log('Cancel pressed');
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
                                //height: 50, // set the height
                                //padding: 6 // set the padding
                            },
                            //dock: 'top'
                            //items:[{text:'datos'}]
                            
                        },
                    items: [{
                            //title:'Capas',
                            tooltip:'Capas',
                            layout : 'fit',
                            iconCls: "fa-solid fa-layer-group btn-white-back",
                            iconAlign: 'top',
                            items: [treePanel]
                        }, 
                        {
                            //title: 'Agregar',
                            layout : 'fit',
                            tooltip: 'Agregar',
                            iconCls: 'fa-solid fa-file-circle-plus btn-white-back',                                                  
                            iconAlign: 'top',
                            height:'100%',
                            items: [addPanel]
                        },
                        {
                            //title: 'Configuración',
                            layout : 'fit',
                            tooltip: 'Proyecto',
                            iconCls: 'fa-solid fa-briefcase',                                                  
                            iconAlign: 'top',
                            items: [configPanel]
                        }
                        ,
                        {
                            //title: 'Ayuda',
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

function deleteItem(layer, url, pk){   
    Ext.Msg.show({
        title:'Salir',
        message: 'Desea eliminar la capa '+layer+'?',
        buttonText: {
            yes: 'Si',
            no: 'No'
        },
        buttons: Ext.Msg.YESNO,
        //iconCls: "fa-solid fa-triangle-exclamation",
        fn: function(btn) {
            if (btn === 'yes') {
                fetch(window.location.protocol + "//" + window.location.host + "/api/"+url+"/" + pk, {
                    method: "DELETE",
                    headers: {
                        Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                    },
                    //waitMsg:'Eliminando capa, espere por favor...',
                }).then(function (response) {
                    if (response.status === 200) {
                        Ext.Msg.alert('Detalle', 'capa eliminada.');
                        initLayers();
                    } else throw response.text();
                }).catch((msg) => Ext.Msg.alert('Error', 'Error al eliminar la capa.'));
            } else {
                console.log('Cancel pressed');
            } 
        }
    });                    
}

function initLayers() {    
    let layers = [];    
    olMap.removeLayer(layersGroup);
    layersGroup = [];
    dataLayers.removeAll();
    dataGroup.removeAll();
    fetch(window.location.protocol + "//" + window.location.host + "/mapper/" + uuid + "/layers",
        {headers: noCacheHeaders})
        .then(response => response.json())
        .then(value => {                           
            for (let lyr of value.layers){
                var layerGrp = {
                    'pk':lyr.pk,
                    'title' : lyr.title, 
                    'name': lyr.name, 
                    "date":lyr.date,
                    "type":lyr.type,
                };            
                dataGroup.add(layerGrp)
                console.log('codigo capa: '+ lyr)
                fetch(window.location.protocol + "//" + window.location.host + "/mapper/"+lyr.pk+"/artifacts",
                    {headers: noCacheHeaders})
                    .then(respons => respons.json())
                    .then(data => {                   
                        let layerfiles=[];     
                        for (let art of data.artifacts) {                               
                            var layerart = {
                                'pk': art.pk,
                                'title' : art.title, 
                                'name': art.name, 
                                "type": art.type,
                                "camera": art.camera, 
                                "date":lyr.date,
                            };                
                            dataLayers.add(layerart);
                            if (art.type === "SHAPEFILE"){
                                //console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + art.layer + "&maxFeatures=50&outputFormat=application/json&");      
                                layerfiles.push(new ol.layer.Vector({
                                    name: art.title,
                                    source: new ol.source.Vector({
                                        format: new ol.format.GeoJSON(),
                                        //projection: 'EPSG:4326',
                                        //srs: 'EPSG:4326',
                                        url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + art.layer + "&maxFeatures=50&outputFormat=application/json&srsname=EPSG:3857&"
                                            //url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:poly&maxFeatures=50&outputFormat=application/json&"
                                    }),                                    
                                   
                            }));}
                            else if (art.type === "MULTIESPECTRAL"){
                                //console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0");
                                layerfiles.push(new ol.layer.Image({
                                    //style: falseColor,
                                    name: art.title,
                                    source: new ol.source.ImageWMS({
                                        url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",                                
                                        params: {"LAYERS": art.layer}

                                    })                            
                            }));}
                            else if (art.type === "RGB"){
                                console.log('prueba RGBw'+window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0");
                                layerfiles.push(new ol.layer.Image({
                                    name: art.title,
                                    source: new ol.source.ImageWMS({
                                        url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",                                
                                        params: {"LAYERS": art.layer}
                                    })                            
                            }));}
                            else if (art.type === "INDEX"){
                                console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0");
                                layerfiles.push(new ol.layer.Image({
                                    name: art.title,
                                    source: new ol.source.ImageWMS({
                                        url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?version=1.3.0",                                
                                        params: {"LAYERS": art.layer}

                                    }),                           
                            }));}
                            else if (art.type === "KML"){
                                //console.log(window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + art.layer + "&maxFeatures=50&outputFormat=application/json&");      
                                layerfiles.push(new ol.layer.Vector({
                                    name: art.title,
                                    source: new ol.source.Vector({
                                        format: new ol.format.GeoJSON({projection: 'EPSG:4326'}),                                
                                        url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + art.layer + "&maxFeatures=50&outputFormat=application/json&"
                                            //url: window.location.protocol + "//" + window.location.host + "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:poly&maxFeatures=50&outputFormat=application/json&"
                                    }),
                                    style: new ol.style.Style({
                                        fill: new ol.style.Fill({
                                            color:'orange'
                                        }),
                                        stroke: new ol.style.Stroke({
                                            color:'black'
                                        })
                                    })
                            }));}
                            
                        }
                        
                        //console.log('capa geo '+art.layer)                     
                        let layerGroup = new ol.layer.Group({
                            name: lyr.title,
                            leaf: true, 
                            layers: layerfiles,
                        });                        
                        layers.push(layerGroup); 
                        console.log("layers valores: " +layers.length);
                    }).finally(() => { 
                        
                        layersGroup = new ol.layer.Group({                
                            layers: layers
                        });
                        olMap.addLayer(layersGroup);
                        var treeStore;
                        if(layers.length > 0){
                        
                            let layerg = layersGroup.getLayers().getArray().slice(-1); 
                            let namelayer = layerg[0].getLayers().getArray()[0].get('name');
                            console.log('data: '+namelayer)
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
                                //layerGroup: [],
                                root: {
                                    expanded: true,
                                    text: project_name,
                                },
                                
                            });
                        }                        
                        Ext.getCmp('treePanelId').setStore(treeStore);                                               
                        console.log("layers: " +layers.length);                
            
                    });
            }
            }            
        ).finally(() => { 
            if(layers.length == 0){
                console.log('Sin capas disponibles');
                var emptyStore =  Ext.create('Ext.data.TreeStore',{
                    root: {
                        text: project_name
                    }
                })
                Ext.getCmp('treePanelId').setStore(emptyStore);
                console.log("layers: " +layers.length);                
            }                        
            

        });
}

function fitMap(name) {
    console.log('consulta: '+ name);
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

