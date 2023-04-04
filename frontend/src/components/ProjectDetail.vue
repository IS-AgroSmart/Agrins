<template>
      <div  style="height:100%; padding-top: 90px; background-color: #fafafa;">                        
        <div style="height: 100%; margin-left: 5%;border-radius: 10px;margin-right: 5%; background-color:white;">
            
            <b-row >
                <b-col cols="12" md="5" >
                    <b-row>
                        <div style="margin-left: 10%; " class="p-2 bd-highlight"><h5>{{this.project.name}}</h5>  </div>
                    </b-row>               
                    <div style="padding-left: 10%; margin-right: 1%; font-size: 12px;">
                        <b-badge v-if="project.is_demo" squared variant="warning">DEMO</b-badge>                                                
                        <b-badge v-if="this.project.user == this.storage.loggedInUser.pk" variant="success" squared>PROPIETARIO</b-badge>                                    
                        <b-badge pill variant="light">Tamaño: {{(this.project.used_space/1024).toFixed(2)}}MB</b-badge>
                        <div><small style="fontSize:12px" class="text-muted">  Última actualización {{dateProject}}.  </small></div>
                    </div>
                    <div class="accordion" style="padding-left: 10%; margin-right: 5%; font-size: 12px;">
                        <b-card no-body class="mb-1">
                            <b-card-header header-tag="header" style="background-color: white; font-size: 12px;" class="p-1" role="tab">                    
                                <b-button   size="sm" variant="link" v-b-toggle.accordion-3 >Descripción</b-button>                                                
                            </b-card-header>
                            <b-collapse id="accordion-3"  accordion="my-accordion" role="tabpanel">
                                <b-card-body>                                    
                                    <b-card-text>
                                        <p>{{this.project.description}}</p>
                                    </b-card-text>                                                                                                 
                                </b-card-body>
                            </b-collapse>
                        </b-card>

                        
                        <b-card no-body class="mb-1">
                            <b-card-header header-tag="header" style="background-color: white; font-size: 10px;" class="p-1" role="tab">                    
                                <b-button   size="sm" variant="link" v-b-toggle.accordion-1 >Documentos</b-button>                                                
                            </b-card-header>
                            <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
                                <b-list-group style="margin:1%">
                                    <b-list-group-item variant="success" v-for="(res) in resources" :key="res" style="font-size: 10px;" >                                        
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1"><b-img v-b-popover.hover.top="res.description" v-bind:src="getImage(res.extension)" width="18" height="18" fluid alt="Fluid image"></b-img> {{res.title}}</h6>
                                            <small>
                                                <b-button style="color: #13620f;" v-b-tooltip.hover title="Descargar" @click="downloadResource(res.pk,res.extension,res.title)" size="sm" variant="link">
                                                    <b-icon-cloud-download-fill />
                                                </b-button>
                                                <b-button style="color: #bd0000;" @click="deleteResources(res.pk)" v-b-tooltip.hover title="Eliminar" v-if="!project.is_demo" size="sm"  variant="link"><b-icon-trash-fill /></b-button> 
                                                
                                            </small>                                                    
                                        </div>
                                    </b-list-group-item>
                                </b-list-group>
                            </b-collapse>
                        </b-card>

                        <b-card v-if="!project.is_demo" no-body class="mb-1">
                            <b-card-header header-tag="header" style="background-color: white; font-size: 12px;" class="p-1" >
                                <b-button   size="sm" variant="link" v-b-toggle.accordion-2 >Capas</b-button>
                            </b-card-header>
                            <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
                                <b-list-group style="margin:1%">
                                    <b-list-group-item  variant="light"  v-for="(lay) in layers" :key="lay" style="font-size: 10px;" >                                        
                                        <b-card-header  header-tag="header" style="background-color: white; font-size: 12px;" class="p-1" >
                                            <b-button v-b-popover.hover.top=getText(lay.type)  size="sm" variant="link" v-b-toggle="'accordion'+lay.pk" ><b-icon-layers-fill/>  {{lay.title}}</b-button>
                                        </b-card-header>
                                        <b-collapse v-if="lay.type === 'IMAGE'" :id="'accordion'+lay.pk"  :accordion="'accordion'+lay.pk" role="tabpanel">
                                            <b-list-group style="margin:1%">
                                                <b-list-group-item variant="info" v-for="(art) in lay.artifacts" :key="art" style="font-size: 10px;" >                                        
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h6 v-b-popover.hover.top=getText(art.type) class="mb-1"><b-icon-layers-half/> {{art.title}}</h6>
                                                        <small>
                                                            <b-button style="color: #13620f;" v-b-tooltip.hover title="Descargar" @click="downloadLayer(art.pk,art.title)" size="sm" variant="link">
                                                                <b-icon-cloud-download-fill/>
                                                            </b-button>                                                
                                                            
                                                        </small>                                                    
                                                    </div>
                                                </b-list-group-item>
                                            </b-list-group>
                                        </b-collapse>
                                    </b-list-group-item>
                                </b-list-group>
                            </b-collapse>
                        </b-card>
                        </div>

                    <b-row>
                    </b-row>
                </b-col>

                <b-col  cols="12" md="7">    
                    <div style="padding-top: 2%; align-items: center; justify-content: center; display: flex;" class="text-center;">
                        <b-button-toolbar  v-if="canCreateProjects" >                            
                            <b-button-group size="sm" class="mr-1">
                                <b-button  v-b-tooltip.hover title="Abrir en Geoportal" size="sm" :to="{name: 'projectMap', params: {uuid: project.uuid}}" variant="success"><b-icon-map-fill/>  Ver Mapa</b-button>
                                <b-button  v-b-tooltip.hover title="Hacer DEMO" v-if="!project.is_demo && isAdmin" @click="onProjectClick" variant="warning" size="sm"><b-icon-briefcase-fill/> Demo</b-button>
                                <b-button  v-b-tooltip.hover title="Deshacer DEMO" v-if="project.is_demo && isAdmin" @click="onDemoProjectClick" variant="warning" size="sm"> <b-icon-briefcase-fill/> Demo</b-button> 
                                <div v-if="!project.is_demo" class="">
                                        <add-new-resource  v-on:loadResources="loadResources"/>
                                </div>    
                            </b-button-group >                            
                            <b-button-group size="sm" >
                                
                                <b-button  v-b-tooltip.hover title="Enviar a papelera" size="sm" v-if="this.project.user == this.storage.loggedInUser.pk" @click="finalDeleteProject" variant="danger"><b-icon-trash2/></b-button>
                                <!--<b-button  v-b-tooltip.hover title="Editar proyecto" size="sm" v-if="this.project.user == this.storage.loggedInUser.pk" ><b-icon-pencil-fill/> </b-button>   -->
                            </b-button-group>
                        </b-button-toolbar>
                        <b-card-text v-else>
                            <small class="text-muted">{{ unableReason }}</small>
                        </b-card-text>  
                    </div>                
                    <div style="padding-top: 2%; padding-left: 10%; padding-right: 18%; padding-bottom: 10%;">
                        <b-card style="padding-left: 5%; border: none; padding-right: 5%;" img.left v-bind:img-src="project.wallpaper" img-alt="Card Image" class="text-center" >
                        </b-card>
                    </div>                    
                </b-col>
                
            </b-row>           

        </div>
            
    </div>

</template>

<script>
import forceLogin from './mixins/force_login';
import axios from 'axios';
import AddNewResource from './AddNewResource';
import { BIconTrash2 } from 'bootstrap-vue';
//import { BIconPencilFill } from 'bootstrap-vue';
import { BIconMapFill } from 'bootstrap-vue';
import { BIconBriefcaseFill } from 'bootstrap-vue';
import { BIconCloudDownloadFill } from 'bootstrap-vue';
import { BIconLayersFill } from 'bootstrap-vue';
import { BIconLayersHalf } from 'bootstrap-vue';

export default {
    data() {
        return {
            resources: [],
            artifacts: [],
            layers: [],
            loading: true,
            project: []

        };
    },
    computed: {
        mapper_url() {            
            return "/mapper/" + this.project.uuid;
        },
        projectName() {
            return this.project.name + (this.project.is_demo ? " (DEMO)" : "");
        },
        dateProject(){
            return (new Date(this.project.date_update).toLocaleDateString('es-ES'))
        },
        isAdmin() { return this.storage.loggedInUser != null && this.storage.loggedInUser.type == "ADMIN"; },
        getResources(){
            var resources=[]
            for (let r of this.project.resources){
                
                var dataf={'pk':r, 'title':r, 'description':r, 'extension':'pdf'}
                resources.push(dataf);
            }
            return resources
        },
        getLayers(){
            var layers=[]
            for (let r of this.project.layers){
                
                var dataf={'pk':r, 'title':r, 'type':r, 'extension':'pdf'}
                layers.push(dataf);
            }
            return layers
        },
        targetUser: function() {
            // returns this.storage.otherUserPk. If it's null, it falls back to this.storage.loggedInUser
            return this.storage.otherUserPk || this.storage.loggedInUser;
        },
        canCreateProjects: function() { return this.unableReason == "" },
        unableReason: function() {
            if (this.targetUser.used_space >= this.targetUser.maximum_space)
                return "Su almacenamiento está lleno.";
            else if (!(["ACTIVE","ADVANCED", "ADMIN"].includes(this.targetUser.type)))
                return "Póngase en contacto con Agrins para activar su cuenta.";
            return "";
        }
        
        
    },
   
    methods: {                    
        getText(value){
            var dicc= {'IMAGE':'Imagen','VECTOR':'Para descargar capa vector ingrese al geoportal', 'MULTIESPECTRAL':'Imagen multiespectral', 'INDEX':'Índice de vegetación', 'MODEL':'Modelo deeplearning', 'SHAPEFILE':"Shapefile", 'KML': 'Kml' }
            return dicc[value];
        },
        getImage(img){                
            return img+'.png'
        },  
        downloadResource(pk,extension,file){    
            this.$bvToast.toast('La descarga ha comenzado', {title: 'Descarga',variant: 'primary',solid: true})
            axios.get('api/download/'+pk+'/resource', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                    responseType: 'blob' ,
                }).then((response) => {
                    const blob = new Blob([response.data], { type: 'application/'+extension })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = file+'.'+extension
                    link.click()                    
                    URL.revokeObjectURL(link.href)
                    this.$bvToast.toast('Descarga finalizada', {title: 'Descarga',variant: 'success',solid: true})                    
                })
                .catch(error => this.$bvToast.toast(error, {title: 'Error',variant: 'danger',solid: true}))

        },
        downloadLayer(pk,file){
            this.$bvToast.toast('La descarga ha comenzado', {title: 'Descarga',variant: 'primary',solid: true})
            axios.get('api/download/'+pk+'/layer', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                    responseType: 'blob' ,
                }).then((response) => {
                    const blob = new Blob([response.data], { type: 'application/tiff' })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = file+'.tiff'
                    link.click()                    
                    URL.revokeObjectURL(link.href)
                    this.$bvToast.toast('Descarga finalizada', {title: 'Descarga',variant: 'success',solid: true})                    
                })
                .catch(error => this.$bvToast.toast(error, {title: 'Error',variant: 'danger',solid: true}))

        },   
        finalDeleteProject() {
            this.$bvModal.msgBoxConfirm('El proyecto ya no estará diponible y para eliminar definitivamente o recuperar lo puede hacer desde la sección proyectos eliminados.', {
                    title: '¿Desea enviar el proyecto  a la papelera?',
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
        onProjectClick() {
            this.$bvModal.msgBoxConfirm('Advertencia al convertir '+this.projectName+' en DEMO compartirá la información con todos los usuarios de la plataforma. ¿Desea continuar?.', {
                    title: '¿Convertir en DEMO?',
                    okVariant: 'danger',
                    okTitle: 'Sí',
                    cancelTitle: 'No',
                })
                .then(value => {
                    if (value){
                        axios.post('api/projects/' + this.project.uuid + '/make_demo/', {}, {
                            headers: { "Authorization": "Token " + this.storage.token }
                        })
                        .then(() => {
                            this.$router.push("/projects");
                        })
                        .catch(() => {
                            this.$bvToast.toast('Error al convertir proyecto a demo', {
                                title: "Error",
                                autoHideDelay: 3000,
                                variant: "danger",
                            });
                        });
                    }
                });            
        },
        onDemoProjectClick() {
            this.$bvModal.msgBoxConfirm('Advertencia al deshacer '+this.projectName+' los usuarios no podrán ver la información del proyecto. ¿Desea continuar?.', {
                    title: 'Deshacer DEMO',
                    okVariant: 'danger',
                    okTitle: 'Sí',
                    cancelTitle: 'No',
                })
                .then(value => {
                    if (value){
                        axios.delete('api/projects/' + this.project.uuid + '/delete_demo/', {
                            headers: { "Authorization": "Token " + this.storage.token }
                        })
                        .then(() => {
                            this.$router.push("/projects");
                        })
                        .catch(() => {
                            this.$bvToast.toast('Error al eliminar el proyecto demo', {
                                title: "Error",
                                autoHideDelay: 3000,
                                variant: "danger",
                            });
                        });
                    }
                });
            
        },
        loadResources() {
            this.resources = []
            this.layers = []            
            axios.get('api/projects/' + this.$route.params.uuid , {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(response => {
                    this.project = response.data                    
                    for (let res of this.project.resources){
                        axios.get('api/resources/' + res , {
                            headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                        })
                        .then(response => this.resources.push(response.data))
                        .catch(error => this.error = error);
                    }            
                    for (let res of this.project.layers){
                        axios.get('api/layers/' + res , {
                            headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                        })
                        .then(response => this.layers.push(response.data))
                        .catch(error => this.error = error);
                    }
                
                })
                        
        },
        deleteResources(pk) {
            this.$bvModal.msgBoxConfirm('Eliminar Documento es un proceso irreversible, ¿Desea continuar?.', {
                    title: 'Eliminar documento',
                    okVariant: 'danger',
                    okTitle: 'Sí',
                    cancelTitle: 'No',
                })
                .then(value => {
                    if (value){
                        axios.delete('api/resources/' + pk , {
                            headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                        })
                        .then(() => this.$emit("delete-confirmed"))
                        .then(() => this.loadResources())
                        .catch(() => {
                            this.$bvToast.toast('Error al eliminar documento', {
                                title: "Error",
                                autoHideDelay: 3000,
                                variant: "danger",
                            });
                        });
                    }
                });
        },
    },
    created() {
        this.loadResources().then(() => this.loading = false);               
        
        
    },
    props: {
        //project: { type: Object },
        //deleted: { type: Boolean, default: false }
    },
    components: { 
        AddNewResource,        
        BIconTrash2,
        //BIconPencilFill,
        BIconMapFill,
        BIconBriefcaseFill,
        BIconCloudDownloadFill,
        BIconLayersFill,
        BIconLayersHalf
    },
    mixins: [forceLogin] // forceLogin not required, this will only be instantiated from page components
}
</script>
