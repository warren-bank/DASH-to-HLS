(function(){
  const $url    = document.getElementById('url')
  const $vod    = document.getElementById('vod')
  const $button = document.querySelector('button')

  const onclick = function(event) {
    event.stopPropagation()
    event.preventDefault()

    let url
    url = btoa($url.value)                                                               // base64 encode URL to DASH manifest
    url = 'http://127.0.0.1:80/' + url                                                   // construct URL to read HLS master manifest
    if (vod.checked)
      url = url + '?VOD=1'                                                               // append a querystring parameter if VOD is checked
    url = url + '#master.m3u8'                                                           // append an HLS file extension to the URL hash (as a hint to the video player)
    url = btoa(url)                                                                      // base64 encode URL to  HLS master manifest
    url = 'http://webcast-reloaded.surge.sh/4-clappr/index.html' + '#/watch/' + url      // construct URL to view HLS master manifest in an HTML5 video player

    window.location = url
  }

  $button.addEventListener('click', onclick)
})()
