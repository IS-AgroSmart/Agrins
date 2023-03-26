<template>
    <div  style="height:100%; padding-top: 90px; background-color: #fafafa;">        
        <div class="d-flex mb-3 border-bottom" style="margin-left: 2%;border-radius: 10px;margin-right: 2%; ">
                <div class="p-2 "><h5>Proyectos</h5>  
                </div>
                <div class=" p-2 ">
                    <b-form-select variant="primary" class="" size = "sm" id="input-select"
                        v-model="selectGroup" :options="['Todos', 'Demo', 'Propietario']" :value="null"
                    ></b-form-select>                    
                </div>
                <div class=" p-2 " style="padding-left: 0%; margin-left: 0%;">
                    <b-button @click="block = !block" size="sm" variant="secondary" title="Vista">                        
                        <b-icon-grid-fill v-if="block === false" scale="0.8" />
                        <b-icon-list v-if="block === true" />
                    </b-button>
                </div>
                <div class="ml-auto p-2 ">
                    <add-new-project   v-on:updateProjects="updateProjects" />
                </div>
        </div>            
        <div style="margin-left: 7%;border-radius: 10px;margin-right: 7%; ">    
            <b-skeleton-wrapper :loading="loading">
                <template #loading>
                    <b-row>
                        <b-col v-for="i in 3" :key="i">
                            <b-card class="my-3">
                                <b-skeleton width="85%" height="40%"></b-skeleton>
                                <b-skeleton width="100%"></b-skeleton>
                                <b-skeleton width="100%"></b-skeleton>
                                <b-skeleton type="button"></b-skeleton>
                            </b-card>
                        </b-col>
                    </b-row>
                </template>

                <div v-if="error">Error!</div>
                <div v-if="block" class="row">
                    <project-partial v-on:updateProjects="updateProjects" v-for="project in projects.filter(filtreProject)" :project="project" :key="project.uuid" @delete-confirmed="deleted"></project-partial>
                </div>
                <div v-else class="row">
                    <div style="width: 100%;">
                        <div style="margin-left: 5%;border-radius: 10px;margin-right: 5%;  ">                      
                            <div class="table-responsive-sm">
                                <table class="table table-sm table-hover"  >
                                    <thead >
                                        <tr >
                                            <th v-for="(f,i) in  fields" :key="i">{{f}}</th>                    
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <project-partial-list v-on:updateProjects="updateProjects" v-for="project in projects.filter(filtreProject)" :project="project" :key="project.uuid" @delete-confirmed="deleted"></project-partial-list>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    </div>                   
                <b-alert v-if="noProjects" variant="info" show>Aún no ha creado ningún proyecto</b-alert>
            </b-skeleton-wrapper>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import ProjectPartial from './ProjectPartial'
import ProjectPartialList from './ProjectPartialList'
import AddNewProject from './AddNewProject'
import forceLogin from './mixins/force_login'
import { BIconGridFill } from 'bootstrap-vue';
import { BIconList } from 'bootstrap-vue';


export default {
    data() {
        return {
            fields: ['Nombre', 'Actialización', 'Tipo','Acción'],
            projects: [],
            error: "",
            loading: true,
            selectGroup: 'Todos',
            block: true
        }
    },
    computed: {
        noProjects() {
            return this.projects.length == 0;
        }
    },
    methods: {
        filtreProject(value){    
            var res = true;        
            switch (this.selectGroup) {
                case 'Demo':
                    res = value.is_demo
                    break
                case 'Propietario':
                    res = !value.is_demo
                    break
            }
            return res
        },
        updateProjects() {
            return axios
                .get('api/projects', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(response => this.projects = response.data)
                .catch(error => this.error = error);
        },
        deleted() { this.updateProjects(); },
    },
    created() {
        this.updateProjects().then(() => this.loading = false);
    },
    components: { 
        ProjectPartial, 
        ProjectPartialList, 
        AddNewProject,
        BIconGridFill,
        BIconList
    },
    mixins: [forceLogin]
}
</script>