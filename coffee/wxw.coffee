###
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00  
###

if not module.parent?.filename? or module.parent.filename.endsWith 'default_app.asar\\main.js'
    
    require './app'

else
    
    wc = require 'wc'
    
    module.exports =
        
        user:       require './user'
        advapi:     require './advapi'
        kernel:     require './kernel'
        shell:      require './shell'
        rect:       require './rect'
        struct:     require './struct'
        zorder:     require './zorder'
        winlist:    require './winlist'
        wininfo:    require './wininfo'
        foreground: require './foreground'
        active:     require('./user').GetForegroundWindow
        frontinfo:  -> require('./wininfo')(require('./user').GetForegroundWindow())
        
        mouse:           -> wc 'mouse'
        info:       (id) -> wc 'info'   id
        raise:      (id) -> wc 'raise'  id
        focus:      (id) -> wc 'focus'  id
        trash:      (id) -> wc 'trash'  id
        folder:     (id) -> wc 'folder' id
        screen:     (id) -> wc 'screen' id
        screenshot: (fp) -> wc 'screenshot' fp
        bounds:     (id, x, y, w, h) -> wc 'bounds' id, x, y, w, h