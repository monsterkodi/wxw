###
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00  
###

os      = require 'os'
fs      = require 'fs'
kstr    = require 'kstr'
noon    = require 'noon'
slash   = require 'kslash'
childp  = require 'child_process'
udp     = require './udp'

useSend = false

usck = null
sendCmd = (args) ->

    usck = new udp({}) if not usck
    cb = (data) -> 
        if process.argv[1]?.endsWith 'wxw'
            process.exit 0
    usck.sendCB.apply usck, [cb].concat args
    ''

if os.platform() == 'win32'
    wcexe = slash.unslash slash.resolve slash.join __dirname, '..' 'bin' 'wc.exe'
else if os.platform() == 'darwin'
    wcexe = slash.resolve slash.join __dirname, '..' 'bin' 'mc.app' 'Contents' 'MacOS' 'mc'

quit = (args) ->
    
    proclist = wxw 'proc' slash.file args[0]
    if proclist.length
        prts = new Set proclist.map (p) -> p.parent
        pids = new Set proclist.map (p) -> p.pid
        pidl = Array.from(pids).filter (p) -> prts.has p
        out = ''
        while pid = pidl.shift()
            for proc in proclist
                if proc.pid == pid
                    out += wxw 'terminate' pid
        return out
    else
        error 'no process'
    ''
    
exec = (argv...) ->
    
    try
        argv = ['help'] if not argv.length
        
        cmd = argv[0]
        
        while cmd[0] == '-' then cmd = cmd.slice(1)
            
        if cmd.length == 1
            switch cmd
                when 'h' then cmd = "help"    
                when 'i' then cmd = "info"    
                when 'b' then cmd = "bounds"  
                when 'v' then cmd = "version" 
                when 'l' then cmd = "launch"  
                
        if cmd == 'version'
            pkg = require slash.join __dirname, ".." "package.json"
            return pkg.version
        
        for i in [1...argv.length]
            if argv[i][0] != '"' and argv[i].indexOf?(' ') >= 0 and argv[i][-1] != '"'
                argv[i] = '"' + argv[i] + '"'
                
        argv[0] = cmd
                      
        if useSend and os.platform() == 'darwin' and cmd in ['bounds' 'launch' 'raise' 'focus' 'minimize' 'maximize']
            return sendCmd argv
        else
            if cmd in ['launch' 'raise' 'focus' 'hook']
                return childp.spawn "\"#{wcexe}\"", argv, encoding:'utf8' shell:true, detached:true
            else
                args = (kstr(s) for s in argv).join " "
                outp = childp.execSync "\"#{wcexe}\" #{args}" encoding:'utf8' shell:true
                
                if cmd == 'quit' and not outp.startsWith 'terminated'
                    return quit argv.slice 1
                
                return outp
    catch err
        return ''
    
wxw = ->
        
    useSend = true
    out = exec.apply null, [].slice.call arguments, 0
        
    switch kstr arguments[0]
        when 'info' 'screen' 'mouse' 'trash' 'proc'
            noon.parse out.trim()
        else
            out
            
wxw.exec = exec
    
module.exports = wxw
