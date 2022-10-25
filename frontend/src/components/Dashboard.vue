<template>
    <div style="background-color: #f7f7f7; height:100%; padding-top: 90px;">
        <div class="border" style="margin-left: 5%;border-radius: 10px;background-color: white; margin-right: 5%;  ">    
            <b-row class="text-center">
            <b-col v-if="isAdmin" md>                           
                <div class="border-right">
                    <h6 class="text-primary" style="padding-top: 3%;"><b-icon-person-circle style="width: 20px; height: 20px; " /> Usuarios</h6>
                    <p>3</p>
                </div>
            </b-col>
            <b-col md>                            
                <div class="border-right">
                    <h6 class="text-success" style="padding-top: 3%;"><b-icon-file-earmark-fill style="width: 20px; height: 20px; " /> Proyectos</h6>
                    <p>1</p>
                </div>
            </b-col>
            <b-col md>                       
                <div class="border-right">
                    <h6 class="text-warning" style="padding-top: 3%;"><b-icon-layers-fill style="width: 20px; height: 20px; "/> Capas</h6>
                    <p>3</p>
                </div>
            </b-col>
            <b-col md>                       
                <div class="border-right">
                    <h6 class="text-secondary" style="padding-top: 3%;"><b-icon-archive-fill style="width: 20px; height: 20px; "/> Almacenamiento</h6>
                    <DiskSpaceIndicatorVue></DiskSpaceIndicatorVue>
                </div>
            </b-col>
        </b-row>           
    </div>
    <div id="chart" class="border" style="margin-left: 5%;border-radius: 10px;background-color: white; margin-right: 5%; margin-top: 1%; ">
        <apexcharts type="bar" height="350" :options="chartOptions" :series="series"></apexcharts>
      </div>
    </div>
  </template>
  
<script>

import { BIconPersonCircle } from 'bootstrap-vue';
import { BIconFileEarmarkFill } from 'bootstrap-vue';
import { BIconLayersFill} from 'bootstrap-vue';
import { BIconArchiveFill} from 'bootstrap-vue';
import DiskSpaceIndicatorVue from './DiskSpaceIndicator.vue';
import VueApexCharts from "vue-apexcharts";


    export default {
        components: {        
        apexcharts: VueApexCharts,      
        BIconPersonCircle,
        BIconFileEarmarkFill,
        BIconLayersFill,
        BIconArchiveFill,
        DiskSpaceIndicatorVue,
    },
    data: function() {
        return {
            series: [{
                name: 'Usuarios',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0]
                }, {
                name: 'Proyectos',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
                }, {
                name: 'Capas',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0]
            }],
            chartOptions: {
                chart: {
                  type: 'bar',
                  height: 350
                },
                plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                },
                },
                dataLabels: {
                enabled: false
                },
                stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
                },
                xaxis: {
                categories: ['Ene','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov','Dec']
                },
                yaxis: {
                title: {
                text: 'Ítems (2022)'
                 }
                },
                fill: {
                opacity: 1
                },
                tooltip: {
                y: {
                formatter: function (val) {
                  return val + " Ítems"
                }
              }
            }
          },}
    },
    computed: {        
        isAdmin() { return this.storage.loggedInUser != null && this.storage.loggedInUser.type == "ADMIN"; },        
    },

    }
  </script>