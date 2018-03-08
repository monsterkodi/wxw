###
00000000   0000000   00000000   00000000   0000000   00000000    0000000   000   000  000   000  0000000    
000       000   000  000   000  000       000        000   000  000   000  000   000  0000  000  000   000  
000000    000   000  0000000    0000000   000  0000  0000000    000   000  000   000  000 0 000  000   000  
000       000   000  000   000  000       000   000  000   000  000   000  000   000  000  0000  000   000  
000        0000000   000   000  00000000   0000000   000   000   0000000    0000000   000   000  0000000    
###

{ slash, log } = require 'kxk'

user    = require './user'
winList = require './winlist'
    
foreground = (exePath) ->
    
    exePath = slash.resolve exePath
    appWins = winList().filter (win) -> win.path == exePath
    visWins = appWins.filter (win) -> not win.minimized
    
    if visWins.length == 0
        visWins = appWins

    for win in visWins
        
        VK_MENU     = 0x12 # ALT key
        SW_RESTORE  = 9
        KEYDOWN     = 1
        KEYUP       = 3
        
        if win.minimized
            user.ShowWindow win.hwnd, SW_RESTORE
        
        user.keybd_event VK_MENU, 0, KEYDOWN, null # fake ALT press to enable foreground switch
        user.SetForegroundWindow win.hwnd          # ... no wonder windows is so bad
        user.keybd_event VK_MENU, 0, KEYUP, null
                
    visWins

module.exports = foreground
