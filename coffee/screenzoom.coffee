#  0000000   0000000  00000000   00000000  00000000  000   000  0000000   0000000    0000000   00     00  
# 000       000       000   000  000       000       0000  000     000   000   000  000   000  000   000  
# 0000000   000       0000000    0000000   0000000   000 0 000    000    000   000  000   000  000000000  
#      000  000       000   000  000       000       000  0000   000     000   000  000   000  000 0 000  
# 0000000    0000000  000   000  00000000  00000000  000   000  0000000   0000000    0000000   000   000  

{ childp, post, karg, slash, drag, clamp, pos, error, log, $ } = require 'kxk'

rect     = require './rect'
electron = require 'electron'

zoomWin  = null

#  0000000  000000000   0000000   00000000   000000000  
# 000          000     000   000  000   000     000     
# 0000000      000     000000000  0000000       000     
#      000     000     000   000  000   000     000     
# 0000000      000     000   000  000   000     000     

start = (opt={}) ->
    
    screenshotexe = slash.join(__dirname,'..','bin','screenshot.exe')
    
    if not slash.isFile screenshotexe
        screenshotexe = slash.swapExt screenshotexe, 'bat'
        
    childp.exec screenshotexe, (err) -> 
        
        return error err if err
        createWindow opt

createWindow = (opt) ->
    
    ar = rect.workarea()
    
    width  = opt.debug and ar.w/2 or ar.w
    height = opt.debug and ar.h/2 or ar.h
    
    win = new electron.BrowserWindow
        backgroundColor: '#00000000'
        transparent:     true
        preloadWindow:   true
        x:               ar.x
        y:               ar.y
        width:           width
        height:          height
        hasShadow:       false
        resizable:       false
        frame:           false
        thickFrame:      false
        show:            true
        fullscreen:      not opt.debug
        webPreferences:
            webSecurity: false
            
    zoomWin = win
    
    pngFile = slash.fileUrl slash.join process.cwd(),'screenshot.png'
            
    vw = electron.screen.getPrimaryDisplay().workAreaSize.width
    vh = electron.screen.getPrimaryDisplay().workAreaSize.height
    
    html = """
        <head>
        <style type="text/css">
            body {
                overflow:       hidden;
                margin:         0;
                border:         none;
            }
            #image {
                position:       absolute;
                left:           0;
                top:            0;
                width:          #{vw}px;
                height:         #{vh}px;
            }
        </style>
        </head>
        <body>
        <img id='image' tabindex=0 src="#{pngFile}"/>
        <script>
            var pth = process.resourcesPath + "/app/js/screenzoom.js";
            if (process.resourcesPath.indexOf("node_modules\\\\electron\\\\dist\\\\resources")>=0) { pth = process.cwd() + "/js/screenzoom.js"; }
            console.log(pth, process.resourcesPath);
            require(pth).init();
        </script>
        </body>
    """

    win.loadURL "data:text/html;charset=utf-8," + encodeURI(html) 
    win.debug = opt.debug
    win.on 'ready-to-show', ->
    if opt.debug
        win.webContents.openDevTools()
    win
        
# 000  000   000  000  000000000    
# 000  0000  000  000     000       
# 000  000 0 000  000     000       
# 000  000  0000  000     000       
# 000  000   000  000     000     

init = ->
    
    post.on 'slog', (text) ->
    
        console.log 'slog', text
        post.toMain 'winlog', text
    
    win  = electron.remote.getCurrentWindow()
    done = -> 
        win.close()
        if win.debug then electron.remote.app.exit 0
    
    a =$ 'image'
    # a.onclick   = done
    a.onkeydown = done
    if not win.debug
        a.onblur = done
    a.onmousewheel = onWheel
    new drag
        target:  a
        onStart: onDragStart
        onMove:  onDragMove
        onStop:  onDragStop
    a.focus()

scale  = 1.0
offset = pos(0,0)
onWheel = (event) ->
    a =$ 'image'
    scale = clamp 1, 20, scale * (1 - event.deltaY / 500.0)
    a.style.transform = "scaleX(#{scale}) scaleY(#{scale}) translateX(#{offset.x}px) translateY(#{offset.y}px)"
    
onDragStart = (drag, event) -> #log 'start', drag.pos, pos(event)
onDragStop  = (drag, event) -> #log 'stop',  drag.pos, pos(event)
onDragMove  = (drag, event) -> 
    a =$ 'image'
    offset.add drag.delta.times 1/scale
    a.style.transform = "scaleX(#{scale}) scaleY(#{scale}) translateX(#{offset.x}px) translateY(#{offset.y}px)"
    log a.style.transform
    
module.exports = 
    start:start
    init:init
    