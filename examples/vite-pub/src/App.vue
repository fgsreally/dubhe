<script setup lang="ts">
import Share from './components/Share.vue'

const { msg } = defineProps<{ msg: string }>()
</script>

<template>
  <p id="vite-r-app">
    {{ msg }}
  </p>
  <img src="/vite.svg" class="logo" alt="Vite logo">

  <el-button>vite-r app button</el-button>
  <Share />
</template>

<style scoped>
#vite-r-app{
  color:red
}
</style>
