<template>
    <div style="height:100%; padding-top: 90px; background-color: #fafafa;">
        <div style="height: 100%; margin-left: 5%;border-radius: 10px;margin-right: 5%; background-color:white;">
            <b-card style="height: 100%; width: 100%; padding: 1%;" no-body class="border-0">
                <b-tabs  pills card >
            <b-tab  disabled>
                <template #title>
                    <h5 >Administración</h5>
                </template>
                <p class="p-3">Tab contents 1</p>
                </b-tab>
                <b-tab active >
                    <template #title>
                    <h6 ><b-icon-briefcase-fill/> Proyectos</h6>
                </template>
                <p class="p-3">proyectos</p>
                </b-tab>
            <b-tab class="border-0" >
                <template #title>
                    <h6 ><b-icon-people/> Usuarios</h6>
                </template>
                <users/>
                </b-tab>
                <b-tab active >
                    <template #title>
                    <h6 ><b-icon-layers-fill/> Capas</h6>
                </template>
                <p class="p-3">Capas</p>
                </b-tab>                
                <b-tab active >
                    <template #title>
                    <h6 ><b-icon-file-earmark/> Documentos</h6>
                </template>
                <p class="p-3">Recursos</p>
                </b-tab>
            <b-tab class="border-0 md">
                <template #title>
                    <h6 ><b-icon-chat-dots/> Contacto</h6>
                </template>
                <div class="pt-3 md" style="padding-left:15px; padding-right:15px;">
        <h1>Administración</h1>
        <b-row class="my-4">
            <b-col align="center">
                <h4 class="my-2">Administración de usuarios</h4>
                <b-row class="mt-1 mb-5">
                    <b-col>
                        <b-dropdown id="dropdown" text="Solicitudes de cuenta" class="m-2">
                            <b-dropdown-item @click="onAdminClick()">Pendientes</b-dropdown-item>
                            <b-dropdown-item @click="onAdminClickRequestDeleted"> Eliminadas </b-dropdown-item>
                        </b-dropdown>
                    </b-col>
                </b-row>
                <b-row class="mt-1 mb-5 pt-3">
                    <b-col>
                        <b-dropdown id="dropdown" text="Usuarios" class="m-2">
                            <b-dropdown-item @click="onAdminClickRequestActive">Activos</b-dropdown-item>
                            <b-dropdown-item @click="onAdminClickUserDeleted()"> Eliminados </b-dropdown-item>
                            <b-dropdown-item @click="onAdminClickUserBloqueados()"> Bloqueados </b-dropdown-item>
                        </b-dropdown>
                    </b-col>
                </b-row>
                <b-row class="mt-1 mb-5 pt-3">
                    <b-col>
                        <admin-element-list-partial :elements="users" title="Emular usuario" placeholder="Buscar usuarios..." :nameFunc="userNameFunc" :filterCriteria="userFilterCriteria" keyField="pk" emptyMessage="no hay usuarios disponibles" @element-clicked="onUserClick">
                        </admin-element-list-partial>
                    </b-col>
                </b-row>
            </b-col>
            <b-col align="center">
                <h4 class="my-2">Administración de vuelos</h4>
                <b-row class="my-1">
                    <b-col>
                        <admin-element-list-partial :elements="candidateDemoFlights" title="Convertir vuelo a demo" placeholder="Buscar vuelos..." :nameFunc="flightNameFunc" :filterCriteria="flightFilterCriteria" keyField="uuid" emptyMessage="No hay vuelos disponibles" @element-clicked="onFlightClick">
                        </admin-element-list-partial>
                    </b-col>
                </b-row>
                <b-row class="my-1">
                    <b-col>
                        <admin-element-list-partial :elements="demoFlights" title="Restaurar demo a vuelo" placeholder="Buscar vuelos demo..." :nameFunc="flightNameFunc" :filterCriteria="flightFilterCriteria" keyField="uuid" emptyMessage="No hay vuelos disponibles" @element-clicked="onDemoFlightClick">
                        </admin-element-list-partial>
                    </b-col>
                </b-row>
                <h4 class="my-2">Administración de proyectos</h4>
                <b-row class="my-1">
                    <b-col>
                        <admin-element-list-partial :elements="candidateDemoProjects" title="Convertir proyecto a demo" placeholder="Buscar proyectos..." :nameFunc="projectNameFunc" :filterCriteria="projectFilterCriteria" keyField="uuid" emptyMessage="No hay proyectos disponibles" @element-clicked="onProjectClick">
                        </admin-element-list-partial>
                    </b-col>
                </b-row>
                <b-row class="my-1">
                    <b-col>
                        <admin-element-list-partial :elements="demoProjects" title="Restaurar demo a proyecto" placeholder="Buscar proyectos demo..." :nameFunc="projectNameFunc" :filterCriteria="projectFilterCriteria" keyField="uuid" emptyMessage="No hay proyectos disponibles" @element-clicked="onDemoProjectClick">
                        </admin-element-list-partial>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </div>
                </b-tab>    
            </b-tabs>
            </b-card>
        </div>

    


    
</div>
</template>

<script>
import axios from "axios";
import AdminElementListPartial from './AdminElementListPartial.vue';
import Users from './Users'
import { BIconBriefcaseFill } from 'bootstrap-vue';
import { BIconChatDots } from 'bootstrap-vue';
import { BIconPeople } from 'bootstrap-vue';
import { BIconLayersFill } from 'bootstrap-vue';
import { BIconFileEarmark } from 'bootstrap-vue';


export default {
    components: {         
        AdminElementListPartial,
        Users,
        BIconLayersFill,
        BIconFileEarmark,
        BIconBriefcaseFill,
        BIconChatDots,
        BIconPeople
    },
    data() {
        return {
            users: [],
            candidateDemoFlights: [],
            demoFlights: [],
            candidateDemoProjects: [],
            demoProjects: [],
            userNameFunc: (u) => `${u.username} (${u.email})`,
            userFilterCriteria: (u, text) => u.username.toLowerCase().indexOf(text) > -1 ||
                u.email.toLowerCase().indexOf(text) > -1,
            flightNameFunc: (f) => f.name,
            flightFilterCriteria: (f, text) => f.name.toLowerCase().indexOf(text) > -1,
            projectNameFunc: (p) => p.name,
            projectFilterCriteria: (p, text) => p.name.toLowerCase().indexOf(text) > -1,
        }
    },
    // https://bootstrap-vue.org/docs/components/form-tags#advanced-custom-rendering-usage for the live search
    computed: {},
    methods: {
        onUserClick(user) {
            this.storage.otherUserPk = user;
            this.$router.push("/flights");
        },
        onFlightClick(flight) {
            axios.post('api/flights/' + flight.uuid + '/make_demo/', {}, {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(() => this.loadFlights())
                .catch(() => {
                    this.$bvToast.toast('Error al convertir vuelo a demo', {
                        title: "Error",
                        autoHideDelay: 3000,
                        variant: "danger",
                    });
                });
        },
        onDemoFlightClick(flight) {
            axios.delete('api/flights/' + flight.uuid + '/delete_demo/', {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(() => this.loadFlights())
                .catch(() => {
                    this.$bvToast.toast('Error al eliminar el vuelo demo', {
                        title: "Error",
                        autoHideDelay: 3000,
                        variant: "danger",
                    });
                });
        },
        onProjectClick(project) {
            axios.post('api/projects/' + project.uuid + '/make_demo/', {}, {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(() => {
                    this.loadProjects();
                    this.loadFlights();
                })
                .catch(() => {
                    this.$bvToast.toast('Error al convertir proyecto a demo', {
                        title: "Error",
                        autoHideDelay: 3000,
                        variant: "danger",
                    });
                });
        },
        onDemoProjectClick(project) {
            axios.delete('api/projects/' + project.uuid + '/delete_demo/', {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(() => {
                    this.loadProjects();
                    this.loadFlights();
                })
                .catch(() => {
                    this.$bvToast.toast('Error al eliminar el proyecto demo', {
                        title: "Error",
                        autoHideDelay: 3000,
                        variant: "danger",
                    });
                });
        },
        onAdminClick() {
            this.$router.push("/admin/accountRequest")
        },
        onAdminClickRequestDeleted(){
            this.$router.push("/admin/accountRequestDeleted")
        },
        onAdminClickRequestActive(){
            this.$router.push("/admin/accountRequestActive")
        },
        onAdminClickUserDeleted(){
            this.$router.push("/admin/userDeleted")
        },
        onAdminClickUserBloqueados(){
            this.$router.push("/admin/blockCriteria")
        },
        loadUsers() {
            axios.get('api/users', {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(response => (this.users = response.data))
                .catch(error => this.error = error);
        },
        loadFlights() {
            axios.get("api/flights", {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(response => {
                    this.candidateDemoFlights = response.data.filter(f => !f.is_demo && f.state == "COMPLETE");
                    this.demoFlights = response.data.filter(f => f.is_demo);
                })
                .catch(error => this.error = error);
        },
        loadProjects() {
            axios.get("api/projects", {
                    headers: { "Authorization": "Token " + this.storage.token }
                })
                .then(response => {
                    this.candidateDemoProjects = response.data.filter(p => !p.is_demo);
                    this.demoProjects = response.data.filter(p => p.is_demo);
                })
                .catch(error => this.error = error);
        },
    },
    created() {
        this.loadUsers();
        this.loadFlights();
        this.loadProjects();
    },
    
}
</script>