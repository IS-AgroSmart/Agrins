<template>
    <div> 
        <div class="bg-info" style=" padding-top:100px; width: 100%; height:220px;">
            <div class="d-flex justify-content-center">                                
                <b-icon-person-circle style="width: 50px; height: 50px; "  class="text-white"/>
            </div>
            <div class="d-flex justify-content-center">                                
                <p class="text-white"><b-icon-envelope/> {{ storage.loggedInUser.email }}</p>
            </div>
            <div style="padding-left: 5%;padding-right:5%">
                <b-card no-body>
                    <b-tabs content-class="mt-3" justified>
                    <b-tab title="Datos Personales" active>
                        <b-card-text style="padding-left: 5%;padding-right:5%; padding-bottom: 3%;">
                                <b-form-group  label-cols-lg="3" label="Información disponible" label-size="lg" label-class="font-weight-bold pt-0" class="mb-0">
                                    <b-input-group  size="sm" prepend="Nombre:" class="mt-3">
                                        <b-form-input v-model="form.name">{{ form.name }}</b-form-input>
                                    </b-input-group>
                                    <b-input-group  size="sm" prepend="Apellidos:" class="mt-3">
                                        <b-form-input v-model="form.lastname">{{ form.lastname }}</b-form-input>
                                    </b-input-group>
                                    <b-input-group  size="sm" prepend="Teléfono:" class="mt-3">
                                        <b-form-input v-model="form.phone">{{ form.phone }}</b-form-input>
                                    </b-input-group>
                                    <b-input-group  size="sm" prepend="Profesión:" class="mt-3">
                                        <b-form-input v-model="form.profesion">{{ form.profesion }}</b-form-input>
                                    </b-input-group>
                                    <b-input-group  size="sm" prepend="Institución:" class="mt-3">
                                        <b-form-input v-model="form.institution">{{ form.institution }}</b-form-input>
                                    </b-input-group>
                                    <b-input-group  size="sm" prepend="Ciudad:" class="mt-3">
                                        <b-form-input v-model="form.city">{{ form.city }}</b-form-input>
                                    </b-input-group>      
                                </b-form-group>
                            
                        </b-card-text >
                    </b-tab>
                    <b-tab title="Cambiar Contraseña"><b-card-text>
                        <b-card-text style="padding-left: 5%;padding-right:5%">
                        <b-form-group size="sm" label-cols-lg="3" label="Datos personales" label-size="lg" label-class="font-weight-bold pt-0" class="mb-0">
                                    

                        <ChangePassword></ChangePassword>
                        </b-form-group></b-card-text>
                    </b-card-text>
                        </b-tab> 
                    
                    </b-tabs>
                </b-card>
            </div>
            
        
                    
               </div>
    </div>
</template>

<script>
import { BIconPersonCircle } from 'bootstrap-vue';
import { BIconEnvelope } from  'bootstrap-vue';
import ChangePassword from './ChangePassword.vue'; 

export default {
        components: {
        BIconEnvelope,
        BIconPersonCircle,
        ChangePassword,
    },
    data() {
      return {
        form: {
          name: '',
          lastname: 'Apellido',
          phone: '9999999999',
          institution: 'this.storage.loggedInUser.organization',
          profesion: 'Profesional',
          city:'Cuenca',
        },        
      }
    },
    created() {
    this.form.name = this.storage.loggedInUser.first_name;
    this.form.lastname = this.storage.loggedInUser.last_name;
    this.form.phone = this.storage.loggedInUser.phone;
    this.form.institution = this.storage.loggedInUser.organization;
    this.form.profesion = this.storage.loggedInUser.profession;
    this.form.city = this.storage.loggedInUser.city;
  }
}
</script>
