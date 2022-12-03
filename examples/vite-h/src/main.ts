import { createApp } from 'vue'
import './style.css'
import { vueDev } from 'dubhe/runtime'
import App from './App.vue'

createApp(App).use(vueDev()).mount('#app')
