<template>
  <div style="margin-left: 30px;margin-top: 50px;">
    <div v-for="square in visibleSquares" :key="square.id" class="square" :style="getSquareStyle(square)" />
    <div v-if="showLoadMore" class="load-more" @click="More">加载更多</div>
    <div @click="changecolor([1,2,3,4,5])">change</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      squares: [], // 所有的正方形数据
      visibleSquares: [], // 当前可见的正方形数据
      pageSize: 100, // 每页显示的正方形数量
      currentPage: 1, // 当前页码
      showLoadMore: true // 是否显示加载更多按钮
    }
  },
  mounted() {
    this.generateSquares() // 生成所有的正方形数据
    this.loadVisibleSquares() // 加载当前页可见的正方形数据
  },
  methods: {
    generateSquares() {
      // 生成所有的正方形数据
      for (let i = 0; i < 30000; i++) {
        this.squares.push({ id: i, color: 'red' })
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
    }
  }
}
</script>

<style scoped>
.square {
  display: inline-block;
}
.load-more {
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
}
</style>
