<template>
    <div  style="height:100%; padding-top: 500px; background-color: #fafafa;">        
        
    <iframe style="height:100%; padding-top: 500px;" :src="mapper_url" height="50%" width="50%" frameborder="0">Your browser doesn't support iFrames.</iframe>
        </div>
</template>

<script>
import forceLogin from './mixins/force_login'

export default {
    data() {
        return {};
    },
    computed: {
        mapper_url() {
            return "/mapper/" + this.$route.params.uuid;
        },
    },
    mixins: [forceLogin]
}
</script>