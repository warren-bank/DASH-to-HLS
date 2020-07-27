const prompt      = require('./lib/LAN_IPs').prompt
const dash_to_hls = require('../dash-to-hls')
const http        = require('http')

const start_server = function({host, port, req_headers, req_options, verbosity, acl_whitelist}) {
  if (!port || isNaN(port)) port = 80

  new Promise((resolve, reject) => {
    if (host) return resolve(host)

    prompt((host) => resolve(host))
  })
  .then((host) => {
    if (host === false) {
      host = 'localhost'
    }

    const server = http.createServer()
    dash_to_hls({server, host, port, is_secure: false, req_headers, req_options, debug_level: verbosity, acl_whitelist})
    server.listen(port, function () {
      console.log(`HTTP server is listening at: ${host}:${port}`)
    })
  })
}

module.exports = start_server
