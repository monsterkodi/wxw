
<p align="center"><img src="img/about.png" width=256 height=256></p>

**wxw** is a collection of tools for the windows operating system.

It can be used as a node module or as a command line tool.

## Command line

```sh
npm install -g wxw

wxw help

wxw [command] [args...]

    commands:

         info       [id|title]
         raise       id
         minimize    id
         maximize    id
         restore     id
         focus       id
         close       id
         bounds      id x y w h
         launch      path
         mouse
         help        command
         folder      name
         trash       empty|count|file
         taskbar     hide|show
         screen     [size|user]
         screenshot [targetfile]
         icon        path [targetfile]
         key        [ctrl+|shift+|alt+]key

    id:

         process id
         executable path
         window handle
         nickname

    nickname:

         normal|maximized|minimized
         top|topmost|front|frontmost|foreground
         taskbar

```

## Module

```coffeescript

wxw = require('wxw'); # a thin wrapper around the executable

console.log wxw('info', 'top')

# [
#   {
#     path: 'C:\\msys64\\usr\\bin\\mintty.exe',
#     title: '/c/Users/kodi/s/wxw',
#     hwnd: '8f04c6',  ◂◂◂ use this to control a single window
#     pid: 12384,
#     x: 15,
#     y: 314,
#     width: 1302,
#     height: 1530,
#     zindex: 40,
#     status: 'normal'
#   }
# ]

wxw('minimize', '8f04c6')
wxw('launch',   'firefox')
wxw('restore',  'minimized')
wxw('trash',    './crap.txt')
wxw('trash',    'count')
wxw('trash',    'empty')

```

## Application

The project on github contains sources for an application that uses some of the features provided by wxw.

The application does

- provide a full screen screen zoom feature similar to the ctrl+mousewheel experience on mac (Alt+Z)
- positions active windows on keyboard shortcuts similiar to divvy or magnet on mac (Alt+Ctrl+[Up|Left...|1...4])
- switch applications similar to the mac cmd-tab switch (Ctrl+Tab)

<p align="center"><img src="img/switch.png"></p>

In case you feel adventurous and want to try it out:

- you can either download an installer from the github [releases page](https://github.com/monsterkodi/wxw/releases) (probably outdated)
- or try to compile it from current sources:

```sh
# with node, npm and git installed:
git clone https://github.com/monsterkodi/wxw.git
cd wxw
npm install

npm run win                    # to build executable (needs some form of bash)
./node_modules/.bin/electron . # to try it out without building an executable
./node_modules/.bin/konrad     # to recompile coffee sources
```

It's still a bit rough around the edges, let me know how it went in case you tried it.

## Caveats

The command line utility works in a lot of 'decent' shells:

- Cmdr
- Fish
- GitBash
- Msys/Mingw
- WinEmu
- Wsl

For some weird reason, in the windows native shells (cmd, PowerShell), it only works when called through node:

```sh
node path/to/wxw ...
```

Any ideas what might cause this and/or how to fix this are welcome :-)





