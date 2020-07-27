const lifespan = 300000                    // remove from cache after this number of milliseconds: 300000 ms = (5 mins)(60 secs/min)(1000 ms/sec)
const debounce = Math.floor(lifespan / 2)  // run cleanup task  after this number of milliseconds

const manifests = {}

const add_manifest = function(dash_url_base64, parsed_dash_manifest) {
  const now   = Date.now()
  const cache = {
    age:  now,
    data: {...parsed_dash_manifest}
  }
  manifests[dash_url_base64] = cache
}

const get_manifest = function(dash_url_base64) {
  const cache = manifests[dash_url_base64]

  return (cache && cache.data)
}

const cleanup = function() {
  const now     = Date.now()
  const min_age = now - lifespan
  const keys    = Object.keys(manifests)
  let i, dash_url_base64, cache

  for (i=0; i < keys.length; i++) {
    dash_url_base64 = keys[i]
    cache = manifests[dash_url_base64]
    if (cache.age < min_age)
      delete manifests[dash_url_base64]
  }
}

setInterval(cleanup, debounce)

module.exports = {add_manifest, get_manifest}
