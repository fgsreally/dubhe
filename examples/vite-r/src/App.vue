<script setup lang="ts">
const { msg } = defineProps<{ msg: string }>()
</script>

<template>
  <p class="red">
    {{ msg }}
  </p>
</template>

<style scoped>
.red{
  color:rgb(77, 83, 250)
}
</style>
