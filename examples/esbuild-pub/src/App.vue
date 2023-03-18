<script setup lang="ts">
import HelloWorld from './HelloWorld.vue'
import './test'
const { msg } = defineProps<{ msg: number }>()
</script>

<template>
  <p id="esbuild-r-app" data-testid="esbuild-pub-text">
    {{ msg }}
  </p>
  <HelloWorld msg="hello-world" />
  <button data-testid="esbuild-pub-btn">
    esbuild-r app button
  </button>
</template>

<style scoped>
#esbuild-r-app{
  color:orange
}
</style>
