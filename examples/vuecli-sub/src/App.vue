<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <el-button>111</el-button>
  <viteout-app msg="remote app component from vite"/>
  <!-- <viteout-hello msg="remote hello component from vite"/> -->

</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
