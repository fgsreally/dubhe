<script setup lang="ts">
// eslint-disable-next-line import/no-webpack-loader-syntax
import app from '!app/app.v'
app_test_testFromViteRemote()
</script>

<template>
  <app msg="remote app component" />  <app-hello msg="remote hello component" />
</template>

