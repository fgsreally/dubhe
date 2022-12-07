<script setup lang="ts">
import Share from './components/Share.vue'

const { msg } = defineProps<{ msg: string }>()
</script>

<template>
  <p class="blue">
    {{ msg }}
    <Share />
  </p>
</template>

<style scoped>
.blue{
  color:rgb(77, 83, 250)
}
</style>
