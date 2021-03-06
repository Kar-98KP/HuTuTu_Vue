import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/User/Users'
import Rigths from '@/components/Power/Rigths'
import Roles from '@/components/Power/Roles'
import Cate from '@/components/goods/Cate'
import Params from '@/components/goods/Params'
import GoodsList from '@/components/goods/List'
import Add from '@/components/goods/Add'
import Order from '@/components/order/Order'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/login'
}, {
  path: '/login',
  component: Login
}, {
  path: '/home',
  component: Home,
  redirect: '/welcome',
  children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: Users
    },
    {
      path: '/rights',
      component: Rigths
    },
    {
      path: '/roles',
      component: Roles
    },
    {
      path: '/categories',
      component: Cate
    },
    {
      path: '/params',
      component: Params
    },
    {
      path: '/goods',
      component: GoodsList
    },
    {
      path: '/goods/add',
      component: Add
    },
    {
      path: '/orders',
      component: Order
    }
  ]
}]

const router = new VueRouter({
  routes
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径来
  // next() 放行 强制跳转
  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
});
export default router
