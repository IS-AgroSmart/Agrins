<template>
    <div style="background-color: #f7f7f7; height:100%; padding-top: 90px;">                
        <b-skeleton-wrapper :loading="loading">
                <template #loading>
                    <b-row>
                        <b-col v-for="i in 3" :key="i">
                            <b-card class="my-3">
                                <b-skeleton width="85%" height="40%"></b-skeleton>
                                <b-skeleton width="100%"></b-skeleton>
                                <b-skeleton width="100%"></b-skeleton>
                                <b-skeleton type="button"></b-skeleton>
                            </b-card>
                        </b-col>
                    </b-row>
                </template>
        <div class="border" style="background-color:white; margin-left: 5%; margin-right: 5%;  ">    
            <b-row style="padding-top: 1%; padding-left: 1%; padding-right: 1%;" class="text-center">            
                <b-col >
                    <b-card style=" height: 80%;" class="border" >  
                        <b-card-text class="text-success"><b-icon-briefcase-fill style="width: 20px; height: 20px; " /> Proyectos</b-card-text>  
                        <b-card-text class="text-success">{{this.projects}} </b-card-text>
                    </b-card>
                </b-col>
                <b-col >
                    <b-card style=" color:  #f09903 ;height: 80%;" class="border">  
                        <b-card-text ><b-icon-layers-fill style="width: 20px; height: 20px; "/> Capas</b-card-text>  
                        <b-card-text >{{this.layers}}</b-card-text>
                    </b-card>
                </b-col>            
                <b-col >
                    <b-card style=" height: 80%; color:#009d95;" class="border">  
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
                <apexcharts type="rangeBar" height="450" :options="chartOptions" :series="series"></apexcharts>
            </div>    

        </div>        
    </b-skeleton-wrapper>
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
            projects:0,
            layers : 0,
            resources : 0,            
            loading: true,

            series: [],
            chartOptions: {
                title:{
                    text:'Proyectos'
                },
                chart: {
                type: 'rangeBar'
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        columnWidth: '50%',
                        barHeight: '50%',
                    }
                },
                xaxis: {
                    type: 'datetime'
                },
                stroke: {
                    width: 1
                },                
                fill: {
                    type: 'solid',
                    opacity: 0.6
                },
                legend: {
                    show: true,
                    position: 'top',
                    showForSingleSeries: true,
                    customLegendItems: ['Capa principal', 'Documento'],
                    markers: {
                        fillColors: ['orange', 'green']
                    }
                },
            },
        }
    },
    computed: {                
    },
    methods:{
        getDashboard() {
            return axios
                .get('api/dashboard/user', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(response => {
                    this.projects = response.data.project
                    this.layers = response.data.layer
                    this.resources = response.data.resource
                    this.series = response.data.series
                })
                .catch(error => this.error = error);
        },
    },
    
    created() {
        this.getDashboard().then(() => this.loading = false);
    },

    }
  </script>