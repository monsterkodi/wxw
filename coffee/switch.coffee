#  0000000  000   000  000  000000000   0000000  000   000  
# 000       000 0 000  000     000     000       000   000  
# 0000000   000000000  000     000     000       000000000  
#      000  000   000  000     000     000       000   000  
# 0000000   00     00  000     000      0000000  000   000  

{ childp, post, karg, slash, drag, elem, prefs, clamp, kpos, klog, keyinfo, $ } = require 'kxk'

wc = require './wc'
electron = require 'electron'

#  0000000   00000000  000000000        0000000   00000000   00000000    0000000  
# 000        000          000          000   000  000   000  000   000  000       
# 000  0000  0000000      000          000000000  00000000   00000000   0000000   
# 000   000  000          000          000   000  000        000             000  
#  0000000   00000000     000          000   000  000        000        0000000   

getApps = ->

    infos = wc 'info'
    
    apps = []
    for info in infos
        klog info
        if info.title != 'wxw-switch'
            apps.push info.path if info.path not in apps
            
    # klog 'apps' apps.map (a) -> slash.base a
    apps
    
# 00000000   000   000   0000000   
# 000   000  0000  000  000        
# 00000000   000 0 000  000  0000  
# 000        000  0000  000   000  
# 000        000   000   0000000   

pngPath = (appPath) ->
    # klog 'appPath' appPath, slash.base(appPath)
    slash.resolve slash.join slash.userData(), 'icons', slash.base(appPath) + ".png"
    
#  0000000  000000000   0000000   00000000   000000000  
# 000          000     000   000  000   000     000     
# 0000000      000     000000000  0000000       000     
#      000     000     000   000  000   000     000     
# 0000000      000     000   000  000   000     000     

start = (opt={}) -> 

    ss = electron.screen.getPrimaryDisplay().workAreaSize
    
    as = 128
    border = 20
    
    apps = getApps()
    
    for app in apps
        png = pngPath slash.base app
        if not slash.fileExists png
            klog 'icon' app, png
            wc 'icon' app, png
    
    width = (as+border)*apps.length+border
    height = as+border*2
            
    win = new electron.BrowserWindow

        backgroundColor: '#00000000'
        transparent:     true
        preloadWindow:   true
        x:               parseInt (ss.width-width)/2
        y:               parseInt (ss.height-height)/2
        width:           width
        height:          height
        hasShadow:       false
        resizable:       false
        frame:           false
        thickFrame:      false
        fullscreen:      false
        show:            true
        webPreferences:
            nodeIntegration: true
            webSecurity:     false
            
    # 000   000  000000000  00     00  000      
    # 000   000     000     000   000  000      
    # 000000000     000     000000000  000      
    # 000   000     000     000 0 000  000      
    # 000   000     000     000   000  0000000  
    
    html = """
        <head>
        <title>wxw-switch</title>
        <style type="text/css">
            * {
                outline-width:  0;
            }
            
            body {
                overflow:       hidden;
                margin:         0;
            }
            .apps {
                opacity:        1;
                white-space:    nowrap;
                position:       absolute;
                left:           0px;
                top:            0px;
                bottom:         0px;
                right:          0px;
                overflow:       hidden;
                background:     rgb(16,16,16);
                border-radius:  6px;
                padding:        10px;
            }
            .app {
                display:        inline-block;
                width:          128px;
                height:         128px;
                padding:        10px;
            }
            .app:hover {
                background:     rgb(24,24,24);
            }
        </style>
        </head>
        <body>
        <div class="apps" tabindex=0></div>
        <script>
            var pth = process.resourcesPath + "/app/js/switch.js";
            if (process.resourcesPath.indexOf("node_modules\\\\electron\\\\dist\\\\resources")>=0) { pth = process.cwd() + "/js/switch.js"; }
            console.log(pth, process.resourcesPath);
            require(pth).initWin();
        </script>
        </body>
    """

    data = "data:text/html;charset=utf-8," + encodeURI(html)
    win.loadURL data, baseURLForDataURL:slash.fileUrl __dirname + '/index.html'

    win.debug = opt.debug
    
    if opt.debug
        win.webContents.openDevTools()
    win
        
done = -> electron.remote.getCurrentWindow().close()

# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  

onMouseMove = (event) -> 
    
    klog event.target.id
    
onMouseDown = (event) -> 
    # klog event.target.id
    done()
    wc 'focus' event.target.id if event.target.id
    
# 000   000  00000000  000   000  
# 000  000   000        000 000   
# 0000000    0000000     00000    
# 000  000   000          000     
# 000   000  00000000     000     

onKeyDown = (event) -> 
    
    { mod, key, char, combo } = keyinfo.forEvent event
    
    switch key
        when 'esc' then done()
        else klog 'onKeyDown' combo

# 000  000   000  000  000000000    
# 000  0000  000  000     000       
# 000  000 0 000  000     000       
# 000  000  0000  000     000       
# 000  000   000  000     000     

initWin = ->
    
    win = electron.remote.getCurrentWindow()
    
    a =$ '.apps'
    
    a.onmousemove = onMouseMove
    a.onmousedown = onMouseDown
    a.onkeydown   = onKeyDown
    
    # if not win.debug
        # a.onblur = done
    
    apps = getApps()
        
    for p in apps
        a.appendChild elem 'img',
            id: p
            class:'app' 
            src:slash.fileUrl pngPath p
        
    a.focus()
    
module.exports = 
    start:start
    initWin:initWin
    
    
    