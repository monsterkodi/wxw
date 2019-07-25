#  0000000  000   000  000  000000000   0000000  000   000  
# 000       000 0 000  000     000     000       000   000  
# 0000000   000000000  000     000     000       000000000  
#      000  000   000  000     000     000       000   000  
# 0000000   00     00  000     000      0000000  000   000  

{ childp, post, karg, slash, drag, elem, prefs, clamp, kpos, empty, last, klog, keyinfo, $ } = require 'kxk'

wc = require './wc'
electron = require 'electron'

#  0000000   00000000  000000000        0000000   00000000   00000000    0000000  
# 000        000          000          000   000  000   000  000   000  000       
# 000  0000  0000000      000          000000000  00000000   00000000   0000000   
# 000   000  000          000          000   000  000        000             000  
#  0000000   00000000     000          000   000  000        000        0000000   

apps = []
getApps = ->

    infos = wc 'info'
    
    apps = []
    for info in infos
        continue if info.title == 'wxw-switch'
        # continue if info.path.endsWith 'ImmersiveControlPanel\SystemSettings.exe'
        # continue if info.path.indexOf('\\WindowsApps\\') >= 0
        file = slash.file info.path
        if file == 'ApplicationFrameHost.exe'
            name = last info.title.split ' ?- '
            if name in ['Calendar' 'Mail']
                apps.push name if name not in apps
            else if info.title in ['Settings' 'Calculator' 'Microsoft Store']
                apps.push info.title
        else
            apps.push info.path if info.path not in apps
    apps
    
# 00000000   000   000   0000000   
# 000   000  0000  000  000        
# 00000000   000 0 000  000  0000  
# 000        000  0000  000   000  
# 000        000   000   0000000   

pngPath = (appPath) ->
    # klog 'appPath' appPath, slash.base(appPath)
    pth = slash.resolve slash.join slash.userData(), 'icons', slash.base(appPath) + ".png"
    # klog pth
    pth
    
#  0000000  000000000   0000000   00000000   000000000  
# 000          000     000   000  000   000     000     
# 0000000      000     000000000  0000000       000     
#      000     000     000   000  000   000     000     
# 0000000      000     000   000  000   000     000     

winRect = (numApps) ->
    
    screen = electron.remote? and electron.remote.screen or electron.screen
    ss = screen.getPrimaryDisplay().workAreaSize
    as = 128
    border = 20
    width = (as+border)*apps.length+border
    height = as+border*2
    
    x:parseInt (ss.width-width)/2
    y:parseInt (ss.height-height)/2
    width:width
    height:height

start = (opt={}) -> 
    
    apps = getApps()
    
    for app in apps
        png = pngPath app
        if not slash.fileExists png
            # klog 'icon' app, png
            wc 'icon' app, png
        
    wr = winRect apps.length
            
    win = new electron.BrowserWindow

        backgroundColor: '#00000000'
        transparent:     true
        preloadWindow:   true
        x:               wr.x
        y:               wr.y
        width:           wr.width
        height:          wr.height
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
                background:     rgb(20,20,20);
            }
            .app.highlight {
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
        
# 0000000     0000000   000   000  00000000  
# 000   000  000   000  0000  000  000       
# 000   000  000   000  000 0 000  0000000   
# 000   000  000   000  000  0000  000       
# 0000000     0000000   000   000  00000000  

done = -> electron.remote.getCurrentWindow().hide()

#  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
# 000   000  000          000     000  000   000  000   000     000     000       
# 000000000  000          000     000   000 000   000000000     000     0000000   
# 000   000  000          000     000     000     000   000     000     000       
# 000   000   0000000     000     000      0      000   000     000     00000000  

activeApp = null
activate = ->
    done()
    if activeApp.id
        if activeApp.id in ['Mail' 'Calendar']
            infos = wc 'info' 'ApplicationFrameHost.exe'
            for info in infos
                if info.title.endsWith activeApp.id
                    wc 'focus' info.hwnd
                    return
            childp.spawn 'start', [{Mail:'outlookmail:' Calendar:'outlookcal:'}[activeApp.id]], encoding:'utf8' shell:true detached:true stdio:'inherit'            
        else if activeApp.id in ['Calculator' 'Settings' 'Microsoft Store']
            infos = wc 'info' 'ApplicationFrameHost.exe'
            for info in infos
                if info.title == activeApp.id
                    wc 'focus' info.hwnd
                    return
            childp.spawn 'start', [{Calculator:'calculator:' Settings:'ms-settings:' 'Microsoft Store':'ms-windows-store:'}[activeApp.id]], encoding:'utf8' shell:true detached:true stdio:'inherit'
        else
            wc 'focus' activeApp.id 

# 000   000  000   0000000   000   000  000      000   0000000   000   000  000000000  
# 000   000  000  000        000   000  000      000  000        000   000     000     
# 000000000  000  000  0000  000000000  000      000  000  0000  000000000     000     
# 000   000  000  000   000  000   000  000      000  000   000  000   000     000     
# 000   000  000   0000000   000   000  0000000  000   0000000   000   000     000     

highlight = (e) ->
    if e.id
        activeApp?.classList.remove 'highlight'
        e.classList.add 'highlight'
        activeApp = e

nextApp = -> highlight activeApp.nextSibling ? $('.apps').firstChild
prevApp = -> highlight activeApp.previousSibling ? $('.apps').lastChild
quitApp = -> klog 'quitApp' activeApp.id
    
# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  

onMouseMove = (event) -> highlight event.target
    
onMouseDown = (event) -> 
    activeApp = event.target
    activate()
        
# 000   000  00000000  000   000  
# 000  000   000        000 000   
# 0000000    0000000     00000    
# 000  000   000          000     
# 000   000  00000000     000     

onKeyDown = (event) -> 
    
    { mod, key, char, combo } = keyinfo.forEvent event
    
    switch key
        when 'esc'   then done()
        when 'right' then nextApp()
        when 'left'  then prevApp()
        when 'q'     then quitApp()
        when 'enter' 'return' 'space' then activate()
        else klog 'onKeyDown' combo
        
    switch combo
        when 'ctrl+shift+tab' then prevApp()
        when 'alt+ctrl+q'     then electron.remote.app.quit()
        
onKeyUp = (event) ->         
    
    { mod, key, char, combo } = keyinfo.forEvent event
    # klog "up #{mod}, #{key}, #{char}, #{combo}"
    if empty combo
        activate()
        
# 000  000   000  000  000000000    000   000  000  000   000  
# 000  0000  000  000     000       000 0 000  000  0000  000  
# 000  000 0 000  000     000       000000000  000  000 0 000  
# 000  000  0000  000     000       000   000  000  000  0000  
# 000  000   000  000     000       00     00  000  000   000  

initWin = ->
    
    win = electron.remote.getCurrentWindow()
    
    a =$ '.apps'
    
    a.onmousedown = onMouseDown
    a.onkeydown   = onKeyDown
    a.onkeyup     = onKeyUp
    
    if not win.debug
        a.onblur = done
    
    loadApps()
        
    post.on 'nextApp' -> 
        
        if win.isVisible()
            nextApp()
        else
            
            win.setPosition -10000,-10000 # move window offscreen before show
            win.show()
            a =$ '.apps'
            a.innerHTML = ''
            
            restore = -> 
                
                wr = winRect apps.length
                win.setBounds wr
                    
            setTimeout restore, 30 # give windows some time to do it's flickering
            
            loadApps()
    
# 000       0000000    0000000   0000000         0000000   00000000   00000000    0000000  
# 000      000   000  000   000  000   000      000   000  000   000  000   000  000       
# 000      000   000  000000000  000   000      000000000  00000000   00000000   0000000   
# 000      000   000  000   000  000   000      000   000  000        000             000  
# 0000000   0000000   000   000  0000000        000   000  000        000        0000000   

loadApps = ->
    
    a =$ '.apps'
    a.innerHTML = ''
    
    for p in getApps()
        a.appendChild elem 'img',
            id: p
            class:'app' 
            src:slash.fileUrl pngPath p
        
    a.focus()
    
    highlight a.firstChild.nextSibling ? a.firstChild
            
module.exports = 
    start:start
    initWin:initWin
    
    
    