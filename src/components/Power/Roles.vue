<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row :gutter="10">
        <el-col :span="6">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="6">
                <el-tag> {{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <!-- 嵌套循环二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级 -->
                  <el-col :span="8">
                    <el-tag type="success"> {{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="16">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作"
          ><template slot-scope="scope">
            <!-- 编辑 -->
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
                >编辑</el-button
              >
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
                @click="removeRolesById(scope.row.id)"
                >删除</el-button
              >
            </el-tooltip>
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template></el-table-column
        >
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
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
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色信息对话框 -->
    <el-dialog
      title="修改角色"
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
        <el-form-item label="角色名">
          <el-input v-model="editFrom.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="email">
          <el-input v-model="editFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="SetRightDialogVisible"
      width="50%"
      @close="SetRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rigthsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //所有角色列表数据
      roleList: [],
      addDialogVisible: false, //控制添加角色信息对框的隐藏
      addForm: { roleName: '', roleDesc: '' }, //添加角色的表单数据

      //添加角色的表单数据规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3~10个字符', trigger: 'blur' },
        ],
        roleDesc: {
          required: false,
          message: '请输入角色描述',
          trigger: 'blur',
        },
      },

      editDialogVisible: false, //控制修改角色信息对框的隐藏
      //查询到的角色信息对象
      editFrom: {},
      //控制分配权限对话框的隐藏
      SetRightDialogVisible: false,
      //权限数据
      rigthsList: [],
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      // 默认选中的权限
      defKeys: [105],
      // 即将分配权限的ID
      roleId: '',
    }
  },
  created() {
    this.getroleList()
  },
  methods: {
    //获取角色列表
    async getroleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败~')
      }
      this.roleList = res.data
    },

    //监听 添加角色对话框 关闭的改变
    addDialogClose() {
      this.$refs.ruleFormRef.resetFields()
    },
    // 点击按钮添加角色
    addUser() {
      this.$refs.ruleFormRef.validate(async (vaild) => {
        if (!vaild) {
          return
        }
        //可以发起网络请求添加角色
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败~')
        }
        this.$message.success('添加角色成功~')
        this.addDialogVisible = false
        this.getroleList() //刷新角色列表
      })
    },

    //修改角色信息按钮
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }

      this.editFrom = res.data
      this.editDialogVisible = true
    },
    //监听 修改角色对话框 关闭的改变
    editDialogClose() {
      this.$refs.editFromRef.resetFields()
    },
    //修改角色信息并提交
    editUserInfo() {
      this.$refs.editFromRef.validate(async (valid) => {
        if (!valid) return
        //发起修改请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editFrom.roleId,
          {
            roleName: this.editFrom.roleName,
            roleDesc: this.editFrom.roleDesc,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('角色信息修改失败~')
        }

        //关闭对话框
        this.editDialogVisible = false
        //刷新角色列表
        this.getroleList()
        //提示修改成功
        this.$message.success('角色信息修改成功~')
      })
    },
    //根据ID删除角色信息
    async removeRolesById(id) {
      //弹框询问角色是否删除数据
      const conFirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 如果角色点击确认删除，则返回字符 confirm
      // 如果角色点击取消删除，则返回字符 cancle
      if (conFirmResult !== 'confirm')
        return this.$message.info('已经取消了删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败~')
      }
      this.$message.success('删除角色成功~')
      this.getroleList()
    },
    // 根据ID删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败~')
      }
      this.$message.success('删除角色成功~')
      this.getroleList()
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      //获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败~')
      }
      //获取的权限数据
      this.rigthsList = res.data
      // 递归获取三级节点的ID数据
      this.getLeafKeys(role, this.defKeys)
      this.SetRightDialogVisible = true
    },
    // 通过递归的方式获取角色下的三级权限ID 并保存到defKeys中
    getLeafKeys(node, arr) {
      // 判断当前节点是否包含 children 属性
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭
    SetRightDialogClosed() {
      this.defKeys = []
    },
    //分配权限
    async allotRights() {
      const Keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = Keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色权限失败~')
      }
      this.$message.success('分配角色权限成功~')
      this.getroleList()
      this.SetRightDialogVisible = false
    },
  },
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 2px solid #eee;
}
.bdbottom {
  border-bottom: 2px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
