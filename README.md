
<p align="center"><img src="bin/about.png" width=256 height=256></p>

**wxw** is a collection of tools for the windows and mac operating systems.

It can be used from the command line or as a node module.

## Command line

```sh
npm install -g wxw

wxw help

wxw [command] [args...]

    commands:

         info       [wid]
         raise       wid
         minimize    wid
         maximize    wid
         restore     wid
         focus       wid
         close       wid
         quit        wid
         bounds      wid [x y w h]
         move        wid x y
         size        wid w h
         launch      path
         handle     [pid|path]
         proc       [pid|file]
         terminate  [pid|file]
         mouse
         key        [[alt+|ctrl+|shift+]key [down|up]]
         help        command
         folder      name
         trash       count|empty|file
         taskbar     hide|show|toggle
         screen     [size|user]
         screenshot [targetfile]
         icon        path [targetfile]

    wid:

         id, pid, path, or nickname

    nickname:

         normal|maximized|minimized
         top|front|foreground
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
#     pid: 12384,
#     id: '8f04c6',  ◂◂◂ use this to control a single window
#     x: 15,
#     y: 314,
#     width: 1302,
#     height: 1530,
#     index: 40,
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

#### Projects using wxw

[kachel](https://github.com/monsterkodi/kachel)
[clippo](https://github.com/monsterkodi/clippo)
[kappo](https://github.com/monsterkodi/kappo)


