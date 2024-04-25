// 导入gulp开发依赖包
const gulp = require('gulp')

// css开发依赖包
// 添加兼容前缀
const autoprefixer = require('gulp-autoprefixer')

// js开发依赖包
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
// js打包规范
const jsHandler = function() {
  return gulp.src('test1.js')
    // 按照路径导入 js文件内容
    .pipe(babel({ presets: ['@babel/env'] }))
    // 转化为ES5语法格式
    .pipe(uglify())
    // 压缩js程序
    .pipe(gulp.dest('./dist/js'))
}

// 监听程序

const watchHandler = function() {
  // 设定css的监听程序 当 路径 指定的css 文件内容改变时 执行 cssHandler 压缩规范
  gulp.watch('test1.js', jsHandler)
}

// gulpfile.js 文件的运行方式
module.exports.default = gulp.series(

  gulp.parallel(jsHandler),
  // 监听事件
  watchHandler
)
