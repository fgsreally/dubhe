<script setup lang="ts">
const { msg } = defineProps<{ msg: number }>()
</script>

<template>
  <p id="esbuild-r-app">
    {{ msg }}
  </p>

  <button>esbuild-r app button</button>
</template>

<style scoped>
#esbuild-r-app{
  color:orange
}
</style>
