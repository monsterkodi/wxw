###
000   000  000   000  000   000         0000000   00000000   00000000   
000 0 000   000 000   000 0 000        000   000  000   000  000   000  
000000000    00000    000000000        000000000  00000000   00000000   
000   000   000 000   000   000        000   000  000        000        
00     00  000   000  00     00        000   000  000        000        
###

{ prefs, about, slash, childp, error, log, _ } = require 'kxk'

gdi      = require './gdi'
user     = require './user'
wininfo  = require './wininfo'
rect     = require './rect'

pkg      = require '../package.json'
electron = require 'electron'

app      = electron.app
Menu     = electron.Menu
tray     = null

#  0000000    0000000  000000000  000   0000000   000   000  
# 000   000  000          000     000  000   000  0000  000  
# 000000000  000          000     000  000   000  000 0 000  
# 000   000  000          000     000  000   000  000  0000  
# 000   000   0000000     000     000   0000000   000   000  

action = (act) ->
    
    switch act
        when 'minimize'   then minimizeWindow()
        when 'screenShot' then screenShot()
        else moveWindow act

#  0000000   0000000  00000000   00000000  00000000  000   000   0000000  000   000   0000000   000000000  
# 000       000       000   000  000       000       0000  000  000       000   000  000   000     000     
# 0000000   000       0000000    0000000   0000000   000 0 000  0000000   000000000  000   000     000     
#      000  000       000   000  000       000       000  0000       000  000   000  000   000     000     
# 0000000    0000000  000   000  00000000  00000000  000   000  0000000   000   000   0000000      000     

screenShot = ->
    
    childp.exec slash.join(__dirname,'..','bin','screenshot.exe'), (err) -> 
        
        return error err if err
        win = new electron.BrowserWindow
            backgroundColor: '#00000000'
            transparent:     true
            preloadWindow:   true
            x:               ar.x
            y:               ar.y
            width:           ar.w
            height:          ar.h
            hasShadow:       false
            resizable:       false
            frame:           false
            thickFrame:      false
            show:            true
            fullscreen:      true
            webPreferences:
                webSecurity: false
        
        pngFile = slash.fileUrl slash.join process.cwd(),'screenshot.png'
                
        html = """
            <body>
            <style type="text/css">
                body {
                    overflow:       hidden;
                    margin:         0;
                    border:         none;
                }
                #image {
                    width:          100%; 
                    height:         100%; 
                }
            </style>
            <img id='image' tabindex=0 src="#{pngFile}"/>
            <script>
                var electron = require('electron');
                win = electron.remote.getCurrentWindow();
                var a = document.getElementById('image');
                a.onclick   = function () { win.close(); }
                a.onkeydown = function () { win.close(); }
                a.onblur    = function () { win.close(); }
                a.focus()
            </script>
            </body>
        """

        win.loadURL "data:text/html;charset=utf-8," + encodeURI(html) 
        win.on 'ready-to-show', -> 
        win
        
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
        
        SWP_NOZORDER = 0x0004
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
        screenShot: 'ctrl+alt+p'
        
    prefs.init keys

    for a in _.keys keys
        electron.globalShortcut.register prefs.get(a), ((a) -> -> action a)(a)
        
  