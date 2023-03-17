<template>
    <div class="col-md-3">
        <b-card @click="viewProject()" :title="projectName" :sub-title="descriptionProject" v-bind:img-src="project.wallpaper" img-alt="Image" img-height="150" img-width="90" img-top tag="article" style="max-width: 19rem; max-height: 25rem;">
         <template #footer class="flex-sm-fill">
            <b-row >
                <small style="fontSize:12px" class="text-muted">Última actualización hace 3 min.</small>
            </b-row>
            <b-row class="float-right">
                    <b-badge v-if="project.is_demo" squared variant="warning">DEMO</b-badge>                    
                    <b-badge v-if="isAdmin" variant="success" squared>PROPIETARIO</b-badge>
                    <b-badge v-if="!project.is_demo && !isAdmin" variant="success" squared>PROPIETARIO</b-badge>                    
            </b-row>
            </template>            
        </b-card>
    </div>


    

        <!--

        <b-card :title="projectName" class="my-3">
    
            <b-card-text>
                <p class="white-space: pre-wrap;">{{ project.description }}</p>
            </b-card-text>
            <div v-if="!deleted">
                <b-button :to="{name: 'projectMap', params: {uuid: project.uuid}}" variant="primary" class="mx-1 my-1">Ver mapa</b-button>
                <b-button @click="deleteProject" :value="deleted" variant="danger" class="mx-1 my-1">Eliminar</b-button>
            </div>
            <div v-else>
                <b-button @click="finalDeleteProject" variant="danger" class="mx-1 my-1">Eliminar</b-button>
                <b-button @click="restoreProject" variant="success" class="mx-1 my-1">Restaurar</b-button>
            </div>
        </b-card>-->
    
</template>

<script>


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
        descriptionProject(){
            return this.project.description.substring(0, 60) +"...";
        },
        isAdmin() { return this.storage.loggedInUser != null && this.storage.loggedInUser.type == "ADMIN"; },
    },
    methods: {
        viewProject(){
             this.$router.push({ name: 'projectDetail', params: { uuid: this.project.uuid, project: this.project , deleted: this.deleted }})
        },        
    },
    props: {
        project: { type: Object },
        deleted: { type: Boolean, default: false }
    },
    // mixins: [forceLogin] // forceLogin not required, this will only be instantiated from page components
}
</script>
