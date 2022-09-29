const { contextBridge } = require('electron')
const net = require('net')

async function scanPort(host, port, timeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const socket = new net.Socket()

    socket.setTimeout(timeout, function () {
      socket.destroy()
      reject(`Connection timed out after ${timeout} ms: ${host}:${port}`)
    })

    socket.connect(port, host, function () {
      console.log()
      socket.destroy()
      resolve({ host: host, port: port, latency: Date.now() - startTime })
    })

    socket.on('error', function (error) {
      socket.destroy()
      reject(error)
    })
  })
}

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

function* ipv4(start = 0) {
  let current = start !== 0 ? start : Math.floor(Math.random() * (MAX_IP + 1))
  for (i = 0; i < MAX_IP; i += 1) {
    if (current <= MAX_IP) yield toIPv4(current - 1)
    current = (current * 3) % CYCLIC_GROUP
  }
}

const EVENT_NEW_HOST_DISCOVERED = 'event-new-host-discovered'
const IPV4_GENERATOR = ipv4()
const discovered = {}

contextBridge.exposeInMainWorld('registry', {
  hosts: () => Object.values(discovered)
})

function handleHostDiscovered(value) {
  console.log(`New host discovered: ${JSON.stringify(value)}`)
  discovered[value.host] = value
  window.postMessage(EVENT_NEW_HOST_DISCOVERED, "*")
}

function doScan() {
  const { value, done } = IPV4_GENERATOR.next()

  scanPort(value, 554, 10000).then(handleHostDiscovered).catch()

  if (done) return
  setTimeout(doScan)
}

// Start the search
// setTimeout(doScan)

// Some test IPs
// handleHostDiscovered('45.42.85.135')
// handleHostDiscovered('134.220.69.73')
// handleHostDiscovered('156.230.29.199')

// TODO: Scrap default configs from
// https://security.world/rtsp/