#!/usr/bin/env bash

cd `dirname $0`

xcodebuild -workspace mc.xcworkspace -scheme mc -configuration Release
