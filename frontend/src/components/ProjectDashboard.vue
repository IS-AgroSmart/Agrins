<template>
    <div  style="height:100%; padding-top: 0%">
      <b-alert v-if="error" show variant="danger">
        <p>Error</p>
        <span style="white-space: pre;">{{ error }}</span>
      </b-alert>
      <b-row style="margin-left: 2%;" ><h6>Plataforma</h6></b-row>
        <b-row>
          <b-col md="9" class="text-center">
            <div id="chart" class="border" style="border-radius: 10px;background-color: white; ">
              <div class=" p-2 " style=" ">                
                <apexcharts type="area" height="380" :options="chartOptions" :series="series"></apexcharts>             
            </div>
            </div>    
          </b-col>
          <b-col md="3" class="text-center">
            <div id="chart" class="border" style=" border-radius: 10px;background-color: white; ">
              <div >                
                <apexcharts type="bar" height="390" :options="chartOptions1" :series="series1"></apexcharts>
               </div> 
            </div> 
          </b-col>
          
        </b-row>
                  
              
          
      </div>
  </template>
  
  
  <script>

  import axios from "axios";
  import forceLogin from './mixins/force_login';
  import VueApexCharts from "vue-apexcharts";
  import moment from 'moment';
  
  
  export default {
      components:{
          apexcharts: VueApexCharts,      
  
      },
      data() {
        return {
          totalStore : [],
          
          series: [],
          
          chartOptions: {
            chart: {
              type: 'area',
              stacked: false,
              height: 350,
              zoom: {
                enabled: false
              },
            },
            dataLabels: {
              enabled: false
            },
            markers: {
              size: 0,
            },
            fill: {
              type: 'gradient',
              gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100]
                },
            },
            yaxis: {
              labels: {
                  style: {
                      colors: '#8e8da4',
                  },
                  offsetX: 0,
                  formatter: function(val) {
                    return val;
                  },
              },
              axisBorder: {
                  show: false,
              },
              axisTicks: {
                  show: false
              }
            },
            xaxis: {
              type: 'datetime',
              tickAmount: 8,
              min: new Date("03/20/2023").getTime(),
              max: Date.now(),
              labels: {
                  rotate: -15,
                  rotateAlways: true,
                  formatter: function(val, timestamp) {
                    return moment(new Date(timestamp)).format("DD MMM YYYY")
                }
              }
            },
            title: {
              text: 'Proyectos línea de tiempo',
              align: 'left',
              offsetX: 14
            },
            tooltip: {
              shared: true
            },
            legend: {
              position: 'top',
              horizontalAlign: 'right',
              offsetX: -10
            }
          },
          
  
          series1: [],

          chartOptions1: {
            chart: {
              type: 'bar',
              height: 380
            },
            plotOptions: {
              bar: {
                barHeight: '100%',
                distributed: true,
                horizontal: true,
                dataLabels: {
                  position: 'bottom'
                },
              }
            },
            colors: ['#bad400', '#70d400', '#61b701', '#23ac02', '#029a08', '#057401', '#ffeeb2', '#8fe8fe',],
            dataLabels: {
              enabled: true,
              textAnchor: 'start',
              style: {
                fontSize: '12px',
                colors: ['#363636']
              },
              formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
              },
              offsetX: 0,
              
            },
            stroke: {
              width: 0,
              colors: ['#000']
            },
            xaxis: {
              categories: ['GCI', 'GRRI', 'MGRVI', 'NDRE', 'NDVI', 'NGRDI', 'Modelo Altura','Modelo Clorofila' ],              
              style: {
                fontSize: '6px',
                colors: ["#304758"]
              }
            },
            yaxis: {
              labels: {
                show: false
              }
            },
            title: {
                text: 'Tipos de Capas',
                align: 'center',
                floating: true
            },
            subtitle: {
                text: 'Índice de vegatación y modelo deeplearning',
                align: 'center',
            },
            tooltip: {
              theme: 'dark',
              x: {
                show: false
              },
              y: {
                title: {
                  formatter: function () {
                    return ''
                  }
                }
              }
            },
          },
        }
      },
      computed: {
      },
      mounted() {
      },
      methods:{
        getDashboard() {
            return axios
                .get('api/dashboard/project', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(response => {
                    this.series = response.data.data
                    this.series1.push(response.data.index)
                })
                .catch(error => this.error = error);
        },
    },
    
    created() {
        this.getDashboard().then(() => this.loading = false);
    },
    mixins: [forceLogin]
    }
  </script>