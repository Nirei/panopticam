const net = require('net')
const IPv4 = require('../ipv4')
const { EventEmitter } = require('node:events')
const { EVENT_HOST_DISCOVERED } = require('../events')

const SERVICE_DISCOVERY_PAYLOAD = `OPTIONS * RTSP/1.0
CSeq: 1
User-Agent: panopticam/0.1.0

`

class Scanner {
  constructor({ batchSize = 100, generator = IPv4.iterate } = {}) {
    this.batchSize = batchSize
    this.generator = generator()
    this.emmiter = new EventEmitter()
  }

  run() {
    setTimeout(this.scanPort)
  }

  onHostDiscovered(callback) {
    this.emmiter.on(EVENT_HOST_DISCOVERED, callback)
  }

  scanPort() {
    for (let i = 0; i < this.batchSize; i += 1) {
      const { value, done } = this.generator.next()

      this.scanPort(value, 554, 10000)
        .then(this.handleHostDiscovered)
        .catch(() => {})

      if (done) return
    }
    setTimeout(this.run)
  }

  handleHostDiscovered(value) {
    console.log(`New host discovered: rtsp://${value.host}:554`)
    discovered[value.host] = value
    this.emmiter.emit(EVENT_NEW_HOST_DISCOVERED, value)
  }

  async scanPort(host, port, timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const socket = new net.Socket()

      socket.setTimeout(timeout, function () {
        socket.destroy()
        reject(`Connection to ${host}:${port} timed out after ${timeout} ms`)
      })

      socket.connect(port, host, function () {
        socket.write(SERVICE_DISCOVERY_PAYLOAD)
      })

      socket.on('data', function (data) {
        const payload = data.toString()
        socket.destroy()
        if (payload.startsWith('RTSP'))
          resolve({ host, port, payload, latency: Date.now() - startTime })
        reject(`Unknown payload received from ${host}:${port}:\n${payload}`)
      })

      socket.on('error', function (error) {
        socket.destroy()
        reject(error)
      })
    })
  }
}

exports.Scanner = Scanner
