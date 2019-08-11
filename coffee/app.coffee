###
000   000  000   000  000   000         0000000   00000000   00000000   
000 0 000   000 000   000 0 000        000   000  000   000  000   000  
000000000    00000    000000000        000000000  00000000   00000000   
000   000   000 000   000   000        000   000  000        000        
00     00  000   000  00     00        000   000  000        000        
###

{ post, prefs, about, slash, childp, karg, klog, os, _ } = require 'kxk'

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

post.on 'winlog', (text) -> klog ">>> " + text

#  0000000    0000000  000000000  000   0000000   000   000  
# 000   000  000          000     000  000   000  0000  000  
# 000000000  000          000     000  000   000  000 0 000  
# 000   000  000          000     000  000   000  000  0000  
# 000   000   0000000     000     000   0000000   000   000  

action = (act) ->

    # klog 'act' act
    
    switch act
        when 'maximize'   then log wc 'maximize' 'top'
        when 'minimize'   then log wc 'minimize' 'top'
        when 'taskbar'    then log wc 'taskbar'  'toggle'
        when 'close'      then log wc 'close'    'top'
        when 'screenzoom' then require('./zoom').start debug:args.debug
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
        
        b = 0
        if os.platform() == 'win32'
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
                when 'left'  then w = ar.w/4+d
                when 'right' then w = ar.w/4+d; x = 3*ar.w/4-b
                when 'down'  then h = ar.h/2+d; y = ar.h/2-b
                when 'up'    then w = ar.w+d;   x = -b
        
        # klog dir, info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h), info.path
        klog 'wxw bounds' info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h)
        wc 'bounds' info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h)

#  0000000  000   000  000  000000000   0000000  000   000  
# 000       000 0 000  000     000     000       000   000  
# 0000000   000000000  000     000     000       000000000  
#      000  000   000  000     000     000       000   000  
# 0000000   00     00  000     000      0000000  000   000  

getSwitch = ->
    
    if not swtch or swtch.isDestroyed()
        swtch = require('./switch').start()
        swtch.on 'close' -> swtch = null
    swtch
        
onAppSwitch = -> 

    getSwitch()
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

post.on 'showAbout' showAbout

app.on 'window-all-closed' (event) -> event.preventDefault()
        
# 00000000   00000000   0000000   0000000    000   000
# 000   000  000       000   000  000   000   000 000 
# 0000000    0000000   000000000  000   000    00000  
# 000   000  000       000   000  000   000     000   
# 000   000  00000000  000   000  0000000       000   

app.on 'ready' ->
    
    tray = new electron.Tray "#{__dirname}/../img/menu.png"
    tray.on 'click' -> getSwitch().show()
    tray.on 'double-click' -> app.exit 0; process.exit 0
    
    tray.setContextMenu Menu.buildFromTemplate [
        label: "Quit"
        click: -> app.exit 0; process.exit 0
    ,
        label: "About"
        click: showAbout
    ]
    
    # app.dock?.hide()
    
    keys = 
        left:       'alt+ctrl+left'
        right:      'alt+ctrl+right'
        up:         'alt+ctrl+up'
        down:       'alt+ctrl+down'
        topleft:    'alt+ctrl+1'
        botleft:    'alt+ctrl+2'
        topright:   'alt+ctrl+3'
        botright:   'alt+ctrl+4'
        top:        'alt+ctrl+5'
        bot:        'alt+ctrl+6'
        minimize:   'alt+ctrl+m'
        close:      'alt+ctrl+w'
        taskbar:    'alt+ctrl+t'
        appswitch:  'ctrl+tab'
        screenzoom: 'alt+z'
        
    prefs.init defaults:keys
    
    for a in _.keys keys
        electron.globalShortcut.register prefs.get(a), ((a) -> -> action a)(a)
        
    getSwitch()
    
    app.on 'activate' -> onAppSwitch()
  
if app.requestSingleInstanceLock?
    
    if app.requestSingleInstanceLock()
        app.on 'second-instance' -> 
            getSwitch().show()
    else
        app.quit()
            
    