import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

//导入全局样式
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require style 导入富文本编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求拦截 挂载
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

//过滤器，将时间字符串转为时间
Vue.filter('dateFormat', function (origin) {
  const Time = new Date(origin)
  const year = Time.getFullYear();
  const month = (Time.getMonth() + 1 + '').padStart(2, '0');
  const day = (Time.getDate() + '').padStart(2, '0');

  const hour = (Time.getHours() + '').padStart(2, '0');
  const miu = (Time.getMinutes() + '').padStart(2, '0');
  const sec = (Time.getSeconds() + '').padStart(2, '0');
  return year + "-" + month + "-" + day + " " + hour + ":" + miu + ":" + sec
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
