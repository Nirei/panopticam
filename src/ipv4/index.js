const MAX_IP = 0xffffffff
const IP_MASK_A = 0xff << 24
const IP_MASK_B = 0xff << 16
const IP_MASK_C = 0xff << 8
const IP_MASK_D = 0xff
const CYCLIC_GROUP = 4294967311

function toIPv4(integer) {
  const a = (integer & IP_MASK_A) >>> 24
  const b = (integer & IP_MASK_B) >>> 16
  const c = (integer & IP_MASK_C) >>> 8
  const d = integer & IP_MASK_D
  return `${a}.${b}.${c}.${d}`
}

function* iterate(start = 0) {
  let current = start !== 0 ? start : Math.floor(Math.random() * (MAX_IP + 1))
  for (i = 0; i < CYCLIC_GROUP; i += 1) {
    if (current <= MAX_IP) yield toIPv4(current - 1)
    current = (current * 3) % CYCLIC_GROUP
  }
}

exports.iterate = iterate
exports.MAX_IP = MAX_IP