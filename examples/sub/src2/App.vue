<script setup lang="ts">
import { HelloWorld } from '@dubhe/pub/a'
import { myAlert } from '@dubhe/pub/b'
import { ElButton } from 'element-plus/es'
import { ref } from 'vue'
const msg = ref('msg')
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo">
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo">
    </a>
    <div>
      <ElButton id="btn_alert" @click="myAlert('invoke!')">
        click to invoke alert
      </ElButton>
      <ElButton data-test-id="update-msg" @click="msg = 'new msg'">
        click to update msg
      </ElButton>
    </div>
  </div>
  <HelloWorld :msg="msg" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
