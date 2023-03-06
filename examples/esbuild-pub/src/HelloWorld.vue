<script setup lang="ts">
/**
 * @props msg string to inject esbuild-pub
 */
defineProps<{ msg: string }>()
</script>

<template>
  <h1 id="esbuild-r-hello">
    {{ msg }}
  </h1>
</template>

<style scoped>
#esbuild-r-hello {
  color: rgb(235, 52, 15);
}
</style>
