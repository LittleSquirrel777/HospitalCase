<template>
  <div id="wrapper">
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
            </el-form-item>

          </el-col>
        </el-row>
      </el-form>

    </div>
    <!--    <van-overlay v-show="isShow">-->
    <!--    <div class="progress-bar">-->
    <!--      <div class="box">-->
    <!--        <div id="context" class="clip" :style="[Width]" />-->
    <!--      </div>-->
    <!--      <span><span id="number">{{ num }}</span><i>%</i></span>-->
    <!--    </div>-->
    <!--  </van-overlay>-->
    <div id="mynetwork" />
    <!--    <div v-show="isShow" id="loadingBar">-->
    <!--      <div class="outerBorder">-->
    <!--        <div id="text">{{ num }}</div>-->
    <!--        <div id="border">-->
    <!--          <div id="bar" :style="[Width]" />-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script>
import { destroy, storage_verification } from '@/api/article'
require('vis-network/dist/dist/vis-network.min.css')
const vis = require('vis-network/dist/vis-network.min')
export default {
  name: 'Network',
  data() {
    return {
      node_num: '',
      fid: '',
      uid: '',
      msg: 'layout',
      num: 0,
      test: false,
      Width: { 'width': '0px' },
      isShow: false
    }
  },
  mounted() {
    // this.makeVis(10000,false)
    var a = 0
    // const id = this.$route.params && this.$route.params.id
    var sitv = setInterval(() => {
      // a = this.verify(id)
      a = this.processbar()
      // console.log('a is' + a + typeof a)
      if (a >= 100) {
        this.isShow = false
        clearInterval(sitv)
        // this.storage_verification(this.node_num)
        // console.log('执行了clearInterval函数')
      }
    }, 100)
  },
  created() {

  },
  methods: {
    processbar() {
      this.isShow = true
      this.num = this.num + 10
      this.Width = { 'width': this.num * 5 + 'px' }
      if (this.num > 100) {
        this.num = 100
      }
      console.log('this.num is' + typeof this.num)
      return this.num
    },
    makeVis(node_num, has_error) {
      var nodes1 = []
      var nodes2 = new vis.DataSet()
      var edge = []
      var w = document.getElementById('wrapper').offsetWidth
      var node_data = {}
      // const h = document.body.wrapper.height
      for (var i2 = 0; i2 < node_num; i2++) {
        if (i2 == 0) {
          nodes2.add({
            id: i2,
            label: 'node' + String(i)
          })
        } else {
          // var tmp_x2, tmp_y2, tmp2
          // tmp2 = 1
          // if (tmp2 < 10) {
          //   tmp2++
          //   tmp_x2 = nodes1[i - 1].x + 20
          //   tmp_y2 = nodes1[i - 1].y
          // } else {
          //   tmp2 = 1
          //   tmp_x2 = 0
          //   tmp_y2 = nodes1[i - 1].y + 20
          // }
          nodes2.add({
            id: i2,
            label: 'node' + String(i)
          })
        }
      }
      for (var i = 0; i < node_num; i++) {
        if (i == 0) {
          node_data = {
            id: i,
            shape: 'square',
            // size: (w - 180) / 10,
            size: 20,
            x: 0,
            y: 0,
            label: '数据块' + String(i),
            color: 'rgb(141,170,220)'
          }
        } else {
          var tmp_x
          var tmp_y
          // // alert(nodes[i - 1].x)
          if (nodes1[i - 1].x + (w - 29) / 30 + 1 > w) {
            tmp_x = 0
            tmp_y = nodes1[i - 1].y + (w - 180) / 30 + 30
          } else {
            tmp_x = nodes1[i - 1].x + (w - 29) / 30 + 1
            tmp_y = nodes1[i - 1].y
          }
          node_data = {
            id: i,
            shape: 'square',
            // size: (w - 180) / 10,
            size: 20,
            x: tmp_x,
            y: tmp_y,
            label: '数据块' + String(i),
            color: 'rgb(141,170,220)'
          }
        }
        // alert(node_data)
        nodes1.push(node_data)
      }
      // var nodesArray = new vis.DataSet(nodes)
      // alert(nodes.length)
      // alert(nodes[1].x)
      // create some edges
      // alert(typeof (error_node))
      if (has_error === true) {
        for (let i = 0; i < node_num; i++) {
          nodes1[i].color = 'darkred'
        }
        this.$message({
          message: '验证失败，数据块发生了损坏',
          type: 'error'
        })
        // nodes1[error_node].color = 'darkred'
      }
      // create a network
      var container = document.getElementById('mynetwork')
      var data = {
        // nodes: new vis.DataSet(nodes)
        nodes: nodes1,
        edge: edge
      }
      var options = {
        nodes: {
          font: {
            color: 'black', // 字体的颜色
            size: 10 // 显示字体大小
          },
          scaling: {
            min: 0,
            max: 0, // 缩放效果比例
            label: {
              enabled: true,
              min: 8,
              max: 8,
              maxVisible: 0
            }
          },
          borderWidth: 1,
          color: {
            border: 'white',
            hover: '',
            highlight: 'green'
          },
          shape: 'circle',
          shapeProperties: {
            interpolation: true
          },
          size: 30
        },
        layout: {
          randomSeed: 1, // 配置每次生成的节点位置都一样，参数为数字1、2等
          improvedLayout: false,
          hierarchical: false
        },
        physics: {
          barnesHut: {
            gravitationalConstant: 0,
            springConstant: 0,
            springLength: 0
          }
        },
        interaction: {
          hover: false, // 鼠标移过后加粗该节点和连接线
          selectConnectedEdges: true, // 选择节点后是否显示连接线
          hoverConnectedEdges: false, // 鼠标滑动节点后是否显示连接线
          tooltipDelay: 200,
          zoomView: false // 是否能缩放画布
        }
      }
      var network = new vis.Network(container, data, options)
      // network.on('stabilizationProgress', function(params) {
      //   var maxWidth = 496
      //   var minWidth = 20
      //   var widthFactor = params.iterations / params.total
      //   var width = Math.max(minWidth, maxWidth * widthFactor)
      //
      //   document.getElementById('bar').style.width = width + 'px'
      //   document.getElementById('text').innerText =
      // Math.round(widthFactor * 100) + '%'
      // })
      // network.once('stabilizationIterationsDone', function() {
      //   document.getElementById('text').innerText = '100%'
      //   document.getElementById('bar').style.width = '496px'
      //   document.getElementById('loadingBar').style.opacity = 0
      //   // really clean the dom element
      //   setTimeout(function() {
      //     document.getElementById('loadingBar').style.display = 'none'
      //   }, 500)
      // })
    },
    destroy() {
      destroy().then(response => {
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
        this.makeVis(this.node_num, has_error)
        // this.num = response.num
        // this.Width = { 'width': this.num * 5 + 'px' }
        // if (this.num >= 100) {
        //   this.num = 100
        //   const error_node = response.error_node
        //   this.makeVis(error_node)
        // }
      }).catch(err => {
        console.log(err)
      })
      return this.num
    }
    // destory() {
    //   const data = {
    //     fid: this.fid,
    //     uid: this.uid
    //   }
    //   destroy(data).then(response => {
    //     this.$notify({
    //       title: '成功',
    //       message: '破坏成功',
    //       type: 'success',
    //       duration: 2000
    //     })
    //   }).catch(err => {
    //     console.log(err)
    //   })
    //   return this.num
    // }
  }
}
//
</script>

<style>
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
