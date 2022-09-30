const DOM_DISCOVERED_FEEDS_CONTAINER = 'discovered-feeds'
const EVENT_NEW_HOST_DISCOVERED = 'event-new-host-discovered'

function createVideoBox() {
  const div = document.createElement('div')
  div.className = 'video-feed-thumbnail'
  div.style.width = '200px'
  div.style.height = '150px'
  div.style.backgroundColor = 'black'

  const video = document.createElement('video')
  div.appendChild(video)

  return div
}

function handleNewHostDiscovered(host) {
  videoBox = createVideoBox()
  document.getElementById(DOM_DISCOVERED_FEEDS_CONTAINER).appendChild(videoBox)
}

window.registry.onHostDiscovered(handleNewHostDiscovered)
