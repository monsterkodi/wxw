###
000   000  000   000  000   000         0000000   00000000   00000000   
000 0 000   000 000   000 0 000        000   000  000   000  000   000  
000000000    00000    000000000        000000000  00000000   00000000   
000   000   000 000   000   000        000   000  000        000        
00     00  000   000  00     00        000   000  000        000        
###

{ post, prefs, about, slash, childp, karg, klog, _ } = require 'kxk'

wc       = require './wc'
pkg      = require '../package.json'
electron = require 'electron'

app      = electron.app
Menu     = electron.Menu
tray     = null
swtch    = null

args = karg """
wxw
    debug  . ? log debug    . = false . - D

version  #{pkg.version}
"""

# args.debug = true

post.on 'winlog', (text) -> klog ">>> " + text

#  0000000    0000000  000000000  000   0000000   000   000  
# 000   000  000          000     000  000   000  0000  000  
# 000000000  000          000     000  000   000  000 0 000  
# 000   000  000          000     000  000   000  000  0000  
# 000   000   0000000     000     000   0000000   000   000  

action = (act) ->

    switch act
        when 'maximize'   then wc 'maximize' 'top'
        when 'minimize'   then wc 'minimize' 'top'
        when 'taskbar'    then wc 'taskbar'  'toggle'
        when 'close'      then wc 'close'    'top'
        when 'screenzoom' then require('./zoom').start()
        when 'appswitch'  then onAppSwitch()
        else moveWindow act
        
# 00     00   0000000   000   000  00000000  
# 000   000  000   000  000   000  000       
# 000000000  000   000   000 000   0000000   
# 000 0 000  000   000     000     000       
# 000   000   0000000       0      00000000  

moveWindow = (dir) ->
    
    screen = wc 'screen' 'user'
    
    ar = w:screen.width, h:screen.height
    
    if info = wc('info' 'top')[0]
        
        base = slash.base info.path
        
        return if base in ['kachel' 'kappo']
        
        if base in ['electron' 'ko' 'konrad' 'clippo' 'klog' 'kaligraf' 'kalk' 'uniko' 'knot' 'space' 'ruler']
            b = 0  # sane window border
        else if base in ['devenv']
            b = -1  # wtf?
        else
            b = 10 # transparent window border
        
        wr = x:info.x, y:info.y, w:info.width, h:info.height
        d = 2*b
        [x,y,w,h] = switch dir
            when 'left'     then [-b,         0,        ar.w/2+d, ar.h+b]
            when 'right'    then [ar.w/2-b,   0,        ar.w/2+d, ar.h+b]
            when 'down'     then [ar.w/4-b,   0,        ar.w/2+d, ar.h+b]
            when 'up'       then [ar.w/6-b,   0,    2/3*ar.w+d,   ar.h+b]
            when 'topleft'  then [-b,         0,        ar.w/3+d, ar.h/2]
            when 'top'      then [ar.w/3-b,   0,        ar.w/3+d, ar.h/2]
            when 'topright' then [2/3*ar.w-b, 0,        ar.w/3+d, ar.h/2]
            when 'botleft'  then [-b,         ar.h/2-b, ar.w/3+d, ar.h/2+d]
            when 'bot'      then [ar.w/3-b,   ar.h/2-b, ar.w/3+d, ar.h/2+d]
            when 'botright' then [2/3*ar.w-b, ar.h/2-b, ar.w/3+d, ar.h/2+d]
        
        sl = 20 > Math.abs wr.x -  x
        sr = 20 > Math.abs wr.x+wr.w - (x+w)
        st = 20 > Math.abs wr.y -  y
        sb = 20 > Math.abs wr.y+wr.h - (y+h)
        
        if sl and sr and st and sb
            switch dir
                when 'left'  then w  = ar.w/4+d
                when 'right' then w  = ar.w/4+d; x = 3*ar.w/4-b
                when 'down'  then h  = ar.h/2+d; y = ar.h/2-b
                when 'up'    then w  = ar.w+d;   x = -b
        
        wc 'bounds' info.hwnd, x, y, w, h
       
onAppSwitch = ->
    
    if not swtch 
        swtch = require('./switch').start()
        return
    
    post.toWin swtch.id, 'nextApp'

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

app.on 'window-all-closed' (event) -> event.preventDefault()
        
# 00000000   00000000   0000000   0000000    000   000
# 000   000  000       000   000  000   000   000 000 
# 0000000    0000000   000000000  000   000    00000  
# 000   000  000       000   000  000   000     000   
# 000   000  00000000  000   000  0000000       000   

app.on 'ready', ->
    
    tray = new electron.Tray "#{__dirname}/../img/menu.png"
    tray.on 'click' showAbout
    tray.on 'double-click' -> app.exit 0; process.exit 0
    
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
        topleft:    'ctrl+alt+1'
        botleft:    'ctrl+alt+2'
        topright:   'ctrl+alt+3'
        botright:   'ctrl+alt+4'
        top:        'ctrl+alt+5'
        bot:        'ctrl+alt+6'
        minimize:   'ctrl+alt+m'
        close:      'ctrl+alt+w'
        taskbar:    'ctrl+alt+t'
        appswitch:  'ctrl+tab'
        screenzoom: 'alt+z'
        
    prefs.init defaults:keys
    
    for a in _.keys keys
        electron.globalShortcut.register prefs.get(a), ((a) -> -> action a)(a)
        
    onAppSwitch()
  
if app.requestSingleInstanceLock? 
    if !app.requestSingleInstanceLock()
        app.quit()
        
if args.debug
    require('./zoom').start debug:true
    
    