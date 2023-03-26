<template>
   <tr>           
        <td> {{projectName}} </td>
        <td> {{dateProject }} </td>
        <td> <b-badge v-if="project.is_demo" squared variant="warning">DEMO</b-badge>                    
            <b-badge v-if="isAdmin" variant="success" squared>PROPIETARIO</b-badge>
            <b-badge v-if="!project.is_demo && !isAdmin" variant="success" squared>PROPIETARIO</b-badge> 
        </td>                        
        <td><b-button @click="viewProject()" size="sm" variant="outline-primary" >Abrir</b-button></td> 
    </tr>    
</template>

<script>


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
