// -----------------------------------------------------------------------------

const get_hls_master_manifest = function(parsed_dash_manifest, server_url, VOD) {
  const m3u8 = []
  m3u8.push('#EXTM3U')

  // child manifest: AUDIO|SUBTITLES
  {
    const group_types = ['AUDIO', 'SUBTITLES']
    group_types.forEach(group_type => {
      if (parsed_dash_manifest && parsed_dash_manifest.mediaGroups && parsed_dash_manifest.mediaGroups[group_type]) {
        const groups = parsed_dash_manifest.mediaGroups[group_type]
        const keyset = []
        keyset[0]    = Object.keys(groups)

        let i, j, group_id, group_lang, group_data, group_playlists, group_attributes, group_index, inner_group_playlist, inner_group_attributes

        for (i=0; i < keyset[0].length; i++) {
          group_id   = keyset[0][i]
          keyset[1]  = Object.keys(groups[group_id])

          for (j=0; j < keyset[1].length; j++) {
            group_lang      = keyset[1][j]
            group_data      = groups[group_id][group_lang]
            group_playlists = (Array.isArray(group_data.playlists) && group_data.playlists.length) ? group_data.playlists : null

            if (!group_playlists)
              continue

            group_attributes = []
            group_attributes.push(`#EXT-X-MEDIA:TYPE=${group_type}`)
            group_attributes.push(`GROUP-ID="${group_id}"`)
            group_attributes.push(`LANGUAGE="${group_data.language || group_lang || ''}"`)
            group_attributes.push(`DEFAULT=${group_data.default ? 'YES' : 'NO'}`)
            group_attributes.push(`AUTOSELECT=${group_data.autoselect ? 'YES' : 'NO'}`)

            for (group_index = 0; group_index < group_playlists.length; group_index++) {
              inner_group_playlist = group_playlists[group_index]

              inner_group_attributes = [...group_attributes]
              inner_group_attributes.push(`NAME="${(inner_group_playlist && inner_group_playlist.attributes && inner_group_playlist.attributes.NAME) || group_data.language || group_lang || ''}"`)
              inner_group_attributes.push(`URI="${server_url}?group_type=${group_type}&group_id=${group_id}&group_lang=${group_lang}&group_index=${group_index}${VOD ? '&VOD=1' : ''}"`)

              m3u8.push(inner_group_attributes.join(','))
            }
          }
        }
      }
    })
  }

  // child manifest: VIDEO
  {
    if (parsed_dash_manifest && Array.isArray(parsed_dash_manifest.playlists) && parsed_dash_manifest.playlists.length) {
      let i, data, stream_attributes

      for (i=0; i < parsed_dash_manifest.playlists.length; i++) {
        data = parsed_dash_manifest.playlists[i]

        if ((data instanceof Object) && (data.attributes instanceof Object) && (typeof data.attributes.BANDWIDTH === 'number')) {
          stream_attributes = []
          stream_attributes.push(`#EXT-X-STREAM-INF:PROGRAM-ID=${(typeof data.attributes["PROGRAM-ID"] === 'number') ? data.attributes["PROGRAM-ID"] : 1}`)
          stream_attributes.push(`BANDWIDTH=${data.attributes.BANDWIDTH}`)

          if (data.attributes.CODECS)
            stream_attributes.push(`CODECS="${data.attributes.CODECS}"`)

          if (data.attributes.RESOLUTION && data.attributes.RESOLUTION.width && data.attributes.RESOLUTION.height)
            stream_attributes.push(`RESOLUTION=${data.attributes.RESOLUTION.width}x${data.attributes.RESOLUTION.height}`)

          if (data.attributes.AUDIO)
            stream_attributes.push(`AUDIO="${data.attributes.AUDIO}"`)

          if (data.attributes.SUBTITLES)
            stream_attributes.push(`SUBTITLES="${data.attributes.SUBTITLES}"`)

          m3u8.push(stream_attributes.join(','))
          m3u8.push(`${server_url}?playlist=${data.attributes.BANDWIDTH}${VOD ? '&VOD=1' : ''}`)
        }
      }
    }
  }

  return m3u8.join("\n")
}

// -----------------------------------------------------------------------------

const is_VOD = function(parsed_dash_manifest, dash_qs) {
  return dash_qs.VOD || (typeof parsed_dash_manifest.minimumUpdatePeriod !== 'number')
}

const get_resolved_url = function(relpath, baseurl) {
  const url = new URL(relpath, baseurl)
  return url.href
}

const get_hls_child_manifest = function(parsed_dash_manifest, dash_url, dash_qs, playlist) {
  const VOD = is_VOD(parsed_dash_manifest, dash_qs)

  const m3u8 = []
  m3u8.push('#EXTM3U')
  m3u8.push('#EXT-X-MEDIA-SEQUENCE:0')
  m3u8.push(`#EXT-X-TARGETDURATION:${(typeof playlist.targetDuration === 'number') ? playlist.targetDuration : 10}`)

  if (VOD)
    m3u8.push('#EXT-X-PLAYLIST-TYPE:VOD')

  if (Array.isArray(playlist.segments) && playlist.segments.length) {
    let i, segment, duration, uri

    for (i=0; i < playlist.segments.length; i++) {
      segment = playlist.segments[i]

      if ((i===0) && segment.map) {
        uri = segment.map.uri || segment.map.resolvedUri

        if (uri) {
          uri = get_resolved_url(uri, dash_url)

          m3u8.push(`#EXT-X-MAP:URI="${uri}"`)
        }
      }

      duration = segment.duration
      uri      = segment.uri || segment.resolvedUri

      if (duration && uri) {
        uri = get_resolved_url(uri, dash_url)

        m3u8.push(`#EXTINF:${duration},`)
        m3u8.push(uri)
      }
    }
  }

  if (VOD)
    m3u8.push('#EXT-X-ENDLIST')

  return m3u8.join("\n")
}

// -----------------------------------------------------------------------------

const get_hls_child_manifest_video = function(parsed_dash_manifest, dash_url, dash_qs) {
  const bandwidth = parseInt(dash_qs.playlist, 10)

  if (isNaN(bandwidth))
    throw new Error('could not parse querystring parameter: "playlist"')

  let playlist

  if (parsed_dash_manifest && Array.isArray(parsed_dash_manifest.playlists) && parsed_dash_manifest.playlists.length) {
    let i, data

    for (i=0; i < parsed_dash_manifest.playlists.length; i++) {
      data = parsed_dash_manifest.playlists[i]

      if ((data instanceof Object) && (data.attributes instanceof Object) && (typeof data.attributes.BANDWIDTH === 'number') && (data.attributes.BANDWIDTH === bandwidth)) {
        playlist = data
        break
      }
    }
  }

  if (!playlist)
    throw new Error('could not resolve video playlist')

  return get_hls_child_manifest(parsed_dash_manifest, dash_url, dash_qs, playlist)
}

// -----------------------------------------------------------------------------

const get_hls_child_manifest_group = function(parsed_dash_manifest, dash_url, dash_qs) {
  const group_type  = dash_qs.group_type
  const group_id    = dash_qs.group_id
  const group_lang  = dash_qs.group_lang
  const group_index = (function(){
    let group_index = dash_qs.group_index ? parseInt(dash_qs.group_index, 10) : 0
    return isNaN(group_index) ? 0 : group_index
  })()

  if (!(parsed_dash_manifest && parsed_dash_manifest.mediaGroups && parsed_dash_manifest.mediaGroups[group_type]))
    throw new Error(`could not resolve media group: "${group_type}"`)

  let group_data
  {
    const groups = parsed_dash_manifest.mediaGroups[group_type]
    const keyset = []
    keyset[0]    = Object.keys(groups)

    let i, j, inner_group_id, inner_group_lang

    for (i=0; i < keyset[0].length; i++) {
      if (group_data)
        break

      inner_group_id = keyset[0][i]

      if (inner_group_id !== group_id)
        continue

      keyset[1] = Object.keys(groups[inner_group_id])

      for (j=0; j < keyset[1].length; j++) {
        inner_group_lang = keyset[1][j]

        if (inner_group_lang === group_lang) {
          group_data = groups[inner_group_id][inner_group_lang]
          break
        }
      }
    }
  }

  if (!group_data)
    throw new Error(`could not resolve: "${group_type}/${group_id}/${group_lang}"`)

  let playlist
  {
    const group_playlists = (Array.isArray(group_data.playlists) && group_data.playlists.length) ? group_data.playlists : null

    if (group_playlists && (group_playlists.length > group_index)) {
      playlist = group_playlists[group_index]
    }
  }

  if (!playlist)
    throw new Error(`could not resolve: "${group_type}/${group_id}/${group_lang}/${group_index}"`)

  return get_hls_child_manifest(parsed_dash_manifest, dash_url, dash_qs, playlist)
}

// -----------------------------------------------------------------------------

/*
 * -----------------------------------------------------------------------------
 * query string params:
 *     &dump=truthy
 *         outputs a dump of JSON with all input parameters
 *     &playlist=bandwidth
 *         outputs an HLS child manifest for the given playlist (as identified by its integer bandwidth)
 *         media group: VIDEO
 *     &group_type=(AUDIO|SUBTITLES)&group_id=id&group_lang=en&group_index=0
 *         outputs an HLS child manifest for the given playlist
 *         media group: AUDIO|SUBTITLES
 *     [default]
 *         outputs the HSL master manifest
 *         includes URLs to access all child manifests
 * -----------------------------------------------------------------------------
 */

const get_hls_manifest = function(parsed_dash_manifest, dash_url_base64, dash_url, dash_qs, host, port, is_secure) {
  if (dash_qs.dump)
    return JSON.stringify({parsed_dash_manifest, dash_url_base64, dash_url, dash_qs}, null, 2)

  // child manifest: VIDEO
  if (dash_qs.playlist)
    return get_hls_child_manifest_video(parsed_dash_manifest, dash_url, dash_qs)

  // child manifest: AUDIO|SUBTITLES
  if (dash_qs.group_type && dash_qs.group_id && dash_qs.group_lang)
    return get_hls_child_manifest_group(parsed_dash_manifest, dash_url, dash_qs)

  // master manifest
  const server_url = `http${is_secure ? 's' : ''}://${host}:${port}/${dash_url_base64}`
  return get_hls_master_manifest(parsed_dash_manifest, server_url, dash_qs.VOD)
}

module.exports = get_hls_manifest
