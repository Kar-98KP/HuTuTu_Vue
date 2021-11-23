<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7"
          ><el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          ></el-col
        >
      </el-row>
      <!-- 用户列表区 -->

      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="序号"> </el-table-column>
        <el-table-column label="姓名" prop="username" align="center">
        </el-table-column>
        <el-table-column label="邮箱" prop="email" align="center">
        </el-table-column>
        <el-table-column label="电话" prop="mobile" align="center">
        </el-table-column>
        <el-table-column label="角色" prop="role_name" align="center">
        </el-table-column>
        <el-table-column label="状态" prop="mg_state" align="center">
          <template slot-scope="scope"
            ><el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip
              :enterable="false"
              effect="dark"
              content="修改"
              placement="top"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>

            <!-- 删除 -->
            <el-tooltip
              :enterable="false"
              effect="dark"
              content="删除"
              placement="top"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="removeUsersById(scope.row.id)"
              ></el-button>
            </el-tooltip>

            <!-- 分配角色 -->
            <el-tooltip
              :enterable="false"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 7]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 内容主体 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="ruleFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机 " prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editFrom"
        :rules="addFormRules"
        ref="editFromRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机 " prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, out) => {
      const regEmail = /^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/
      if (regEmail.test(value)) {
        return out()
      }
      out(new Error('请输入合法的邮箱地址'))
    }
    // 验证手机的规则
    var checkMobile = (rule, value, out) => {
      const regMobile = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/
      if (regMobile.test(value)) {
        return out()
      }
      out(new Error('请输入合法的手机号'))
    }
    return {
      //获取用户列表参数
      queryInfo: { query: '', pagenum: 1, pagesize: 1 },
      userList: [],
      total: 0,
      addDialogVisible: false, //控制添加用户信息对框的隐藏

      addForm: { username: '', password: '', email: '', mobile: '' }, //添加用户的表单数据
      //添加用户的表单数据规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3~10个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6~15个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur',
          },
        ],
      },
      editDialogVisible: false, //控制修改用户信息对框的隐藏
      //查询到的用户信息对象
      editFrom: {},
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })

      if (res.meta.status !== 200) {
        return this.$, message.error('获取用户列表失败~')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听Pagesize
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagesize = newPage
      this.getUserList()
    },
    //监听 switch 开关状态的改变
    async userStateChanged(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败~')
      }
      this.$message.success('更新用户状态成功~')
    },
    //监听 添加用户对话框 关闭的改变
    addDialogClose() {
      this.$refs.ruleFormRef.resetFields()
    },
    // 点击按钮添加用户
    addUser() {
      this.$refs.ruleFormRef.validate(async (vaild) => {
        if (!vaild) {
          return
        }
        //可以发起网络请求添加用户
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败~')
        }
        this.$message.success('添加用户成功~')
        this.addDialogVisible = false
        this.getUserList() //刷新用户列表
      })
    },
    //修改用户信息按钮
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }

      this.editFrom = res.data
      this.editDialogVisible = true
    },
    //监听 修改用户对话框 关闭的改变
    editDialogClose() {
      this.$refs.editFromRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFromRef.validate(async (valid) => {
        if (!valid) return
        //发起修改请求
        const { data: res } = await this.$http.put(
          'users/' + this.editFrom.id,
          {
            email: this.editFrom.email,
            mobile: this.editFrom.mobile,
          }
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('用户信息修改失败~')
        }

        //关闭对话框
        this.editDialogVisible = false
        //刷新用户列表
        this.getUserList()
        //提示修改成功
        this.$message.success('用户信息修改成功~')
      })
    },
    //根据ID删除用户信息
    async removeUsersById(id) {
      //弹框询问用户是否删除数据
      const conFirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 如果用户点击确认删除，则返回字符 confirm
      // 如果用户点击取消删除，则返回字符 cancle
      if (conFirmResult !== 'confirm')
        return this.$message.info('已经取消了删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败~')
      }
      this.$message.success('删除用户成功~')
      this.getUserList()
    },
  },
}
</script>
<style lang="less" scoped></style>
