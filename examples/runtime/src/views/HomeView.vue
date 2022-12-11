<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { HomeModel } from '@/models/home'

const { name } = new HomeModel()
</script>

<template>
  <main>
    home.name<div>{{ name }}</div>
    <TheWelcome />
  </main>
</template>
