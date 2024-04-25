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
          <el-col v-if="show_conv" :span="3">
            <el-form-item label-width="90px" label="通道编号">
              <el-input v-model="postForm.channel_no" placeholder="请输入通道编号" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_conv" :span="3">
            <el-form-item label-width="90px" label="卷积核 [1]">
              <el-input v-model="postForm.num1" placeholder="请输入卷积核中第一个数据" />
            </el-form-item>
          </el-col>
          <el-col v-if="show_conv" :span="3">
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
            <el-form-item label-width="20px">
              <el-button type="primary" size="small" icon="el-icon-edit-outline" @click="update">修改</el-button>
            </el-form-item>
          </el-col>
          <!--          <el-col :span="3">-->
          <!--            <el-form-item>-->
          <!--              <el-button type="primary" size="small" icon="el-icon-brush" @click="reset">恢复</el-button>-->
          <!--            </el-form-item>-->
          <!--          </el-col>-->
          <el-col :span="3">
            <el-form-item>
              <el-button type="primary" size="small" icon="el-icon-document-checked" @click="verify">验证</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!--    <div id="mynetwork" />-->
    <canvas ref="canvas" width="2000" height="600" />
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
import { edit_net, reset_net, result_write, verify2, verify_batch } from '@/api/article'
import { getStore } from '@/utils/localstorage'
import { Ctxt, Cypher } from '@/api/set'
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
      isCompleted: false,
      id: this.$route.params && this.$route.params.id,
      squares: [
        { id: 0, x: 100, y: 100, width: 10, height: 250, color: 'rgb(171,171,171)' },
        { id: 1, x: 300, y: 100, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 2, x: 310, y: 110, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 3, x: 320, y: 120, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 4, x: 330, y: 130, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 5, x: 340, y: 140, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 6, x: 350, y: 150, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 7, x: 360, y: 160, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 8, x: 370, y: 170, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 9, x: 380, y: 180, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 10, x: 390, y: 190, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 11, x: 400, y: 200, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 12, x: 410, y: 210, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 13, x: 420, y: 220, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 14, x: 430, y: 230, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 15, x: 440, y: 240, width: 100, height: 100, color: 'rgb(230,230,230,0.9)' },
        { id: 16, x: 450, y: 250, width: 100, height: 100, color: 'rgb(171,171,171,0.9)' },
        { id: 17, x: 500, y: 300, width: 10, height: 10, color: 'white' },

        { id: 18, x: 600, y: 100, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 19, x: 610, y: 110, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 20, x: 620, y: 120, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 21, x: 630, y: 130, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 22, x: 640, y: 140, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 23, x: 650, y: 150, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 24, x: 660, y: 160, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 25, x: 670, y: 170, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 26, x: 680, y: 180, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 27, x: 690, y: 190, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 28, x: 700, y: 200, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 29, x: 710, y: 210, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 30, x: 720, y: 220, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 31, x: 730, y: 230, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 32, x: 740, y: 240, width: 80, height: 80, color: 'rgb(230,230,230,0.9)' },
        { id: 33, x: 750, y: 250, width: 80, height: 80, color: 'rgb(171,171,171,0.9)' },
        { id: 34, x: 800, y: 300, width: 10, height: 10, color: 'white' },

        { id: 35, x: 800, y: 100, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 36, x: 810, y: 110, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 37, x: 820, y: 120, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 38, x: 830, y: 130, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 39, x: 840, y: 140, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 40, x: 850, y: 150, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 41, x: 860, y: 160, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 42, x: 870, y: 170, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 43, x: 880, y: 180, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 44, x: 890, y: 190, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 45, x: 900, y: 200, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 46, x: 910, y: 210, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 47, x: 920, y: 220, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 48, x: 930, y: 230, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 49, x: 940, y: 240, width: 70, height: 70, color: 'rgb(230,230,230,0.9)' },
        { id: 50, x: 950, y: 250, width: 70, height: 70, color: 'rgb(171,171,171,0.9)' },
        { id: 51, x: 1000, y: 300, width: 10, height: 10, color: 'white' },

        { id: 35, x: 1000, y: 100, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 36, x: 1010, y: 110, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 37, x: 1020, y: 120, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 38, x: 1030, y: 130, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 39, x: 1040, y: 140, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 40, x: 1050, y: 150, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 41, x: 1060, y: 160, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 42, x: 1070, y: 170, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 43, x: 1080, y: 180, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 44, x: 1090, y: 190, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 45, x: 1100, y: 200, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 46, x: 1110, y: 210, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 47, x: 1120, y: 220, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 48, x: 1130, y: 230, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 49, x: 1140, y: 240, width: 50, height: 50, color: 'rgb(230,230,230,0.9)' },
        { id: 50, x: 1150, y: 250, width: 50, height: 50, color: 'rgb(171,171,171,0.9)' },
        { id: 51, x: 1160, y: 260, width: 8, height: 8, color: 'white' }]
    }
  },
  mounted() {
    const id = this.$route.params && this.$route.params.id
    this.verify1(id)
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
            message: 操作失败,
            type: 'error'
          })
        } else {
          const error_node = response.error_node
          if (error_node != '') {
            const square = this.squares[error_node]
            square.color = 'darkred'
          }
          this.drawNetwork1()
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
          this.$message({
            message: '验证成功',
            type: 'success'
          })
        }
      }).then(response => {
        console.log(verify_dict)
        result_write(verify_dict)
      })
    },
    verify() {
      const id = this.$route.params && this.$route.params.id
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
      verify_batch(dict).then(response => {
        this.isCompleted = true
        this.progress = 1
        this.isShow = false
        this.animateProgress(100)
        var layer_nos = response.layer_no
        var kernel_nos = response.kernel_no
        console.log()
        var error_node
        for (let i = 0; i < layer_nos.length; i++) {
          var layer_no = layer_nos[i]
          var kernel_no = kernel_nos[i]
          if (layer_no == 5 || layer_no == 6) {
            const canvas = this.$refs.canvas
            const ctx = canvas.getContext('2d')
            this.drawParallelogram(ctx, 1250, 150, 1350, 250, 10, 'darkred', '')
          } else {
            error_node = 17 * (layer_no - 1) + kernel_no
            if (error_node > 0) {
              const square = this.squares[error_node]
              square.color = 'darkred'
            } else {
              this.$message({
                message: '验证成功',
                type: 'success'
              })
            }
          }
        }
        this.drawNetwork1()
      })
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
      reset_net().then(response => {
        if (response.code == 200) {
          this.$message({
            message: '重置成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '重置失败',
            type: 'error'
          })
        }
      }).catch(err => {
        console.log(err)
      })
    },
    drawRect(ctx, x, y, width, height, color, text) {
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)

      ctx.font = '18px Arial'
      ctx.fillStyle = '#000000'
      // ctx.strokeStyle = 'black'
      // ctx.strokeRect(x,y,width,height)
      ctx.fillText(text, x + 10, y + 30)
    },
    drawLine(ctx, startX, startY, endX, endY) {
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    },
    drawParallelogram(ctx, x1, y1, x2, y2, width, color, text) {
      // 绘制平行四边形
      ctx.beginPath()
      ctx.moveTo(x1, y1) // 左上角点
      ctx.lineTo(x1 + width, y1) // 右上角点
      ctx.lineTo(x2 + width, y2) // 右下角点
      ctx.lineTo(x2, y2) // 左下角点
      ctx.closePath()
      ctx.fillStyle = color // 设置填充颜色
      ctx.fill()
      ctx.fillText(text, x1 + 10, y1 + 30)
    },
    drawSquares(context) {
      // 绘制所有正方形
      this.squares.forEach(square => {
        context.fillStyle = square.color
        context.fillRect(square.x, square.y, square.width, square.height)
      })
    },
    drawNetwork1() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')
      this.drawSquares(ctx)
      ctx.fillStyle = 'black'
      ctx.font = '18px Georgia'
      ctx.fillText('1×205', 90, 90)
      ctx.fillText('输入', 90, 390)
      // conv
      ctx.fillText('16@1×2', 310, 90)

      this.drawLine(ctx, 110, 100, 480, 260)
      this.drawLine(ctx, 110, 350, 480, 260)
      ctx.fillText('Convolution', 250, 390)
      // 绘制池化层
      ctx.fillText('16@16×2', 610, 90)
      this.drawLine(ctx, 510, 300, 780, 270)
      this.drawLine(ctx, 510, 310, 780, 270)
      ctx.fillText('Pool', 650, 390)
      // conv
      ctx.fillText('16@16×2', 810, 90)
      this.drawLine(ctx, 810, 300, 980, 280)
      this.drawLine(ctx, 810, 310, 980, 280)
      ctx.fillText('Convolution', 860, 390)
      // conv
      ctx.fillText('16@16×2', 1010, 90)
      this.drawLine(ctx, 1010, 300, 1180, 290)
      this.drawLine(ctx, 1010, 310, 1180, 290)
      ctx.fillText('Pool', 1100, 390)
      // // 绘制全连接层
      ctx.fillText('1×192', 1240, 90)
      this.drawParallelogram(ctx, 1250, 150, 1350, 250, 10, 'rgb(171,171,171)', '')
      this.drawLine(ctx, 1050, 100, 1250, 150)
      this.drawLine(ctx, 1200, 300, 1350, 250)
      ctx.fillStyle = 'black'
      ctx.fillText('flatten', 1300, 390)
      ctx.fillText('1×4', 1380, 90)
      this.drawParallelogram(ctx, 1400, 170, 1450, 230, 10, 'rgb(171,171,171)', '')
      this.drawLine(ctx, 1260, 150, 1400, 170)
      this.drawLine(ctx, 1360, 250, 1450, 230)
      ctx.fillStyle = 'black'
      ctx.fillText('输出', 1450, 390)
    },
    changeSquareColor(event) {
      const canvas = this.$refs.canvas
      const context = canvas.getContext('2d')

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      // 遍历所有正方形
      this.squares.forEach(square => {
        // 判断鼠标点击的位置是否在正方形内
        if (x >= square.x && x <= square.x + square.width && y >= square.y && y <= square.y + square.height) {
          // 修改正方形的颜色
          square.color = 'rgb(246,202,229)'
          // 清除之前的正方形
          context.clearRect(square.x, square.y, square.width, square.height)
          // 绘制新的正方形
          context.fillStyle = square.color
          context.fillRect(square.x, square.y, square.width, square.height)
        }
      })
    },
    changeSquareColor1(error_node) {
      const canvas = this.$refs.canvas
      const context = canvas.getContext('2d')
      const square = this.squares[1]
      context.clearRect(square.x, square.y, square.width, square.height)
      square.color = '#c9c0d3'
      // 绘制新的正方形
      context.fillStyle = square.color
      context.fillRect(square.x, square.y, square.width, square.height)
    }
  }
}
//
</script>

<style>
canvas {
border: 0px solid #000000;
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
