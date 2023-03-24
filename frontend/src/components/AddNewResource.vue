<template>
    <div >
                <b-button v-b-tooltip.hover title="Agregar nuevo documento" size="sm" v-if="canCreateProjects" v-b-modal.modal-center variant="info"><b-icon-plus scale="1.2"/> Documento</b-button>
                
                <b-card-text v-else>
                    <small class="text-muted">No puede agregar recursos. {{ unableReason }}</small>
                </b-card-text>  
                <b-modal ref="my-modal" id="modal-center" button-size="sm" ok-only ok-variant="secondary" ok-title="Cancel"  centered title="Agregar documento">
                    <div  style="height:100%; ">        
                        <p>Para agregar un recurso ingrese la información solicitada.</p>
                        <b-alert v-if="error" variant="danger" show>{{error}}</b-alert>
                        <b-form @submit="onSubmit">
                            <b-form-group id="input-group-1" label="Nombre:*" label-for="input-1">
                                <b-form-input size="sm" id="input-1" v-model="name" type="text" required placeholder="Nombre del documento"></b-form-input>
                            </b-form-group>           
                            <b-form-group label="Documento: .docx, .xlsx, .pdf">
                                <b-form-file v-model="file" :file-name-formatter="formatName" :state="anyFile" required placeholder="Escoja o arrastre un documento..." drop-placeholder="Sleccionar documento..." browse-text="Seleccionar" accept=".docx, .pdf, .xlsx"></b-form-file>
                            </b-form-group>
                            <b-form-group id="input-group-2" label="Descripción:*" label-for="input-2">
                                <b-form-textarea size="sm" id="input-2" v-model="description" placeholder="Describa el proyecto" rows="5" max-rows="16" required></b-form-textarea>
                            </b-form-group> 
                            <b-row align-h="center" style="padding-bottom:2%">
                                <b-button style="padding-top:0%; padding-bottom:0%" type="submit" pill variant="info">Agregar</b-button>
                            </b-row>
                            
                        </b-form>
                    </div>
                
                </b-modal>          
    </div>
</template>

<script>
// import forceLogin from './mixins/force_login'
import {BIconPlus} from 'bootstrap-vue';
import axios from "axios";

export default {
    data() {
        return {
            file: null,
            name: "",
            description : "",

        }
    },
    computed: {
        targetUser: function() {
            // returns this.storage.otherUserPk. If it's null, it falls back to this.storage.loggedInUser
            return this.storage.otherUserPk || this.storage.loggedInUser;
        },
        canCreateProjects: function() { return this.unableReason == "" },
        unableReason: function() {
            if (this.targetUser.used_space >= this.targetUser.maximum_space)
                return "Su almacenamiento está lleno.";
            else if (!(["ACTIVE", "ADMIN"].includes(this.targetUser.type)))
                return "Póngase en contacto con Agrins para activar su cuenta.";
            return "";
        },
    },
    components: {
        BIconPlus,
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault();
            if (!this.$isLoggedIn()) {
                this.$router.push("/login");
                return;
            }            
            var data = new FormData();
            data.append("file", this.file);
            data.append("name", this.name);
            data.append("description", this.description);

            
            axios.post('/api/uploads/' + this.$route.params.uuid + '/resource', data, {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(() => this.$refs['my-modal'].hide())
                .then(() => this.$router.push("/projects")) 
                //.then(() => this.$router.go())
                .catch(error => this.error = "ERROR: " + error.response.data.name[0]);
        },
    }
    // mixins: [forceLogin] // forceLogin not required, this will only be instantiated from page components
}
</script>