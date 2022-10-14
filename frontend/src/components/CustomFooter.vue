<template>
    <footer class="footer mt-auto py-2 bg-dark" style="color:white;">
        <b-row align-v="center">
            <b-col >
                <disk-space-indicator v-if="shouldShowDisk" />
            </b-col>
            <b-col >&copy; Copyright 2022 Agrins</b-col>
        </b-row>
    </footer>
</template>

<script>
import DiskSpaceIndicator from './DiskSpaceIndicator'

export default {
    components: {
        DiskSpaceIndicator
    },
    computed: {
        shouldShowDisk() { return this.$effectiveUser() != null; },
    },
}
</script>