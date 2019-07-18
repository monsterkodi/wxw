#!/usr/bin/env bash

cd `dirname $0`

"/c/Program Files (x86)/Microsoft Visual Studio/2019/Community/MSBuild/Current/Bin/msbuild.exe" wc.sln -p:Configuration=Release

cp x64/Release/wc.exe ../bin