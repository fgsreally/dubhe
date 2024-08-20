<script setup lang="ts">
import { HelloWorld } from '@dubhe/pub/a'
import { myAlert } from '@dubhe/pub/b'
import { ElButton } from 'element-plus/es'
import { ref } from 'vue'
const msg = ref('msg')
</script>

<template>
  <ElButton id="btn_alert" @click="myAlert('invoke!')">
    click to invoke alert
  </ElButton>
  <ElButton data-testid="update-msg" @click="msg = 'new msg'">
    click to update msg
  </ElButton>

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
