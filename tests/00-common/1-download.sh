#!/usr/bin/env bash

OUT_FILE=$(realpath "$1")
URL="$2"
QS="$3"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "${DIR}/0-constants.sh"

URL=$(echo "$URL" | base64 --wrap=0)
URL="${SERVER}/${URL}?${QS}"

curl --silent --insecure --output "$OUT_FILE" "$URL"
