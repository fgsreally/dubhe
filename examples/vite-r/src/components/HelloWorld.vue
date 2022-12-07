<script setup lang="ts">
import { ref } from 'vue'
import Share from './Share.vue'
/**
 * @props msg string
 */
defineProps<{ msg: string }>()
const count = ref(0)
</script>

<template>
  <h1 class="red">
    <Share />
    {{ msg }}
    <button>{{ count }}</button>
  </h1>
</template>

<style scoped>
.red {
  color: yellow;
}
</style>
