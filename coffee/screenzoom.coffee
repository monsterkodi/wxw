#  0000000   0000000  00000000   00000000  00000000  000   000  0000000   0000000    0000000   00     00  
# 000       000       000   000  000       000       0000  000     000   000   000  000   000  000   000  
# 0000000   000       0000000    0000000   0000000   000 0 000    000    000   000  000   000  000000000  
#      000  000       000   000  000       000       000  0000   000     000   000  000   000  000 0 000  
# 0000000    0000000  000   000  00000000  00000000  000   000  0000000   0000000    0000000   000   000  

{ childp, slash, error, log } = require 'kxk'

rect     = require './rect'
electron = require 'electron'

module.exports = ->
    
    childp.exec slash.join(__dirname,'..','bin','screenshot.exe'), (err) -> 
        
        return error err if err
        
        ar = rect.workarea()
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
        