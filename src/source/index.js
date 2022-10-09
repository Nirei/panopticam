Stream = require('node-rtsp-stream')

class Source {
  constructor(source, { width, height, fps }) {
    this.source = source
    this.width = width
    this.height = height
    this.fps = fps
    this.stream = undefined
  }

  start() {
    this.stream = new Stream({
      name: 'test',
      streamUrl: this.source.url,
      wsPort: 0,
      ffmpegOptions: {
        '-r': this.fps,
        '-vf': `scale=w=${this.width}:h=${this.height}:force_original_aspect_ratio=increase,crop=${this.width}:${this.height}`
      }
    })
  }

  port() {
    return this.stream.wsServer.address().port
  }

  stop() {
    this.stream.stop();
  }
}

exports.Source = Source