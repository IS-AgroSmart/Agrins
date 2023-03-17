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
                        '<li><h6><i class="fa-solid fa-layer-group"></i> Capas</h6></li>'+
                        '<li><h6><i class="fa-solid fa-file-circle-plus"></i> Agregar Capas</h6></li>'+
                        '<li><h6><i class="fa-solid fa-briefcase"></i> Detalle del proyecto</h6></li>'+
                        '<li><h6><i class="fa-solid fa-images"></i> Obtener índices de vegetación</h6></li>'+
                        '<li><h6><i class="fa-solid fa-kaaba"></i> Modelo Deeplearning </h6></li>'+                    
                        '<li><h6><i class="fa-solid fa-map-location-dot"></i> Opciones de Mapa</h6></li>'+
                        '<li><h6><i class="fa-solid fa-folder-tree"></i> Opciones de capas</h6></li>'+
                        '<li><h6><i class="fa-solid fa-arrow-up-right-from-square"></i> Salir del visualizador</h6></li>'+
                    '</ol>'
                    
        },{
            id: 'card-1',
            border:0,
            padding:10,
            autoScroll: true,
            html:'<h6><i class="fa-solid fa-layer-group"></i> Capas</h6>'+
                    '<p> Al inicio del portal encontrará la estructura del proyecto y sus capas de manera jerárquica, para visualizar asegúrese de tener marcada la casilla respectiva.</p>'+                    
                    '<p> Los eventos del mouse sobre capas: selección con un click sobre la capa, click derecho opciones de capas </p>'+
                    '<p> Para visualizar la leyenda de la capa seleccione la capa y active la visualización </p>'+
                '<h6><i class="fa-solid fa-file-circle-plus"></i> Agregar Capa</h6>'+
                    '<p> En la plataforma puede agregar tres tipos de capas.</p>'+
                    '<ol>'+
                        '<li> Geotiff(Multiespectrales - RGB): campos (cámara, tipo de imagen)</li>'+
                        '<li> Shapefile: Capa:(.shp, .shx, .dbf, .prj)</li>'+
                        '<li> KML</li>'+                        
                    '</ol>'+
                    '<p> Debe considerar los formatos así como los campos requeridos para cada tipo de capa </p>'+
                '<h6><i class="fa-solid fa-briefcase"></i> Detalle del proyecto</h6>'+
                    '<p>En esta sección encontrará el nombre, descripción, portada y tipo de proyecto en el que se encuentra.</p>'+                    
                    
                '<h6> <i class="fa-solid fa-images"></i> Obtener índices de vegetación</h6>'+
                    '<p>Para obtener el índice requerido  debe realizar un click derecho sobre la capa principal. En la lista disponible de índices seleccione para multiespectrales:(GCI, GRRI, MGRVI, NDRE, NDVI, NGRDI) y para RGB: (GRRI, MGRVI,NGRDI)</p>'+
                '<h6><i class="fa-solid fa-kaaba"></i> Modelo Deeplearning</h6>'+
                    '<p> En el geoportal podrá obtener dos modelos uno para determinar la altura y otro para clorofila, se aplica a capas multiespectrales, debe seleccionar la capa principal y con click derecho seleccionar la opción modelo.</p>'
                    
        },{
            id: 'card-2',
            border:0,
            padding:10,
            autoScroll: true,
            html: '<h6><i class="fa-solid fa-map-location-dot"></i> Opciones de mapa</h6>'+
                        '<ol>'+
                            '<li><i class="fa-solid fa-magnifying-glass-plus"></i> Acercar Mapa</li>'+
                            '<li><i class="fa-solid fa-magnifying-glass-minus"></i> Alejar Mapa</li>'+
                            '<li><i class="fa-solid fa-location-arrow"></i> Norte</li>'+                            
                            '<li><i class="fa-solid fa-crop"></i> Medición: Dibujar polígonos, cálculo de área y metadata</li>'+                    
                            '<li><i class="fa-solid fa-arrows-left-right"></i> Medición: Distancia, cálculo de distancia y metadata</li>'+
                            '<li><i class="fa-solid fa-location-dot"></i> Medición: Punto de coordenadas y metadata</li>'+
                            '<li><i class="fa-solid fa-eraser"></i> Borrar mediciones: elimina todas las mediciones realizadas sobre el mapa que no se han guardado</li>'+
                            '<li><i class="fa-solid fa-cloud-arrow-up"></i> Guardar mediciones: Asigne un nombre a las mediciones realizadas para almacenar la capa</li>'+
                            '<li><i class="fa-solid fa-arrow-right-arrow-left"></i> Swiper: permite comparar dos capas active el control y seleccione la capa superior</li>'+
                            '<li><i class="fa-solid fa-magnifying-glass"></i> Buscar: escriba el lugar a buscar presione enter y seleccione de la lista el lugar indicado</li>'+
                            '<li><i class="fa-solid fa-diamond"></i> Mapa Base: Seleccione el mapa base(tres disponibles)</li>'+
                            '<li><i class="fa-solid fa-list"></i> Leyenda: seleccione y active la capa. (verificar el nombre de la capa en la leyenda no se exclusiva de la capa que muestra el mapa)</li>'+
                        '</ol>'+                    
                '<h6><i class="fa-solid fa-folder-tree"></i> Opciones de capas</h6>'+
                        '<ol>'+
                            '<li><i class="fa-solid fa-arrow-down-short-wide"></i> Expandir: Aplica solo a la carpeta del proyecto, expande todas las capas</li>'+
                            '<li><i class="fa-solid fa-arrow-up-short-wide"></i> Contraer: Aplica solo a la carpeta del proyecto, contrae todas las capas</li>'+
                            '<li><i class="fa-solid fa-rotate"></i> Recargar: actualiza las capas</li>'+                            
                            '<li><i class="fa-solid fa-file-arrow-down"></i> Descargar: Aplica para formatos ligeros Raster(tiff, jpeg, png) Vector(KML Shapefile, CSV)</li>'+                    
                            '<li><i class="fa-solid fa-trash-can"></i> Eliminar: Elimina la capa seleccionada (No recuperable)</li>'+
                            '<li><i class="fa-solid fa-circle-info"></i> Información: Detalles de la capa</li>'+
                            '<li><i class="fa-solid fa-kaaba"></i> Modelo: Obtener modelo</li>'+
                            '<li><i class="fa-solid fa-images"></i> Índice: Obtener índice</li>'+
                            '<li><i class="fa-solid fa-panorama"></i> Portada: Establece la capa como portada del proyecto (aplica: índice, modelo, raster)</li>'+
                        '</ol>'+                     
                '<h6><i class="fa-solid fa-arrow-up-right-from-square"></i> Salir del visualizador</h6>'+
                    '<p>Asegurece de guardar las mediones o verificar que los cambios realizados se muesren en el mapa</p>'
                
        }],
    });    
}
