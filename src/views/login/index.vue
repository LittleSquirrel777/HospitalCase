<template>
  <div class="main-box">
    <div :class="['container', 'container-register', { 'is-txl': isLogin }]">
      <form ref="registerForm" :model="registerForm">
        <h2 class="title">Create Account</h2>
        <span class="text">or use email for registration</span>
        <input ref="username" v-model="registerForm.username" class="form__input" type="text" placeholder="Name" required>
        <input ref="email" v-model="registerForm.email" class="form__input" type="text" placeholder="Email">
        <input ref="password" v-model="registerForm.password" class="form__input" type="password" placeholder="Password">
        <br>
        <br>
        <el-radio-group
          v-model="registerForm.identity"
          placeholder="identity"
          name="identity"
          type="text"
          style="text-align: center"
        >
          <el-radio :label="1">患者</el-radio>
          <el-radio :label="2">医生</el-radio>
          <el-radio :label="3">医院</el-radio>
        </el-radio-group>
        <button :loading="loading" type="button" class="primary-btn" @click="handleRegister">立即注册</button>
      </form>
    </div>
    <div :class="['container', 'container-login', { 'is-txl is-z200': isLogin }]">
      <form ref="loginForm" :model="loginForm">
        <h2 class="title">Sign in to Website</h2>
        <span class="text">or use email for registration</span>
        <input ref="username" v-model="loginForm.username" class="form__input" type="text" placeholder="Name" required>
        <input ref="password" v-model="loginForm.password" class="form__input" type="password" placeholder="Password" required>
        <br>
        <br>
        <br>
        <br>
        <el-radio-group
          v-model="loginForm.identity"
          placeholder="identity"
          name="identity"
          type="text"
          tabindex="1"
          style="margin-left: 20px"
        >
          <el-radio :label="1">患者</el-radio>
          <el-radio :label="2">医生</el-radio>
          <el-radio :label="3">医院</el-radio>
        </el-radio-group>
        <button :loading="loading" class="primary-btn" type="button" @click="handleLogin">立即登录</button>
      </form>
    </div>
    <div :class="['switch', { login: isLogin }]">
      <div class="switch__circle" />
      <div class="switch__circle switch__circle_top" />
      <div class="switch__container">
        <h2>{{ isLogin ? 'Hello Friend !' : 'Welcome Back !' }}</h2>
        <p>
          {{
            isLogin
              ? 'Enter your personal details and start journey with us'
              : 'To keep connected with us please login with your personal info'
          }}
        </p>
        <button class="primary-btn" @click="isLogin = !isLogin">
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// import { validUsername } from '@/utils/validate'

import { register } from '@/api/user'
import { setStore, getStore, removeStore } from '@/utils/localstorage'
import { keyGenerate } from '@/api/set'
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      isLogin: false,
      loginForm: {
        username: '',
        password: '',
        identity: ''
      },
      registerForm: {
        username: '',
        password: '',
        email: '',
        identity: ''
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    handleLogin() {
      this.loading = true
      // const keyset = keyGenerate(128)
      // var tmp = {
      //   // p: String(keyset.p),
      //   alpha: String(keyset.alpha),
      //   beta: String(keyset.beta)
      // }
      // setStore(this.loginForm.username, JSON.stringify(tmp))
      // var tmp1 = getStore(this.loginForm.username)
      // console.log(JSON.parse(tmp1))
      this.$store.dispatch('user/login', this.loginForm)
        .then(() => {
          this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    handleRegister() {
      this.loading = true
      register(this.registerForm)
        .then(response => {
          if (response.code != 200) {
            this.$message({
              message: response.message,
              type: 'error'
            })
          } else {
            this.$message({
              message: response.message,
              type: 'success'
            })
          }
          this.loading = false
          const keyset = keyGenerate(128)
          var tmp = {
            // p: String(keyset.p),
            alpha: String(keyset.alpha),
            beta: String(keyset.beta)
          }
          setStore(this.registerForm.username, JSON.stringify(tmp))
        })
        .catch(() => {
          this.loading = false
        })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.svg-container {
    padding: 6px 5px 6px 15px;
    color: #889aa4;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
.main-box {
  margin-left: 25%;
  margin-top: 8%;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  width: 1000px;
  //width: 100%;
  min-width: 1000px;
  min-height: 600px;
  //height: 100%;
  height: 600px;
  padding: 25px;
  background-color: #ecf0f3;
  box-shadow: 10px 10px 10px #d1d9e6, -10px -10px 10px #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    //top: 0;
    width: 600px;
    height: 100%;
    padding: 25px;
    background-color: #ecf0f3;
    transition: all 1.25s;
    form {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 100%;
      height: 100%;
      color: #a0a5a8;
      .title {
        font-size: 34px;
        font-weight: 700;
        line-height: 3;
        color: #181818;
      }
      .text {
        margin-top: 30px;
        margin-bottom: 12px;
      }
      .form__input {
        width: 350px;
        height: 40px;
        margin: 4px 0;
        padding-left: 25px;
        font-size: 13px;
        letter-spacing: 0.15px;
        border: none;
        outline: none;
        // font-family: 'Montserrat', sans-serif;
        background-color: #ecf0f3;
        transition: 0.25s ease;
        border-radius: 8px;
        box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #f9f9f9;
        &::placeholder {
          color: #a0a5a8;
        }
      }
    }
  }
  .container-register {
    z-index: 100;
    left: calc(100% - 600px);
  }
  .container-login {
    left: calc(100% - 600px);
    z-index: 0;
  }
  .is-txl {
    left: 0;
    transition: 1.25s;
    transform-origin: right;
  }
  .is-z200 {
    z-index: 200;
    transition: 1.25s;
  }
  .switch {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 400px;
    padding: 50px;
    z-index: 200;
    transition: 1.25s;
    background-color: #ecf0f3;
    overflow: hidden;
    box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #f9f9f9;
    color: #a0a5a8;
    .switch__circle {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background-color: #ecf0f3;
      box-shadow: inset 8px 8px 12px #d1d9e6, inset -8px -8px 12px #f9f9f9;
      bottom: -60%;
      left: -60%;
      transition: 1.25s;
    }
    .switch__circle_top {
      top: -30%;
      left: 60%;
      width: 300px;
      height: 300px;
    }
    .switch__container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      position: absolute;
      width: 400px;
      padding: 50px 55px;
      transition: 1.25s;
      h2 {
        font-size: 34px;
        font-weight: 700;
        line-height: 3;
        color: #181818;
      }
      p {
        font-size: 14px;
        letter-spacing: 0.25px;
        text-align: center;
        line-height: 1.6;
      }
    }
  }
  .login {
    left: calc(100% - 400px);
    .switch__circle {
      left: 0;
    }
  }
  .primary-btn {
    width: 180px;
    height: 50px;
    border-radius: 25px;
    margin-top: 50px;
    text-align: center;
    line-height: 50px;
    font-size: 14px;
    letter-spacing: 2px;
    background-color: #4b70e2;
    color: #f9f9f9;
    cursor: pointer;
    box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #f9f9f9;
    &:hover {
      box-shadow: 1px 1px 1px 0 rgb(255 255 255 / 50%),
        -1px -1px 1px 0 rgb(116 125 136 / 50%),
        inset -1px -1px 1px 0 rgb(255 255 255 / 20%),
        inset -1px -1px 1px 0 rgb(0 0 0 / 40%);
    }
  }
}
</style>

