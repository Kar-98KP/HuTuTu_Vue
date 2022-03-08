<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-col>
            <el-button type="primary" @click="showAddCateDialog"
              >添加分类</el-button
            >
          </el-col>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="TreeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        style="font-size: 20px"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-circle-check"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-circle-close" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success"
            >二级</el-tag
          >
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="deleteCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFromRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options为数据源 -->
          <!-- props用于指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类
    <el-dialog title="修改分类" :visible.sync="dialogVisible" width="50%">
      <el-form>
        <el-form-item label="分类名称">
          <el-input v-model="editName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog> -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      //查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品分类的数据列表，默认为空
      catelist: [],
      // 总的数据条数
      total: 0,
      //   为Table指定列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //   使用自定义模板
          type: 'template',
          //   模板名称
          template: 'isOk',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: '排序',
          //   使用自定义模板
          type: 'template',
          //   模板名称
          template: 'order',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: '操作',
          //   使用自定义模板
          type: 'template',
          //   模板名称
          template: 'opt',
          align: 'center',
          headerAlign: 'center',
        },
      ],
      //   控制添加分类对话框的显示
      addCateDialogVisible: false,
      //   添加分类的表单数据对象
      addCateForm: {
        //   将要添加的分类名称
        cat_name: '',
        //父级ID
        cat_pid: 0,
        //添加分类等级默认为1
        cat_level: 0,
      },
      //   添加分类表单的规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      //   父级分类列表
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //   选中的父级分类ID数组
      selectedKeys: [],
      // //控制修改用户信息对框的隐藏
      // dialogVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败~')
      }
      //   把数据列表赋值进列表
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听PageSize的改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听PageNum的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮显示添加对话框
    showAddCateDialog() {
      // 先获取数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败~')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化
    parentCateChange() {
      // 判断selectedKeys的长度是否大于零，如果大于则选择了父级

      // 添加的父级分类ID
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类等级
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        // 当前分类等级
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加分类
    addCate() {
      this.$refs.addCateFromRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败~')
        }
        this.$message.success('添加分类成功~')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加对话框的关闭，目的：重置添加表单
    addCateDialogClose() {
      this.$refs.addCateFromRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 根据ID删除分类
    async deleteCateById(CateId) {
      //弹框询问用户是否删除数据
      const conFirmResult = await this.$confirm(
        '此操作将永久删除该分组, 是否继续?',
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
      const { data: res } = await this.$http.delete('categories/' + CateId)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分组失败~')
      }
      this.$message.success('删除分组成功~')
      this.getCateList()
    },
    // 根据ID对分类进行修改
    async showEditDialog(CateId) {
      const conFirmResult = await this.$prompt('请输入分类名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        // inputPattern: !null,
        // inputErrorMessage: '邮箱格式不正确',
      })
        .then(async ({ value }) => {
          const { data: res } = await this.$http.put('categories/' + CateId, {
            cat_name: value,
          })
          if (res.meta.status !== 200) {
            console.log(res)
            return this.$message.error('修改分类名称失败~')
          }
          this.$message.success('修改分类名称成功~')
          this.getCateList()
          // this.$message({
          //   type: 'success',
          //   message: '你的邮箱是: ' + value,

          // })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消修改分类名称~',
          })
        })
      // 如果用户点击确认删除，则返回字符 confirm
      // 如果用户点击取消删除，则返回字符 cancle
      // if (conFirmResult !== 'confirm')
      //   return this.$message.info('已经取消了删除')
      // const { data: res } = await this.$http.delete('categories/' + CateId)
      // if (res.meta.status !== 200) {
      //   return this.$message.error('删除分组失败~')
      // }
      // this.$message.success('删除分组成功~')
      // this.getCateList()
    },
  },
}
</script>
<style lang="less" scoped>
.TreeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-dialog {
  font-size: 24px;
}
.el-input__inner {
  font-size: 24px;
}
</style>
