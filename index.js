const { application } = require('./src/application')
const { EVENT_HOST_DISCOVERED } = require('./src/events')
const { Scanner } = require('./src/scanner')


// Load application
application.run().then(() => {

  const scanner = new Scanner()
  scanner.onHostDiscovered((value) => application.mainWindow.send(EVENT_HOST_DISCOVERED, value.host))
  // scanner.run()

  // Some test IPs
  // This one has a live feed
  application.mainWindow.send(EVENT_HOST_DISCOVERED, '176.63.94.193')
  
  // TODO: Scrap default configs from
  // https://security.world/rtsp/

  // TODO: Transform RTSP streams to websockets
  // https://www.npmjs.com/package/node-rtsp-stream
  
})
