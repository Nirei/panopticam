const net = require('net')
const IPv4 = require('../ipv4')
const { EventEmitter } = require('node:events')

const IGNORED_ERROR_CODES = ['ENETUNREACH', 'EADDRNOTAVAIL', 'ECONNREFUSED', 'ECONNRESET']
const EVENT_HOST_DISCOVERED = 'event-scanner-host-discovered'

const SERVICE_DISCOVERY_PAYLOAD = `DESCRIBE * RTSP/1.0
CSeq: 1
User-Agent: panopticam/0.1.0

`

class TimeoutError extends Error {}
class UnknownPayloadError extends Error {}

class Scanner {
  constructor({ batchSize = 20, generator = IPv4.iterate, timeout = 2000 } = {}) {
    this.batchSize = batchSize
    this.generator = generator()
    this.emmiter = new EventEmitter()
    this.completed = 0
    this.timeout = timeout
  }

  run() {
    setTimeout(() => this.scanRound())
  }

  onHostDiscovered(callback) {
    this.emmiter.addListener(EVENT_HOST_DISCOVERED, callback)
  }

  scanRound() {
    for (let i = 0; i < this.batchSize; i += 1) {
      const { value, done } = this.generator.next()

      this.scanPort(value, 554)
        .then((discovered) => this.handleHostDiscovered(discovered))
        .catch((error) => {
          if (IGNORED_ERROR_CODES.includes(error.code)) return
          if (error instanceof TimeoutError) return
          if (error instanceof UnknownPayloadError) return
          console.error(error)
        })
        .finally(() => {
          this.completed += 1
          if (this.completed % 10000 == 0)
            console.log(
              `${(this.completed / IPv4.MAX_IP).toFixed(2)}% completed`,
            )
        })

      if (done) return
    }
    setTimeout(() => this.scanRound())
  }

  handleHostDiscovered(value) {
    console.log(`New host discovered: rtsp://${value.host}:554`)
    this.emmiter.emit(EVENT_HOST_DISCOVERED, value)
  }

  async scanPort(host, port) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const socket = new net.Socket()

      socket.setTimeout(this.timeout, function () {
        socket.destroy()
        reject(
          new TimeoutError(
            `Connection to ${host}:${port} timed out after ${this.timeout} ms`,
          ),
        )
      })

      socket.connect(port, host, function () {
        socket.write(SERVICE_DISCOVERY_PAYLOAD)
      })

      socket.on('data', function (data) {
        const payload = data.toString()
        socket.destroy()
        if (payload.startsWith('RTSP'))
          resolve({ host, port, payload, latency: Date.now() - startTime })
        reject(new UnknownPayloadError(`Unknown payload received from ${host}:${port}:\n${payload}`))
      })

      socket.on('error', function (error) {
        socket.destroy()
        reject(error)
      })
    })
  }
}

exports.Scanner = Scanner
