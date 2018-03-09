###
000   000  000   000  000   000         0000000   00000000   00000000   
000 0 000   000 000   000 0 000        000   000  000   000  000   000  
000000000    00000    000000000        000000000  00000000   00000000   
000   000   000 000   000   000        000   000  000        000        
00     00  000   000  00     00        000   000  000        000        
###

{ prefs, about, log } = require 'kxk'

user     = require './user'

pkg      = require '../package.json'
electron = require 'electron'
Struct   = require 'ref-struct'

app      = electron.app
tray     = null

showAbout = ->
    
    about 
        img: "#{__dirname}/../img/about.png"
        background: "#222"
        size: 300
        pkg: pkg

app.on 'window-all-closed', (event) -> event.preventDefault()

#  0000000    0000000  000000000  000   0000000   000   000  
# 000   000  000          000     000  000   000  0000  000  
# 000000000  000          000     000  000   000  000 0 000  
# 000   000  000          000     000  000   000  000  0000  
# 000   000   0000000     000     000   0000000   000   000  

action = (dir) ->
    
    Rect = Struct left:'long', top:'long', right:'long', bottom:'long'
    rect = new Rect
    
    SPI_GETWORKAREA= 0x0030
    user.SystemParametersInfoW SPI_GETWORKAREA, 0, rect.ref(), 0
    
    if hWnd = user.GetForegroundWindow()
        
        SWP_NOZORDER = 0x0004

        wr = new Rect
        user.GetWindowRect hWnd, wr.ref()
        
        [x,y,w,h] = switch dir
            when 'left'   then [-10,             0, rect.right/2+20, rect.bottom+10]
            when 'right'  then [rect.right/2-10, 0, rect.right/2+20, rect.bottom+10]
            when 'up'     then [-10,             0, rect.right+20,   rect.bottom+10]
            when 'down'   then [rect.right/4-10, 0, rect.right/2+20, rect.bottom+10]
        
        sl = 20 > Math.abs wr.left   -  x
        sr = 20 > Math.abs wr.right  - (x+w)
        st = 20 > Math.abs wr.top    -  y
        sb = 20 > Math.abs wr.bottom - (y+h)
        
        if sl and sr and st and sb
            switch dir
                when 'left'  then w  = rect.right/4+20
                when 'right' then w  = rect.right/4+20;   x = 3*rect.right/4-10
                when 'up'    then w  = 2/3*rect.right+20; x = rect.right/6-10
                when 'down'  then h  = rect.bottom/2+20;  y = rect.bottom/2-10
        
        user.SetWindowPos hWnd, null, x, y, w, h, SWP_NOZORDER
    
    
#00000000   00000000   0000000   0000000    000   000
#000   000  000       000   000  000   000   000 000 
#0000000    0000000   000000000  000   000    00000  
#000   000  000       000   000  000   000     000   
#000   000  00000000  000   000  0000000       000   

app.on 'ready', -> 
    tray = new electron.Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', showAbout
    app.dock?.hide()
            
    prefs.init 
        left:  'ctrl+alt+left'
        right: 'ctrl+alt+right'
        up:    'ctrl+alt+up'
        down:  'ctrl+alt+down'

    for a in ['left', 'right', 'up', 'down']
        electron.globalShortcut.register prefs.get(a), ((a) -> -> action a)(a)
  