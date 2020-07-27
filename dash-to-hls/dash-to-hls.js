const request          = require('@warren-bank/node-request').request
const mpd_parser       = require('mpd-parser')
const dash_cache       = require('./dash_cache')
const get_hls_manifest = require('./dash_convert')
const parse_url        = require('url').parse

// btoa
const base64_encode = function(str) {
  return Buffer.from(str, 'binary').toString('base64')
}

// atob
const base64_decode = function(str) {
  return Buffer.from(str, 'base64').toString('binary')
}

const dash_to_hls = function({server, host, port, is_secure, req_headers, req_options, debug_level, acl_whitelist}) {
  debug_level = debug_level  ||  0

  const debug = function() {
    let args      = [...arguments]
    let verbosity = args.shift()
    let append_LF = true

    if (append_LF) args.push("\n")

    if (debug_level >= verbosity) {
      console.log.apply(console.log, args)
    }
  }

  const regexs = {
    wrap: new RegExp('^/?([^\\.\\?_]+)(?:[\\.\\?_].*)?$', 'i'),
    vals: new RegExp('^[^\\?]+\\?(.+)$', 'i')
  }

  const add_CORS_headers = function(res) {
    res.setHeader('Access-Control-Allow-Origin',      '*')
    res.setHeader('Access-Control-Allow-Methods',     '*')
    res.setHeader('Access-Control-Allow-Headers',     '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Max-Age',           '86400')
  }

  const get_request_options = function(url) {
    if (!req_headers && !req_options) return url

    let request_options = Object.assign(
      {},
      parse_url(url),
      {headers: (req_headers || {})},
      (req_options || {})
    )
    return request_options
  }

  // Access Control
  if (acl_whitelist) {
    acl_whitelist = acl_whitelist.trim().toLowerCase().split(/\s*,\s*/g)

    server.on('connection', (socket) => {
      if (socket && socket.remoteAddress) {
        let remoteIP = socket.remoteAddress.toLowerCase().replace(/^::?ffff:/, '')

        if (acl_whitelist.indexOf(remoteIP) === -1) {
          socket.destroy()
          debug(2, socket.remoteFamily, 'connection blocked by ACL whitelist:', remoteIP)
        }
      }
    })
  }

  // Create an HTTP tunneling proxy
  server.on('request', (req, res) => {
    debug(3, 'converting (raw):', req.url)

    add_CORS_headers(res)

    const dash_url_base64 = req.url.replace(regexs.wrap, '$1')
    const dash_url        = base64_decode(dash_url_base64).trim()
    const dash_qs         = {}

    {
      let vals = req.url.replace(regexs.vals, '$1')
      if (vals) {
        vals = vals.split('&')
        vals.forEach(pair => {
          pair = pair.split('=')
          if (pair.length === 2) {
            let key = pair[0].trim()
            let val = pair[1].trim()
 
            if (key && val) {
              dash_qs[key] = decodeURIComponent(val)
            }
          }
        })
      }
    }

    const callback = function(parsed_dash_manifest) {
      if (!parsed_dash_manifest)
        throw new Error('could not parse DASH manifest')

      const hls_manifest = get_hls_manifest(parsed_dash_manifest, dash_url_base64, dash_url, dash_qs, host, port, is_secure)
      if (!hls_manifest)
        throw new Error('could not convert DASH manifest')

      res.writeHead(200, { "Content-Type": "application/x-mpegURL" })
      res.end(hls_manifest)
    }

    let parsed_dash_manifest = dash_cache.get_manifest(dash_url_base64)
    if (parsed_dash_manifest) {
      callback(parsed_dash_manifest)
    }
    else {
      const options = get_request_options(dash_url)
      debug(1, 'downloading:', dash_url)

      request(options, '', {binary: false, stream: false})
      .then(({response}) => {
        if (!response)
          throw new Error('could not download DASH manifest')

        parsed_dash_manifest = mpd_parser.parse(response, dash_url)
        if (!parsed_dash_manifest)
          throw new Error('could not parse DASH manifest')

        dash_cache.add_manifest(dash_url_base64, parsed_dash_manifest)
        callback(parsed_dash_manifest)
      })
      .catch((e) => {
        debug(0, 'ERROR:', e.message)
        res.writeHead(500)
        res.end()
      })
    }
  })
}

module.exports = dash_to_hls
