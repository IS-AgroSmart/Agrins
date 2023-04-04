<template>
    <div  style="cursor: pointer;" v-if="!projectDelete" class="col-md-3">
        <b-card  @click="viewProject()" :title="projectName" :sub-title="descriptionProject" v-bind:img-src="project.wallpaper" img-alt="Image" img-height="150" img-width="90" img-top tag="article" style="max-width: 19rem; max-height: 25rem;">
         <template #footer class="flex-sm-fill">
            <b-row >
                <small style="fontSize:12px" class="text-muted">Última actualización {{dateProject}}.</small>
            </b-row>
            <b-row class="float-right">
                    <b-badge v-if="project.is_demo" squared variant="warning">DEMO</b-badge>                    
                    <b-badge v-if="isAdmin" variant="success" squared>PROPIETARIO</b-badge>
                    <b-badge v-if="!project.is_demo && !isAdmin" variant="success" squared>PROPIETARIO</b-badge>                    
            </b-row>
            </template>            
        </b-card>
    </div>
    <div v-else class="col-md-3">
        <b-card :title="projectName"  v-bind:img-src="project.wallpaper"  img-alt="Image" img-height="135" img-width="90" img-top tag="article" style="max-width: 19rem; max-height: 25rem;">
         <template #footer class="flex-sm-fill">
            <b-card-text>
                <b-button @click="finalDeleteProject" size="sm" variant="danger" class="mx-1 my-1">Eliminar</b-button>
                <b-button @click="restoreProject" size="sm" variant="warning" class="mx-1 my-1">Restaurar</b-button>
            </b-card-text>
            <b-row class="float-right">
                    <b-badge v-if="project.deleted" squared variant="danger">ELIMINADO</b-badge>                    
                    
            </b-row>
            </template>            
        </b-card>

    </div>

    
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            
        };
    },
    computed: {
        mapper_url() {
            return "/mapper/" + this.project.uuid;
        },
        projectName() {
            return this.project.name;
        },
        projectDelete() {
            return this.project.deleted;
        },
        descriptionProject(){
            return this.project.description.substring(0, 24) +"...";
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
