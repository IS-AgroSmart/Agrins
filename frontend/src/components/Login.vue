<template>
    <div class="custom-jumbotron">
        <div >
            <b-container style="padding-top:100px; display:flex; justify-content: flex-end;">
                <b-card class="text-center" style="max-width: 25rem;" title="Bienvenido">
                    <p>Inicie sesión para tener acceso a su cuenta</p>
                    <div class="text-left" >
                        <b-alert v-if="error" show variant="danger" data-cy="alert">
                            Error! Usuario o contraseña incorrectos
                        </b-alert>
                        <b-form @submit="onSubmit">
                            <b-form-group id="input-group-1" label="Email:" label-for="input-1">
                                <b-form-input id="input-1" v-model="form.username" type="email" required placeholder="Email" data-cy="username"></b-form-input>
                            </b-form-group>
                    
                            <b-form-group id="input-group-2" label="Contraseña:" label-for="input-2">
                                <b-form-input id="input-2" type="password" v-model="form.password" required placeholder="Contraseña" data-cy="password"></b-form-input>
                            </b-form-group>

                            <b-form-group id="input-group-3" >
                                <b-row>
                                    <b-col><b-form-checkbox value="me">Recordarme</b-form-checkbox></b-col>
                                    <b-col class="text-right"><b-link to="restorePassword" >Olvidó su contraseña?</b-link></b-col>
                                </b-row>
                            </b-form-group>
                            
                            <b-container>
                                <b-row align-h="center">                        
                                        <b-button class="d-flex align-items-start" pill variant="info" style="padding-top:0%; padding-bottom:0%" type="submit" data-cy="login">Iniciar sesión</b-button>
                                </b-row>
                                <b-row style="padding-top:5%;" align-h="center">
                                    <p>No tiene cuenta?  <b-link to="signUp">Registrarse</b-link></p>    
                                </b-row>
                            </b-container>
                        </b-form>
                    </div>
                </b-card>
            </b-container>
        </div>
    </div>
</template>

<script>

import axios from "axios";
import { getUserInfo } from "../api/users"
export default {
    data() {
        return {
            form: {
                username: '',
                password: '',
            },
            error: false
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            axios.post("api/api-auth", {
                    "username": this.form.username,
                    "password": this.form.password
                })
                .then((tokenResponse) => {
                    this.storage.token = tokenResponse.data.token;
                    return getUserInfo(this.storage.token, this.form.username);
                }).then(([user, err]) => {
                    if (err != null) {
                        this.error = err;
                    } else {
                        this.storage.loggedInUser = user;
                        this.$router.back();
                    }
                })
                .catch(error => this.error = error);
        },
    }
}
</script>
<style scoped>
.custom-jumbotron {
    background: url('/login.jpg') no-repeat center center fixed;
  -webkit-background-size: 100% 100%;
  -moz-background-size: 100% 100%;
  -o-background-size: 100% 100%;
  background-size: 100% 100%;
  height: 100%;
  width: 100%;
  
}

</style>