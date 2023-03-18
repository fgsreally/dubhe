<script setup lang="ts">
const { msg } = defineProps<{ msg: number }>()
</script>

<template>
  <p id="esbuild-r-app" data-testid="esbuild-pub-text">
    {{ msg }}
  </p>

  <button data-testid="esbuild-pub-btn">
    esbuild-r app button
  </button>
</template>

<style scoped>
#esbuild-r-app{
  color:orange
}
</style>
