<template>
   <tr>           
        <td> {{projectName}} </td>
        <td> {{dateProject }} </td>
        <td> <b-badge v-if="project.is_demo" squared variant="warning">DEMO</b-badge>                    
            <b-badge v-if="isAdmin && !project.deleted" variant="success" squared>PROPIETARIO</b-badge>
            <b-badge v-if="!project.is_demo && !isAdmin && !project.deleted" variant="success" squared>PROPIETARIO</b-badge> 
            <b-badge v-if="project.deleted" variant="danger" squared>ELIMINADO</b-badge> 
        </td>                        
        <td>
            <b-button v-if="!project.deleted" @click="viewProject()" size="sm" variant="outline-primary" >Abrir</b-button>
            <b-button v-if="project.deleted" @click="finalDeleteProject" size="sm" variant="danger" class="mx-1 my-1">Eliminar</b-button>
            <b-button v-if="project.deleted" @click="restoreProject" size="sm" variant="warning" class="mx-1 my-1">Restaurar</b-button>
        </td> 
    </tr>    
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
         
        };
    },
    computed: {        
        projectName() {
            return this.project.name;
        },
        dateProject(){
            return (new Date(this.project.date_update).toLocaleDateString('es-ES'))
        },
        isAdmin() { return this.storage.loggedInUser != null && this.storage.loggedInUser.type == "ADMIN"; },
    },
    methods: {
        finalDeleteProject() {
            this.$bvModal.msgBoxConfirm('Este proyecto NO podrá ser recuperado.', {
                    title: '¿Realmente desea eliminar el proyecto?',
                    okVariant: 'danger',
                    okTitle: 'Sí',
                    cancelTitle: 'No',
                    // hideHeaderClose: false
                })
                .then(value => {
                    if (value)
                        axios.delete("api/projects/" + this.project.uuid, {
                            headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                        }).then(() => this.$emit('updateProjects'))
                        .catch(() => {
                            this.$bvToast.toast('Error al eliminar el proyecto', {
                                title: "Error",
                                autoHideDelay: 3000,
                                variant: "danger",
                            });
                        });
                });
        },
        restoreProject() {
            axios.patch("api/projects/" + this.project.uuid + "/", { deleted: false }, {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                }).then(() => this.$emit('updateProjects'))
                .catch(() => {
                    this.$bvToast.toast('Error al restaurar el proyecto', {
                        title: "Error",
                        autoHideDelay: 3000,
                        variant: "danger",
                    });
                });
        },
        viewProject(){
             this.$router.push({ name: 'projectDetail', params: { uuid: this.project.uuid,}}) //project: this.project , deleted: this.deleted }})
        },        
    },
    props: {
        project: { type: Object },
        deleted: { type: Boolean, default: false }
    },
    // mixins: [forceLogin] // forceLogin not required, this will only be instantiated from page components
}
</script>
