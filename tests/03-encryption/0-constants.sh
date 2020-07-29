#!/usr/bin/env bash

# ------------------------------------------------------------------------------
# https://testweb.playready.microsoft.com/Content/Content2X
# ------------------------------------------------------------------------------
# notes:
# - in: 'output/1-dash.json'
#   * in: data.parsed_dash_manifest
#     - not found: manifest.key
#     - not found: manifest.contentProtection
#   * in: data.parsed_dash_manifest.playlists[0]
#     - not found: playlist.key
#     - not found: playlist.contentProtection
#   * in: data.parsed_dash_manifest.playlists[0].segments[i]
#     - not found: segment.key
#     - not found: segment.contentProtection
# ------------------------------------------------------------------------------

export URL='http://profficialsite.origin.mediaservices.windows.net/c51358ea-9a5e-4322-8951-897d640fdfd7/tearsofsteel_4k.ism/manifest(format=mpd-time-csf)'
