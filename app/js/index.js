const DOM_DISCOVERED_FEEDS_CONTAINER = 'discovered-feeds'

function createVideoBox(host) {
  const div = document.createElement('div')
  div.id = `video-container-${host}-${crypto.randomUUID()}`
  div.className = 'video-feed-thumbnail'
  div.style.width = '200px'
  div.style.height = '150px'
  div.style.backgroundColor = 'black'

  const canvas = document.createElement('canvas')
  div.appendChild(canvas)

  new JSMpeg.VideoElement(div, host, { canvas, autoplay: true, control: false }, { disableGl: true })

  document.getElementById(DOM_DISCOVERED_FEEDS_CONTAINER).appendChild(div)
}

function handleNewHostDiscovered(_event, value) {
  createVideoBox(value)
}

window.registry.onHostDiscovered(handleNewHostDiscovered)
