<template>
    <div>        
        <div id="inicio" class="custom-jumbotron">
            <b-container class="text-white">
                <!-- <b-img class="bg" fluid alt="ortomosaico" src="/field.jpg" />-->
                <b-row align-content="center">
                    <b-col style="padding-top: 15%;" md="8" lg="7" order-md="1">
                        <h1 >Agricultura 4.0</h1>
                        <p>Con el uso de las técnicas de teledetección para el análisis de imágenes aéreas se busca comprender mejor los sistemas de producción agrícola, a través del monitoreo y análisis en tiempo real de los factores que influyen en el rendimiento de los cultivos.</p>                        
                    </b-col>
                    
                </b-row>
                <b-button pill variant="info" to="projects" v-if="loggedIn">Mi cuenta</b-button>
                <b-button pill variant="info" @click="scroll('desafios')" v-else>¡QUIERO SABER MÁS!</b-button>
                
            </b-container>
            <b-row style="padding-left:0%; padding-top: 5%;" align-content="left">
                    <b-img style="object-fit: contain; background-size: cover; max-width: 100%; padding-left:0%; padding-right:5%;" height="70" width="500" left src="/serv.png" fluid alt="Fluid image"></b-img>    
            </b-row>
        </div>
    
        <div id="desafios" class="shadow-sm p-3 mb-5 bg-white rounded">
            <b-container class="pb-5">
                <div align-h="center"  >
                    <b-row align-h="left" class="py-5">
                                <h2>Desafíos actuales en el cultivo de maíz</h2>
                            </b-row>
                    <b-row>
                        <b-col cols="9">                            
                            <b-row class="text-justify">
                                <p style="padding-left:5%;padding-top: 3%;">La creciente demanda de alimentos de una población en aumento  plantea desafíos para los gobiernos  en términos de soberanía  alimentaria; sin embargo desde el punto de vista de los productores los desafíos estan relacionados con la baja competitividad de la región, los altos costos de producción y la baja productividad. <b-link href="/">LEER MÁS >></b-link></p>
                            </b-row>
                        </b-col>
                        <b-col align-v="start" style="padding-top: 0%;">
                            <b-img  width="150" height="150" src="/maiz.jpg" rounded="circle" />
                        </b-col>                     
                    </b-row>
                </div>
            </b-container>
        </div>
        
        <div id="servicios" style="background-color:#cad0d0">
            <b-container>
                <b-row align-h="center" class="py-5">
                        <h2><b>Servicios</b></h2>
                    </b-row>
                    <b-row class="text-center">
                        <b-col md>
                            <div class="mb-2">
                                <img width="250" height="150" src="/pc.png" thumbnail/>
                            </div>
                            <div>
                                <h5><b>SIG WEB (geoportal)</b></h5>
                                <p>Disponemos de una solución web para el mapeo y gestión de la cartografía de cultivos.</p>
                            </div>
                        </b-col>
                        <b-col md>
                            <div class="mb-2">
                                <img width="150" height="150" src="/layer.png" thumbnail/>
                            </div>
                            <div>
                                <h5><b>Proyectos</b></h5>
                                <p>En la plataforma web se podrá visualizar, consultar y descargar la geoinformación creada en el proyecto.</p>
                        </div>
                    </b-col>
                    <b-col md>
                        <div class="mb-2">
                            <img width="160" height="150" src="/indice.png" thumbnail/>
                        </div>
                        <div>
                            <h5><b>Índices de vegetación</b></h5>
                            <p>A partir de las imágenes aéreas se podrá estimar índices espectrales de vegetación y aplicar modelos de predicción para el monitoreo y diagnóstico en los cultivos.</p>
                        </div>
                    </b-col>
                </b-row>

            </b-container></div>

            <div class="text-black" style="padding-bottom: 0; background-image:url('fieldS.png'); background-repeat: no-repeat; height: 100%; width:100%; background-size: cover;">
                <b-row >
                    <b-col></b-col>
                    <b-col cols="10">
                        <b-row align-h="center" class="py-5">
                            <h2><b>Ventajas de la Agricultura 4.0</b></h2>
                        </b-row>
                        <b-row align-h="center" class="py-4" >
                            <ul>
                                <li style="color:white"><h6>Aumento de la productividad en los cultivos, mediante la implementación de tecnologías.</h6></li>
                                <li style="color:white"><h6>Reducción de los costos de producción mediante el uso eficiente de recursos.</h6></li>
                                <li style="color:white"><h6>Minimiza las labores de control en campo.</h6></li>
                                <li style="color:white"><h6>Mayor precisión en el manejo de los campos de producción.</h6></li>
                            </ul>
                        </b-row>

                    </b-col>
                    <b-col></b-col>
                </b-row>
                
            
            </div>

                <div id="quienes" class="shadow-lg p-3 mb-5 bg-white rounded" style="padding-bottom:2%">
                    <b-container>                        
                        <b-row class="text-center">
                            <b-col></b-col>
                            <b-col cols="10">
                                <b-row align-h="center" >
                                    <h2><b>¿Quienes Somos?</b></h2>
                                </b-row>
                                <b-row align-h="center" >
                                    
                                    <div style="height:300px; width:300px;padding-bottom:0% ">
                                        <b-embed type="video" aspect="4by3" controls >                                        
                                            <source src="video.mp4" type="video/mp4">
                                        </b-embed>
                                    </div>
                                
                                    <p>Agrins está formado por investigadores de 3 universidades públicas del Ecuador: ESPOL de Guayaquil, UTM de Portoviejo y Universidad de Cuenca, especializados en el campo de la agricultura, computación y en el uso de técnicas y herramientas tecnológicas para el monitoreo y diagnóstico de los cultivos.</p>
                                </b-row>

                            </b-col>
                            <b-col></b-col>
                        </b-row>
                    
                </b-container>
                </div>
                <div class="bg-white">
                    <Contacto id="contacto"></Contacto>
                </div>


        </div>
</template>

<style scoped>
.custom-jumbotron {
    background: url('/field6.jpg') no-repeat center center fixed;
    -webkit-background-size: 100% 100%;
    -moz-background-size: 100% 100%;
    -o-background-size: 100% 100%;
    background-size: 100% 100%;  
    height: 100%;
    width: 100%;
    padding-top: 10%;
    margin-bottom: 2rem;
    background-color: #e9ecef00;
    object-fit: contain;
    padding-bottom: 0; 
    
}
.bg {
    position: fixed;
    right: 0;
    top:100px;
    left: 0;
    z-index: 1; 
}
</style>

<script>
import Contacto from "./Contacto.vue";
export default {
    computed: {
        loggedIn() {
            return this.$isLoggedIn();
        }
    },
    components: { Contacto },
    methods: {
      scroll(id) {  
      document.getElementById(id).scrollIntoView({
        behavior: "smooth"
      });
    }
    }
    
}
</script>
