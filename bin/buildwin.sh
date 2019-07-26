#!/usr/bin/env bash

DIR=`dirname $0`
BIN=$DIR/../node_modules/.bin
cd $DIR/..

npm install

if rm -rf wxw-win32-x64; then

    if $BIN/konrad; then

        $BIN/electron-rebuild

        IGNORE="(Icon$|inno|wc/.*)"
            
        $BIN/electron-packager . --overwrite --icon=img/app.ico --ignore $IGNORE --prune

        start wxw-win32-x64/wxw.exe
    fi
fi
