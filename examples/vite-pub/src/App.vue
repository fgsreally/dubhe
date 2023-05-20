<script setup lang="ts">
import Share from './components/Share.vue'
const { msg } = defineProps<{ msg: boolean }>()
</script>

<template>
  <p id="vite-r-app" data-testid="vite-pub-text">
    {{ msg }}
  </p>
  <img src="/vite.svg" class="logo" alt="Vite logo">

  <el-button data-testid="vite-pub-btn">
    vite-r app button
  </el-button>
  <Share />
</template>

<style scoped>
#vite-r-app{
  color:red
}
</style>
