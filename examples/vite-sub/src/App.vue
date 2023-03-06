<script setup lang="ts">
import { testFromViteRemote } from 'dubhe-viteout/test'
testFromViteRemote()
</script>

<template>
  <!-- <vite_dubhe-app msg="remote app component" /> -->
  <viteout-app msg="remote hello component from vite" />
  <!-- <esbuild-hello msg="remote hello component from esbuild" /> -->
</template>

