<template>
    <b-container style="padding-top:100px;">
        <b-card class="text-center" style="max-width:80rem;" title="Recuperar Contraseña">
            <p>Recuerde usar el correo vinculado a su cuenta de Agrins.</p>            
            <b-alert v-if="error" show variant="danger">
                Error! Verifique que el correo ingresado este vinculado con una cuenta de AgroSmart.
            </b-alert>
            <b-form @submit="onSubmit">
                <b-form-group id="input-group-2" label="Email:" label-for="input-2">
                    <b-form-input id="input-2" type="email" v-model="form.email" required placeholder="E-mail para enviar notificaciones"></b-form-input>
                </b-form-group>
                <b-container>
                    <b-row align-h="center">
                        <b-col cols="5" class="text-center">
                            <b-button @click="goBack" style="padding-top:0%; padding-bottom:0%" pill variant="secondary">Cancelar</b-button>
                            
                        </b-col>
                        <b-col cols="5" class="text-center">
                            <b-button type="submit" pill variant="info" style="padding-top:0%; padding-bottom:0%">  Enviar  </b-button>
                        </b-col>
                    </b-row>
                </b-container>
            </b-form>
        </b-card>
    </b-container>    
</template>>

<script>
import axios from "axios";

export default {
    data() {
        return {
            form: {
                email: '',
            },
            error: false
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            axios.post("api/password_reset/", {
                    "email": this.form.email,
                })
                .then(() => this.goBack())
                .catch(error => {
                    this.error = error.response ? this.errorToLines(error.response.data) : error;
                });
        },
        goBack() {
            this.$router.go(-1);
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