<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status" style="background: white">
        <!--        <CommentDropdown v-model="postForm.comment_disabled" />-->
        <!--        <PlatformDropdown v-model="postForm.platforms" />-->
        <!--        <SourceUrlDropdown v-model="postForm.source_uri" />-->
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          上传
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          保存
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <h3 style="text-align:center">病历单</h3>
          <br>
          <el-col :span="24">
            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="姓名" class="postInfo-container-item" required>
                    <!--                    <el-select v-model="postForm.name" :remote-method="getRemoteUserList" filterable default-first-option remote placeholder="Search user">-->
                    <!--                      <el-option v-for="(item,index) in userListOptions" :key="item+index" :label="item" :value="item" />-->
                    <!--                    </el-select>-->
                    <el-input v-model="postForm.name" placeholder="Please enter the data" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="年龄" class="postInfo-container-item" required>
                    <el-input v-model="postForm.age" placeholder="Please enter the data" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="性别" class="postInfo-container-item" required>
                    <el-select v-model="postForm.gender">
                      <el-option value="1" label="male" />
                      <el-option value="2" label="female" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="90px" label="体检时间:" class="postInfo-container-item">
                    <el-date-picker v-model="postForm.time" type="date" format="yyyy-MM-DD" placeholder="Select date and time" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="数据1" class="postInfo-container-item">
                    <el-input v-model="postForm.feature1" placeholder="Please enter the data" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="数据2" class="postInfo-container-item">
                    <el-input v-model="postForm.feature2" placeholder="Please enter the data" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="70px" label="诊断结果">
          <el-input v-model="postForm.result" :rows="1" type="textarea" class="article-textarea" autosize placeholder="Please enter the content" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

        <el-form-item prop="remark" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.remark" :height="400" />
        </el-form-item>

        <!--        <el-form-item prop="image_uri" style="margin-bottom: 30px;">-->
        <!--          <Upload v-model="postForm.image_uri" />-->
        <!--        </el-form-item>-->
      </div>
    </el-form>
  </div>
</template>
<!--<script src="../../../jstest/test2.js"></script>-->
<script>
import Tinymce from '@/components/Tinymce'
// import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { validURL } from '@/utils/validate'
import { createrecord, fetchrecord_id, updaterecord } from '@/api/article'
import { Cypher, keyGenerate } from '@/api/tools'

const defaultForm = {
  status: 'draft',
  name: '', // 姓名
  age: '',
  gender: '',
  remark: '', // 文章内容
  result: '', // 诊断结果
  // source_uri: '', // 文章外链
  // image_uri: '', // 图片
  time: undefined, // 前台展示时间
  id: undefined,
  feature1: '',
  feature2: ''
  // platforms: ['a-platform'],
  // comment_disabled: false,
  // importance: 0
}

export default {
  name: 'ArticleDetail',
  components: { Tinymce, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      // userListOptions: [],
      rules: {
        // image_uri: [{ validator: validateRequire }],
        name: [{ validator: validateRequire }],
        result: [{ validator: validateRequire }]
        // source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {}
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.result.length
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchrecord_id(id).then(response => {
        this.postForm = response.data
        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = '新增病历'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '新增病历'
      document.title = `${title} - ${this.postForm.id}`
    },
    submitForm() {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          const data = {
            'name': this.postForm.name,
            'age': this.postForm.age,
            'gender': this.postForm.gender,
            'remark': this.postForm.remark,
            'result': this.postForm.result,
            'time': this.postForm.time,
            'feature1': this.postForm.feature1,
            'feature2': this.postForm.feature2,
            'status': 'created'
          }
          this.loading = true
          if (this.isEdit) {
            const id = this.$route.params && this.$route.params.id
            const data1 = {
              'name': this.postForm.name,
              'age': this.postForm.age,
              'gender': this.postForm.gender,
              'remark': this.postForm.remark,
              'result': this.postForm.result,
              'time': this.postForm.time,
              'feature1': this.postForm.feature1,
              'feature2': this.postForm.feature2,
              'status': 'submitted',
              'id': id
            }
            updaterecord(data1).then(response => {
              console.log(response.log)
              this.$notify({
                title: '成功',
                message: '病历修改成功',
                type: 'success',
                duration: 2000
              })
              this.loading = false
            }).catch(err => {
              console.log(err)
              this.loading = false
            })
          } else {
            createrecord(data).then(response => {
              console.log(response.code)
              this.$notify({
                title: '成功',
                message: '病历新增成功',
                type: 'success',
                duration: 2000
              })
              this.loading = false
            }).catch(err => {
              console.log(err)
              this.loading = false
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.name.length === 0 || this.postForm.age.length === 0) {
        this.$message({
          message: '请填写必要的姓名和年龄',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    }
    // getRemoteUserList(query) {
    //   searchUser(query).then(response => {
    //     if (!response.data.items) return
    //     this.userListOptions = response.data.items.map(v => v.name)
    //   })
    // }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
