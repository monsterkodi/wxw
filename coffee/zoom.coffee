# 0000000   0000000    0000000   00     00  
#    000   000   000  000   000  000   000  
#   000    000   000  000   000  000000000  
#  000     000   000  000   000  000 0 000  
# 0000000   0000000    0000000   000   000  

{ childp, post, karg, slash, drag, prefs, clamp, kpos, klog, $ } = require 'kxk'

wc = require './wc'
electron = require 'electron'

taskbar = false

screenshotPath = ->
    slash.resolve slash.join prefs.get('screenhotFolder', slash.resolve "~/Desktop"), 'screenshot.png'
    
screenshotFile = ->
    slash.unslash screenshotPath()
    
#  0000000  000000000   0000000   00000000   000000000  
# 000          000     000   000  000   000     000     
# 0000000      000     000000000  0000000       000     
#      000     000     000   000  000   000     000     
# 0000000      000     000   000  000   000     000     

start = (opt={}) ->
    
    wc 'screenshot' screenshotFile()
    createWindow opt
    
# 000   000  000  000   000  0000000     0000000   000   000  
# 000 0 000  000  0000  000  000   000  000   000  000 0 000  
# 000000000  000  000 0 000  000   000  000   000  000000000  
# 000   000  000  000  0000  000   000  000   000  000   000  
# 00     00  000  000   000  0000000     0000000   00     00  

createWindow = (opt) ->
                
    ss = electron.screen.getPrimaryDisplay().size
    
    win = new electron.BrowserWindow
        backgroundColor:        '#00000000'
        x:                      0 
        y:                      0 
        width:                  ss.width
        height:                 ss.height
        minWidth:               ss.width
        minHeight:              ss.height
        hasShadow:              false
        resizable:              false
        frame:                  false
        thickFrame:             false
        fullscreen:             false
        transparent:            true
        preloadWindow:          true
        alwaysOnTop:            true
        enableLargerThanScreen: true
        acceptFirstMouse:       true
        show:                   true
        webPreferences:
            nodeIntegration: true
            webSecurity:     false
            
    pngFile = slash.fileUrl screenshotPath()
    
    html = """
        <head>
        <style type="text/css">
            body {
                overflow:       hidden;
                margin:         1px;
                border:         none;
            }
            img {
                position:       absolute;
                left:           0;
                top:            0;
                width:          #{ss.width}px;
                height:         #{ss.height}px;
            }
        </style>
        </head>
        <body>
        <img class="screenshot" tabindex=0 src="#{pngFile}"/>
        <script>
            var pth = process.resourcesPath + "/app/js/zoom.js";
            if (process.resourcesPath.indexOf("node_modules\\\\electron\\\\dist\\\\resources")>=0) { pth = process.cwd() + "/js/zoom.js"; }
            console.log(pth, process.resourcesPath);
            require(pth).init();
        </script>
        </body>
    """

    data = "data:text/html;charset=utf-8," + encodeURI(html) 
    win.loadURL data, baseURLForDataURL:slash.fileUrl __dirname + '/index.html'

    win.debug = opt.debug
    
    win.webContents.on 'dom-ready' ->
        info = wc('info' 'taskbar')[0]
        if info.status != 'hidden'
            post.toWin win.id, 'taskbar' true
        else
            post.toWin win.id, 'taskbar' false
        
    if opt.debug then win.webContents.openDevTools mode:'detach'

    win

# 0000000     0000000   000   000  00000000  
# 000   000  000   000  0000  000  000       
# 000   000  000   000  000 0 000  0000000   
# 000   000  000   000  000  0000  000       
# 0000000     0000000   000   000  00000000  

done = -> 
    win = electron.remote.getCurrentWindow()
    win.close()
    if window.taskbar
        wc 'taskbar' 'show'
    if win.debug then electron.remote.app.exit 0
    
# 000  000   000  000  000000000    
# 000  0000  000  000     000       
# 000  000 0 000  000     000       
# 000  000  0000  000     000       
# 000  000   000  000     000     
        
init = ->
    
    post.on 'taskbar' (show) -> window.taskbar = show
    
    win = electron.remote.getCurrentWindow()
    
    a =$ '.screenshot'
    
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
offset = kpos 0 0
dragging = false

transform = ->
    
    ss = electron.remote.screen.getPrimaryDisplay().size
    
    a =$ '.screenshot'

    scale = clamp 1 20 scale
    
    ox = ss.width  * (scale-1)/(2*scale)
    oy = ss.height * (scale-1)/(2*scale)
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
    
    scaleFactor = 1 - event.deltaY / 400.0
    newScale = clamp 1 20 scale * scaleFactor
    if newScale == 1
        dragging = false
    
    ss = electron.remote.screen.getPrimaryDisplay().size
    
    mp = kpos(event).minus kpos(ss.width, ss.height).times 0.5
    
    oldPos = offset.plus kpos(mp).times 1/scale
    newPos = offset.plus kpos(mp).times 1/newScale
    offset.add newPos.minus oldPos
    
    scale *= scaleFactor
    
    transform()
    
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
    startScroll()
    
startScroll = ->
    ms = mapRange scrollSpeed, [0 1], [1000/10 1000/30]
    borderTimer = setTimeout borderScroll, ms
  
borderScroll = ->

    clearTimeout borderTimer
    borderTimer = null
    
    return if dragging
    
    mousePos = kpos wc 'mouse'
    
    scroll = false
    border = 200
    
    ss = electron.remote.screen.getPrimaryDisplay().size
    
    direction = kpos(ss.width,ss.height).times(0.5).to(mousePos).mul(kpos(1/ss.width,1/ss.height)).times(-1)
    
    if mousePos.x < border
        scrollSpeed = (border-mousePos.x)/border
        offset.add direction.times (1.0+scrollSpeed*30)/scale
        scroll = true
    else if mousePos.x > ss.width-border
        scrollSpeed = (border-(ss.width-mousePos.x))/border
        offset.add direction.times (1.0+scrollSpeed*30)/scale
        scroll = true
        
    if mousePos.y < border
        scrollSpeed = (border-mousePos.y)/border
        offset.add direction.times (1.0+scrollSpeed*30)/scale
        scroll = true
    else if mousePos.y > ss.height-border
        scrollSpeed = (border-(ss.height-mousePos.y))/border
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
    else if scale == 1
        done()
        return 'skip'
        
    dragging = true
    
onDragStop = (drag, event) -> # dragging = false
onDragMove = (drag, event) -> 
    
    offset.add drag.delta.times 1/scale
    transform()
    
module.exports = 
    start:start
    init:init
    
    