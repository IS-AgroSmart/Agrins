<template>
    <div class="bg-white" >
        <b-container>
            <b-row align-h="center" class="py-5">
                <h2><b>Contáctanos</b></h2>
            </b-row>
            <b-form @submit="onSubmit"> 
            <b-row class="text-center">
                <b-col md>
                    <div class="mb-2">
                        <img src="../assets/logoB.png" style='height: 100%; width: 100%; object-fit: contain' thumbnail/>
                    </div>
                    <div>
                        <b-icon-twitter font-scale="2" variant="info" />
                        <b-icon-facebook font-scale="2" variant="info"/>
                    </div>
                    <div>                                
                        <p style="color:#087990"><b-icon-envelope variant="info"/> mrealpe@fiec.espol.edu.ec</p>
                    </div>
                    <div>
                        <p style="color:#087990"><b-icon-telephone variant="info"/> (+593) 42269761</p>
                    </div>
                </b-col>                
                <b-col md >
                    <div style="text-align: left;">                                                               
                        <b-form-group size="sm" id="input-group-1" label="Nombre y Apellido:*" label-for="input-1">
                            <b-form-input size="sm" id="input-1" v-model="form.name" placeholder="Nombre y Apellido" type="text" required></b-form-input>
                        </b-form-group>
                        <b-form-group id="input-group-2" label="Email:*" label-for="input-2">
                            <b-form-input size="sm" id="input-2" v-model="form.email" type="email" placeholder="Email" required></b-form-input>
                        </b-form-group>  
                        <b-form-group  id="input-group-3" label="Teléfono:*" label-for="input-3">
                            <b-form-input  size="sm" id="input-3" v-model="form.telefono" type="tel" placeholder="Teléfono" required></b-form-input>
                        </b-form-group>                          
                    </div>
                </b-col >
                <b-col md left>
                    <div style="text-align: left;">
                        <b-form-group id="input-group-4" label="Mensaje:*" label-for="input-4">
                            <b-form-textarea size="sm" id="textarea" v-model="mensaje" placeholder="Mensaje..." rows="8" max-rows="16" required></b-form-textarea>
                        </b-form-group> 
                        
                    </div>
                </b-col>
                    
                </b-row>
                <b-row align-h="center" style="padding-bottom:2%">
                    <b-button style="padding-top:0%; padding-bottom:0%" type="submit" pill variant="info">Enviar</b-button>
                </b-row>
                </b-form>    
                
                
            
        </b-container>
    </div>
    
</template>

<style scoped>

</style>

<script>
import { BIconTwitter } from 'bootstrap-vue';
import { BIconFacebook } from 'bootstrap-vue';
import { BIconEnvelope } from  'bootstrap-vue';
import { BIconTelephone } from  'bootstrap-vue';


export default {
    components: {
        BIconFacebook,
        BIconTwitter,
        BIconEnvelope,
        BIconTelephone,
    },

    data() {
      return {
        form: {
          name: '',
          email: '',
          telefono: '',
          mensaje: '',
        },        
      }
    },
    methods: {
      onSubmit() {
        
      }
    }
}
</script>
