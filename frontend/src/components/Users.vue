<template>
    <div  style="height:100%; padding-top: 90px;">
        <b-alert v-if="error" show variant="danger">
            <p>Error en la creación de cuenta</p>
            <span style="white-space: pre;">{{ error }}</span>
        </b-alert>
        <div style="margin-left: 5%;border-radius: 10px;margin-right: 5%;  ">
            <h5>Usuarios</h5>           
            <div class="table-responsive-sm">
            <table class="table table-sm table-hover"  >
                <thead >
                    <tr >
                        <th></th>
                        <th v-for="(f,i) in  fields" :key="i">{{f}}</th>                    
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="u in  users" :key="u.pk" >
                        <td>
                            <b-icon-person-circle v-if="u.type == 'ADMIN'" class="text-info"/>
                            <b-icon-person-circle v-if="u.type == 'ACTIVE'" class="text-secondary"/>
                            <b-icon-person-circle v-if="u.type == 'DEMO_USER'" class="text-danger"/>
                        </td>
                        <td> {{ u.first_name }} </td>
                        <td> {{ u.last_name }} </td>
                        <td> {{ u.email }} </td>
                        <td> {{ u.organization }} </td>
                        <td> {{ u.profession }} </td>
                        <td> {{ u.city }} </td>
                        <td> {{ u.type }} </td>
                        <td> 
                            <b-dropdown style="padding-top:0%; padding-bottom:0%" size="sm" squared variant="success" v-if="u.email != storage.loggedInUser.email " text="Acciones" ref="dropdown">
                                <div v-if="u.type == 'DEMO_USER'">
                                <b-dropdown-item-button v-for="accion in acciones" :key="accion.pk"  @click="accionRequest(user,accion)">
                                    {{ accion }}
                                </b-dropdown-item-button>
                            </div>
                            <div v-else >
                                <b-dropdown-item-button v-for="ac in acciones1" :key="ac.pk" @click="accionRequest(user,accion)">
                                    {{ ac }}
                                </b-dropdown-item-button>
                            </div>
                            </b-dropdown>
                            
                        
                        </td> 
                    </tr>
                </tbody>
            </table>
        </div>
        </div>
        
    </div>
</template>


<script>
import axios from "axios";
import { BIconPersonCircle } from 'bootstrap-vue';

export default {
    components:{
        BIconPersonCircle,
    },
    data() {
      return {
        fields: ['Nombre', 'Apellido', 'Email','Institución','Profesión','Ciudad','Estado', 'Acción'],
        users: [],
        acciones: ['Aceptar', 'Rechazar', 'Bloquear'],
        acciones1: ['Eliminar','Bloquear'],
        error: false,
      }
    },
    methods: {
        loadUsers() {
            axios.get('api/users', {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(response => {
                    this.users = response.data
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