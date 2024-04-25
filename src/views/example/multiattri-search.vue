<template>
  <div class="app-container">
    <div class="filter-container">
      <!--      <span class="filter-item" style="margin-right: 10px;">日期: </span>-->
      <el-date-picker v-model="listQuery.date_begin" placeholder="开始日期" class="filter-item" style="width: 150px;margin-right: 10px" />
      <span class="filter-item" style="margin-right: 10px;color:darkgray">—</span>
      <el-date-picker v-model="listQuery.date_end" placeholder="结束日期" class="filter-item" style="width: 150px;margin-right: 40px" />
      <!--      <el-input v-model="listQuery.id" placeholder="编号" style="width: 150px;margin-right: 10px" class="filter-item" @keyup.enter.native="handleFilter" />-->
      <el-select v-model="listQuery.age_begin" placeholder="最小年龄" clearable style="width: 150px;margin-right: 10px" class="filter-item">
        <el-option v-for="item in 100" :key="item" :label="item" :value="item" />
      </el-select>
      <span class="filter-item" style="margin-right: 10px;color:darkgray">—</span>
      <el-select v-model="listQuery.age_end" placeholder="最大年龄" clearable style="width: 150px;margin-right: 40px" class="filter-item">
        <el-option v-for="item in 100" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.result_begin" placeholder="预测结果1" clearable class="filter-item" style="width: 150px;margin-right: 10px">
        <el-option v-for="item in resultlist" :key="item" :label="item" :value="item" />
      </el-select>
      <span class="filter-item" style="margin-right: 10px;color:darkgray">—</span>
      <el-select v-model="listQuery.result_end" placeholder="预测结果2" clearable class="filter-item" style="width: 150px;margin-right: 10px">
        <el-option v-for="item in resultlist" :key="item" :label="item" :value="item" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>
    <el-button type="primary" size="medium" style="margin-bottom: 10px; float:right" @click="Checkbox"><i class="el-icon-s-check">批量验证</i></el-button>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column v-model="multipleSelection" type="selection" width="50px" align="center" />
      <el-table-column align="center" label="编号" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="时间">
        <template slot-scope="scope">
          <!--          <span>{{ scope.row.time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
          <span>{{ scope.row.time | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="姓名">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            <!--          <el-tag>-->
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="推理结果">
        <template slot-scope="{row}">
          <router-link :to="'/record/edit/'+row.id" class="link-type">
            <span>
              <el-tag :type="row.result | resultFilter">
                {{ row.result }}
              </el-tag>
            </span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="验证结果">
        <span>{{ verify_res }}</span>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <router-link :to="'/record/edit/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit-outline">
              修改
            </el-button>
          </router-link>
          <el-button type="primary" size="small" icon="el-icon-delete" style="margin-left: 10px" @click="delete_record(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="提示" :visible.sync="dialog_show" width="35%" :before-close="handleClose">
      <span>推理结果为： {{ dialog_result }}</span>
      <span slot="footer">
        <el-button @click="dialog_show=false">确定</el-button>
      </span>
    </el-dialog>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { exportpdf, fetchall, handledelete, handleFilter_multiattri, result_write, verify_batch } from '@/api/article'
import Pagination from '@/components/Pagination'
import { getStore } from '@/utils/localstorage'
import { Ctxt, Cypher } from '@/api/set'
import 'jspdf-autotable'
import pdf from 'vue-pdf'
import vueshowpdf from 'vueshowpdf'
export default {
  name: 'ArticleList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        verified: 'blue',
        created: 'info',
        computed: 'danger'
      }
      return statusMap[status]
    },
    resultFilter(status) {
      const resultMap = {
        NO1: 'success',
        NO2: 'info',
        NO3: 'danger',
        NO4: 'orange'
      }
      return resultMap[status]
    }
  },
  data() {
    return {
      resultlist: ['NO1', 'NO2', 'NO3', 'NO4'],
      dialog_show: false,
      dialog_result: '',
      isshowpdf: false,
      verify_res: '',
      src: '/home/andy/code/front/hospital-front1/public/static/pdftest.pdf',
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        age_begin: '',
        age_end: '',
        result_begin: '',
        result_end: '',
        date_begin: '',
        date_end: ''
      },
      multipleSelection: [],
      multis: undefined
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleFilter() {
      this.listLoading = true
      handleFilter_multiattri(this.listQuery).then(response => {
        if (response.code == 200) {
          this.total = response.total
          this.listLoading = false
          const pageList = response.items.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
          this.list = pageList
          console.log('----------123--------------')
          console.log(this.list)
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
      })
    },
    verify() {
      var arr = this.multipleSelection
      const dict = {
        'ids': arr[0].id
      }
      const list = []
      for (var i = 0; i < arr.length; i++) {
        list.push(arr[i].id)
      }
      dict['ids'] = list
      var verify_res = []
      var verify_ids = []
      var verify_dict = {
        'ids': arr[0].id,
        'res': arr[0].id
      }
      // 将数组中key值为id的数据遍历出来，然后，将所得到的数据传入mutis数组中，最后将multis数据提交至后端
      verify_batch(dict).then(response => {
        this.verify_res = '验证通过'
        if (response.code != 200) {
          this.$message({
            message: response.message,
            type: 'error'
          })
        } else {
          var data = getStore(this.$store.getters.name)
          data = JSON.parse(data)
          // console.log(data)]
          for (let i = 0; i < dict['ids'].length; i++) {
            // var lx = 'l' + String(dict['ids'][i])
            var lx = 'l' + String(i)
            console.log('-----------lx---------')
            console.log(lx)
            var list = response[lx]
            console.log('-----------list---------')
            console.log(list)
            const transpose1 = matrix => matrix[0].map((_, i) => matrix.map(row => row[i]))
            var t_list = transpose1(list)
            const cypher = new Cypher(281602337934977853466841830245427184521n, 79282169705769363565508359150665314252n, 20)
            // const cypher = new Cypher(BigInt(data.alpha), BigInt(data.beta), 40)
            var plaintxt = []
            for (let i = 0; i < t_list.length; i++) {
              var c = new Ctxt(BigInt(t_list[i][0]), BigInt(t_list[i][1]), BigInt(t_list[i][2]))
              // console.log(c)
              plaintxt.push(cypher.decrypt(c))
            }
            console.log(plaintxt)
            var result = Math.max(...plaintxt)
            var res_index = plaintxt.indexOf(result)
            console.log('--------res-----------')
            console.log(result)
            console.log('--------res_index---------')
            console.log(res_index)
            verify_ids.push(dict['ids'][i])
            // verify_ids.push(i)
            verify_res.push(res_index)
          }
          verify_dict['ids'] = verify_ids
          verify_dict['res'] = verify_res
          console.log('---------verify_res----------')
          console.log(verify_res)
          console.log(verify_dict)
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          result_write(verify_dict)
          this.getList()
        }
      })
      //   .then(response => {
      //   console.log(verify_dict)
      //   result_write(verify_dict)
      // })
    },
    infer(id) {
      const dict = {
        'ids': id
      }
      var list = []
      list.push(id)
      dict['ids'] = list
      var verify_res = []
      var verify_ids = []
      var verify_dict = {
        'ids': id,
        'res': id
      }
      // 将数组中key值为id的数据遍历出来，然后，将所得到的数据传入mutis数组中，最后将multis数据提交至后端
      verify_batch(dict).then(response => {
        if (response.code != 200) {
          this.$message({
            message: response.message,
            type: 'error'
          })
        } else {
          var data = getStore(this.$store.getters.name)
          data = JSON.parse(data)
          for (let i = 0; i < dict['ids'].length; i++) {
            // var lx = 'l' + String(dict['ids'][i])
            var lx = 'l' + String(i)
            var list = response[lx]
            console.log('-------------lx---------')
            console.log(lx)
            const transpose1 = matrix => matrix[0].map((_, i) => matrix.map(row => row[i]))
            var t_list = transpose1(list)
            const cypher = new Cypher(281602337934977853466841830245427184521n, 79282169705769363565508359150665314252n, 20)
            // const cypher = new Cypher(BigInt(data.alpha), BigInt(data.beta), 40)
            var plaintxt = []
            for (let i = 0; i < t_list.length; i++) {
              var c = new Ctxt(BigInt(t_list[i][0]), BigInt(t_list[i][1]), BigInt(t_list[i][2]))
              // console.log(c)
              plaintxt.push(cypher.decrypt(c))
            }
            console.log(plaintxt)
            var result = Math.max(...plaintxt)
            var res_index = plaintxt.indexOf(result)
            verify_ids.push(dict['ids'][i])
            // verify_ids.push(i)
            verify_res.push(res_index)
          }
          verify_dict['ids'] = verify_ids
          verify_dict['res'] = verify_res
          result_write(verify_dict)
          this.dialog_show = true
          const dis_list = ['NO1', 'NO2', 'NO3', 'NO4']
          this.dialog_result = dis_list[verify_res[0]]
          this.getList()
        }
      })
    },
    Checkbox() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请至少勾选一项，再进行操作',
          type: 'warning'
        })
      } else {
        this.verify()
      }
    },
    exportpdf1(id) {
      // this.isshowpdf=true
      const data = {
        id: id
      }
      exportpdf(data).then(response => {
        if (response.code != 200) {
          this.$message({
            message: response.message,
            type: 'error'
          })
        } else {
          this.isshowpdf = true
        }
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
