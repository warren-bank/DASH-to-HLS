#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "${DIR}/0-constants.sh"

OUT_DIR="${DIR}/output"
OUT_FILE="${OUT_DIR}/5-hls-subtitles.m3u8"
[ ! -d "$OUT_DIR" ] && mkdir -p "$OUT_DIR"

QS='group_type=SUBTITLES&group_id=subs&group_lang=en&group_index=0'

SH_FILE="${DIR}/../00-common/1-download.sh"
"$SH_FILE" "$OUT_FILE" "$URL" "$QS"
