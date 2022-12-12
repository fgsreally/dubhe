<script setup lang="ts">
import { useModel } from '@dubhe/runtime'
import TheWelcome from '../components/TheWelcome.vue'
import { HomeModel } from '@/models/home'
const { name, changeName } = useModel(HomeModel)
</script>

<template>
  <main>
    home.name<div>{{ name }}</div>
    <button @click="changeName">
      change home name
    </button>
    <TheWelcome />
  </main>
</template>
