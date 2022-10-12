<template>
    <div>
        <b-navbar toggleable="lg" fixed="top" sticky style="margin-top: 0;margin-bottom: 0; padding-top: 0;padding-bottom: 0; background-color:#ffffff;" >
            <b-navbar-brand to="/" style="margin-left:3%;">
                <img height="75" width="250" src="../assets/logo.png" class="d-inline-block align-top" alt="Agrins">                
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
                        <b-navbar-nav>                            
                            <b-nav-item class="d-flex align-items-end" >Inicio</b-nav-item>
                            <b-nav-item class="d-flex align-items-end" >Servicios</b-nav-item>
                            <b-nav-item class="d-flex align-items-end" >¿Quienes Somos?</b-nav-item>
                            <b-nav-item class="d-flex align-items-end" >Contacto</b-nav-item>
                            <b-nav-item>
                                <b-icon variant="info" icon="whatsapp"></b-icon> 
                            </b-nav-item> 
                            <b-nav-item>
                                <b-icon variant="info" icon="twitter"></b-icon>
                            </b-nav-item> 
                            <b-nav-item>
                                <b-icon variant="info" icon="facebook"></b-icon> 
                            </b-nav-item>                            
                            <b-nav-item to="signup" class="d-flex align-items-top" >Registrarse</b-nav-item>                        
                            <b-nav-item class="d-flex align-items-start" to="/login" style="padding: 3px;" data-cy="navbar-login">
                                <b-button  class="d-flex align-items-start" pill variant="info" style="padding-top:0%; padding-bottom:0%">Iniciar Sesión</b-button>
                            </b-nav-item>
                        </b-navbar-nav>
                    </div>
    
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
export default {
    data: function() {
        return {

        };
    },
    computed: {
        isLoggedIn() { return this.storage.token != ""; },
        isAdmin() { return this.storage.loggedInUser != null && this.storage.loggedInUser.type == "ADMIN"; },
    },
}
</script>