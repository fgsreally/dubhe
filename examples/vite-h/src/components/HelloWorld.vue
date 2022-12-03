<script setup lang="ts">
// eslint-disable-next-line import/no-webpack-loader-syntax
import app from '!app/app.v'// extension .v
</script>

<template>
  <app msg="remote app component" />
  <r-app-hello msg="remote hello component" />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
