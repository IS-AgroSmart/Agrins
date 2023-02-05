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
let mapComponent, mapPanel, selectClick, olMap, popup, basemapsGroup, layersGroup;;
let mainPanel, startPanel, treePanel, addPanel, indexPanel, modelPanel, helpPanel, configPanel;
let artifactLayer = [];
let anotationLayer = new ol.layer.Group({name:'Grupo anotaciones'});
let noCacheHeaders = new Headers(); // HACK: Force disable cache, otherwise timing problem when going back to screen
var ctrlSwiper; //LayerSwiper control compare layers tool
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
 
            mapPanel = Ext.create('Ext.panel.Panel', {
                region: 'center',
                border: false,
                layout: 'fit',
                items: [mapComponent],
               
            });            

            var elem = document. getElementById("spiner"); 
            elem. parentNode. removeChild(elem);

            mainPanel = Ext.create('Ext.panel.Panel', {
                id: 'mainPanelId',
                border: 0,
            });            
            createViewPort();
            
        },
        name: 'BasicTree'
    });
}

function indexWin(id, title, width, height){
    var url = top.window.location.href= "/#/projects/" +uuid + "/upload/geotiff";                         
    Ext.widget('container', {           
        items: [
            {
                xtype: 'box',
                autoEl: {
                    tag: 'iframe',
                    src: url,
                    width: 640,
                    height: 480
                }
            }
        ]        
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

function createindexPanel(){   
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
    var capa = Ext.create('Ext.form.ComboBox', {
        fieldLabel: 'Seleccionar capa',
        name: 'layer',
        id: 'layer',
        store: dataLayers,
        width: '100%',
        msgTarget: 'under' ,
        queryMode: 'local',
        allowBlank : false,
        blankText: 'Seleccione la capa',
        forceSelection: true,
        displayField: 'title',
        valueField: 'name',
        labelAlign: 'top',
        
        
        //value:'1'
        //renderTo: Ext.getBody()
    });
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
    var formSelectIndex = Ext.create('Ext.form.Panel', {                
        id: 'formIdIndex',
        width: '100%', 
        height: '100%',
        bodyPadding: 10,    
        border:0,
        defaultType: 'textfield',
        items: [
            capa,
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
                console.log('camara capa: '+dataLayers.findRecord('title', Ext.getCmp('layer').getRawValue()).get('camera'));  
                console.log('tipo capa: '+dataLayers.findRecord('title', Ext.getCmp('layer').getRawValue()).get('type'));
                if (form.isValid()) {
                    form.submit({
                        method: 'POST',
                        url : '/api/rastercalcs/' + uuid ,
                        params: {
                            'title': Ext.getCmp('layer').getRawValue(),
                            'camera': dataLayers.findRecord('title', Ext.getCmp('layer').getRawValue()).get('camera'),
                            'type': dataLayers.findRecord('title', Ext.getCmp('layer').getRawValue()).get('type')
                        }
                        ,
                        headers: {
                            Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                        },
                        waitMsg:'Creando índice espere por favor...',
                        success: function(fp, o) {
                            Ext.getCmp('formIdIndex').reset();
                            Ext.Msg.alert('Detalle', 'Índice creado correctamente.');                                                   
                        },
                        failure: function(fp, o) {
                            
                            Ext.Msg.alert('Error', 'Error al crear el índice.');
                        }
                    });
                }
                
            }
        }],        
    });

    indexPanel = new Ext.create('Ext.panel.Panel', {                
        width: '100%',
        autoScroll: true,
        height: '100%',         
        border:0,
        
        items:[            
            {
                padding: 5,                    
                border:0,
                html: '<h6><center>Crear índice de vegetación</center></h6'+
                        '<img src="https://sp.depositphotos.com/173808586/stock-photo-panoramic-view-of-green-field.html"/>'
            },
            formSelectIndex,
            
        ],
        
    });
}

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
                            { text: 'Modelo', iconCls:'fa-solid fa-kaaba', handler: function() {console.log("Delete");} },
                            { text: 'Índice', iconCls:'fa-solid fa-images', handler: function() {console.log("Delete");} }
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
                    if(record.data.leaf){
                        ctrlSwiper.addLayer(record);                        
                        fitMap(record.data.text);                        
                    }
                    
                }
            }               
        }               
    });
}

function windowDownload(layer, path){
    console.log('uid: '+uuid),
    console.log('layer: '+path)

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

function createhelpPanel(){
    var navigate = function(panel, direction){
        var layout = panel.getLayout();
        layout[direction]();
        Ext.getCmp('move-prev').setDisabled(!layout.getPrev());
        Ext.getCmp('move-next').setDisabled(!layout.getNext());
    };    
    helpPanel = new Ext.create('Ext.panel.Panel', {       
        width:'100%',
        autoScroll: true,
        border:0,
        //height: '100%',        
        layout: 'card',
        bodyStyle: 'padding:5px',        
        autoScroll: true,
        tbar: [
            {
                id: 'move-prev',
                xtype:'button',
                //text: 'Anterior',
                iconCls:'fa-regular fa-circle-left',
                handler: function(btn) {
                    navigate(btn.up("panel"), "prev");
                },
                disabled: true
            },
            '->', // greedy spacer so that the buttons are aligned to each side
            {
                id: 'move-next',
                xtype:'button',
                //text: 'Siguiente',
                iconCls:'fa-regular fa-circle-right',
                handler: function(btn) {
                    navigate(btn.up("panel"), "next");
                }
            }
        ],
        // the panels (or "cards") within the layout
        items: [{
            id: 'card-0',
            border:0,
            padding:10,
            autoScroll: true,
            html: '<h2> Geoportal Agrins</h2>'+
                    '<p> A continuación encontrará una guía para el uso de la plataforma.</p>'+
                    '<ol><li>Agregar capas</li><li>Obtener índices</li><li>Modelo</li>'+
                    '<li>Mediciones</li><li>Áreas</li><li>Puntos</li><li>Mapa bases</li></ol'+
                    '<ol><li>Eliminar capa</li><li>Detalle de capa</li><li>Salir del visualizador</li>'
                    
        },{
            id: 'card-1',
            border:0,
            padding:10,
            autoScroll: true,
            html:'<h5> Agregar Capa</h5>'+
                    '<p> En la plataforma puede agregar archivos (multiespectrales, RGB) .tiff deberá especificad el modelo de la cámara para poder obtener los índices así como ejeccutar el modelo.</p>'+
                    '<p> Además podrá agregar archivos kml y shapefile </p>'+
                '<h5> Obtener índices</h5>'+
                    '<p> Seleccione el índice requerido de la lista disponible (GCI, GRRI, MGRVI, NDRE, NDVI, NGRDI)</p>'+
                '<h5> Modelo</h5>'+
                    '<p> En el geoportal podrá obtener dos modelos uno para determinar la altura y otro para clorofila.</p>'
                    
        },{
            id: 'card-2',
            border:0,
            padding:10,
            autoScroll: true,
            html: '<h3> Continuar..</h3>'+            
            '<p> Continuar agregando </p>'
        }],
    });    
}

function createViewPort(){    
    createaddPanel();
    createconfigPanel();
    createhelpPanel();
    createTree();    
    initLayers();             
    
    /*let btagregar = Ext.create('Ext.Button', {        
            //text: 'Agregar',
            iconCls: 'fa-circle-plus',
            cls: 'fa-solid ',
            tooltip: 'Agregar capa',
            handler: function(){
                createaddPanel();
                var p = Ext.getCmp('viewportPanelId');
                p.removeAll();
                p.updateLayout();
                p.add(addPanel);
            }
    });*/

    let btreload = Ext.create('Ext.Button',{
            xtype: 'button',
            iconCls: ' fa-rotate',   
            cls: 'fa-solid',
            tooltip: 'Recargar',
            handler: function(){            
                Ext.getCmp('btdeletelayer').setVisible(false);
                Ext.getCmp('btinfolayer').setVisible(false);
                initLayers();
            }
    })

    let btindice = Ext.create('Ext.Button', {        
        //text: 'Índices',
        iconCls: 'fa-images',
        cls: 'fa-solid ',
        tooltip: 'Índices de vegetación',        
        handler: function(){ 
            createindexPanel();
            var p = Ext.getCmp('viewportPanelId');
            p.removeAll();
            p.updateLayout();
            p.add(indexPanel);

        },
    });

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

    /*let btcapas  = Ext.create('Ext.Button', {
            //text: 'Capas',
            iconCls: 'fa-layer-group',
            cls: 'fa-solid',
            tooltip: 'Capas',
            //width: '90px',
            handler: function() {
                var p = Ext.getCmp('viewportPanelId');
                p.removeAll();
                //mainPanel.updateLayout();
                initLayers();              
                createTree();
                p.add(treePanel);
            },
    });*/
    
    tabMenu = Ext.create('Ext.toolbar.Toolbar', {   
        style: {
            backgroundColor: 'white',
        },
        layout: {
            pack:'middle',
            align:'middle'
        },         
        items: [
            
            
            btindice,
            btModelo,
            
    ],
        
    });     
    
    //var p = Ext.getCmp('mainPanelId');
    //p.add(treePanel);

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

function createmodelPanel(){
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
    var capa = Ext.create('Ext.form.ComboBox', {
        fieldLabel: 'Seleccionar capa',
        name: 'layerm',
        id: 'layerm',
        store: dataLayers,
        width: '100%',
        msgTarget: 'under' ,
        queryMode: 'local',
        allowBlank : false,
        blankText: 'Seleccione la capa',
        forceSelection: true,
        displayField: 'title',
        valueField: 'name',
        labelAlign: 'top',
    });
    var formSelectIndex = Ext.create('Ext.form.Panel', {                
        id: 'formIdModel',
        width: '100%', 
        height: '100%',
        bodyPadding: 10,    
        border:0,
        defaultType: 'textfield',
        items: [
            capa,
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
                console.log('camara capa: '+dataLayers.findRecord('title', Ext.getCmp('layerm').getRawValue()).get('camera'));  
                console.log('tipo capa: '+dataLayers.findRecord('title', Ext.getCmp('layerm').getRawValue()).get('type'));
                if (form.isValid()) {
                    form.submit({
                        method: 'POST',
                        url : '/api/rastermodel/' + uuid ,
                        params: {
                            'title': Ext.getCmp('layerm').getRawValue(),
                            'camera': dataLayers.findRecord('title', Ext.getCmp('layerm').getRawValue()).get('camera'),
                            'type': dataLayers.findRecord('title', Ext.getCmp('layerm').getRawValue()).get('type')
                        }
                        ,
                        headers: {
                            Authorization: "Token " + JSON.parse(localStorage.getItem('vrs_')).token,
                        },
                        waitMsg:'Creando modelo espere por favor...',
                        success: function(fp, o) {
                            Ext.getCmp('formIdModel').reset();
                            Ext.Msg.alert('Detalle', 'Modelo creado correctamente.');                                                   
                        },
                        failure: function(fp, o) {
                            
                            Ext.Msg.alert('Error', 'Error al crear el modelo.');
                        }
                    });
                }
                
            }
        }],        
    });

    modelPanel = new Ext.create('Ext.panel.Panel', {                
        width: '100%',
        autoScroll: true,
        height: '100%',         
        border:0,
        
        items:[            
            {
                padding: 5,                    
                border:0,
                html: '<h6><center>Obtener modelo</center></h6'
                        
            },
            formSelectIndex,
            
        ],
        
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
    var flag = true;
    dataLayers.removeAll();
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
                            if (!flag)
                                ctrlSwiper.addLayer(layerfiles[0],true); 
                            flag=false
                        }
                        
                        //console.log('capa geo '+art.layer)                     
                        let layerGroup = new ol.layer.Group({
                            name: lyr.title,
                            leaf: true, 
                            layers: layerfiles,
                        });
                        
                        layers.push(layerGroup); 
                        console.log("layers valores: " +layers.length);
                    })
                    .finally(() => { 

                        layersGroup = new ol.layer.Group({                
                            layers: layers
                        });
                        olMap.addLayer(layersGroup);
                
                        if(layers.length > 0){
                            let layerg = layersGroup.getLayers().getArray().slice(-1); 
                            let namelayer = layerg[0].getLayers().getArray()[0].get('name');
                            console.log('data: '+namelayer)
                            fitMap(namelayer);
                        };
                        var treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                            layerGroup: layersGroup,
                            root: {
                                expanded: true,
                                text: project_name,
                            },
                            
                        });
                        
                        //id:'treePanelId',
                        Ext.getCmp('treePanelId').setStore(treeStore);                       
                        
                        
                        console.log("layers: " +layers.length);                
            
                    })

            }
            }            
        )
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

function createSaveControl() {
    return _createControl(saveMeasurementsListener,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792" width="90%" height="90%">' +
        '<g transform="matrix(1,0,0,-1,129.08475,1270.2373)">' +
        '  <path fill="#000" d="m 384,0 h 768 V 384 H 384 V 0 z m 896,0 h 128 v 896 q 0,14 -10,38.5 -10,24.5 -20,34.5 l -281,281 q -10,10 -34,20 -24,10 -39,10 V 864 q 0,-40 -28,-68 -28,-28 -68,-28 H 352 q -40,0 -68,28 -28,28 -28,68 v 416 H 128 V 0 h 128 v 416 q 0,40 28,68 28,28 68,28 h 832 q 40,0 68,-28 28,-28 28,-68 V 0 z M 896,928 v 320 q 0,13 -9.5,22.5 -9.5,9.5 -22.5,9.5 H 672 q -13,0 -22.5,-9.5 Q 640,1261 640,1248 V 928 q 0,-13 9.5,-22.5 Q 659,896 672,896 h 192 q 13,0 22.5,9.5 9.5,9.5 9.5,22.5 z m 640,-32 V -32 q 0,-40 -28,-68 -28,-28 -68,-28 H 96 q -40,0 -68,28 -28,28 -28,68 v 1344 q 0,40 28,68 28,28 68,28 h 928 q 40,0 88,-20 48,-20 76,-48 l 280,-280 q 28,-28 48,-76 20,-48 20,-88 z"/>' +
        '</g></svg>', "save-meas", "Guardar mediciones");
}

function createClearControl() {
    return _createControl(clearMeasurementsListener,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<g>' +
        '  <path stroke="#000" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" fill="none" d="m6 4v24h11v-1h-10v-22h11v7h7v7h1v-8l-7-7h-1z"/>' +
        '  <path stroke="#000" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" fill="none" d="m18 20.707l3.293 3.293-3.293 3.293c.013.025.707.707.707.707l3.293-3.293 3.293 3.293.707-.707-3.293-3.293 3.293-3.293-.707-.707-3.293 3.293-3.293-3.293z"/>' +
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
            else{
                clearMeasurementsListener()
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
