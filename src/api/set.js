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

export class Ctxt {
  constructor(y0, y1, hashk) {
    this.y0 = y0
    this.y1 = y1
    this.hashk = hashk
  }
}

class Key {
  constructor(alpha, beta) {
    this.alpha = alpha
    this.beta = beta
  }
}
function primegenerate(length) {
  const DH = Crypto.createDiffieHellman(length)
  const prime = DH.getPrime('hex')
  console.log('prime:', prime)
  var result = 0n
  for (let i = 0; i < prime.length; i++) {
    result += BigInt(parseInt(prime[i], 16))
    if (i != prime.length - 1) { result *= 16n }
  }

  return result
}

export function keyGenerate(length) {
  // let p = primegenerate(length)
  const alpha = primegenerate(length - 1)
  const beta = primegenerate(length - 1)
  // console.log("p____:", p)
  console.log('alpha:', alpha)
  console.log('beta_:', beta)
  console.log(typeof (alpha))
  console.log(typeof (beta))
  return new Key(alpha, beta)
}

export class Cypher {
  constructor(alpha, beta, MAG = 20) {
    this.alpha = alpha
    this.beta = beta
    this.MAG = MAG
  }

  trans(str) {
    let pedis = 0n
    // console.log("trans", str)
    // console.log(str.length)
    for (let i = 0; i < str.length; i++) {
      // console.log(i,str[i])
      pedis *= 16n
      pedis += BigInt(parseInt(str[i], 16))
      // pedis += BigInt(str[i].charCodeAt());
      // console.log(str[i].charCodeAt());
      // console.log(pedis)
    }
    // pedis = pedis % this.p;
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

  Hash(num) {
    return CryptoJS.SHA256(num.toString()).toString().slice(0, 32)
  }

  encrypt(data) {
    if (Number.isInteger(data) == false) {
      data = floatToLong(data, this.MAG)
      data = parseInt(data)
    }
    // console.log("data:", data)
    const t = this.trans(this.Hash(data))
    // console.log("HashK:", this.Hash(data))
    console.log('t:', t)
    const y0 = this.alpha * BigInt(data)
    // console.log("y0:", y0)
    // while(y0 < 0n){
    //     y0 += this.p
    // }
    // y0 = y0 % this.p
    console.log('y0:', y0)
    const y1 = (y0 + t) * this.beta
    // while (y1 < 0n) {
    //     y1 += this.p
    // }
    // y1 = y1 % this.p
    const ctxt = new Ctxt(y0, y1, t)
    return ctxt
  }

  decrypt(ctxt) {
    // let inv = this.pow(this.alpha, this.p - 2n, this.p)
    // let test = inv * this.alpha % this.p
    // console.log("test:", test)
    // let plain = inv * ctxt.y0

    const plain = ctxt.y0 / this.alpha
    // while(plain < 0n){
    //     plain+= this.p
    // }
    // plain = plain % this.p
    let num = Number(plain)
    num = longToFloat(num, this.MAG)
    return num
  }
}

const keyset = keyGenerate(128)
// console.log(keyset)
// const keyp = 281776192951378367083588325338945228229n
// const keys = 134920890566235299823285762767211707848n
// const keyk = 157222500695008773376422121395749431412n

// const keyk = 1572225006950087

const alpha = 281602337934977853466841830245427184521n
const beta = 79282169705769363565508359150665314252n
// let cypher = new Cypher(keyset.alpha, keyset.beta, 40);
const cypher = new Cypher(keyset.alpha, keyset.beta, 40)

const c = cypher.encrypt(0.695463466)
console.log(c)

const p = cypher.decrypt(c)
console.log(p)

// for(let i = 0; i < prime.length; i++) {
//     re += BigInt(prime[i])
//     re *= 256n
// }

