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

    module.exports =
        
        advapi:     require './advapi'
        kernel:     require './kernel'
        user:       require './user'
        shell:      require './shell'
        zorder:     require './zorder'
        winlist:    require './winlist'
        wininfo:    require './wininfo'
        foreground: require './foreground'
        active:     require('./user').GetForegroundWindow
    