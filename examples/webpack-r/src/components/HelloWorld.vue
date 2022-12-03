<script setup lang="ts">
import { testFromWebpackR } from '../modules/test'
import Share from './Share.vue'
/**
 * @props msg string
 */
defineProps<{ msg: string }>()
testFromWebpackR()
</script>

<template>
  <h1>{{ msg }}</h1>
  <Share />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
