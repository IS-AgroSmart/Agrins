<template>
    <div style="background-color: #f7f7f7; height:100%; padding-top: 90px;">
        <div class="border" style="background-color:white; margin-left: 5%; margin-right: 5%;  ">    
            <b-row style="padding-top: 1%; padding-left: 1%; padding-right: 1%;" class="text-center">            
                <b-col >
                    <b-card style="cursor: pointer; height: 80%;" class="border" >  
                        <b-card-text class="text-success"><b-icon-briefcase-fill style="width: 20px; height: 20px; " /> Proyectos</b-card-text>  
                        <b-card-text class="text-success">{{this.length}}</b-card-text>
                    </b-card>
                </b-col>
                <b-col >
                    <b-card style="cursor: pointer; color:  #f09903 ;height: 80%;" class="border">  
                        <b-card-text ><b-icon-layers-fill style="width: 20px; height: 20px; "/> Capas</b-card-text>  
                        <b-card-text >{{this.layers}}</b-card-text>
                    </b-card>
                </b-col>            
                <b-col >
                    <b-card style="cursor: pointer; height: 80%; color:#009d95;" class="border">  
                        <b-card-text ><b-icon-file-earmark-fill style="width: 20px; height: 20px; "/> Documentos</b-card-text>  
                        <b-card-text >{{this.resources}}</b-card-text>
                    </b-card>
                </b-col>            
            <b-col md>                       
                <div style="background-color: #f8f8f8; height: 80%;">
                    <h6 class="text-secondary" style="padding-top: 3%;"><b-icon-archive-fill style="width: 20px; height: 20px; "/> Almacenamiento</h6>
                    <DiskSpaceIndicatorVue></DiskSpaceIndicatorVue>
                </div>
            </b-col>
            </b-row>           
        </div>
        <div id="chart" class="border" style="margin-left: 5%;border-radius: 10px;background-color: white; margin-right: 5%; margin-top: 1%; ">
            <div class=" p-2 " style=" margin-left: 2%; margin-right: 2%;">                
                <apexcharts type="rangeBar" height="350" :options="chartOptions" :series="series"></apexcharts>
            </div>
        </div>        
    </div>
  </template>
  
<script>


import { BIconFileEarmarkFill } from 'bootstrap-vue';
import { BIconLayersFill} from 'bootstrap-vue';
import { BIconArchiveFill} from 'bootstrap-vue';
import { BIconBriefcaseFill} from 'bootstrap-vue';
import DiskSpaceIndicatorVue from './DiskSpaceIndicator.vue';
import VueApexCharts from "vue-apexcharts";
import axios from 'axios';


    export default {
        components: {        
        apexcharts: VueApexCharts,      
        BIconFileEarmarkFill,
        BIconLayersFill,
        BIconArchiveFill,
        BIconBriefcaseFill,
        DiskSpaceIndicatorVue,
    },
    data: function() {
        return {
            selectGroup: '2023',            
            projects:[],
            layers : 0,
            resources : 0,
            length:0,
            
            series: [],
            
            chartOptions: {
                title:{
                    text:'Proyectos'
                },
            chart: {
              height: 450,
              type: 'rangeBar'
            },
            plotOptions: {
              bar: {
                horizontal: true,
                barHeight: '80%'
              }
            },
            xaxis: {
              type: 'datetime'
            },
            stroke: {
              width: 10
            },
            fill: {
              type: 'solid',
              opacity: 0.6
            },
            legend: {
              position: 'top',
              horizontalAlign: 'left'
            }
          
          
          
        },
    
          

        }
    },
    computed: {                
    },
    methods:{
        updateProjects() {
            axios.get('api/projects', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(response => {
                    this.projects = response.data                    
                    var dat=[]
                    var layer = []
                    var doc = []
                    var del=[]
                    for (let p of this.projects){                        
                        if(!p.is_demo){
                            this.length += 1
                            var d = {
                                    x: p.name,
                                    y: [
                                        new Date(p.date_create).getTime(),
                                        new Date(p.date_create).getTime(),
                                    ]
                            }                            
                            dat.push(d) 
                            var e = {
                                    x: p.name,
                                    y: [
                                        new Date(p.date_update).getTime(),
                                        new Date(p.date_update).getTime()
                                    ]
                            }                            
                            del.push(e) 
                            for (let res of p.layers){
                                axios.get('api/layers/' + res , {
                                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                                })
                                .then(response => {
                                    var lay = response.data                                    
                                    this.layers += lay.artifacts.length                                    
                                    var o = {
                                        x: p.name,
                                        y: [
                                            new Date(lay.date).getTime(),
                                            new Date(lay.date).getTime()
                                        ]
                                    }
                                    layer.push(o)
                                })
                                .catch(error => this.error = error);
                            }
                            for (let res of p.resources){
                                this.resources += 1
                                axios.get('api/resources/' + res , {
                                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                                })
                                .then(response => {
                                    var resource = response.data
                                    
                                    var r = {
                                        x: p.name,
                                        y: [
                                            new Date(resource.date).getTime(),
                                            new Date(resource.date).getTime()
                                        ]
                                    }
                                    doc.push(r)

                                }) 
                                .catch(error => this.error = error);
                            }      
                        }                
                    }
                    var crear={
                        name: 'Crear proyecto',
                        data:dat
                    }
                    var capa = {
                        name: 'Agregar Capa',
                        data:layer
                    }
                    var docs = {
                        name: 'Agregar Documento',
                        data:doc
                    }
                    var rmd = {
                        name: 'Última actualización',
                        data:del
                    }
                    this.series.push(crear)                       
                    this.series.push(capa)                       
                    this.series.push(docs)                       
                    this.series.push(rmd)                       

                })                
                .catch(error => this.error = error);
        },
        deleted() { this.updateProjects(); },
    },
    created() {
        this.updateProjects().then(() => this.loading = false);
    },

    }
  </script>