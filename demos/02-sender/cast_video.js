(function(){
  const $host    = document.getElementById('host')
  const $port    = document.getElementById('port')
  const $tls     = document.getElementById('tls')

  const $sender  = document.getElementById('sender_cdn')

  const $samples = document.getElementById('sample_videos')
  const $url     = document.getElementById('url')
  const $vod     = document.getElementById('vod')
  const $button  = document.querySelector('button')

  const load_sample = function(event) {
    event.stopPropagation()
    event.preventDefault()

    let url = $samples.value
    if (url)
      $url.value = url
  }

  const redirect_page = function(event) {
    event.stopPropagation()
    event.preventDefault()

    const host = $host.value || $host.getAttribute('placeholder')
    const port = $port.value || $port.getAttribute('placeholder')
    const server_url = `http${$tls.checked ? 's' : ''}://${host}:${port}/`

    const sender = $sender.value || $sender.querySelector(':scope > option[value^="http:"]').value

    let url
    url = btoa($url.value)                   // base64 encode URL to DASH manifest
    url = server_url + url                   // construct URL to read HLS master manifest
    if (vod.checked)
      url = url + '?VOD=1'                   // append a querystring parameter if VOD is checked
    url = url + '#master.m3u8'               // append an HLS file extension to the URL hash (as a hint to the video player)
    url = btoa(url)                          // base64 encode URL to  HLS master manifest
    url = sender + '#/watch/' + url          // construct URL to view HLS master manifest in an HTML5 video player

    window.location = url
  }

  $samples.addEventListener('change', load_sample)
  $button.addEventListener( 'click',  redirect_page)
})()
