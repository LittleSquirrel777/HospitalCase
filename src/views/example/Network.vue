<template>
  <div id="wrapper">
    <div>
      <el-form ref="postForm" style="margin-left: 20px;margin-top: 20px" :model="postForm">
        <el-row>
          <el-col :span="3">
            <el-form-item label-width="60px" label="层编号">
              <el-input v-model="postForm.layer_no" placeholder="请输入层编号" @change="handlechange" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_conv" :span="3">
            <el-form-item label-width="90px" label="卷积核编号">
              <el-input v-model="postForm.kernel_no" placeholder="请输入卷积核编号" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_conv" :span="4">
            <el-form-item label-width="90px" label="通道编号">
              <el-input v-model="postForm.channel_no" placeholder="请输入通道编号" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_conv" :span="4">
            <el-form-item label-width="90px" label="卷积核 [1]">
              <el-input v-model="postForm.num1" placeholder="请输入卷积核中第一个数据" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_conv" :span="4">
            <el-form-item label-width="90px" label="卷积核 [2]">
              <el-input v-model="postForm.num2" placeholder="请输入卷积核中第二个数据" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_fc" :span="4">
            <el-form-item label-width="120px" label="输入神经元编号">
              <el-input v-model="postForm.input_no" placeholder="请输入输入神经元编号" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_fc" :span="4">
            <el-form-item label-width="120px" label="输出神经元编号">
              <el-input v-model="postForm.output_no" placeholder="请输入输出神经元编号" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_fc" :span="4">
            <el-form-item label-width="90px" label="权重值">
              <el-input v-model="postForm.weight" placeholder="请输入权重值" />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label-width="60px">
              <el-button type="primary" size="small" icon="el-icon-edit" @click="update">修改</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item>
              <el-button type="primary" size="small" icon="el-icon-edit" @click="reset">恢复</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div id="mynetwork" />
    <div v-show="isShow" id="loadingBar">
      <div class="outerBorder">
        <div id="text">{{ progress.toFixed(2) }}</div>
        <div id="border">
          <div id="bar" class="clip" :style="{ width: progress.toFixed(2) + '%' }" />
          <!--          <div id="bar" :style="[Width]" />-->
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { createrecord, edit_net, result_write, updaterecord, verify_batch, verify_id } from '@/api/article'
import fa from 'element-ui/src/locale/lang/fa'
import { getStore } from '@/utils/localstorage'
import { Ctxt, Cypher } from '@/api/set'
require('vis-network/dist/dist/vis-network.min.css')
const vis = require('vis-network/dist/vis-network.min')
const postForm = {
  layer_no: '',
  kernel_no: '',
  channel_no: '',
  num1: '',
  num2: '',
  input_no: '',
  output_no: '',
  weight: ''
}
export default {
  name: 'Network',
  data() {
    return {
      postForm,
      show_conv: true,
      show_fc: false,
      msg: 'layout',
      num: 0,
      test: false,
      Width: { 'width': '0px' },
      isShow: false,
      progress: 0,
      isCompleted: false
    }
  },
  mounted() {
    // this.makeVis()
    const id = this.$route.params && this.$route.params.id
    this.verify1(id)
    // var a = 0
    // const id = this.$route.params && this.$route.params.id
    // var sitv = setInterval(() => {
    //   // a = this.verify(id)
    //   a = this.processbar()
    //   // console.log('a is' + a + typeof a)
    //   if (a >= 100) {
    //     this.isShow = false
    //     clearInterval(sitv)
    //     this.verify1(id)
    //     // console.log('执行了clearInterval函数')
    //   }
    // }, 100)
  },
  methods: {
    start() {
      this.isShow = true
      // this.isPlaying = true
      this.animateProgress(90)
        .then(() => {
          if (!this.isCompleted) {
            this.animateProgress(100)
          }
        })
        .catch((error) => {
          console.error('Progress error', error)
        })
    },
    animateProgress(target) {
      return new Promise((resolve, reject) => {
        const start = this.progress
        const end = target
        const duration = (target - start) * 15
        const doAnimation = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          this.progress = start + ((end - start) * progress)

          if (progress === 1) {
            resolve()
          } else if (this.isCompleted) {
            resolve()
          } else {
            requestAnimationFrame(doAnimation)
          }
        }
        const startTime = Date.now()
        requestAnimationFrame(doAnimation)
      })
    },
    handlechange() {
      if (this.postForm.layer_no == 5 || this.postForm.layer_no == 6) {
        this.show_conv = false
        this.show_fc = true
      } else {
        this.show_conv = true
        this.show_fc = false
      }
    },
    processbar() {
      this.isShow = true
      this.num = this.num + 10
      this.Width = { 'width': this.num * 5 + 'px' }
      if (this.num > 100) {
        this.num = 100
      }
      // console.log('this.num is' + typeof this.num)
      return this.num
    },
    makeVis(error_node) {
      var nodes = [
        {
          id: 0,
          label: '输入',
          group: '2',
          x: -950,
          y: 100,
          shape: 'box',
          widthConstraint: 30,
          heightConstraint: 100,
          color: 'rgb(109,173,209)',
          title: '1*205'
        },
        {
          id: 1,
          label: 'Conv_1',
          group: '4',
          x: -680,
          y: 100,
          shape: 'box',
          widthConstraint: 80,
          heightConstraint: 80,
          color: '#2A93D5',
          title: '16*102'
        },
        {
          id: 2,
          label: 'Pooling_1',
          group: '6',
          x: -350,
          y: 100,
          shape: 'box',
          widthConstraint: 80,
          heightConstraint: 80,
          color: '#2A93D5',
          title: '16*51'
        },
        {
          id: 3,
          label: 'Conv_2',
          group: '8',
          x: -350,
          y: 320,
          shape: 'box',
          widthConstraint: 80,
          heightConstraint: 80,
          color: '#2A93D5',
          title: '16*25'
        },
        {
          id: 4,
          label: 'Pooling_2',
          group: '6',
          x: -680,
          y: 320,
          shape: 'box',
          widthConstraint: 80,
          heightConstraint: 80,
          color: '#2A93D5',
          title: '16*12'
        },
        {
          id: 5,
          label: 'flatten',
          group: '6',
          x: -920,
          y: 320,
          shape: 'box',
          widthConstraint: 100,
          heightConstraint: 30,
          color: '#2A93D5',
          title: '192*1'
        },
        { id: 6, label: ' ', group: '1', x: -950, y: 410, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 7, label: ' ', group: '1', x: -950, y: 470, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 8, label: ' ', group: '1', x: -950, y: 530, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 9, label: ' ', group: '1', x: -950, y: 650, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 10, label: ' ', group: '1', x: -950, y: 710, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 11, label: '全连接层：192节点', group: '1', x: -950, y: 770, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 12, label: ' ', group: '1', x: -680, y: 410, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 13, label: ' ', group: '1', x: -680, y: 470, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 14, label: ' ', group: '1', x: -680, y: 590, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 15, label: '全连接层：512节点', group: '1', x: -680, y: 650, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 16, label: ' ', group: '1', x: -350, y: 410, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 17, label: ' ', group: '1', x: -350, y: 470, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 18, label: ' ', group: '1', x: -350, y: 530, size: 25, color: '#2A93D5', shape: 'dot' },
        { id: 19, label: '输出', group: '1', x: -350, y: 590, size: 25, color: '#2A93D5', shape: 'dot' },

        {
          id: 20,
          label: '',
          group: '3',
          x: -850,
          y: 30,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 21,
          label: '',
          group: '3',
          x: -840,
          y: 40,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 22,
          label: '',
          group: '3',
          x: -830,
          y: 50,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 23,
          label: '',
          group: '3',
          x: -820,
          y: 60,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 24,
          label: '卷积核',
          group: '3',
          x: -810,
          y: 70,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },

        // { id: 16, label: '', group: '3', x: -200, y: 100, shape: 'box', widthConstraint: 300, heightConstraint: 200, color: '#D1EBFF', title: '池化层——大小：'},
        {
          id: 25,
          label: '',
          group: '5',
          x: -550,
          y: 30,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 26,
          label: '',
          group: '5',
          x: -540,
          y: 40,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 27,
          label: '',
          group: '5',
          x: -530,
          y: 50,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 28,
          label: '',
          group: '5',
          x: -520,
          y: 60,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 29,
          label: '池化核',
          group: '5',
          x: -510,
          y: 70,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },

        {
          id: 30,
          label: '',
          group: '7',
          x: -300,
          y: 190,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 31,
          label: '',
          group: '7',
          x: -290,
          y: 200,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 32,
          label: '',
          group: '7',
          x: -280,
          y: 210,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 33,
          label: '',
          group: '7',
          x: -270,
          y: 220,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 34,
          label: '卷积核',
          group: '7',
          x: -260,
          y: 230,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },

        {
          id: 35,
          label: '',
          group: '5',
          x: -550,
          y: 250,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 36,
          label: '',
          group: '5',
          x: -540,
          y: 260,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 37,
          label: '',
          group: '5',
          x: -530,
          y: 270,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 38,
          label: '',
          group: '5',
          x: -520,
          y: 280,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },
        {
          id: 39,
          label: '池化核',
          group: '5',
          x: -510,
          y: 290,
          shape: 'box',
          widthConstraint: 40,
          heightConstraint: 40,
          color: '#D1EBFF'
        },

        { id: 40, label: ' ', group: '1', x: -950, y: 570, size: 1, color: 'black', shape: 'dot' },
        { id: 41, label: ' ', group: '1', x: -950, y: 580, size: 1, color: 'black', shape: 'dot' },
        { id: 42, label: ' ', group: '1', x: -950, y: 590, size: 1, color: 'black', shape: 'dot' },
        { id: 43, label: ' ', group: '1', x: -950, y: 600, size: 1, color: 'black', shape: 'dot' },
        { id: 44, label: ' ', group: '1', x: -950, y: 610, size: 1, color: 'black', shape: 'dot' },
        // { id: 29, label: ' ', group: '1', x: -950, y: 590, size: 25, color: 'white', shape: 'Image', image: '@/static/ellipsis.jpg' },

        { id: 45, label: ' ', group: '1', x: -680, y: 510, size: 1, color: 'black', shape: 'dot' },
        { id: 46, label: ' ', group: '1', x: -680, y: 520, size: 1, color: 'black', shape: 'dot' },
        { id: 47, label: ' ', group: '1', x: -680, y: 530, size: 1, color: 'black', shape: 'dot' },
        { id: 48, label: ' ', group: '1', x: -680, y: 540, size: 1, color: 'black', shape: 'dot' },
        { id: 49, label: ' ', group: '1', x: -680, y: 550, size: 1, color: 'black', shape: 'dot' }

        // { id: 4, label: '2-1', group: '2', x: 200, y: 0 },
        // { id: 5, label: '2-2', group: '2', x: 200, y: 200 },
        // { id: 6, label: '2-3', group: '2', x: 200, y: 400 },
        // { id: 7, label: '2-4', group: '2', x: 200, y: 600 },
        // { id: 8, label: '3-1', group: '3', x: 400, y: 0 },
        // { id: 9, label: '3-2', group: '3', x: 400, y: 200 },
        // { id: 10, label: '3-3', group: '3', x: 400, y: 400 },
        // { id: 11, label: 'output', group: '4', x: 600, y: 200 },
        // { id: 12, label: 'input', group: '5', x: -200, y: 200 },
        // { id: 13, group: '6', x: -600, y: 200, shape: 'box', size: 40, title: '卷积层', widthConstraint: 500, heightConstraint: 500, color: { background: 'green' }},
        // { id: 14, label: 'act', group: '7', x: -600, y: 200, shape: 'square', size: 30, color: 'green', title: '激活层' }
        // { id: 14, label: 'act', group: '7', x: -400, y: 200, shape: 'square', size: 30, color: 'green', title: '激活层' }
      ]

      // create some edges
      var edges = [
        { id: 0, from: 0, to: 1 },
        { id: 1, from: 1, to: 2 },
        { id: 2, from: 2, to: 3 },
        { id: 3, from: 3, to: 4 },
        { id: 4, from: 4, to: 5 }
      ]
      var id = 5
      var edge_data = {}
      for (var i = 6; i < 16; i++) {
        if (i < 12) {
          for (var j = 12; j < 16; j++) {
            edge_data = {
              id: id,
              from: i,
              to: j
            }
            edges.push(edge_data)
            id++
          }
        } else {
          for (var k = 16; k < 20; k++) {
            edge_data = {
              id: id,
              from: i,
              to: k
            }
            edges.push(edge_data)
            id++
          }
        }
      }
      if (error_node != '') {
        nodes[error_node].color = 'darkred'
        // if (error_node < 4) {
        //   for (var i = 4; i <= 11; i++) {
        //     nodes[i].color = 'darkred'
        //   }
        // } else if (error_node < 8) {
        //   for (var j = 8; j <= 11; j++) {
        //     nodes[j].color = 'darkred'
        //   }
        // } else {
        //   nodes[11].color = 'darkred'
        // }
      }
      // create a network
      var container = document.getElementById('mynetwork')
      var data = {
        edges: edges,
        nodes: nodes

      }
      var options = {
        nodes: {
          font: {
            color: 'black', // 字体的颜色
            size: 16 // 显示字体大小
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
            background: '#2A93D5',
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
        // groups: {
        //   3: { color: { background: '#055D98' }, size: 30 },
        //   4: { color: { background: '#125488' }},
        //   2: { color: { background: '#2A93D5' }},
        //   1: { color: { background: '#37CAEC' }},
        //   5: { color: { background: '#D1EBFF' }}
        // },
        layout: {
          // randomSeed: 1, // 配置每次生成的节点位置都一样，参数为数字1、2等
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
          zoomView: true // 是否能缩放画布
        },
        edges: {
          color: {
            color: 'green',
            highlight: '#000',
            hover: 'green',
            inherit: 'from',
            opacity: 1
          },
          font: {
            color: '#000',
            size: 1
          },
          scaling: {
            min: 20,
            max: 20
          },
          arrowStrikethrough: true,
          selfReferenceSize: 3,
          hoverWidth: 0.3,
          shadow: false,
          smooth: {
            enabled: true,
            type: 'dynamic',
            roundness: 0.5
          }
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
    verify1(id) {
      this.start()
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
        this.isCompleted = true
        this.progress = 1
        this.isShow = false
        this.animateProgress(100)
        if (response.code != 200) {
          this.$message({
            message: response.message,
            type: 'error'
          })
        } else {
          const error_node = response.error_node
          this.makeVis(error_node)
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
          // this.$message({
          //   message: '验证成功',
          //   type: 'success'
          // })
          console.log(verify_dict)
          result_write(verify_dict)
        }
      })
      //   .then(response => {
      //   console.log(verify_dict)
      //   result_write(verify_dict)
      // })
    },
    verify(id) {
      // this.isShow = true
      verify_id(id).then(response => {
        const error_node = response.error_node
        this.makeVis(error_node)
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
    },
    update() {
      edit_net(this.postForm).then(response => {
        if (response.code == 200) {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: response.message,
            type: 'error'
          })
        }
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    reset() {
    }
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
