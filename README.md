
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
         quit        id
         bounds      id [x y w h]
         move        id x y
         size        id w h
         launch      path
         handle     [pid|path]
         proc       [pid|file]
         terminate  [pid|file]
         mouse
         key        [shift+|ctrl+|alt+]key
         help        command
         folder      name
         trash       count|empty|file
         taskbar     hide|show|toggle
         screen     [size|user]
         screenshot [targetfile]
         icon        path [targetfile]

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

The project contains also sources for an application that ...
- provides a full-screen zoom similar to the ctrl-mousewheel experience on mac (Alt+Z)
- positions windows on keyboard shortcuts similiar to divvy or magnet (Alt+Ctrl+[Up|Left...|1...4])
- switches between applications similar to the cmd-tab switch on mac (Ctrl+Tab):

<p align="center"><img src="img/switch.png"></p>

If you want to try it out

- you can either download an installer from the [releases page](https://github.com/monsterkodi/wxw/releases)
- or try to build it yourself:

```sh
# with node, npm, git and some form of bash installed:
git clone https://github.com/monsterkodi/wxw.git
cd wxw
npm install
npm run build
```

It's still a bit rough around the edges, let me know how it went if you tried it.

#### Projects using wxw

[clippo](https://github.com/monsterkodi/clippo)
[kappo](https://github.com/monsterkodi/kappo)
[kachel](https://github.com/monsterkodi/kachel)


