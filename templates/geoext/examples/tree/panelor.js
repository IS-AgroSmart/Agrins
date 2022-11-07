Ext.require([
    'GeoExt.component.Map',
    'GeoExt.data.store.LayersTree'
]);

Ext.create('Ext.container.Viewport', {
    layout: 'border',
    renderTo: Ext.getBody(),
    items: [{
        region:'north',
        height:120,
        xtype: 'container',
        layout: {
            align: 'stretch',
            type: 'hbox'
        },
		html: '<h1>Kenya Weather Stations</h1><h2>Enhancing weather forecast and analysis in the region</h2>',
        style:"background-image:url(/f_head.png);font-size: 18px;text-align:center;color:#ffffff; !important"
    }, {
        region: 'west',
        collapsible: true,
        xtype: 'tabpanel', // TabPanel itself has no title
        activeTab: 0,
        title: 'Capas',
        width: 300,
        items: {
            title: 'Shapefilegdadfasdfasdfasdfasdfa',
        },
        // could use a TreePanel or AccordionLayout for navigational items
    }, {
        region: 'south',
        title: 'South Panel',
        collapsible:true,
		collapsed:false,
        html: 'Information goes here',
        split: true,
        height: 100,
        minHeight: 100
    }, {
        region: 'east',
        title: 'East Panel',
        collapsible: true,
        collapsed:false,
        split: true,
        width: 150
    }, {
        region: 'center',
        xtype: 'tabpanel', // TabPanel itself has no title
        activeTab: 0,      // First tab active by default
        items: {
            title: 'Default Tab',
            html: 'The first tab\'s content. Others may be added dynamically'
        }
    }]
});
