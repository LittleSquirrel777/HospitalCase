const CryptoJS = require('crypto-js')
const Crypto = require('crypto')

function floatToLong(data, M) {
  const da = data * Math.pow(2, M)
  return da
}

function longToFloat(data, M) {
  const da = data / Math.pow(2, M)
  return da
}

function trans(str) {
  let pedis = 0
  for (i = 0; i < str.length; i++) {
    pedis += str[i].charCodeAt()
    pedis *= 256
  }
  return pedis
}

class Ctxt {
  constructor(y0, y1, hashk, hashr) {
    this.y0 = y0
    this.y1 = y1
    this.hashk = hashk
    this.hashr = hashr
  }
}

export class Key {
  constructor(keyp, keys, keyk) {
    this.keyp = keyp
    this.keys = keys
    this.keyk = keyk
  }
}
function primegenerate(length) {
  const DH = Crypto.createDiffieHellman(length)
  const prime = DH.getPrime('hex')
  var result = 0n
  for (let i = 0; i < prime.length; i++) {
    result += BigInt(parseInt(prime[i], 16))
    result *= 16n
  }

  return result
}

export function keyGenerate(length) {
  const keyp = primegenerate(length)
  const keys = primegenerate(length) % keyp
  const keyk = primegenerate(length) % keyp
  return new Key(keyp, keys, keyk)
}

export class Cypher {
  constructor(keyp, keys, keyk, MAG = 40) {
    this.keyp = keyp
    this.keys = keys
    this.keyk = keyk
    this.MAG = MAG
  }
  fillKey(key) {
    const filledKey = Buffer.alloc(256 / 8)
    const keys = Buffer.from(key.toString())
    if (keys.length != filledKey.length) {
      filledKey.map((b, i) => filledKey[i] = keys[i])
    } else {
      return keys
    }
    return filledKey
  }
  trans(str) {
    let pedis = 0n
    for (let i = 0; i < str.length; i++) {
      pedis += BigInt(str[i].charCodeAt())
      // console.log(str[i].charCodeAt());
      pedis *= 256n
    }
    pedis = pedis % this.keyp
    return pedis
  }

  pow(n, power, p) {
    let result = 1n
    while (power > 0) {
      if (power % 2n == 1n) {
        power -= 1n
        result = result * n % p
        power = power / 2n
        n = n * n % p
      } else {
        power = power / 2n
        n = n * n % p
      }
    }
    return result
  }

  HashK(num) {
    return CryptoJS.SHA256(num.toString()).toString().slice(0, 15) + '1'
  }
  HashR(num) {
    return CryptoJS.SHA256(num.toString()).toString().slice(0, 15) + '2'
  }
  encryptAES(word) {
    const key = CryptoJS.enc.Utf8.parse(this.fillKey(this.keyk)) // 16位
    let encrypted = ''
    if (typeof (word) === 'string') {
      const srcs = CryptoJS.enc.Utf8.parse(word)
      encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
    } else if (typeof (word) === 'number') {
      const words = this.HashK(word)
      console.log(words)
      const srcs = CryptoJS.enc.Utf8.parse(words)
      encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
    } else if (typeof (word) === 'object') { // 对象格式的转成json字符串
      const data = JSON.stringify(word)
      const srcs = CryptoJS.enc.Utf8.parse(data)
      encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
    }
    return encrypted.toString()
  }

  encrypt(data) {
    if (Number.isInteger(data) == false) {
      data = floatToLong(data, this.MAG)
      data = parseInt(data)
    }
    const hashk = this.HashK(data)
    const hashr = this.HashR(data)
    const k = this.trans(this.encryptAES(hashk))
    const r = this.trans(this.encryptAES(hashr))
    let y0 = (BigInt(data) - k)
    while (y0 < 0n) {
      y0 += this.keyp
    }
    y0 = y0 % this.keyp
    const ns = this.pow(this.keys, this.keyp - 2n, this.keyp)
    let y1 = r - y0
    while (y1 < 0n) {
      y1 += this.keyp
    }
    y1 = y1 * ns & this.keyp
    const ctxt = new Ctxt(y0, y1, hashk, hashr)
    return ctxt
  }
  decryptAES(word) {
    // console.log("inde:", typeof(word))
    const key = CryptoJS.enc.Utf8.parse(this.fillKey(this.keyk))
    const decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return decrypt.toString(CryptoJS.enc.Utf8)
  }

  computeT(array, coefficients) {
    let result = 0n
    for (let i = 0; i < array.length; i++) {
      const k = this.trans(this.encryptAES(array[i]))
      result += (k * coefficients[i]) % this.keyp
      result = result % this.keyp
    }
    return result
  }
  decrypt(ctxt, array, coefficients) {
    let resultK = this.computeT(array, coefficients)
    resultK = (resultK + ctxt.y0) % this.keyp
    return Number(resultK)
  }

  decrypt(ctxt) {
    let k = this.trans(this.encryptAES(ctxt.hashk))
    k = (k + ctxt.y0) % this.keyp
    let numk = Number(k)
    numk = longToFloat(numk, this.MAG)
    return numk
  }
}

// const keyset = keyGenerate(128)
// console.log(keyset)
// // const keyp = 281776192951378367083588325338945228229n
// // const keys = 134920890566235299823285762767211707848n
// // const keyk = 157222500695008773376422121395749431412n
//
// // const keyk = 1572225006950087
// const cypher = new Cypher(keyset.keyp, keyset.keys, keyset.keyk)
//
// const ctxt = cypher.encryptAES(4234234252)
// console.log(ctxt)
//
// const ptxt = cypher.decryptAES(ctxt)
// console.log(ptxt)
//
// const c = cypher.encrypt(27438.9)
// console.log(c)
//
// const p = cypher.decrypt(c)
// console.log(p)
//
// // for(let i = 0; i < prime.length; i++) {
// //     re += BigInt(prime[i])
// //     re *= 256n
// // }
//
// console.log(parseInt('c', 16))

