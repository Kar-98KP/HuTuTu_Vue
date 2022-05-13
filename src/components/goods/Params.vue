<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片式图区域 -->
    <el-card>
      <el-alert
        title="注意:只允许为三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span> 选择商品分类： </span>
          <!-- 选择分类的级联选择器 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProp"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many"
          ><el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >

          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 循环渲染Tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本款 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only"
          ><el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 循环渲染Tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本款 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加属性参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 添加属性参数对话框 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 修改属性参数对话框 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 商品分类级联
      cateProp: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 级联选择器双向绑定的数组
      selectedCateKeys: [],
      // 选中的页签
      activeName: 'many',
      // 属性数据
      manyTableData: [],
      onlyTableData: [],
      // 控制添加属性参数对话框的开关
      addDialogVisible: false,
      // 添加表单的数据
      addForm: { attr_name: '' },
      // 添加表单数据的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
      // 控制修改参数对话框的开关
      editDialogVisible: false,
      // 修改表单的数据
      editForm: {},
      // 修改表单数据的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败~')
      }
      this.catelist = res.data
    },
    // 级联选择器的内容发生变化触发
    handleChange() {
      this.getParamsData()
    },
    // Tab页签点击事件处理函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 根据选择的分类ID和当前面板获取对应的参数
      // this.selectedCateKeys.length === 3 ? this.selectedCateKeys[2] : null

      const { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes',
        {
          params: {
            sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败~')
      }

      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 添加回话框的关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 对话框关闭时发起添加请求
    addParams() {
      this.$refs.addFormRef.validate(async (validate) => {
        if (!validate) {
          return
        }
        const { data: res } = await this.$http.post(
          'categories/' + this.cateId + '/attributes',
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败~')
        }
        this.$message.success('添加参数成功~')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击按钮展示修改对话框
    async showEditDialog(attr_id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes/' + attr_id,
        {
          params: { attr_sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('获取分类参数信息失败~')
      }
      this.editForm = res.data
    },
    // 重置修改的表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数表单
    editParams() {
      this.$refs.editFormRef.validate(async (value) => {
        if (!value) return
        const { data: res } = await this.$http.put(
          'categories/' + this.cateId + '/attributes/' + this.editForm.attr_id,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败~')
        }
        this.$message.success('修改成功~')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 根据ID删除对应的参数项
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        '此操作将用永久删除该参数，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 用户取消了该操作
      if (confirmResult !== 'confirm') {
        return this.$refs.info('已取消删除')
      }
      // 删除业务逻辑
      const { data: res } = await this.$http.delete(
        'categories/' + this.cateId + '/attributes/' + attr_id
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败~')
      }
      this.$message.success('删除参数成功~')
      this.getParamsData()
    },
    // 文本框在失去焦点是或者按下Enter时都会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //输入正确内容后的操作
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发送请求保存操作
      this.saveAttrValues(row)
    },
    // 对attr_vals进行操作后保存到数据库
    async saveAttrValues(row) {
      const { data: res } = await this.$http.put(
        'categories/' + this.cateId + '/attributes/' + row.attr_id,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数项失败~')
      }
      this.$message.success('添加参数项成功~')
    },
    // 点击按钮展示输入框
    showInput(scope) {
      scope.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick在页面重新渲染后执行操作
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrValues(row)
    },
  },
  computed: {
    // 如果按钮需要别禁用返回 true
    // eslint-disable-next-line vue/return-in-computed-property
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    cateId() {
      return this.selectedCateKeys.length === 3
        ? this.selectedCateKeys[2]
        : null
    },
    // 动态设置Dialog文本
    // eslint-disable-next-line vue/return-in-computed-property
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  },
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 20px 0;
  font-size: 18px;
}
.el-tag {
  font-size: 15px;
  margin: 8px;
}
.input-new-tag {
  width: 150px;
}
</style>
