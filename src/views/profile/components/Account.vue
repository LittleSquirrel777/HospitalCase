<template>
  <el-form>
    <el-form-item label="Name">
      <el-input v-model.trim="user.name" disabled />
    </el-form-item>
    <el-form-item label="Email">
      <el-input v-model.trim="user.email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Update</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { update } from '@/api/user'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: ''
        }
      }
    }
  },
  methods: {
    submit() {
      const data = {
        username: this.user.name,
        email: this.user.email
      }
      update(data)
        .then(response => {
          if (response.code == 200) {
            this.$message({
              message: '信息修改成功',
              type: 'success',
              duration: 5 * 1000
            })
          } else {
            this.$message({
              message: response.message,
              type: 'success'
            })
          }

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>
