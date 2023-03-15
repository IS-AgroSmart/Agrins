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
            html: '<img src="agrins/logo.png" alt="HTML5 Icon" width="155" height="50">'+
                    '<h4> Geoportal</h4>'+
                    '<p> A continuación encontrará una guía para el uso de la plataforma.</p>'+
                    '<ol>'+
                        '<li><h5><i class="fa-solid fa-layer-group"></i> Capas</h5></li>'+
                        '<li><i class="fa-solid fa-file-circle-plus"></i> Agregar Capas</li>'+
                        '<li><i class="fa-solid fa-briefcase"></i> Detalle del proyecto</li>'+
                        '<li><i class="fa-solid fa-circle-question"></i> Ayuda</li>'+
                        '<li><i class="fa-solid fa-images"></i> Obtener índices de vegetación</li>'+
                        '<li><i class="fa-solid fa-kaaba"></i> Modelo Deeplearning </li>'+                    
                        '<li><i class="fa-solid fa-map-location-dot"></i> Mediciones</li>'+
                        '<li><i class="fa-solid fa-folder-tree"></i> Opciones de capas</li>'+
                        '<li><i class="fa-solid fa-arrow-up-right-from-square"></i> Salir del visualizador</li>'+
                    '</ol>'
                    
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
