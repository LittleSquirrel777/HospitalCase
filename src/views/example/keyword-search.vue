<template>
  <div class="app-container">
    <div class="filter-container">
      <!--      <span class="filter-item" style="margin-right: 10px;color:darkgray">关键词一： </span>-->
      <!--      <el-input v-model="listQuery.keyword1" placeholder="请输入关键词" clearable style="width: 150px;margin-right: 10px" class="filter-item"></el-input>-->
      <!--      <span class="filter-item" style="margin-right: 10px;color:darkgray">关键词二： </span>-->
      <!--      <el-input v-model="listQuery.keyword2" placeholder="请输入关键词" clearable style="width: 150px;margin-right: 10px" class="filter-item"></el-input>-->
      <!--      <span class="filter-item" style="margin-right: 10px;color:darkgray">关键词三： </span>-->
      <!--      <el-input v-model="listQuery.keyword3" placeholder="请输入关键词" clearable style="width: 150px;margin-right: 10px" class="filter-item"></el-input>-->
      <!--      -->
      <el-form ref="formInline" :inline="true" :model="formInline" label-width="120px" class="filter-item">
        <div v-for="(item,index) in formInline.Item" :key="index" class="filter-item">
          <el-form-item :prop="'item.'+index+ '.keyword'" :label="&quot;关键词&quot;+(index+1)" class="filter-item">
            <el-input v-model="item.keyword" required />
          </el-form-item>
          <el-form-item class="filter-item"><i v-if="index !==0" class="el-icon-remove-outline" type="danger" style="font-size:30px;color:#f56c6c;cursor:pointer" @click="$event => del(index)" />
          </el-form-item>
        </div>
        <el-form-item> <el-button class="filter-item" icon="el-icon-circle-plus-outline" type="primary" @click="$event => addItem()">增加关键词</el-button>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">检索</el-button>
          <el-button class="filter-item" type="primary" icon="el-icon-edit-outline" @click="handleCreate">新增记录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column v-model="multipleSelection" type="selection" width="50px" align="center" />
      <el-table-column align="center" label="患者编号" width="80">
        <template slot-scope="scope">
          <span>患者 {{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column width="120px" align="center" label="患者编号">-->
      <!--        <template slot-scope="scope">-->
      <!--          <span>{{ scope.row.name }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit-outline" @click="handleUpdate(scope.row.id)">
            修改
          </el-button>
          <el-button type="primary" size="small" icon="el-icon-delete" style="margin-left: 10px" @click="delete_record(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialog_show" width="35%" :before-close="handleClose">
      <el-input v-model="dialog_num" />
      <!--      <span> {{ dialog_num }}</span>-->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog_show = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { createdata, fetchall, handledelete, handleFilter_keywords, updatedata } from '@/api/article'
import Pagination from '@/components/Pagination'
import 'jspdf-autotable'
export default {
  name: 'ArticleList',
  components: { Pagination },
  data() {
    return {
      formInline: {
        Item: [{ keyword: '' }]
      },
      dialog_show: false,
      dialog_num: '',
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      multipleSelection: [],
      multis: undefined
    }
  },
  created() {
    this.getList()
  },
  methods: {
    addItem() {
      this.formInline.Item.push({
        keyword: ''
      })
    },
    del(index) {
      this.formInline.Item.splice(index, 1)
    },
    handleFilter() {
      var data = []
      var length = this.formInline.Item.length
      data['len'] = length
      for (var i = 0; i < length; i++) {
        var my_str = 'keyword_' + String(i)
        if (this.formInline.Item[i].keyword === '') {
          this.$message({
            message: '请输入关键词',
            type: 'error'
          })
          return
        }
        data[my_str] = this.formInline.Item[i].keyword
      }
      this.listLoading = true
      console.log(data)
      handleFilter_keywords(data).then(response => {
        if (response.code == 200) {
          this.total = response.total
          this.listLoading = false
          const pageList = response.items.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
          this.list = pageList
        } else {
          this.$message({
            message: '检索失败',
            type: 'error'
          })
        }
      }).catch(() => {
        alert('error!!!')
      })
    },
    delete_record(id) {
      const data = {
        id: id
      }
      handledelete(data).then(response => {
        if (response.code == 200) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getList()
        } else {
          this.$message({
            message: '删除失败',
            type: 'error'
          })
        }
      }).catch(() => {
        alert('error!!!')
      })
    },
    handleClose() {
      this.dialog_show = false
    },
    handleCreate() {
      this.dialog_num = ''
      this.dialog_show = true
      this.dialogStatus = 'create'
    },
    createData() {
      const data = {
        data: this.dialog_num
      }
      createdata(data).then(response => {
        if (response.code == 200) {
          this.$message({
            message: '数据新增成功',
            type: 'success'
          })
          this.dialog_show = false
        } else {
          this.$message({
            message: '数据新增失败',
            type: 'error'
          })
        }
      }).catch(() => {
        alert('error!!!')
      })
    },
    handleUpdate(id) {
      this.dialog_num = '患者' + String(id)
      this.dialogStatus = 'update'
      this.dialog_show = true
    },
    updateData() {
      const data = {
        data: this.dialog_num
      }
      updatedata(data).then(response => {
        if (response.code == 200) {
          this.$message({
            message: '数据修改成功',
            type: 'success'
          })
          this.dialog_show = false
        } else {
          this.$message({
            message: '数据修改失败',
            type: 'error'
          })
        }
      }).catch(() => {
        alert('error!!!')
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getList() {
      this.listLoading = true
      fetchall().then(response => {
        // this.list = response.items
        this.total = response.total
        this.listLoading = false
        const pageList = response.items.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
        this.list = pageList
      }).catch(() => {
        alert('error!!!')
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
