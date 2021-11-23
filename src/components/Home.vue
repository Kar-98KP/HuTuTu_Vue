<template>
  <el-container class="home_container">
    <!-- 头部 -->
    <el-header style="height: 130px"
      ><div>
        <img src="../assets/糊涂涂点餐.png" alt="" />
        <span>糊涂涂后台管理系统</span>
      </div>
      <el-button type="inof" @click="logout">退出</el-button></el-header
    >
    <!-- 页面主体 -->
    <el-container>
      <!-- 左侧导航 -->
      <el-aside :width="isCollapse ? '64px' : '240px'">
        <div class="toggle_button" @click="isCollapse = !isCollapse">|||</div>
        <!-- 侧边菜单栏 -->
        <el-menu
          background-color="#304156"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级导航 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文字 -->
              <span style="font-size: 20px">{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="savaNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文字 -->
                <span style="font-size: 18px">{{ subItem.authName }}</span>
              </template></el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view> </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      iconObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-mobile',
        101: 'el-icon-shopping-bag-1',
        102: 'el-icon-s-order',
        145: 'el-icon-bangzhu',
      },
      isCollapse: false,
      activePath: '', //被激活的地址
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    //保存链接的状态
    savaNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
  },
}
</script>
<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #304156;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 50px;
  > div {
    display: flex;
    align-items: center;
    padding: 0px 50px;
    span {
      margin-left: 50px;
    }
  }
  img {
    width: 120px;
  }
}
.el-aside {
  background-color: #304156;
  .el-menu {
    border: none;
  }
}
.toggle_button {
  background-color: #304156;
  font-size: 14px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.el-main {
  background-color: #eaedf1;
}
</style>
