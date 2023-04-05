<template>
    <div style="height:100%; padding-top: 90px; background-color: #fafafa;">
            <div >
                <b-card style=" margin-left: 5%; margin-right: 5%; padding: 1%; border-radius: 10px; background-color: #e9f2f2;" no-body class="border" >
                    <user-dashboard />
                </b-card>
            </div>
            <div style="margin-top:1% ">
                <b-card style=" margin-left: 5%; margin-right: 5%; padding: 1%; border-radius: 10px; background-color: #e9f2f2 ;" no-body class="border" >
                    <project-dashboard />
                </b-card>
            </div>

    


    
</div>
</template>

<script>
import axios from "axios";
import UserDashboard from './UserDashboard'
import ProjectDashboard from "./ProjectDashboard";


export default {
    components: {         
        UserDashboard,
        ProjectDashboard
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