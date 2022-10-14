<template>
    <div>        
        <div class="custom-jumbotron" style="height: 80vh;">
            <b-container class="text-white">
                <b-img class="bg" fluid alt="Agricultura 4.0" src="/field.png" />
                <b-row align-content="center">
                    <b-col style="padding-top: 15%;" md="8" lg="7" order-md="1">
                        <h1 >Agricultura 4.0</h1>
                        <p>Con el uso de las técnicas de teledetección para el análisis de imágenes aéreas se busca comprender mejor los sistemas de producción agrícola, a través del monitoreo y análisis en tiempo real de los factores que influyen en el rendimiento de los cultivos.</p>                        
                    </b-col>
                    
                </b-row>
                <b-button pill variant="info" to="flights" v-if="loggedIn">Mi cuenta</b-button>
                <b-button pill variant="info" to="signup" v-else>¡QUIERO SABER MÁS!</b-button>
                
            </b-container>
            <b-row style="padding-left:0%; padding-top: 5%;" align-content="left">
                    <b-img style="padding-left:0%" height="70" width="500" left src="/serv.png" fluid alt="Fluid image"></b-img>    
            </b-row>
        </div>
    
        <div class="bg-white">
            <b-container class="pb-5">
                <div id="desafios" align-h="center" >
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


                <div align-h="center" >
                    <b-row align-h="center" class="py-5">
                        <h1>Servicios</h1>
                    </b-row>
                    <b-row class="text-center">
                        <b-col md>
                            <div class="mb-2">
                                <b-img width="300" height="300" src="/pc.png" thumbnail/>
                            </div>
                            <div>
                                <h5>SIG WEB</h5>
                                <p>Disponemos de una solución web para la gestión de la cartografía de los cultivos.</p>
                            </div>
                        </b-col>
                        <b-col md>
                            <div class="mb-2">
                                <b-img width="150" height="150" src="/layer.png" thumbnail/>
                            </div>
                            <div>
                                <h5>Proyectos</h5>
                                <p>En la plataforma web, se podrá crear modificar y compartir cartografía.</p>
                        </div>
                    </b-col>
                    <b-col md>
                        <div class="mb-2">
                            <b-img width="160" height="150" src="/indice.png" thumbnail/>
                        </div>
                        <div>
                            <h5>Índices de vegetación</h5>
                            <p>A partir de las imágenes aéreas se pueden estimar índices de vegetación como el Índice de Vegetación de Diferencia Normalizada (NDVI), para el diagnóstico en los cultivos.</p>
                        </div>
                    </b-col>
                </b-row>
                
                <b-row align-h="center" class="py-5">
                    <h1>Precios</h1>
                </b-row>
                <b-row class="text-center">
                    <b-col>
                        <b-card header="Demo" header-tag="h4" title-tag="title">
                            <b-card-body>
                                <b-card-title title-tag="h1">
                                    $0<small class="text-muted">/mes</small>
                                </b-card-title>
                                <ul class="list-unstyled">
                                    <li>Acceso a vuelos y proyectos demo</li>
                                    <li>Sin límite de tiempo</li>
                                </ul>
                                <b-button variant="outline-primary" to="signup" v-if="!loggedIn">Crear cuenta</b-button>
                            </b-card-body>
                        </b-card>
                    </b-col>
                    <b-col>
                        <b-card header="Básico" header-tag="h4" title-tag="title">
                            <b-card-body>
                                <b-card-title title-tag="h1">
                                    $65<small class="text-muted">/mes</small>
                                </b-card-title>
                                <ul class="list-unstyled">
                                    <li>3000 imágenes mensuales</li>
                                    <li>Vuelos y proyectos ilimitados</li>
                                    <li>45 GB de almacenamiento</li>
                                </ul>
                                <b-button variant="primary" to="login" v-if="!loggedIn">Iniciar sesión</b-button>
                                <b-button variant="primary" to="flights" v-else>Mis vuelos</b-button>
                            </b-card-body>
                        </b-card>
                    </b-col>
                </b-row>
            </div>
            </b-container>
        </div>
    </div>
</template>

<style scoped>

.bg {
    position: fixed;
    right: 0;
    top: 0;
    left: 0;
    z-index: -1;
}
</style>

<script>
export default {
    computed: {
        loggedIn() {
            return this.$isLoggedIn()
        }
    },
}
</script>