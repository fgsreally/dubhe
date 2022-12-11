<script setup lang="ts">
import { AboutModel } from '../models/about'
import { HomeModel } from '@/models/home'
const { name } = new HomeModel()
const { change_home_name } = new AboutModel()

function emit() {
  new AboutModel().emit_update()
}
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="change_home_name">
      change home name
    </button>
    <button @click="emit">
      emit  name
    </button>
    {{ name }}
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
