#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
node "$SCRIPT_DIR/log-activity.js" "$@"
node "$SCRIPT_DIR/summarize-project.js"
