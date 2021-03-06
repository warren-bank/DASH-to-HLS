// -----------------------------------------------------------------------------

const manifests = {}

const add_manifest = function(dash_url_base64, parsed_dash_manifest) {
  fix_minimum_update_period(parsed_dash_manifest)

  const now   = Date.now()
  const cache = {
    age:  now,
    data: {...parsed_dash_manifest}
  }
  manifests[dash_url_base64] = cache
}

const get_manifest = function(dash_url_base64) {
  const cache = manifests[dash_url_base64]

  return (cache && !is_cache_expired(cache) && cache.data)
}

// -----------------------------------------------------------------------------

const fix_minimum_update_period = function(parsed_dash_manifest) {
  let VOD      = true
  let lifespan = 0

  const get_playlist_lifespan = function(playlist) {
    if ((typeof playlist.targetDuration === 'number') && Array.isArray(playlist.segments) && playlist.segments.length) {
      const playlist_lifespan = playlist.targetDuration * 1000 * playlist.segments.length

      if ((lifespan <= 0) || (playlist_lifespan < lifespan))
        lifespan = playlist_lifespan
    }
  }

  if (parsed_dash_manifest.mediaGroups) {
    let group_type, group_id, group_lang, group_data, group_index, playlist

    for (group_type in parsed_dash_manifest.mediaGroups) {
      for (group_id in parsed_dash_manifest.mediaGroups[group_type]) {
        for (group_lang in parsed_dash_manifest.mediaGroups[group_type][group_id]) {
          group_data = parsed_dash_manifest.mediaGroups[group_type][group_id][group_lang]

          if (group_data && Array.isArray(group_data.playlists) && group_data.playlists.length) {
            for (group_index=0; group_index < group_data.playlists.length; group_index++) {
              playlist = group_data.playlists[group_index]

              get_playlist_lifespan(playlist)

              if (!playlist.endList)
                VOD = false
            }
          }
        }
      }
    }
  }

  if (Array.isArray(parsed_dash_manifest.playlists) && parsed_dash_manifest.playlists.length) {
    let stream_index, playlist

    for (stream_index=0; stream_index < parsed_dash_manifest.playlists.length; stream_index++) {
      playlist = parsed_dash_manifest.playlists[stream_index]

      get_playlist_lifespan(playlist)

      if (!playlist.endList)
        VOD = false
    }
  }

  if (VOD) {
    delete parsed_dash_manifest.minimumUpdatePeriod
  }
  else {
    const padding = 1500  // expire 1.5 seconds early so the updated manifest is available when requested by the client

    lifespan = (lifespan > padding) ? (lifespan - padding) : 0

    parsed_dash_manifest.minimumUpdatePeriod = lifespan
  }
}

// -----------------------------------------------------------------------------

const is_cache_expired = function(cache, now) {
  if (!cache || !cache.data)
    return true

  const lifespan = cache.data.minimumUpdatePeriod

  if (typeof lifespan === 'number') {
    if (!now)
      now = Date.now()

    const min_age = now - lifespan

    if ((lifespan === 0) || (cache.age < min_age))
      return true
  }

  return false
}

const cleanup = function() {
  const now  = Date.now()
  const keys = Object.keys(manifests)
  let i, dash_url_base64, cache

  for (i=0; i < keys.length; i++) {
    dash_url_base64 = keys[i]
    cache = manifests[dash_url_base64]

    if (is_cache_expired(cache, now))
      delete manifests[dash_url_base64]
  }
}

const cleanup_interval = 300000  // (5 mins)(60 secs/min)(1000 ms/sec)

setInterval(cleanup, cleanup_interval)

// -----------------------------------------------------------------------------

module.exports = {add_manifest, get_manifest}
