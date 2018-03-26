###
00000000   0000000   00000000   00000000   0000000   00000000    0000000   000   000  000   000  0000000    
000       000   000  000   000  000       000        000   000  000   000  000   000  0000  000  000   000  
000000    000   000  0000000    0000000   000  0000  0000000    000   000  000   000  000 0 000  000   000  
000       000   000  000   000  000       000   000  000   000  000   000  000   000  000  0000  000   000  
000        0000000   000   000  00000000   0000000   000   000   0000000    0000000   000   000  0000000    
###

{ slash, log } = require 'kxk'

user    = require './user'
winlist = require './winlist'
    
foreground = (exePath, opt={}) ->
    
    opt.strict ?= false
    opt.electron ?= true
    
    winMatches = (win) ->
        return true if opt.strict and win.path == exePath
        return true if slash.file(win.path) == slash.file exePath
        if opt.electron 
            if slash.file(win.path) == 'electron.exe' 
                split = slash.split win.path
                if split.length > 5 and split[split.length-5] == slash.base exePath
                    return true
        false
    
    exePath = slash.resolve exePath
    appWins = winlist().filter winMatches
        
    visWins = appWins.filter (win) -> not win.minimized
    
    if visWins.length == 0
        visWins = appWins

    for win in visWins
        
        VK_MENU     = 0x12 # ALT key
        KEYDOWN     = 1
        KEYUP       = 3
        
        if win.minimized
            user.RestoreWindow win.hwnd
        
        user.keybd_event VK_MENU, 0, KEYDOWN, null # fake ALT press to enable foreground switch
        user.SetForegroundWindow win.hwnd          # ... no wonder windows is so bad
        user.keybd_event VK_MENU, 0, KEYUP, null
                
    visWins

module.exports = foreground
