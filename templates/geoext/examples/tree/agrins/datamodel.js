var dataCamera = Ext.create('Ext.data.Store', {
    storeId: 'dataCamera',
    fields: ['id', 'name'],
    data : [
        {"id":"REDEDGE", "name":"Micasense RedEdge-M"},
        {"id":"PARROT", "name":"Parrot Sequoia"},
        {"id":"RGB", "name":"RGB"},
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
        {"id":"RGB", "name":"RGB"},
    ]
});