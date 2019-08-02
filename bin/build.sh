#!/usr/bin/env bash
cd `dirname $0`/../wc

wxw kill /wxw/bin/wc.exe

MSBUILD="/c/Program Files (x86)/Microsoft Visual Studio/2017/Professional/MSBuild/15.0/Bin/"

if [ -d "/c/Program Files (x86)/Microsoft Visual Studio/2019/Community/MSBuild/Current/Bin/" ]; then
    MSBUILD="/c/Program Files (x86)/Microsoft Visual Studio/2019/Community/MSBuild/Current/Bin/"
fi

"$MSBUILD/msbuild.exe" wc.sln -p:Configuration=Release

cp x64/Release/wc.exe ../bin