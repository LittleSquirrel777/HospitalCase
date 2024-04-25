import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login/',
    method: 'post',
    data
  })
}
export function register(data) {
  return request({
    url: '/register/',
    method: 'post',
    data
  })
}
export function getInfo(username) {
  return request({
    url: '/info/',
    method: 'get',
    params: { username }
  })
}

export function logout() {
  return request({
    url: '/logout/',
    method: 'post'
  })
}
export function update(data) {
  return request({
    url: '/profile_update/',
    method: 'post',
    data
  })
}
