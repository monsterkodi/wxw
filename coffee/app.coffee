###
000   000  000   000  000   000         0000000   00000000   00000000   
000 0 000   000 000   000 0 000        000   000  000   000  000   000  
000000000    00000    000000000        000000000  00000000   00000000   
000   000   000 000   000   000        000   000  000        000        
00     00  000   000  00     00        000   000  000        000        
###

{ prefs, about, slash, childp, karg, error, log, _ } = require 'kxk'

user     = require './user'
wininfo  = require './wininfo'
rect     = require './rect'

pkg      = require '../package.json'
electron = require 'electron'

app      = electron.app
Menu     = electron.Menu
tray     = null

args = karg """
wxw
    debug  . ? log debug    . = false . - D

version  #{pkg.version}
"""

#  0000000    0000000  000000000  000   0000000   000   000  
# 000   000  000          000     000  000   000  0000  000  
# 000000000  000          000     000  000   000  000 0 000  
# 000   000  000          000     000  000   000  000  0000  
# 000   000   0000000     000     000   0000000   000   000  

action = (act) ->
    
    switch act
        when 'minimize'   then minimizeWindow()
        when 'screenzoom' then require('./screenzoom').start()
        else moveWindow act
        
# 00     00  000  000   000  000  00     00  000  0000000  00000000  
# 000   000  000  0000  000  000  000   000  000     000   000       
# 000000000  000  000 0 000  000  000000000  000    000    0000000   
# 000 0 000  000  000  0000  000  000 0 000  000   000     000       
# 000   000  000  000   000  000  000   000  000  0000000  00000000  

minimizeWindow = ->

    ensureFocusWindow = ->
        
        if not user.GetForegroundWindow()
            log 'no focus window!'
        
    if hWnd = user.GetForegroundWindow()
        SW_MINIMIZE = 6
        user.ShowWindow hWnd, SW_MINIMIZE
        setTimeout ensureFocusWindow, 50
        
# 00     00   0000000   000   000  00000000  
# 000   000  000   000  000   000  000       
# 000000000  000   000   000 000   0000000   
# 000 0 000  000   000     000     000       
# 000   000   0000000       0      00000000  

moveWindow = (dir) ->
    
    ar = rect.workarea()
        
    if hWnd = user.GetForegroundWindow()
        
        wr = rect.window hWnd
        
        [x,y,w,h] = switch dir
            when 'left'   then [-10,       0,     ar.w/2+20, ar.h+10]
            when 'right'  then [ar.w/2-10, 0,     ar.w/2+20, ar.h+10]
            when 'down'   then [ar.w/4-10, 0,     ar.w/2+20, ar.h+10]
            when 'up'     then [ar.w/6-10, 0, 2/3*ar.w+20,   ar.h+10]
        
        sl = 20 > Math.abs wr.x -  x
        sr = 20 > Math.abs wr.x+wr.w - (x+w)
        st = 20 > Math.abs wr.y -  y
        sb = 20 > Math.abs wr.y+wr.h - (y+h)
        
        if sl and sr and st and sb
            switch dir
                when 'left'  then w  = ar.w/4+20
                when 'right' then w  = ar.w/4+20; x = 3*ar.w/4-10
                when 'down'  then h  = ar.h/2+20; y = ar.h/2-10
                when 'up'    then w  = ar.w+20;   x = -10
        
        SWP_NOZORDER = 0x4
        user.SetWindowPos hWnd, null, x, y, w, h, SWP_NOZORDER

#  0000000   0000000     0000000   000   000  000000000  
# 000   000  000   000  000   000  000   000     000     
# 000000000  0000000    000   000  000   000     000     
# 000   000  000   000  000   000  000   000     000     
# 000   000  0000000     0000000    0000000      000     

showAbout = ->
    
    about 
        img: "#{__dirname}/../img/about.png"
        background: "#222"
        size: 300
        pkg: pkg

app.on 'window-all-closed', (event) -> event.preventDefault()
        
# 00000000   00000000   0000000   0000000    000   000
# 000   000  000       000   000  000   000   000 000 
# 0000000    0000000   000000000  000   000    00000  
# 000   000  000       000   000  000   000     000   
# 000   000  00000000  000   000  0000000       000   

app.on 'ready', ->
    
    tray = new electron.Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', showAbout
    tray.on 'double-click', -> app.exit 0; process.exit 0
    
    tray.setContextMenu Menu.buildFromTemplate [
        label: "Quit"
        click: -> app.exit 0; process.exit 0
    ,
        label: "About"
        click: showAbout
    ]
    
    app.dock?.hide()
    
    keys = 
        left:       'ctrl+alt+left'
        right:      'ctrl+alt+right'
        up:         'ctrl+alt+up'
        down:       'ctrl+alt+down'
        minimize:   'ctrl+alt+m'
        screenzoom: 'ctrl+alt+z'
        
    prefs.init keys

    for a in _.keys keys
        electron.globalShortcut.register prefs.get(a), ((a) -> -> action a)(a)
        
  
if args.debug
    require('./screenzoom').start debug:true
    