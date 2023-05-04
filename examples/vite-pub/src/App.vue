<script setup >
import Share from './components/Share.vue'
</script>

<template>
  <p id="vite-r-app" data-testid="vite-pub-text" />
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
