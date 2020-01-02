#!/bin/bash
# Build config for build.sh

# Get the package version number and remove any whitespace
VER=`sed -n 's| *"version": "\(.*\)",|\1|p' manifest.json`
VER=${VER//[[:space:]]}

APP_NAME=vttb3-$VER
CHROME_PROVIDERS="content locale skin"
CLEAN_UP=1
ROOT_FILES="vtiger-Public-License.txt phpjs-License.txt CHANGELOG.txt"
ROOT_DIRS="defaults"
BEFORE_BUILD=
AFTER_BUILD=
