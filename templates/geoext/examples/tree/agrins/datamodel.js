var dataCamera = Ext.create('Ext.data.Store', {
    storeId: 'dataCamera',
    fields: ['id', 'name'],
    data : [
        {"id":"REDEDGE", "name":"Micasense RedEdge-M"},
        {"id":"PARROT", "name":"Parrot Sequoia"},
        {"id":"RGB", "name":"RGB"},
    ]
});
var dataIndex = Ext.create('Ext.data.Store', {
    storeId: 'dataIndex',
    fields: ['id', 'index'],
    data : [
        {"id":"GCI", "name":"GCI"},
        {"id":"GRRI", "name":"GRRI"},
        {"id":"MGRVI", "name":"MGRVI"},
        {"id":"NDRE", "name":"NDRE"},
        {"id":"NDVI", "name":"NDVI"},
        {"id":"NGRDI", "name":"NGRDI"},        
    ]
});
var dataModel = Ext.create('Ext.data.Store', {
    storeId: 'dataModel',
    fields: ['id', 'name'],
    data : [
        {"id":"ALTURA", "name":"ALTURA"},
        {"id":"CLOROFILA", "name":"CLOROFILA"},                
    ]
});
var dataLayers = Ext.create('Ext.data.Store', {
    storeId: 'dataCamera',
    fields: ['pk','title', 'name', "type","camera","date"],    
});
var dataGroup = Ext.create('Ext.data.Store', {
    storeId: 'dataCamera',
    fields: ['pk','title', 'name', "date", 'type'],    
});
var dataTypeArtefact = Ext.create('Ext.data.Store', {
    storeId: 'dataTypeArtefact',
    fields: ['id', 'name'],
    data : [
        {"id":"MULTIESPECTRAL", "name":"Multiespectral"},
        {"id":"SHAPEFILE", "name":"Shapefile"},
        {"id":"INDEX", "name":"Index"},
        {"id":"RGB", "name":"RGB"},
        {"id":"KML", "name":"Kml"},
    ]
});
var dataTypeImage = Ext.create('Ext.data.Store', {
    storeId: 'dataTypeArtefact',
    fields: ['id', 'name'],
    data : [
        {"id":"MULTIESPECTRAL", "name":"Multiespectral"},        
        {"id":"RGB", "name":"Rgb"},
    ]
});