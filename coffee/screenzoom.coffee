#  0000000   0000000  00000000   00000000  00000000  000   000  0000000   0000000    0000000   00     00  
# 000       000       000   000  000       000       0000  000     000   000   000  000   000  000   000  
# 0000000   000       0000000    0000000   0000000   000 0 000    000    000   000  000   000  000000000  
#      000  000       000   000  000       000       000  0000   000     000   000  000   000  000 0 000  
# 0000000    0000000  000   000  00000000  00000000  000   000  0000000   0000000    0000000   000   000  

{ childp, post, karg, slash, drag, clamp, pos, error, log, $ } = require 'kxk'

rect     = require './rect'
electron = require 'electron'
robot    = require 'robotjs' 

zoomWin  = null
vw = electron.screen.getPrimaryDisplay().workAreaSize.width
vh = electron.screen.getPrimaryDisplay().workAreaSize.height

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

# 000   000  000  000   000  0000000     0000000   000   000  
# 000 0 000  000  0000  000  000   000  000   000  000 0 000  
# 000000000  000  000 0 000  000   000  000   000  000000000  
# 000   000  000  000  0000  000   000  000   000  000   000  
# 00     00  000  000   000  0000000     0000000   00     00  

createWindow = (opt) ->
        
    win = new electron.BrowserWindow
        backgroundColor: '#00000000'
        transparent:     true
        preloadWindow:   true
        x:               0 
        y:               0 
        width:           vw
        height:          vh
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

done = -> 
    win = electron.remote.getCurrentWindow()
    win.close()
    if win.debug then electron.remote.app.exit 0
        
init = ->
    
    post.on 'slog', (text) ->
    
        console.log 'slog', text
        post.toMain 'winlog', text
    
    win = electron.remote.getCurrentWindow()
    
    a =$ 'image'
    a.ondblclick   = onDblClick
    a.onmousemove  = onMouseMove
    a.onmousewheel = onWheel
    a.onkeydown    = done
    if not win.debug
        a.onblur = done
    new drag
        target:  a
        onStart: onDragStart
        onMove:  onDragMove
        onStop:  onDragStop
    a.focus()

# 000000000  00000000    0000000   000   000   0000000  00000000   0000000   00000000   00     00  
#    000     000   000  000   000  0000  000  000       000       000   000  000   000  000   000  
#    000     0000000    000000000  000 0 000  0000000   000000    000   000  0000000    000000000  
#    000     000   000  000   000  000  0000       000  000       000   000  000   000  000 0 000  
#    000     000   000  000   000  000   000  0000000   000        0000000   000   000  000   000  

scale  = 1.0
offset = pos(0,0)

transform = ->
    a =$ 'image'

    scale = clamp 1, 20, scale
    
    ox = vw * (scale-1)/(2*scale)
    oy = vh * (scale-1)/(2*scale)
    offset.x = clamp -ox, ox, offset.x
    offset.y = clamp -oy, oy, offset.y
    
    a.style.transform = "scaleX(#{scale}) scaleY(#{scale}) translateX(#{offset.x}px) translateY(#{offset.y}px)"

onDblClick = (event) -> 
    scale = 1 
    transform()
    
# 000   000  000   000  00000000  00000000  000      
# 000 0 000  000   000  000       000       000      
# 000000000  000000000  0000000   0000000   000      
# 000   000  000   000  000       000       000      
# 00     00  000   000  00000000  00000000  0000000  

onWheel = (event) ->
    
    scaleFactor =(1 - event.deltaY / 400.0)
    newScale = clamp 1, 20, scale * scaleFactor
    
    mp = pos(event).minus pos(vw, vh).times 0.5
    
    oldPos = offset.plus pos(mp).times 1/scale
    newPos = offset.plus pos(mp).times 1/newScale
    offset.add newPos.minus oldPos
    
    scale *= scaleFactor
    transform()
    
robotPos = -> pos(robot.getMousePos()).div(pos(robot.getScreenSize().width,robot.getScreenSize().height)).mul pos(vw,vh)

borderTimer = null
onMouseMove = (event) ->
    if not borderTimer
        borderScroll()

mapRange = (value, valueRange, targetRange) ->
    targetWidth   = targetRange[1] - targetRange[0]
    valueWidth    = valueRange[1]  - valueRange[0]
    clampedValue  = clamp valueRange[0], valueRange[1], value
    relativeValue = (clampedValue - valueRange[0]) / valueWidth
    targetRange[0] + targetWidth * relativeValue
        
scrollSpeed = 0
doScroll = ->
    transform()
    ms = mapRange scrollSpeed, [0,1], [1000/10, 1000/30]
    borderTimer = setTimeout borderScroll, ms
    
borderScroll = ->

    clearTimeout borderTimer
    borderTimer = null
    
    mousePos = robotPos()
    
    scroll = false
    border = 200
    
    direction = pos(vw,vh).times(0.5).to(mousePos).mul(pos(1/vw,1/vh)).times(-1)
    
    if mousePos.x < border
        scrollSpeed = (border-mousePos.x)/border
        offset.add direction.times (1.0+scrollSpeed*30)/scale
        scroll = true
    else if mousePos.x > vw-border
        scrollSpeed = (border-(vw-mousePos.x))/border
        offset.add direction.times (1.0+scrollSpeed*30)/scale
        scroll = true
        
    if mousePos.y < border
        scrollSpeed = (border-mousePos.y)/border
        offset.add direction.times (1.0+scrollSpeed*30)/scale
        scroll = true
    else if mousePos.y > vh-border
        scrollSpeed = (border-(vh-mousePos.y))/border
        offset.add direction.times (1.0+scrollSpeed*30)/scale
        scroll = true
        
    if scroll
        doScroll()
    
# 0000000    00000000    0000000    0000000   
# 000   000  000   000  000   000  000        
# 000   000  0000000    000000000  000  0000  
# 000   000  000   000  000   000  000   000  
# 0000000    000   000  000   000   0000000   

onDragStart = (drag, event) -> 
    
    if event.button != 0
        if event.button == 1
            done()
        return 'skip'
    
onDragStop  = (drag, event) -> 
onDragMove  = (drag, event) -> 
    
    offset.add drag.delta.times 1/scale
    transform()
    
module.exports = 
    start:start
    init:init
    