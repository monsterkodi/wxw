#  0000000  000   000  000  000000000   0000000  000   000  
# 000       000 0 000  000     000     000       000   000  
# 0000000   000000000  000     000     000       000000000  
#      000  000   000  000     000     000       000   000  
# 0000000   00     00  000     000      0000000  000   000  

{ childp, post, karg, slash, drag, elem, prefs, clamp, kpos, klog, keyinfo, $ } = require 'kxk'

wc = require './wc'
electron = require 'electron'

getApps = ->

    infos = wc 'info'
    
    apps = []
    for info in infos
        apps.push info.path if info.path not in apps
            
    klog 'apps' apps.map (a) -> slash.base a
    apps
    
pngPath = (appPath) ->
    klog 'appPath' appPath, slash.base(appPath)
    slash.resolve slash.join slash.userData(), 'icons', slash.base(appPath) + ".png"
    
#  0000000  000000000   0000000   00000000   000000000  
# 000          000     000   000  000   000     000     
# 0000000      000     000000000  0000000       000     
#      000     000     000   000  000   000     000     
# 0000000      000     000   000  000   000     000     

start = (opt={}) -> 

    ss = electron.screen.getPrimaryDisplay().workAreaSize
    
    as = parseInt ss.height/10
    
    apps = getApps()
    
    for app in apps
        png = pngPath slash.base app
        if not slash.fileExists png
            klog 'icon' app, png
            wc 'icon' app, png
    
    win = new electron.BrowserWindow

        backgroundColor: '#222222'
        transparent:     true
        preloadWindow:   true
        x:               parseInt (ss.width-as*apps.length)/2
        y:               parseInt (ss.height-as)/2
        width:           as*apps.length
        height:          as
        hasShadow:       false
        resizable:       false
        frame:           false
        thickFrame:      false
        fullscreen:      false
        show:            true
        webPreferences:
            nodeIntegration: true
            webSecurity:     false
            
    html = """
        <head>
        <style type="text/css">
            body {
                overflow:       hidden;
                margin:         0;
                border:         none;
            }
            .apps {
                position:       absolute;
                left:           0;
                top:            0;
                bottom:         0;
                right:          0;
                display:        flex;
            }
            .app {
                flex:           1 1 0;
                border:         1px solid white;
            }
        </style>
        </head>
        <body>
        <div class="apps" tabindex=0></div>
        <script>
            var pth = process.resourcesPath + "/app/js/switch.js";
            if (process.resourcesPath.indexOf("node_modules\\\\electron\\\\dist\\\\resources")>=0) { pth = process.cwd() + "/js/switch.js"; }
            console.log(pth, process.resourcesPath);
            require(pth).init();
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

onMouseMove = (event) -> 
onMouseDown = (event) -> done()
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

init = ->
    
    win = electron.remote.getCurrentWindow()
    
    a =$ '.apps'
    
    a.onmousemove  = onMouseMove
    a.onkeydown    = onKeyDown
    
    # if not win.debug
        # a.onblur = done
    
    apps = getApps()
        
    for p in apps
        a.appendChild elem 'img' class:'app' src:slash.fileUrl pngPath p
        
    a.focus()
    
module.exports = 
    start:start
    init:init
    
    
    