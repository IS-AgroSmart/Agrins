<template>
    <div class="pt-3" style="padding-left:15px; padding-right:15px;">
        <b-alert v-if="error" show variant="danger">
            Error al cambiar contraseña: las contraseñas no coindicen o no se cumplen las condiciones requeridas
        </b-alert>
        <b-form @submit="onSubmit">
                <b-form-group id="input-group-5" label="Nueva Contraseña:" size="sm" label-for="input-5">
                <b-input-group>
                    <b-form-input  id="input-5" v-if="showPassword" type="text" size="sm" :state="passwordState" v-model="form.password" required placeholder="Nueva Contraseña" data-cy="password"></b-form-input>
                    <b-form-input  id="input-5" v-if="!showPassword" type="password" size="sm" :state="passwordState" v-model="form.password" required placeholder="Nueva Contraseña" data-cy="password"></b-form-input>
                        <b-form-invalid-feedback id="input-live-feedback3">
                            Escriba una contraseña de al menos 8 caracteres
                        </b-form-invalid-feedback>
                        <b-input-group-append>
                            <b-button size="sm" variant="secondary" @click="showPassword = !showPassword">
                                <b-icon-eye-fill v-show="showPassword" />
                                <b-icon-eye-slash-fill v-show="!showPassword" />                                        
                            </b-button>                                
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>


                <b-form-group id="input-group-6" label="Repetir Contraseña Nueva:" label-for="input-6">
                    <b-input-group>
                        <b-form-input  id="input-6" v-if="showPassword1" type="text" size="sm" :state="confirmpasswordState" v-model="form.confirmpassword" required placeholder="Contraseña" data-cy="password"></b-form-input>
                            <b-form-input  id="input-6" v-if="!showPassword1" type="password" size="sm" :state="passwordRepeatedState" v-model="form.repeatedPassword" required placeholder="Contraseña" data-cy="password"></b-form-input>
                            <b-form-invalid-feedback id="input-live-feedback4">
                                Las contraseñas no coinciden
                            </b-form-invalid-feedback>
                            <b-input-group-append>
                                <b-button size="sm" variant="secondary" @click="showPassword1 = !showPassword1">
                                    <b-icon-eye-fill v-show="showPassword1" />
                                    <b-icon-eye-slash-fill v-show="!showPassword1" />                                        
                                </b-button>                                
                            </b-input-group-append>
                        </b-input-group>
                </b-form-group>

    
            <b-container>
                <b-row align-h="center" style="padding-bottom: 3%;">
                    <b-col cols="5" class="text-center">
                        <b-button style="padding-top:0%; padding-bottom:0%" @click="goToProfile" pill variant="danger">Cancelar</b-button>
                    </b-col>
                    <b-col cols="5" class="text-center">
                        <b-button style="padding-top:0%; padding-bottom:0%" type="submit" pill variant="info">Aceptar</b-button>
                    </b-col>
                    
                </b-row>
            </b-container>
        </b-form>
    </div>
</template>

<script>
import axios from "axios";
import { BIconEyeFill } from 'bootstrap-vue';
import { BIconEyeSlashFill } from 'bootstrap-vue';

export default {
    components:{
        BIconEyeFill,
        BIconEyeSlashFill,
    },
    data() {
        return {
            form: {
                password: '',
                repeatedPassword: '',
            },
            error: false,
            errorConfirmation: false,
            showPassword: false,
            showPassword1: false,
        }
    },
    computed: {
        passwordState() {
            if (this.form.password.length == 0) return null;
            return this.form.password.length >= 8;
        },
        passwordRepeatedState() {
            if (this.form.repeatedPassword.length == 0) return null;
            return this.form.password == this.form.repeatedPassword;
        },
    },
    methods: {
        onSubmit(evt) {
            if (this.form.password != this.form.repeatedPassword || this.form.password.length < 8) {
                this.error = true;
            } else {
                evt.preventDefault()
                axios.post("api/users/" + this.storage.loggedInUser.pk + "/set_password/", {
                        "password": this.form.repeatedPassword,
                    }, { headers: { "Authorization": "Token " + this.storage.token } })
                    .then(() => this.goToProfile())
                    .catch(error => this.error = error.response ? this.errorToLines(error.response.data) : error);
            }
        },
        goToProfile() {
            this.form.password = '';
            this.form.repeatedPassword = '';
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