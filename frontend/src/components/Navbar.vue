<template>
    <div>
        <b-navbar toggleable="lg" placement="sticky-top" class="nav-main">
            <b-navbar-brand to="/" style="margin-left:3%;">
                <img height="60" width="200" src="../assets/logoB.png" class="d-inline-block align-top" alt="Agrins">                
            </b-navbar-brand>    
            <b-navbar-toggle sticky target="nav-collapse"></b-navbar-toggle>
    
            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav v-if="isLoggedIn">
                    <b-nav-item to="/flights" data-cy="navbar-flights">Vuelos</b-nav-item>
                    <b-nav-item to="/flights/deleted">Vuelos eliminados</b-nav-item>
                    <b-nav-item to="/projects">Proyectos</b-nav-item>
                    <b-nav-item to="/projects/deleted">Proyectos eliminados</b-nav-item>
                </b-navbar-nav>
    
                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <div v-if="isLoggedIn">
                        <b-nav-item-dropdown right>
                            <!-- Using 'button-content' slot -->
                            <template v-slot:button-content><em>Mi cuenta</em>
                            </template>
                        <b-dropdown-item to="/profile">Perfil</b-dropdown-item>
                        <b-dropdown-item v-if="isAdmin" to="/admin">Administración</b-dropdown-item>
                        <b-dropdown-item to="/logout">Cerrar sesión</b-dropdown-item>
                    </b-nav-item-dropdown>
                    </div>
                    <div v-else>
                        <b-navbar-nav >                            
                            <b-nav-item v-if="!hide" class="d-flex align-items-end" to="/" @click="scroll('inicio')" text>Inicio</b-nav-item>
                            <b-nav-item v-if="!hide" class="d-flex align-items-end" to="/" @click="scroll('servicios')" text>Servicios</b-nav-item>
                            <b-nav-item v-if="!hide" class="d-flex align-items-end" to="/" @click="scroll('quienes')" text>¿Quienes Somos?</b-nav-item>
                            <b-nav-item v-if="!hide" class="d-flex align-items-end" to="/" @click="scroll('contacto')" text>Contacto </b-nav-item>
                            <b-nav-item style="padding-top:0%; margin-top:0%">
                                
                            </b-nav-item> 
                            <b-nav-item>
                                <b-icon-twitter variant="info"/>
                            </b-nav-item> 
                            <b-nav-item>
                                <b-icon-facebook variant="info"/>
                            </b-nav-item >  
                                <b-nav-item  v-if="!hide" to="signup" class="d-flex align-items-top" >Registrarse</b-nav-item>                        
                            <b-nav-item v-if="!hide" class="d-flex align-items-start"  style="padding: 3px;" data-cy="navbar-login">
                                <b-button class="d-flex align-items-start" to="/login"  pill variant="info" style="padding-top:0%; padding-bottom:0%">Iniciar Sesión</b-button>
                            </b-nav-item>
                        </b-navbar-nav>
                    </div>
    
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
import { BIconFacebook } from 'bootstrap-vue';
import { BIconTwitter } from 'bootstrap-vue';


export default {
    components: {
    BIconFacebook,
    BIconTwitter,
},
    data: function() {
        return {

        };
    },
    computed: {
        isLoggedIn() { return this.storage.token != ""; },
        isAdmin() { return this.storage.loggedInUser != null && this.storage.loggedInUser.type == "ADMIN"; },
        hide () { return this.$route.path === '/login' || this.$route.path === '/signup' || this.$route.path ==='/restorePassword'; }
    },
    methods: {
      scroll(id) {  
      document.getElementById(id).scrollIntoView({
        behavior: "smooth"
      });
    }
    },    
}
</script>
<style scoped>
.nav-main{
    position: fixed; 
    top: 0; 
    right: 0; 
    left: 0; 
    background: white;
    opacity: 1.0;
    z-index: 1000;
    width: 100%;
    background-color:#ffffff;
    padding-bottom: 0%;
    padding-top: 0%;
    border-bottom-color: #000;
}
</style>