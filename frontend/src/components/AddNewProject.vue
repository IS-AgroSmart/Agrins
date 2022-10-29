<template>
    <div >
                <b-button size="sm" v-if="canCreateProjects" v-b-modal.modal-center variant="info"><b-icon-plus scale="1.2"/>  Agregar proyecto</b-button>
                
                <b-card-text v-else>
                    <small class="text-muted">No puede crear proyectos. {{ unableReason }}</small>
                </b-card-text>  
                <b-modal id="modal-center" button-size="sm" ok-only ok-variant="secondary" ok-title="Cancel"  centered title="Crear proyecto">
                    <p class="my-4"><NewProject></NewProject></p>
                
                </b-modal>          
    </div>
</template>

<script>
// import forceLogin from './mixins/force_login'
import {BIconPlus} from 'bootstrap-vue';
import NewProject from './NewProject.vue';

export default {
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
        }
    },
    components: {
        BIconPlus,
        NewProject,
    }
    // mixins: [forceLogin] // forceLogin not required, this will only be instantiated from page components
}
</script>