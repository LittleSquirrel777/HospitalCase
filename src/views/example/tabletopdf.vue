<template>
  <template v-for="item in pageNum" :key="item">
    <canvas :id="`pdf-canvas-${item}`" />
  </template>
</template>

<script>
import { reactive, toRefs, nextTick, watchEffect } from 'vue'
import * as pdfjs from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import { Toast } from 'vant'

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default {
  name: 'PdfViewer',
  props: {
    url: { type: String, default: '' } // pdf文件路径
  },
  setup(props, { emit }) {
    const state = reactive({
      pageNum: 0,
      pdfCtx: null
    })

    const resolvePdf = (url) => {
      const loadingTask = pdfjs.getDocument(url)
      loadingTask.promise.then(pdf => {
        console.log(pdf, 'pdf')
        state.pdfCtx = pdf
        state.pageNum = pdf.numPages
        nextTick(() => {
          renderPdf()
        })
      })
    }

    const renderPdf = (num = 1) => {
      state.pdfCtx.getPage(num).then(page => {
        const canvas = document.getElementById(`pdf-canvas-${num}`)
        const ctx = canvas.getContext('2d')
        const viewport = page.getViewport({ scale: 1 })
        // 画布大小,默认值是width:300px,height:150px
        canvas.height = viewport.height
        canvas.width = viewport.width
        // 画布的dom大小, 设置移动端,宽度设置铺满整个屏幕
        const clientWidth = document.body.clientWidth
        // canvas.style.width = 900 + 'px'
        // 根据pdf每页的宽高比例设置canvas的高度
        // canvas.style.height = clientWidth * (viewport.height / viewport.width) + 'px'
        page.render({
          canvasContext: ctx,
          viewport
        })
        if (num < state.pageNum) {
          renderPdf(num + 1)
        } else {
          emit('onRendered')
		  Toast.clear() // 取消加载loading
        }
      })
    }

    watchEffect(() => {
      if (props.url) {
      	// 展示加载loading
        Toast.loading({
          message: '加载中...',
          overlay: true,
          forbidClick: true,
          duration: 0
        })

        resolvePdf(props.url)
      }
    })
    return {
      ...toRefs(state)
    }
  }
}
</script>
