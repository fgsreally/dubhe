<script setup lang="ts">
const { msg } = defineProps<{ msg: string }>()
</script>

<template>
  <p class="blue">
    {{ msg }}
  </p>
</template>

<style scoped>
.blue{
  color:rgb(77, 83, 250)
}
</style>
