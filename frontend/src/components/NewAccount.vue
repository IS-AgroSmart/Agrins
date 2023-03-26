<template>
    <div style="background-color: #fafafa; padding-top: 80px;">
    <div class=" pt-3 text-center " style="background-color: white;  padding-left:10%; padding-right:10%;">
        <b-alert v-if="success" show variant="success">
            <h4 class="alert-heading">Cuenta Activada!</h4>
            <p>
            Su cuenta de Agrins ha sido activada 
            <b-button @click="goToLogin" size="sm" pill variant="link" >Iniciar sesión.</b-button>
            </p>
            <hr>
            <p class="mb-0">
            Ir al portal Agrins 
            <b-button @click="goToStart" size="sm" pill variant="link" >Inicio.</b-button>
            </p>
        </b-alert>
        <h5 v-if="!success && !error" >Activar cuenta </h5>
    
        <b-alert v-if="error" show variant="danger">
            <p>Error al activar Cuenta</p>
            <span style="white-space: pre;">{{ error }}</span>
            <p><b-button @click="goToSignUp" size="sm" pill variant="primary" >Registrarse</b-button></p>
        </b-alert>
        <b-form v-if="!success && !error" @submit="onSubmit">
            <b-container style="background-color: white;  padding-left:10%; padding-right:10%;">
                <b-row align-h="center">
                        <b-button type="submit" size="sm" pill variant="success" >Activar</b-button>
                </b-row>
            </b-container>
        </b-form>
    </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {            
            error: false,
            success :false
        }
    },
    computed: {
        
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            //this.$bvToast.toast(this.$route.query.uidb64, {title: this.$route.query.token,variant: 'primary',solid: true})
            axios.post('api/activate/'+this.$route.query.uidb64+'/'+this.$route.query.token, {                    
                })
                .then(response =>  {
                    if (response.data.state){
                        this.success = response.data.msg
                    }
                    else
                        this.error = response.data.msg
                })
                .catch(error => {
                    this.error = error.response ? this.errorToLines(error.response.data) : error;
                });
                
        },        
        goToLogin() {
            this.$router.replace({ path: '/login' });
        },
        goToSignUp() {
            this.$router.replace({ path: '/signup' });
        },
        goToStart() {
            this.$router.replace({ path: '/' });
        },
        errorToLines(body) {
            var err = "";
            for (var field in body) {
                for (var error of body[field]) {
                    err += field + ": " + error + "\n";
                }
            }
            return err;
        }
    }
}
</script>