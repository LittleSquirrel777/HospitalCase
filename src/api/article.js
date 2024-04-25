import request from '@/utils/request'

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-element-admin/article/create',
    method: 'post',
    data
  })
}
export function createrecord(data) {
  return request({
    url: '/record_create/',
    method: 'post',
    data
  })
}
export function fetchall() {
  return request({
    url: '/record_all/',
    method: 'get'
  })
}
export function fetchrecord_id(id) {
  return request({
    url: '/fetchrecord_id/',
    method: 'get',
    params: { id }
  })
}
export function verify_id(id) {
  return request({
    url: '/verify_id/',
    method: 'get',
    params: { id }
  })
}
export function verify_batch(data) {
  return request({
    url: '/verify_batch/',
    method: 'post',
    data
  })
}
export function storage_verification(data) {
  return request({
    url: '/storage_verification/',
    method: 'post',
    data
  })
}
export function destroy() {
  return request({
    url: '/destroy/',
    method: 'post'
  })
}
export function updaterecord(data) {
  return request({
    url: '/update_record/',
    method: 'post',
    data
  })
}
export function update_bypatient(data) {
  return request({
    url: '/updated_bypatient/',
    method: 'post',
    data
  })
}
export function update_byhospital(data) {
  return request({
    url: '/updated_byhospital/',
    method: 'post',
    data
  })
}
export function fetchdocterlist(query) {
  return request({
    url: '/docter_list/',
    method: 'get',
    params: query
  })
}
export function delete_docter(id) {
  return request({
    url: '/delete_docter/',
    method: 'get',
    params: id
  })
}
export function add_docter(data) {
  return request({
    url: '/add_docter/',
    method: 'post',
    data
  })
}
export function fetchList(query) {
  return request({
    url: '/patient_list/',
    method: 'get',
    params: query
  })
}
export function update_statue(data) {
  return request({
    url: '/update_status/',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}

export function upload_img(data) {
  return request({
    url: '/upload_img/',
    method: 'post',
    data
  })
}
export function exportpdf(data) {
  return request({
    url: '/exportpdf/',
    method: 'post',
    data
  })
}
export function loglist(data) {
  return request({
    url: '/log_list/',
    method: 'post',
    data
  })
}
export function result_write(data) {
  return request({
    url: '/result_write/',
    method: 'post',
    data
  })
}
export function edit_net(data) {
  return request({
    url: '/edit_net/',
    method: 'post',
    data
  })
}
export function reset_net() {
  return request({
    url: '/reset_net/',
    method: 'post'
  })
}
export function verify2(data) {
  return request({
    url: '/verify2/',
    method: 'post',
    data
  })
}
export function destroy_location(data) {
  return request({
    url: '/destory_location/',
    method: 'post',
    data
  })
}
export function verify3(data) {
  return request({
    url: '/destory_location/',
    method: 'post',
    data
  })
}
export function handledelete(data) {
  return request({
    url: '/delete_record/',
    method: 'post',
    data
  })
}
export function handleFilter_multiattri(data) {
  return request({
    url: '/multiattri_search/',
    method: 'post',
    data
  })
}
export function handleFilter_keywords(data) {
  return request({
    url: '/keywords_search/',
    method: 'post',
    data
  })
}
export function createdata(data) {
  return request({
    url: '/keywords_create/',
    method: 'post',
    data
  })
}
export function updatedata(data) {
  return request({
    url: '/keywords_update/',
    method: 'post',
    data
  })
}
