<script setup lang="ts">
import { ref } from 'vue'
import Share from './Share.vue'
/**
 * @props msg string
 */
defineProps<{ msg: string }>()
</script>

<template>
  <h1 id="vite-r-hello">
    {{ msg }}
  </h1>
  <el-button>vite-r app button11</el-button>

  <Share />
</template>

<style scoped>
#vite-r-hello {
  color: rgb(64, 15, 235);
}
</style>
