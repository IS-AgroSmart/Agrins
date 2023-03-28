<template>
    <div  style="height:100%; padding-top: 0%">
        <b-alert v-if="error" show variant="danger">
            <p>Error</p>
            <span style="white-space: pre;">{{ error }}</span>
        </b-alert>
        <b-row>
            <b-col cols="12" md="8" >
            <h6>Usuarios</h6>           
                <b-row>
                    <b-col lg="6" class="my-1">
                        <b-form-group
                        label="Buscar"
                        label-for="filter-input"
                        label-cols-sm="3"
                        label-align-sm="right"
                        label-size="sm"
                        class="mb-0"
                        >
                        <b-input-group size="sm">
                            <b-form-input
                            id="filter-input"
                            v-model="filter"
                            type="search"
                            placeholder="Ingrese la información"
                            ></b-form-input>

                            <b-input-group-append>
                            <b-button :disabled="!filter" @click="filter = ''">Borrar</b-button>
                            </b-input-group-append>
                        </b-input-group>
                        </b-form-group>
                    </b-col>
                    <b-col sm="5" md="6" class="my-1">
                        <b-form-group
                        label="Usuarios"
                        label-for="per-page-select"
                        label-cols-sm="6"
                        label-cols-md="4"
                        label-cols-lg="3"
                        label-align-sm="right"
                        label-size="sm"
                        class="mb-0"
                        >
                        <b-form-select
                            id="per-page-select"
                            v-model="perPage"
                            :options="pageOptions"
                            size="sm"
                        ></b-form-select>
                        </b-form-group>
                    </b-col>
                </b-row>
                <div >
                    <b-table                       
                        :items="users"
                        :fields="fields"
                        :current-page="currentPage"
                        :per-page="perPage"
                        :filter="filter"
                        :filter-included-fields="filterOn"
                        :sort-by.sync="sortBy"
                        :sort-desc.sync="sortDesc"
                        :sort-direction="sortDirection"
                        stacked="md"
                        show-empty
                        small
                        @filtered="onFiltered"
                        >
                        <template #cell(name)="row">
                            <b-badge v-if="!row.value.validate" squared variant="danger">Activación</b-badge> {{row.value.name}}
                        </template>
                        <template #cell(space)="row">
                            <b-progress variant="success" :value="row.value.used_space" :max="row.value.max_space" :precision="2" show-progress class="mb-2"></b-progress>
                        </template>

                        <template #cell(actions)="row">                        
                            <b-button size="sm" @click="row.toggleDetails">
                                <b-icon-three-dots font-scale="1"/>
                            </b-button>                    
                            <b-button size="sm" @click="info(row.item, row.index, $event.target)" class="mr-1">
                                <b-icon-pencil-fill font-scale="1"/>
                            </b-button>
                        </template>
                        

                        <template #row-details="row">
                            <b-card>
                            <ul>
                                <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value }}</li>
                            </ul>
                            </b-card>
                        </template>
                    </b-table>
                    <b-modal :id="infoModal.id" title="Modificar usuario" ok-only @hide="resetInfoModal">
                        {{ infoModal.content['index'] }}
                        {{ infoModal.content['name']}}
                        {{ infoModal.content['type'] }}
                        
                    </b-modal>
                </div>
                <b-row style="padding-bottom: 2%;">
                    <b-pagination
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"                    
                    size="sm"
                    class="my-0"
                    ></b-pagination>
                </b-row>
            </b-col>
            <b-col cols="12" md="4" class="text-center">
                <b-row>
                    <div id="chart" class="border" style="margin-left: 5%; border-radius: 10px;background-color: white; ">
                        <div class=" p-2 " style=" ">                
                            <apexcharts  height="300" type="donut" :options="chartOptions" :series="series"></apexcharts>
                        </div>
                    </div>    
                </b-row>
                <b-row>
                    <div id="chart" class="border" style="margin-left: 5%; border-radius: 10px;background-color: white; ">
                        <div class=" p-2 " style=" ">                
                            <apexcharts type="bar" height="160" :options="chartOptions1" :series="series1"></apexcharts>
                        </div>
                    </div>    

                </b-row>
            </b-col>
        </b-row>
        
        
    </div>
</template>


<script>
import axios from "axios";
import { BIconPencilFill } from 'bootstrap-vue';
import { BIconThreeDots } from 'bootstrap-vue';
import VueApexCharts from "vue-apexcharts";


export default {
    components:{
        apexcharts: VueApexCharts,      
        BIconPencilFill,
        BIconThreeDots

    },
    data() {
      return {
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
          
          
        


        infoModal: {
          id: 'info-modal',
          title: '',
          content: ''
        },
        fields: [
            { key: 'name', label: 'Nombre', sortable: true, sortDirection: 'desc' },            
            { key: 'type', label: 'Tipo', sortable: true, class: 'text-center' },
            { key: 'profession', label: 'Profesón', sortable: true, class: 'text-center' },
            { key: 'space', label:'Almacenamiento'},
            { key: 'actions', label: 'Acciones' }
            
        ],
        
        users: [],
        acciones: ['Aceptar', 'Rechazar', 'Bloquear'],
        acciones1: ['Eliminar','Bloquear'],
        error: false,
        filter: null,
        totalRows: 1,
        currentPage: 1,
        perPage: 5,
        pageOptions: [5, 10, 15, { value: 1000, text: "Todos" }],
      }
    },
    computed: {
      sortOptions() {
        // Create an options list from our fields
        return this.fields
          .filter(f => f.sortable)
          .map(f => {
            return { text: f.label, value: f.key }
          })
      }
    },
    mounted() {
      // Set the initial number of items
      this.totalRows = this.users.length
    },
    methods: {       
        onFiltered(filteredItems) {
        // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        info(item, index, button) {
            this.infoModal.title = `Row index: ${index}`
            this.infoModal.content = item
            this.$root.$emit('bv::show::modal', this.infoModal.id, button)
        },
        resetInfoModal() {
            this.infoModal.title = ''
            this.infoModal.content = ''
        },
        loadUsers() {
            axios.get('api/users', {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(response => {                    
                    var ty = {'ADMIN':0,'ADVANCED':0, 'ACTIVE':0}                    
                    var org = {'Publico':0,'Privado':0, 'Otro':0}
                    for(let u of response.data){
                        ty[u.type] +=1;
                        org[u.organization] +=1
                        var user = {                            
                            'index': u.pk,
                            'name': {'name':u.first_name+' '+u.last_name, 'validate': u.is_active},
                            'super': u.is_staff,
                            'type': u.type,
                            'city': u.city,
                            'email': u.email,
                            'organization': u.organization,
                            'max_space': u.maximum_space,
                            'used_space': u.used_space,
                            'profession': u.profession,
                            'Cuenta validada': u.is_active,
                            'space': {'max_space': u.maximum_space, 'used_space': u.used_space,}//(100*u.used_space/u.maximum_space).toFixed(0)
                        }
                        this.users.push(user)
                        this.totalRows = this.users.length
                    }                    
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