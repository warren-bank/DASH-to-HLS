#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "${DIR}/0-constants.sh"

OUT_DIR="${DIR}/output"
OUT_FILE="${OUT_DIR}/4-hls-audio.m3u8"
[ ! -d "$OUT_DIR" ] && mkdir -p "$OUT_DIR"

QS='group_type=AUDIO&group_id=audio&group_lang=en_stereo&group_index=0&VOD=1'

SH_FILE="${DIR}/../00-common/1-download.sh"
"$SH_FILE" "$OUT_FILE" "$URL" "$QS"
