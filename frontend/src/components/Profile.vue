<template>
    <div style="width: 100%; height: 100%;"> 
        <div style="background-color: #fafafa; background-image: url('fondo_img.png');background-size: 100% 280px; background-repeat: no-repeat; padding-top:100px; width: 100%; height:100%;">
            
            <div style="margin-top: 7%; padding-left: 5%;padding-right:5%">
                <b-card no-body>                    
                    <b-tabs style="margin: 2%;" content-class="mt-3 " justified>
                    <b-tab title="Datos Personales"  active>    

                        <b-card-text style="padding-left: 5%;padding-right:5%; ">
                            <b-row  align-h="around" class="d-flex justify-content-center">
                                <b-col md="3">
                                    <div  class="d-flex justify-content-center">                                
                                        <b-icon-file-person-fill style="width: 120px; height: 120px; "  class="text-black"/>
                                    </div>
                                    <div class="d-flex justify-content-center">                                
                                        <p class="text-black"><b-icon-envelope/> {{ storage.loggedInUser.email }}</p>
                                    </div>
                                    <div class="d-flex justify-content-center">                                
                                        <ChangePassword />
                                    </div>
                                </b-col>
                                <b-col md="7" style="padding-top: 2%; color: gray; margin-left: 5%; " >
                                    <h4 style="text-transform:capitalize;">{{ storage.loggedInUser.first_name }} {{ storage.loggedInUser.last_name }}</h4>
                                    <h6><b-icon-map/> {{ storage.loggedInUser.city }}</h6>
                                    <h6><b-icon-telephone/> {{ storage.loggedInUser.phone }}</h6>
                                    <h6>Profesión:   {{ storage.loggedInUser.profession }}</h6>
                                    <h6>Institución: {{ storage.loggedInUser.organization }}</h6>
                                    <p><b-badge v-if="this.storage.loggedInUser.type === 'ACTIVE'" variant="info">{{ storage.loggedInUser.type }} 10GB </b-badge> </p>
                                    <b-badge v-if="this.storage.loggedInUser.type === 'ADMIN'" variant="success">{{ storage.loggedInUser.type }}</b-badge>
                                    <b-badge v-if="this.storage.loggedInUser.type === 'ADVANCED'" variant="primary">{{ storage.loggedInUser.type }} 45GB</b-badge>
                                    <p v-if="this.storage.loggedInUser.type === 'DELETED'"><b-badge  variant="danger">{{ storage.loggedInUser.type }}</b-badge></p>
                                </b-col>
                            </b-row>                            
                        </b-card-text >                       
                                
                    </b-tab>
                    <b-tab v-if="this.storage.loggedInUser.type === 'ADMIN'" title="Mensajes de Contacto">
                        <div  style="margin-left: 2%; margin-right: 2%;" class="d-flex mb-3 border-bottom" >
                        <div class="p-2 "><h5>Mensajes </h5>  
                            
                        </div>
                        <div class=" p-2 ">
                            <b-form-select variant="primary" class="" size = "sm" id="input-select"
                                v-model="selectGroup" :options="['Todos', 'Revisados', 'Pendientes']" :value="null"
                            ></b-form-select>                    
                        </div></div>                        
                        <div v-for="message in messages.filter(filtreContact)" :message="message" :key="message.pk" id="collapse-1">
                            
                                <b-card
                                                      
                                    style="margin-left:4%;margin-right: 4%; margin-top: 1%;background-color: #fafafa;"
                                    :sub-title="message.name"
                                    
                                    >                                                                        
                                    <b-row >
                                        <b-col md="2" >
                                            <small><b-icon-telephone/> {{message.phone}}  </small><br>
                                            <small><b-icon-calendar/> {{new Date(message.date).toLocaleDateString('es-ES')}}</small><br>
                                            <small><b-icon-envelope/> {{message.email}}</small><br>
                                            <b-badge v-if="message.view" variant="success">Mensaje revisado</b-badge>
                                            <b-badge v-if="!message.view" variant="warning">Mensaje pendiente</b-badge>
                                        </b-col>
                                        <b-col  md="8" class="text-left">
                                            
                                            <b-card-text>{{message.message}}</b-card-text>                                            
                                            <b-button v-b-tooltip.hover @click="deleteContact(message.pk)" title="Eliminar mensaje" href="#" size="sm"  variant="outline-danger" class="mr-1"><b-icon-trash-fill/></b-button>
                                            <b-button v-b-tooltip.hover @click="reviewContact(message.pk)" title="Marcar como revisado" v-if="!message.view"  size="sm"  variant="outline-success"><b-icon-check-circle-fill/></b-button>
                                        </b-col>
                                    </b-row>                                    
                                    
                                </b-card>
                            

                        </div>
                        
                    </b-tab> 
                    
                    </b-tabs>
                </b-card>
            </div>
            
        
                    
        </div>
    </div>
</template>

<script>
import { BIconFilePersonFill} from 'bootstrap-vue';
import forceLogin from './mixins/force_login';
import { BIconEnvelope } from  'bootstrap-vue';
import { BIconMap } from  'bootstrap-vue';
import { BIconTelephone } from  'bootstrap-vue';
import { BIconTrashFill } from  'bootstrap-vue';
import { BIconCalendar } from  'bootstrap-vue';
import { BIconCheckCircleFill } from  'bootstrap-vue';
import ChangePassword from './ChangePassword.vue'; 
import axios from 'axios';

export default {
        components: {
        BIconEnvelope,
        BIconCalendar,
        BIconCheckCircleFill,
        BIconTelephone,
        BIconMap,
        BIconTrashFill,
        BIconFilePersonFill,
        ChangePassword,
    },
    data() {
      return {
        messages:[],
        error: "",
        selectGroup: 'Todos',
        pendiente: 0
      }
    },
    computed:{
        dateContact(value){
            return (new Date(value).toLocaleDateString('es-ES'))
        },

    },
    methods:{
        filtreContact(value){    
            var res = true;        
            switch (this.selectGroup) {
                case 'Pendientes':
                    res = !value.view
                    break
                case 'Revisados':
                    res = value.view
                    break
            }
            return res
        },
        reviewContact(pk){
            this.$bvModal.msgBoxConfirm('Mensaje revisado.', {
                    title: '¿Desea marcar el mesaje como revisado?',
                    okVariant: 'danger',
                    okTitle: 'Sí',
                    cancelTitle: 'No',
                    // hideHeaderClose: false
                })
                .then(value => {
                    if (value)
                        axios.patch("api/contacts/" + pk + "/", { view: true, }, {
                            headers: { "Authorization": "Token " + this.storage.token },
                        }).then(() => this.loadContact())
                        .catch(error => this.error = error);
                });
        },
        deleteContact(pk){
            this.$bvModal.msgBoxConfirm('Eliminar mensaje.', {
                    title: '¿Desea eliminar el mensaje?',
                    okVariant: 'danger',
                    okTitle: 'Sí',
                    cancelTitle: 'No',
                    // hideHeaderClose: false
                })
                .then(value => {
                    if (value)
                        axios.delete("api/contacts/" + pk, {
                            headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                        }).then(() => this.loadContact())
                        .catch(error => this.error = error);
                });

        },
        loadContact(){
            return axios
                .get('api/contacts', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(response => this.messages = response.data)
                .then(() =>{ this.pendiente = this.messages.filter(e => e.view === false).length;})
                .catch(error => this.error = error);
            }
    },
    created() {
        this.loadContact();
    },
    mixins: [forceLogin] 
}
</script>

