<template>
    <div  style="height:100%; padding-top: 0%">
      <b-alert v-if="error" show variant="danger">
        <p>Error</p>
        <span style="white-space: pre;">{{ error }}</span>
      </b-alert>
      <b-row style="margin-left: 2%;" ><h6>Usuarios</h6></b-row>
        <b-row>
          <b-col cols="12" md="4" class="text-center">
            <div id="chart" class="border" style="border-radius: 10px;background-color: white; ">
              <div class=" p-2 " style=" ">                
                <apexcharts  height="160" type="donut" :options="chartOptions" :series="series"></apexcharts>
              </div>
            </div>    
          </b-col>
          <b-col cols="12" md="4" class="text-center">
            <div id="chart" class="border" style=" border-radius: 10px;background-color: white; ">
              <div >                
                <apexcharts type="bar" height="160" :options="chartOptions1" :series="series1"></apexcharts>
              </div>
            </div>    
          </b-col>
          <b-col cols="12" md="4" class="text-center">
            <div id="chart" class="border" style=" border-radius: 10px;background-color: white; ">
              <div >                
                <apexcharts style="padding-left: 2%;" type="treemap" height="160" :options="chartOptions2" :series="series2"></apexcharts>
              </div>
            </div>    
          </b-col>
        </b-row>
                  
              
          
      </div>
  </template>
  
  
  <script>
  import axios from "axios";
  import VueApexCharts from "vue-apexcharts";
  
  
  export default {
      components:{
          apexcharts: VueApexCharts,      
  
      },
      data() {
        return {
          totalStore : 0,
          series: [],
            chartOptions: {
              labels:['Público', 'Privado', 'Otro'],
              title:{
                  text:'Organización'
  
              },            
              chart: {
                type: 'donut',
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }]
            },
  
            series1: [],
            chartOptions1: {
              chart: {
                type: 'bar',
                height: 100,
                stacked: true,
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  dataLabels: {
                    total: {
                      enabled: true,
                      offsetX: 0,
                      style: {
                        fontSize: '13px',
                        fontWeight: 900
                      }
                    }
                  }
                },
              },
              stroke: {
                width: 1,
                colors: ['#fff']
              },
              title: {
                text: 'Usuarios'
              },
              xaxis: {
                categories: ['Usuario'],              
              },
              tooltip: {
                y: {
                  formatter: function (val) {
                    return val + "usuarios"
                  }
                }
              },
              fill: {
                opacity: 1
              },
              legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetX: 40
              }
            },
          
            series2: [
            ],
            chartOptions2: {
              legend: {
                show: true
              },
              tooltip: {
                y: {
                  formatter: function(value, ) {
                    return value+' GB'
                  }
                }
              },
  
              chart: {
                height: 200,
                type: 'treemap'
              },
              title: {
                text: 'Almacenamiento ',
                align: 'left'
              }
            },            
        }
      },
      computed: {
      },
      mounted() {
      },
      methods: {       
          loadUsers() {
              axios.get('api/users', {
                      headers: { "Authorization": "Token " + this.storage.token }
                  })
                  .then(response => {                    
                      var ty = {'ADMIN':0,'ADVANCED':0, 'ACTIVE':0, 'DELETED':0}    
                      var bloq = {'ADMIN':{name: 'Administrador', data: []},
                                  'ADVANCED': {name: 'Avanzado', data: []},
                                  'ACTIVE': {name: 'Activo', data: []},
                                  'DELETED':{name: 'Eliminado', data: []}
                                }
                      var org = {'Publico':0,'Privado':0, 'Otro':0}
                      for(let u of response.data){
                          ty[u.type] +=1;
                          org[u.organization] +=1                          
                          this.totalStore += ((u.used_space/1024)/1024).toFixed(2)
                          var store = {'x':u.first_name+' '+u.last_name, 'y':((u.used_space/1024)/1024).toFixed(2)}
                          

                          bloq[u.type].data.push(store)
                      }                      
                      if (ty['ADMIN']>0) this.series2.push(bloq['ADMIN'])
                      if (ty['ADVANCED']>0) this.series2.push(bloq['ADVANCED'])
                      if (ty['ACTIVE']>0) this.series2.push(bloq['ACTIVE'])
                      this.series = [org['Publico'],org['Privado'],org['Otro']]
                      this.series1 = [{
                          name: 'Administador',
                          data: [ty['ADMIN']]
                      },{
                          name: 'Avanzado',
                          data: [ty['ADVANCED']]
  
                      },{
                          name: 'Activo',
                          data: [ty['ACTIVE']]
                      }
                      ]    
                      
                  })
                  .catch(error => this.error = error);
          }
      },
      created() {
          if (!this.$isLoggedIn()) {
              this.$router.push("/login");
          }
          this.loadUsers();
      },
    }
  </script>