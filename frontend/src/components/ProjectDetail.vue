<template>
      <div  style="height:100%; padding-top: 90px; background-color: #fafafa;">        
        <div style="margin-left: 5%; border-radius: 10px;margin-right: 5%;  ">
            <div class="d-flex bd-highlight mb-3 border-bottom">
                <div class="p-2 bd-highlight"><h5>{{this.project.name}}</h5>  </div>
                
                <div class="ml-auto p-2 bd-highlight">
                    <small style="fontSize:12px" class="text-muted">Última actualización hace 3 min.  </small>
                    <b-badge v-if="project.is_demo" squared variant="warning">DEMO</b-badge>                    
                    <b-badge v-if="isAdmin" variant="success" squared>PROPIETARIO</b-badge>
                    <b-badge v-if="!project.is_demo && !isAdmin" variant="success" squared>PROPIETARIO</b-badge>

                </div>
            </div>    
        </div>
        <div style="height: 100%; margin-left: 5%;border-radius: 10px;margin-right: 5%;  ">
            <b-card no-body>
                <b-tabs size="sm" content-class="mt-3" justified>
                <b-tab class="text-center" style="height: 100%;background-color:;" title="Proyecto" active>
                    <div class="text-center">
                        <div class="text-center">                                                               
                            <b-img  src="./card_proj.png" fluid alt="Fluid image"></b-img>                               
                            <div class="text-center">
                                <b-button-group size="sm">
                                    <b-button :to="{name: 'projectMap', params: {uuid: project.uuid}}" class="mx-1 my-1" variant="success">Ver Mapa</b-button>
                                    <b-button v-if="!project.is_demo" @click="finalDeleteProject" variant="danger" class="mx-1 my-1" >Eliminar</b-button>
                                </b-button-group>
                            </div>
                            <h5>
                                Descripción
                            </h5>
                                <p>{{this.project.description}}</p>
                            </div>
                        </div>                    
                </b-tab>
                <b-tab style="background-color:white;" title="Recursos"><b-card-text>
                    <div style="padding-left: 3%; padding-right: 3%; ">                        
                        <div>                           
                            <b-card>                                
                                <b-breadcrumb v-if="project.is_demo">                                    
                                    <b-breadcrumb-item target="_blank" href="demo-recurso.pdf">{{projectName}}/ Demo-recurso.pdf</b-breadcrumb-item>
                                </b-breadcrumb>                                

                                <b-button v-if="!project.is_demo" v-b-toggle.collapse-1-inner size="sm">+ Agregar recurso</b-button>
                                <b-collapse id="collapse-1-inner" class="mt-2">
                                    <b-card>En desarrollo...</b-card>
                                </b-collapse>
                            </b-card>                            
                        </div>
                        <div v-if="project.is_demo" class="accordion" role="tablist">
                            <b-card no-body class="mb-1">
                            <b-card-header header-tag="header" class="p-1" role="tab">
                                <b-button class="text-left" block v-b-toggle.accordion-1 squared variant="outline-secondary">Capa Maiz.geotiff</b-button>
                            </b-card-header>
                            <b-collapse id="accordion-1"  accordion="my-accordion" role="tabpanel">
                                <b-card-body>
                                <b-card-text>La capa con nombre <code>Maiz.geotiff</code> no está disponible para descarga</b-card-text>
                                <b-card-text>{{ text }}</b-card-text>
                                </b-card-body>
                            </b-collapse>
                            </b-card>
                            </div>

                    
                   </div>
                </b-card-text></b-tab>

                <b-tab v-if="!project.is_demo" style="background-color:white;" title="Configuración">
                    <div style="padding-left: 3%; padding-right: 3%; ">
                        <b-card-text>Configuración del proyecto</b-card-text>
                    </div> 
                </b-tab>
                
                </b-tabs>
            </b-card>
        </div>
            
    </div>

</template>

<script>
import forceLogin from './mixins/force_login';
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
            return this.project.name + (this.project.is_demo ? " (DEMO)" : "");
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
                        }).then(() => this.$emit("delete-confirmed"))
                        .then(() => this.$router.push("/projects"))
                        .catch(() => {
                            this.$bvToast.toast('Error al eliminar el proyecto', {
                                title: "Error",
                                autoHideDelay: 3000,
                                variant: "danger",
                            });
                        });
                });
        },
        
    },
    props: {
        project: { type: Object },
        deleted: { type: Boolean, default: false }
    },
    mixins: [forceLogin] // forceLogin not required, this will only be instantiated from page components
}
</script>
