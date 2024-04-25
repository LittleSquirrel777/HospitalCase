// alert(111111)
// import ffi from 'ffi-napi'
// import ref from 'ref-napi'
const ffi = require('ffi-napi')
const ref = require('ref-napi')
// alert(2222222)
const libs = ffi.Library('./tools.so', {
  'EncryptLinearK': ['string', [ref.types.float, 'string', 'string']],
  'Decryptinfo': [ref.types.float, ['string', 'string', 'string']],
  // 'computeSingleK': [ref.types.void, [ref.types.long, 'string']],
  'KeyGenerate': ['string', [ref.types.int, 'string']]
})

// const a = Buffer.alloc(100)
// console.log('1 =', a)
// const encryptres = libs.EncryptLinear(1234567)
// libs.computeSingleK(1234567, a)
// const decryptres = libs.Decrypt(encryptres, a)
// console.log('a =', a)
// console.log('encryptres = ', encryptres)
// console.log('decryptres = ', decryptres)

// const keyK = Buffer.alloc(50)
// const tmp = libs.KeyGenerate(128, keyK)
// console.log(keyK)
// const name = Buffer.alloc(16)
// const s = libs.EncryptLinearK(0.6923, keyK, name)
// console.log(s)
// const f = libs.Decryptinfo(s, name, keyK)
// console.log(f)
var myencrypt = function(s) {
  const keyK = Buffer.alloc(50)
  libs.KeyGenerate(128, keyK)
  console.log(keyK)
  const name = Buffer.alloc(16)
  var en_res = libs.EncryptLinearK(0.6923, keyK, name)
  console.log('2222')
  // alert(en_res)
  console.log(en_res)
  // return en_res
}
module.exports = myencrypt;
