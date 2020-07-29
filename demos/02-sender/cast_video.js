(function(){
  const $host    = document.getElementById('host')
  const $port    = document.getElementById('port')
  const $tls     = document.getElementById('tls')

  const $sender  = document.getElementById('sender_cdn')

  const $samples = document.getElementById('sample_videos')
  const $url     = document.getElementById('url')
  const $vod     = document.getElementById('vod')
  const $button  = document.querySelector('button')

  // ---------------------------------------------------------------------------

  const get_cookie_value = function(key) {
    const pattern = new RegExp('(?:^|;)\\s*' + key + '\\s*=\\s*([^;]+)(?:;|$)')
    const cookies = document.cookie
    const matches = pattern.exec(cookies)
    return (matches && matches.length) ? matches[1] : ''
  }

  const set_cookie_value = function(key, val) {
    document.cookie = `${key}=${val};domain=${window.location.hostname};path=${window.location.pathname};max-age=${60*60*24*365}`
  }

  const cookie_name_prefix = 'dash_to_hls_demo_02sender_'

  const prepopulate_form_fields = function() {
    const host = get_cookie_value(cookie_name_prefix + 'host')
    const port = get_cookie_value(cookie_name_prefix + 'port')
    const tls  = get_cookie_value(cookie_name_prefix + 'tls')

    if (host) $host.value = host
    if (port) $port.value = port
    if (tls === '1') $tls.checked = true
  }

  const persist_form_fields = function (host, port, tls) {
    set_cookie_value(cookie_name_prefix + 'host', host)
    set_cookie_value(cookie_name_prefix + 'port', port)
    set_cookie_value(cookie_name_prefix + 'tls',  (tls ? '1' : '0'))
  }

  // ---------------------------------------------------------------------------

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
    const tls  = $tls.checked

    const server_url = `http${tls ? 's' : ''}://${host}:${port}/`

    const sender = $sender.value || $sender.querySelector(':scope > option[value^="http:"]').value

    let url
    url = btoa($url.value)                   // base64 encode URL to DASH manifest
    url = server_url + url                   // construct URL to read HLS master manifest
    if (vod.checked)
      url = url + '?VOD=1'                   // append a querystring parameter if VOD is checked
    url = url + '#master.m3u8'               // append an HLS file extension to the URL hash (as a hint to the video player)
    url = btoa(url)                          // base64 encode URL to  HLS master manifest
    url = sender + '#/watch/' + url          // construct URL to view HLS master manifest in an HTML5 video player

    persist_form_fields(host, port, tls)

    window.location = url
  }

  // ---------------------------------------------------------------------------

  prepopulate_form_fields()

  $samples.addEventListener('change', load_sample)
  $button.addEventListener( 'click',  redirect_page)
})()
