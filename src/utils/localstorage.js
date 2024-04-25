/**
 * 存储localStorage
 */
export const setStore = (username, key) => {
  if (!username) return
  // if (typeof key !== 'string') {
  //   key = JSON.stringify(key)
  // }
  window.localStorage.setItem(username, key)
}

/**
 * 获取localStorage
 */
export const getStore = username => {
  if (!username) return
  return window.localStorage.getItem(username)
}

/**
 * 删除localStorage
 */
export const removeStore = username => {
  if (!username) return
  window.localStorage.removeItem(username)
}
