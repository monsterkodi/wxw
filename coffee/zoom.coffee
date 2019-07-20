# 0000000   0000000    0000000   00     00  
#    000   000   000  000   000  000   000  
#   000    000   000  000   000  000000000  
#  000     000   000  000   000  000 0 000  
# 0000000   0000000    0000000   000   000  

{ childp, post, karg, slash, drag, prefs, clamp, kpos, klog, $ } = require 'kxk'

wc = require './wc'
electron = require 'electron'

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
    
    vw = electron.screen.getPrimaryDisplay().workAreaSize.width
    vh = electron.screen.getPrimaryDisplay().workAreaSize.height
    
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
                width:          #{vw}px;
                height:         #{vh}px;
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
    
    win.on 'ready-to-show' ->
        
    if opt.debug
        win.webContents.openDevTools()
    else
        win.maximize()
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

transform = ->
    
    vw = electron.remote.screen.getPrimaryDisplay().workAreaSize.width
    vh = electron.remote.screen.getPrimaryDisplay().workAreaSize.height
    
    a =$ '.screenshot'

    scale = clamp 1 20 scale
    
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
    
    
    scaleFactor = 1 - event.deltaY / 400.0
    newScale = clamp 1 20 scale * scaleFactor
    
    vw = electron.remote.screen.getPrimaryDisplay().workAreaSize.width
    vh = electron.remote.screen.getPrimaryDisplay().workAreaSize.height
    
    mp = kpos(event).minus kpos(vw, vh).times 0.5
    
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
    ms = mapRange scrollSpeed, [0 1], [1000/10 1000/30]
    borderTimer = setTimeout borderScroll, ms
    
borderScroll = ->

    clearTimeout borderTimer
    borderTimer = null
    
    mousePos = kpos wc 'mouse'
    
    scroll = false
    border = 200
    
    direction = kpos(vw,vh).times(0.5).to(mousePos).mul(kpos(1/vw,1/vh)).times(-1)
    
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
    else if scale == 1
        done()
        return 'skip'
    
onDragStop = (drag, event) -> 
onDragMove = (drag, event) -> 
    
    offset.add drag.delta.times 1/scale
    transform()
    
module.exports = 
    start:start
    init:init
    
    
    