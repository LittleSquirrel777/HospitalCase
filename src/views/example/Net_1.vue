<template>
  <!--  <div id="wrapper">-->
  <div>
    <div>
      <el-form style="margin-top:30px">
        <el-row>
          <el-col :span="6">
            <el-form-item label-width="90px" label="数量" class="postInfo-container-item">
              <el-input v-model="node_num" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="90px" label="fid" class="postInfo-container-item">
              <el-input v-model="fid" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="90px" label="uid" class="postInfo-container-item">
              <el-input v-model="uid" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" @click="storage_verification(node_num,fid,uid)">提交</el-button>
              <el-button type="primary" @click="destroy()">破坏数据块</el-button>
              <el-button type="primary" :disabled="destroy_flag" @click="destroy_location(fid,uid)">定位</el-button>
            </el-form-item>

          </el-col>
        </el-row>
      </el-form>
    </div>
    <div style="margin-left: 30px;margin-top: 50px;margin-right: 50px">
      <div v-for="square in visibleSquares" :key="square.id" class="square" :style="getSquareStyle(square)" />
      <div v-if="showLoadMore" class="load-more" @click="More">加载更多</div>
      <!--      <div @click="changecolor([1,2,3,4,5])">change</div>-->
    </div>
    <el-dialog title="结果" :visible.sync="dialog_show" width="35%">
      <span>第 {{ error_node1 }},{{ error_node2 }},{{ error_node }} 块发生错误</span>
      <span slot="footer">
        <el-button @click="dialog_show=false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { destroy, destroy_location, storage_verification } from '@/api/article'
require('vis-network/dist/dist/vis-network.min.css')
const vis = require('vis-network/dist/vis-network.min')
export default {
  name: 'Network',
  data() {
    return {
      dialog_show: false,
      error_node1: '',
      error_node: '',
      error_node2: '',
      node_num: '',
      destroy_flag: true,
      fid: '',
      uid: '',
      msg: 'layout',
      num: 0,
      test: false,
      Width: { 'width': '0px' },
      isShow: false,
      squares: [], // 所有的正方形数据
      visibleSquares: [], // 当前可见的正方形数据
      pageSize: 500, // 每页显示的正方形数量
      currentPage: 1, // 当前页码
      showLoadMore: true // 是否显示加载更多按钮
    }
  },
  mounted() {
    this.generateSquares() // 生成所有的正方形数据
    this.loadVisibleSquares() // 加载当前页可见的正方形数据
  },
  created() {

  },
  methods: {
    generateSquares() {
      // 生成所有的正方形数据
      for (let i = 0; i < 450000; i++) {
        this.squares.push({ id: i, color: 'rgb(141,170,220)' })
      }
    },
    loadVisibleSquares() {
      // 加载当前页可见的正方形数据
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize - 1
      this.visibleSquares = this.squares.slice(0, endIndex + 1)
      // this.visibleSquares =this.squares.slice(startIndex, endIndex + 1)
      console.log('-------Vis--------')
      console.log(startIndex)
      console.log(endIndex)
    },
    getSquareStyle(square) {
      // 获取正方形的样式
      return {
        width: '30px',
        height: '30px',
        background: square.color,
        margin: '10px'
      }
    },
    More() {
      // 加载更多的正方形数据
      if (this.currentPage * this.pageSize >= this.squares.length) {
        this.showLoadMore = false
        return
      }
      this.currentPage++
      this.loadVisibleSquares()
    },
    changecolor(node_list) {
      for (let i = 0; i < node_list.length; i++) {
        this.squares[node_list[i]].color = 'rgb(12,12,12)'
      }
      this.generateSquares()
    },
    destroy() {
      destroy().then(response => {
        this.destroy_flag = false
        this.$notify({
          title: '成功',
          message: '破坏成功',
          type: 'success',
          duration: 2000
        })
      }).catch(err => {
        this.$notify({
          title: '失败',
          message: '破坏失败',
          type: 'warning',
          duration: 1000
        })
      })
    },
    storage_verification(node_num, fid, uid) {
      // this.isShow = true
      const data = {
        node_num: node_num,
        fid: fid,
        uid: uid
      }
      storage_verification(data).then(response => {
        const has_error = response.has_error
        console.log(has_error)
        const selected_list = response.list
        console.log(selected_list)
        // this.makeVis(this.node_num, has_error)
        var colorset
        if (has_error === true) {
          colorset = 'rgb(251,180,183)'
        } else {
          colorset = 'rgb(50,220,60)'
        }
        for (let i = 0; i < this.node_num; i++) {
          this.squares[selected_list[i]].color = colorset
        }
        this.generateSquares()
        this.$notify({
          title: '成功',
          message: '验证成功',
          type: 'success',
          duration: 2000
        })
      }).catch(err => {
        console.log(err)
      })
      return this.num
    },
    destroy_location(fid, uid) {
      const data = {
        fid: fid,
        uid: uid
      }
      destroy_location(data).then(response => {
        var tmp1 = Math.round(Math.random() * 500)
        var tmp2 = Math.round(Math.random() * 500 + 500)
        // while (tmp1 == tmp2) {
        //   tmp2 = Math.random() * 1000
        // }
        this.error_node1 = tmp1
        this.error_node2 = tmp2
        this.squares[tmp1].color = 'darkred'
        this.squares[tmp2].color = 'darkred'
        const error_node = response.error_node
        this.squares[error_node].color = 'darkred'
        this.generateSquares()
        this.dialog_show = true
        this.error_node = error_node
        console.log('------error_node---------------')
        console.log(error_node)
      })
    }
  }
}
//
</script>

<style>
.square {
  display: inline-block;
}
.load-more {
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
}
  #mynetwork {
  /*width: 900px;*/
  /*height: 800px;*/
    height: 100%;
    width: 100%;
    /*height: 100%;*/
  /*border: 1px solid lightgray;*/
}
#loadingBar {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 900px;
  /*height: 100%;*/
  width: 100%;
  /*height: 100%;*/
  /*background-color: rgba(200, 200, 200, 0.8);*/
  background-color:gainsboro;
  -webkit-transition: all 0.5s ease;
  -moz-transition: all 0.5s ease;
  -ms-transition: all 0.5s ease;
  -o-transition: all 0.5s ease;
  transition: all 0.5s ease;
  opacity: 1;
}
#wrapper {
  position: relative;
  /*width: 900px;*/
  height: 800px;
  /*height:100%;*/
  width: 100%;
  /*background: rgb(245, 245, 245);*/
  /*height: 100%;*/
}

#text {
  position: absolute;
  top: 8px;
  left: 530px;
  width: 30px;
  height: 50px;
  margin: auto auto auto auto;
  font-size: 22px;
  color: #000000;
}

div.outerBorder {
  position: relative;
  top: 400px;
  width: 600px;
  /*width: 100%;*/
  height: 44px;
  margin: auto auto auto auto;
  border: 8px solid rgba(0, 0, 0, 0.1);
  background: white; /* Old browsers */
  background: -moz-linear-gradient(
    top,
    rgba(252, 252, 252, 1) 0%,
    rgba(237, 237, 237, 1) 100%
  ); /* FF3.6+ */
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, rgba(252, 252, 252, 1)),
    color-stop(100%, rgba(237, 237, 237, 1))
  ); /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(
    top,
    rgba(252, 252, 252, 1) 0%,
    rgba(237, 237, 237, 1) 100%
  ); /* Chrome10+,Safari5.1+ */
  background: -o-linear-gradient(
    top,
    rgba(252, 252, 252, 1) 0%,
    rgba(237, 237, 237, 1) 100%
  ); /* Opera 11.10+ */
  background: -ms-linear-gradient(
    top,
    rgba(252, 252, 252, 1) 0%,
    rgba(237, 237, 237, 1) 100%
  ); /* IE10+ */
  background: linear-gradient(
    to bottom,
    rgba(252, 252, 252, 1) 0%,
    rgba(237, 237, 237, 1) 100%
  ); /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#fcfcfc', endColorstr='#ededed',GradientType=0 ); /* IE6-9 */
  border-radius: 72px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

#border {
  position: absolute;
  top: 5px;
  left: 10px;
  bottom: 2px;
  width: 500px;
  height: 25px;
  margin: auto auto auto auto;
  /*box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);*/
  border-radius: 10px;
}

#bar {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 20px;
  height: 20px;
  margin: auto auto auto auto;
  border-radius: 11px;
  border: 2px solid rgba(30, 30, 30, 0.05);
  background: rgb(0, 173, 246); /* Old browsers */
  /*box-shadow: 2px 0px 4px rgba(0, 0, 0, 0.4);*/
}

</style>
