<template>
  <div  style="height:100%; padding-top: 90px; background-color: #fafafa;"> 
    <div style=" padding: 2%; margin-left: 5%;border-radius: 10px;margin-right: 5%; background-color: white; ">
      <b-alert v-if="error" show variant="danger">
        <p>Error</p>
        <span style="white-space: pre;">{{ error }}</span>
      </b-alert>
    <div class=" border-bottom" ><h5>Usuarios</h5> </div>      
    <b-row class="justify-content-md-center" style="margin-top: 1%; margin-bottom: 1%;">
                    <b-col lg="4" >
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
                    <b-col lg="4" >
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
                        :tbody-tr-class="rowClass"
                        >
                        <template #cell(space)="row">
                            <b-progress variant="success" :value="row.item['GB_utilizado']" :max="row.item['GB_maximo']" :precision="2" show-progress class="mb-2"></b-progress>
                        </template>

                        <template #cell(actions)="row">      
                          <b-button-group class="mr-1">
                            <b-button v-b-tooltip.hover title="Ver detalles" class="mr-1" variant="info" size="sm" @click="row.toggleDetails">
                                <b-icon-three-dots font-scale="1"/>
                            </b-button>                    
                            <b-button v-if="row.item.Estado !='Eliminado' && row.item.Tipo != 'Administrador'" v-b-tooltip.hover title="Enviar a papelera" class="mr-1" variant="danger" size="sm" @click="accionRequest(row.item,'enviar a papelera','DELETED')" >
                              <b-icon-person-x/>
                            </b-button>
                            <b-button v-if="row.item.Tipo ==='Eliminado' && row.item.Tipo != 'Administrador'" v-b-tooltip.hover title="Eliminar" class="mr-1" size="sm" variant="danger" @click="accionRequest(row.item,'eliminar','DELETED')">
                                <b-icon-trash-fill font-scale="1"/>
                            </b-button>
                            <b-button v-if="row.item.Tipo ==='Eliminado'" v-b-tooltip.hover title="Restaurar" class="mr-1" size="sm" variant="success" @click="accionRequest(row.item,'restaurar',getType(row.item.GB_maximo))">
                                <b-icon-person-check-fill font-scale="1"/>
                            </b-button>
                            <b-dropdown v-if="row.item.Estado !='Eliminado' && row.item.Tipo != 'Administrador'" size="sm" text="Cambiar tipo" >
                              
                              <b-dropdown-item v-if="row.item.Tipo !='Administrador'" @click="accionRequest(row.item,'convertir'), 'ADMIN'">Administrador</b-dropdown-item>
                              <b-dropdown-item v-if="row.item.Tipo !='Avanzado'" @click="accionRequest(row.item,'convertir', 'ADVANCED')">Avanzado</b-dropdown-item>
                              <b-dropdown-item v-if="row.item.Tipo !='Activo'" @click="accionRequest(row.item,'convertir', 'ACTIVE')">Activo</b-dropdown-item>
                            </b-dropdown>
                          </b-button-group>
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
                        {{ infoModal.content['Indice'] }}
                        {{ infoModal.content['Nombre']}}
                        {{ infoModal.content['Tipo'] }}
                        
                    </b-modal>
    </div>
    <b-row class="justify-content-md-center">
                  <b-col md="2">
                    <b-pagination
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"                    
                    size="sm"
                    class="my-0"
                    ></b-pagination>
                  </b-col>
    </b-row>
  </div>  
    </div>
</template>


<script>
import axios from "axios";
import { BIconThreeDots } from 'bootstrap-vue';
import { BIconPersonX } from 'bootstrap-vue';
import { BIconPersonCheckFill } from 'bootstrap-vue';
import { BIconTrashFill } from 'bootstrap-vue';


export default {
    components:{  
        BIconThreeDots,
        BIconPersonX,
        BIconTrashFill,
        BIconPersonCheckFill,

    },
    data() {
      return {
        infoModal: {
          id: 'info-modal',
          title: '',
          content: ''
        },
        fields: [
            { key: 'Nombre', label: 'Nombre', sortable: true, sortDirection: 'desc' },            
            { key: 'Tipo', label: 'Tipo', sortable: true, },
            { key: 'Profesión', label: 'Profesión', sortable: true, },
            { key: 'Ciudad', label: 'Ciudad', sortable: true, },
            { key: 'Estado', label: 'Estado', sortable: true, },
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
        pageOptions: [5, 10, 15, 20,25],
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
      getType(space){
        if (space >10.00)
          return 'ADVANCED'
        return 'ACTIVE'
      },   
      rowClass(item, type) {
        if (!item || type !== 'row') return
        if (item.Estado === 'Eliminado') return 'table-danger'
        if (item.Estado === 'Activación pendiente') return 'table-warning'
      },
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
        deleteUser(idUser){
            axios.delete("api/users/"+idUser+'/',{
                    headers: { "Authorization": "Token " + this.storage.token },
                }).then(() => this.loadUsers())
                .catch(() => {
                    this.$bvToast.toast('Error al procesar la solicitud. Intente más tarde', {
                        title: "Error",
                        autoHideDelay: 3000,
                        variant: "danger",
                    });
                });
        },
        patchUser(user, newType, maxSize) {
            axios.patch("api/users/" + user.Indice + "/", { 'maximum_space': maxSize, 'type': newType }, {
                    headers: { "Authorization": "Token " + this.storage.token },
                }).then(() => this.loadUsers())
                .catch(() => {
                    this.$bvToast.toast('Error al procesar la solicitud. Intente más tarde', {
                        title: "Error",
                        autoHideDelay: 3000,
                        variant: "danger",
                    });
                });
        },
        accionRequest(user, accion, type) {
            let acciong='';
            var M_size = 0
            var typeUser = {'ADMIN':'Administrador','ADVANCED':'Avanzado', 'ACTIVE':'Activo', 'DELETED': 'Eliminado'}
            var typeM_size = {'ADMIN':47185920,'ADVANCED':47185920, 'ACTIVE':10485760}
            if (accion == "enviar a papelera") {
                acciong='enviado a papelera.'
                M_size = user.GB_maximo
              }
            else if (accion =='convertir'){
              acciong= 'convertido a: '+typeUser[type]
              M_size = typeM_size[type]
            }
            else if(accion =='eliminar'){
              acciong='eliminado'                         
              M_size = user.GB_maximo
            } else {
                acciong='restaurado';
                M_size = typeM_size[type]
            }
            this.$bvModal.msgBoxConfirm('El/la usuario ' + '"'+user.Nombre + '"'+" será "+acciong, {
                        title: '¿Realmente desea '+accion+' el usuario?',
                        okVariant: 'danger',
                        okTitle: 'Sí',
                        cancelTitle: 'No',
                        // hideHeaderClose: false
                    })
                    .then(value => {
                      if(value){
                            if (accion == "eliminar") {
                                this.deleteUser(user.Indice);
                            } else {
                              this.patchUser(user, type, M_size);
                            }
                        }


                    });
        },
        loadUsers() {
          this.users = []
            axios.get('api/users', {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(response => {   
                    var type = {'ADMIN':'Administrador','ADVANCED':'Avanzado', 'ACTIVE':'Activo', 'DELETED': 'Eliminado'}
                    var status = ''
                    
                    for(let u of response.data){
                      if (u.type === 'DELETED')
                        status = 'Eliminado'
                      else if (!u.is_active)
                        status = 'Activación pendiente'
                      else
                        status = 'Activo'
                      var nam = u.first_name+' '+u.last_name
                      var user = {                            
                            'Indice': u.pk,
                            'Nombre': nam,//{'name':u.first_name+' '+u.last_name, 'validate': u.is_active},                            
                            'Tipo': type[u.type],
                            'Ciudad': u.city,
                            'E-mail': u.email,
                            'Organización': u.organization,
                            'GB_maximo': ((u.maximum_space/1024)/1024).toFixed(2),
                            'GB_utilizado':((u.used_space/1024)/1024).toFixed(2),
                            'Profesión': u.profession,
                            'Estado': status,                            
                        }
                        this.users.push(user)
                        this.totalRows = this.users.length
                    }                    
                       
                    
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