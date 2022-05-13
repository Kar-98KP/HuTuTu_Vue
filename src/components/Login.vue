<template>
  <div class="Login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        ref="loginFromRef"
        :model="loginFrom"
        :rules="loginFromRules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item label="" prop="username">
          <el-input
            v-model="loginFrom.username"
            placeholder=" 请输入用户名"
            prefix-icon="el-icon-s-custom"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="" prop="password">
          <el-input
            v-model="loginFrom.password"
            placeholder=" 请输入密码"
            prefix-icon="el-icon-lock"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" round @click="login">登录</el-button>
          <el-button class="size" type="info" round @click="resetLoginFrom"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //登录表单的数据绑定
      loginFrom: {
        username: 'admin',
        password: '123456',
      },
      //表单验证规则
      loginFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3~10个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6~15个字符', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    //预验证
    login() {
      this.$refs.loginFromRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginFrom)
        if (res.meta.status !== 200) {
          console.log(res)
          this.$message.error('登录失败！请检查用户名或密码错误')
        } else {
          console.log(res)
          this.$message.success('登录成功！欢迎使用糊涂涂点餐后台')
        }
        //登录成功后将token保存在sessionStorage
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
    //重置From表单
    resetLoginFrom() {
      this.$refs.loginFromRef.resetFields()
    },
  },
}
</script>
<style lang="less" scoped>
.Login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 675px;
  height: 450px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 200px;
    width: 200px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 20px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login_form {
    position: absolute;
    bottom: 15%;
    width: 100%;
    padding: 0 150px;
    box-sizing: border-box;
    .el-input {
      font-size: 20px;
    }
  }
  .btns {
    display: flex;
    justify-content: center;
  }
}
</style>
