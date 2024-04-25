/** index.js*/
const Koa = require('koa')
const app = new Koa()
const router = require('koa-router')()
var content = 0
router.get('/', function(ctx, next) {
  content++
  ctx.body = 'Hello koa' + content
  console.log('ok')
  console.log(content)
})

router.get('/news', (ctx, next) => {
  content++
  ctx.body = '新闻page111' + content
  console.log('ok')
  console.log(content)
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
