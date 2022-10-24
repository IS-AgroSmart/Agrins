<template>
    <div>
        <b-navbar id="NavMainTop" toggleable="lg" placement="sticky-top" class="border-bottom">
            <b-navbar-brand v-if="isLoggedIn" style="margin-left:3%;margin-top: 0%;margin-bottom: 0%;">
                <img height="60" width="200" src="../assets/logoB.png" class="d-inline-block align-top" alt="Agrins">                
            </b-navbar-brand>
            <b-navbar-brand v-if="!isLoggedIn" to="/" style="margin-left:3%; margin-top: 0%; margin-bottom: 0%;">
                <img height="60" width="200" src="../assets/logoB.png" class="d-inline-block align-top" alt="Agrins">                
            </b-navbar-brand>    
            <b-navbar-toggle sticky target="nav-collapse"></b-navbar-toggle>
    
            <b-collapse id="nav-collapse" is-nav>
                <div v-if="isLoggedIn" class="ml-auto" style="padding-top:25px ; ">
                    <b-navbar-nav>
                        <b-nav-item to="/admin" data-cy="navbar-dashboard"><p class="text-info">Dashboard</p></b-nav-item>
                        <b-nav-item to="/projects"><p class="text-info">Proyectos</p></b-nav-item>
                        <b-nav-item v-if="isAdmin" data-cy="navbar-grupos"><p class="text-info">Grupos</p></b-nav-item>
                        <b-nav-item v-if="isAdmin" data-cy="navbar-usuarios" ><p class="text-info">Usuarios</p></b-nav-item>
                        <b-nav-item to="/admin">Administracións</b-nav-item>
                        <b-nav-item to="/profile"><p class="text-info">Perfil</p></b-nav-item>
                    </b-navbar-nav>
                </div>
                <div v-else class="ml-auto" style="padding-top:25px margin-bottom:0%; color: blue;">
                    <b-navbar-nav tabs>
                            <b-nav-item v-if="!hide" to="/" @click="scroll('inicio')" text><p class="text-info">Inicio</p></b-nav-item>
                            <b-nav-item v-if="!hide" to="/" @click="scroll('servicios')" text ><p class="text-info">Servicios</p></b-nav-item>
                            <b-nav-item v-if="!hide" to="/" @click="scroll('quienes')" text><p class="text-info">¿Quienes Somos?</p></b-nav-item>
                            <b-nav-item v-if="!hide" to="/" @click="scroll('contacto')" text><p class="text-info">Contacto</p> </b-nav-item>
                    </b-navbar-nav>
                </div>
                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto" style="margin-right: 4%;">
                    <div v-if="isLoggedIn" style="padding-bottom:20px;">
                        <b-navbar-nav > 
                            <b-nav-item v-if="isAdmin">
                                <b-icon-chat-dots-fill variant="info"/>
                            </b-nav-item> 
                            <b-nav-item >
                                <b-button to="/logout" pill variant="outline-secondary" style="padding-top:0%; padding-bottom:0%">
                                    <b-icon-x-circle-fill scale="0.8" />Salir
                                </b-button>
                            </b-nav-item>
                        </b-navbar-nav>
                    </div>
                    <div v-else style="padding-bottom:20px ; ">
                        <b-navbar-nav> 
                            <b-nav-item>
                                <b-icon-twitter variant="info"/>
                            </b-nav-item> 
                            <b-nav-item>
                                <b-icon-facebook variant="info"/>
                            </b-nav-item >  
                                <b-nav-item  v-if="!hide" to="signup" class="d-flex align-items-top" ><p class="text-info">Registrarse</p></b-nav-item>                        
                            <b-nav-item v-if="!hide" class="d-flex align-items-start"  style="padding: 3px;" data-cy="navbar-login">
                                <b-button size="sm" to="/login"  pill variant="info" style="padding-top:0%; padding-bottom:0%">Iniciar Sesión</b-button>
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
import { BIconChatDotsFill } from 'bootstrap-vue';
import { BIconXCircleFill } from 'bootstrap-vue';


export default {
    components: {
    BIconFacebook,
    BIconTwitter,
    BIconChatDotsFill,
    BIconXCircleFill
},
    data: function() {
        return {

        };
    },
    computed: {
        isLoggedIn() { return this.storage.token != ""; },
        isAdmin() { return this.storage.loggedInUser != null && this.storage.loggedInUser.type == "ADMIN"; },
        hide () { return this.$route.path == '/login' || this.$route.path == '/signup' || this.$route.path == '/signUp' || this.$route.path =='/restorePassword'; }
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

#NavMainTop{
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