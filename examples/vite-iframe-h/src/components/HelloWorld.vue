<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Sub, mount } from 'dubhe-iframe'
defineProps<{ msg: string }>()
const instance = new Sub({})
const container = ref<unknown>(null)
window.name = 'fgs'

onMounted(async () => {
  const iframe = await instance.add('vite-iframe-r', 'http://127.0.0.1:5173/')
  mount(iframe, (container.value as HTMLElement))
})
</script>

<template>
  <div ref="container" class="container" />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.container{
  /* position: fixed */
}
</style>
