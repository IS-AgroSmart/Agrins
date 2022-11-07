<template>
    <div class="custom-jumbotron">        
            <b-container style=" padding-top:100px; ">                
                <b-card class="text-center" style="max-width: 80em;" title="Registro">
                    <p>Bienvenido, ingrese la información solicitada</p>
                    <div class="text-left" >
                        <b-alert v-if="error" show variant="danger">
                            <p>Error en la creación de cuenta</p>
                            <span style="white-space: pre;">{{ error }}</span>
                        </b-alert>
                        <b-form @submit="onSubmit">                          
                                <b-row >
                                    <b-col>
                                        <b-form-group size="sm" id="input-group-1" label="Nombre:*" label-for="input-1">
                                            <b-form-input size="sm"  id="input-1" type="text" v-model="form.name" :state="nameState" required placeholder="Nombre"></b-form-input>
                                            <b-form-invalid-feedback id="input-live-feedback">
                                                El nombre no puede superar los 150 caracteres.
                                            </b-form-invalid-feedback>
                                        </b-form-group>
                                    </b-col>
                                    <b-col>
                                        <b-form-group size="sm"  id="input-group-2" label="Apellidos:*" label-for="input-2">
                                            <b-form-input size="sm"  id="input-2" type="text" v-model="form.lastname" :state="lastnameState" required placeholder="Apellidos"></b-form-input>
                                            <b-form-invalid-feedback id="input-live-feedback2">
                                                Los apellidos no puede superar los 150 caracteres.
                                            </b-form-invalid-feedback>
                                        </b-form-group>
                                        
                                    </b-col>
                                </b-row>                            
                                <b-row >
                                    <b-col>
                                        <b-form-group id="input-group-3" label="Email:*" label-for="input-3">
                                            <b-form-input size="sm"  id="input-3" type="email" v-model="form.email" required placeholder="Email"></b-form-input>
                                        </b-form-group>
                                    </b-col>
                                    <b-col>
                                        <b-form-group id="input-group-4" label="Teléfono:*" label-for="input-4">
                                            <b-form-input size="sm" id="input-4" type="tel" v-model="form.phone" :state="phoneState" required placeholder="Teléfono"></b-form-input>
                                        </b-form-group>
                                    </b-col>
                                </b-row>                            
                                <b-row >
                                    <b-col>
                                        <b-form-group id="input-group-5" label="Contraseña:*" label-for="input-5">
                                            <b-input-group>
                                                <b-form-input  id="input-5" v-if="showPassword" type="text" size="sm" :state="passwordState" v-model="form.password" required placeholder="Contraseña" data-cy="password"></b-form-input>
                                                <b-form-input  id="input-5" v-if="!showPassword" type="password" size="sm" :state="passwordState" v-model="form.password" required placeholder="Contraseña" data-cy="password"></b-form-input>
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
                                    </b-col>
                                    <b-col>
                                        <b-form-group id="input-group-6" label="Confirmar Contraseña:*" label-for="input-6">
                                            <b-input-group>
                                                <b-form-input  id="input-6" v-if="showPassword1" type="text" size="sm" :state="confirmpasswordState" v-model="form.confirmpassword" required placeholder="Contraseña" data-cy="password"></b-form-input>
                                                <b-form-input  id="input-6" v-if="!showPassword1" type="password" size="sm" :state="confirmpasswordState" v-model="form.confirmpassword" required placeholder="Contraseña" data-cy="password"></b-form-input>
                                                <b-form-invalid-feedback id="input-live-feedback4">
                                                    La contaseña debe ser igual
                                                </b-form-invalid-feedback>
                                                <b-input-group-append>
                                                    <b-button size="sm" variant="secondary" @click="showPassword1 = !showPassword1">
                                                        <b-icon-eye-fill v-show="showPassword1" />
                                                        <b-icon-eye-slash-fill v-show="!showPassword1" />                                        
                                                    </b-button>                                
                                                </b-input-group-append>
                                            </b-input-group>
                                        </b-form-group>

                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col>
                                        <b-form-group id="input-group-7" label="Profesión:*" label-for="input-7">
                                            <b-form-input size="sm"  id="input-1" type="text" v-model="form.name" :state="nameState" required ></b-form-input>
                                            <b-form-invalid-feedback id="input-live-feedback">
                                                La profesión no puede superar los 150 caracteres.
                                            </b-form-invalid-feedback>
                                        </b-form-group>
                                    </b-col>
                                    <b-col>
                                        <b-form-group id="input-group-8" label="Institución:*" label-for="input-8">
                                            <b-form-select size="sm" id="input-8" required v-model="form.institution" :options="optionsInst"></b-form-select>
                                        </b-form-group>
                                    </b-col>
                                    <b-col>
                                        <b-form-group id="input-group-9" label="Ciudad:*" label-for="input-9">
                                            <b-form-select size="sm" id="input-9" required v-model="form.city" :options="ciudadesjson"></b-form-select>
                                        </b-form-group>
                                    </b-col>
                                </b-row>                            
                                <b-row >  
                                    <b-col class="text-center">
                                        <b-form-checkbox required v-model="acept" value="true" unchecked-value="false" >Acepto los <b-link variant="info" v-b-modal.modal-scrollable>términos y condiciones</b-link></b-form-checkbox>                                    
                                                <b-modal id="modal-scrollable" ok-only scrollable title="Términos y Condiciones">
                                                <p>
Este contrato es contentivo de los términos y condiciones aplicables al uso del contenido, productos y/o servicios de la web Agrins para hacer uso del contenido, productos y/o servicios del sitio web el usuario deberá sujetarse a los presentes términos y condiciones. <br>
I. OBJETIVO Se persigue la regulación el acceso y utilización del contenido, productos y/o servicios a disposición del público en general en el dominio planteado. El titular se guarda el derecho de realizar cualquier tipo de reforma en la página en cualquier momento y sin previo aviso, al suscriptor. El acceso a la página web por parte del usuario es libre y gratuito, la utilización del contenido, productos y/o servicios no conlleva un costo para el usuario. El sitio web está dirigido a un público con enfoques agrícolas del Ecuador y se ajusta a los parámetros legales establecidos en dicho territorio. La administración del sitio web puede ejercerse por terceros, es decir, personas distintas al titular, sin afectar esto los presentes términos y condiciones. <br>
SOBRE DERECHOS DEL USUARIO<br>
La actividad del usuario en el sitio web como publicaciones o comentarios estarán sujetos a los presentes términos y condiciones. El usuario se compromete a utilizar el contenido, productos y/o servicios de forma lícita, sin faltar a la moral o al orden público. El usuario se compromete a proporcionar información verídica en los formularios del sitio web. El acceso al sitio web no supone una relación directa ni física  entre el usuario y el titular del sitio web. El usuario manifiesta ser mayor de edad y contar con la capacidad jurídica de acatar los presentes términos y condiciones.<br>
ACCESO Y NAVEGACIÓN DENTRO DEL SITIO<br>
El titular no responde por la continuidad y disponibilidad del contenido, productos y/o servicios en a largo plazo, se realizará acciones que fomenten el buen funcionamiento de dicho sitio web sin responsabilidad alguna. El titular no se responsabiliza de que el software esté libre de errores que puedan causar un daño al software y/o hardware del equipo del cual el usuario accede al sitio web. De igual forma, no se responsabiliza por los posibles daños psicológicos que puedan ocasionar el acceso y utilización del sitio web.<br>
El titular establecerá roles para cada uno de los usuarios en base al uso que le dará al sistema, cada uno de esos roles tendrá accesos y capacidad de almacenamiento para subir proyecto establecidos con el fin que el sitio web no se sobrecargue, una vez que un usuario llene su almacenamiento no podrá crear más proyectos a menos que elimine uno de los existentes libreando así espacio para los nuevos.<br>                                               
                                                
                                                </p>
                                            </b-modal>
                                    </b-col>                                  
                                </b-row>                    
                                <b-row style="padding-top: 2% ;">
                                    <b-col class="text-center">
                                        <b-button @click="goBack" style="padding-top:0%; padding-bottom:0%" pill variant="danger">Cancelar</b-button>
                                    </b-col>
                                    <b-col class="text-center">
                                        <b-button pill variant="info" style="padding-top:0%; padding-bottom:0%" type="submit" :disabled="!everythingValid">Guardar</b-button>
                                    </b-col>                                    
                                </b-row>  
                    
                        </b-form>
                    </div>
                </b-card>
            
            </b-container>        
    </div>
</template>

<script>
import axios from "axios";
import ciudad from "../assets/ciudades.json";
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
                name: '',
                lastname:'',
                password: '',
                confirmpassword: '',
                email: '',
                phone: '',                
                profession: '',
                institution: '',
                city:''
            },
            error: false,
            optionsInst:[
                { value: 'Publico', text: 'Público' },
                { value: 'Privado', text: 'Privado' },
                { value: 'Otro', text: 'Otro' },
            ],
            ciudadesjson: ciudad,
            showPassword: false,
            showPassword1: false,
            acept: false,
        }
    },
    computed: {
        nameState() {
            if (this.form.name.length == 0) return null;
            return this.form.name.length <= 150;
        },
        lastnameState() {
            if (this.form.lastname.length == 0) return null;
            return this.form.lastname.length <= 150;
        },
        passwordState() {
            if (this.form.password.length == 0) return null;
            return this.form.password.length >= 8;
        },
        phoneState() {
            if (this.form.phone.length == 0) return null;
            return this.form.phone.length >= 8;
        },
        confirmpasswordState() {
            if (this.form.confirmpassword.length == 0 ) return null;
            return this.form.password == this.form.confirmpassword;
        },
        everythingValid() {
            return this.phoneState && this.acept && this.nameState && this.lastnameState && this.passwordState && this.confirmpasswordState;
        },
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault();
            axios.post("api/users/", {
                    "username": this.form.email,
                    "password": this.form.password,
                    "email": this.form.email,
                    "phone": this.form.phone,
                    "first_name": this.form.name,
                    "last_name" : this.form.lastname,
                    "profession" : this.form.profession,
                    "organization": this.form.institution,
                    "city" : this.form.city,

                })
                .then(response => {
                    if (response.status == 201)
                        this.goBack();
                    else
                        this.error = this.errorToLines(response.body);
                })
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

<style scoped>
.custom-jumbotron {
    background: url('/registro.jpg') no-repeat center center fixed;
  -webkit-background-size: 100% 100%;
  -moz-background-size: 100% 100%;
  -o-background-size: 100% 100%;
  background-size: 100% 100%;
  height: 100%;
  width: 100%;
  
}

</style>