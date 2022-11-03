<template>
    <div  style="height:100%; padding-top: 90px; background-color: #fafafa;">        
        <div style="margin-left: 5%;border-radius: 10px;margin-right: 5%;  ">
            <div class="d-flex bd-highlight mb-3 border-bottom">
                <div class="p-2 bd-highlight"><h5>Proyectos eliminados</h5>  </div>
            </div>
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
            <div class="row">
                <project-partial v-for="project in projects" :project="project" :key="project.uuid" deleted @delete-confirmed="updateProjects"  @restore-confirmed="updateProjects"></project-partial>
            </div>
            <b-alert v-if="noProjects" variant="info" show>No tiene proyectos eliminados</b-alert>
        </b-skeleton-wrapper>
    </div></div>
</template>

<script>
import axios from 'axios';
import ProjectPartial from './ProjectPartial'
import forceLogin from './mixins/force_login'

export default {
    data() {
        return {
            projects: [],
            error: "",
            loading: true,
        }
    },
    computed: {
        noProjects() {
            return this.projects.length == 0;
        }
    },
    methods: {
        updateProjects() {
            return axios
                .get('api/projects/deleted', {
                    headers: Object.assign({ "Authorization": "Token " + this.storage.token }, this.storage.otherUserPk ? { TARGETUSER: this.storage.otherUserPk.pk } : {}),
                })
                .then(response => this.projects = response.data)
                .then(() => this.$router.push("/projects"))
                .catch(error => this.error = error);
        },
    },
    created() {
        this.updateProjects().then(() => this.loading = false);
    },
    components: { ProjectPartial },
    mixins: [forceLogin]
}
</script>