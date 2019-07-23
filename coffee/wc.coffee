###
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
###

{ childp, slash, noon, klog, empty, kstr, fs } = require 'kxk'

fakeIcon = (argv) ->
    
    iconMap = 
        recycle:    'recycle'
        recycledot: 'recycledot'
        mingw32:    'terminal'
        mingw64:    'terminal'
        msys2:      'terminaldark'
        procexp64:  'procexp'
    
    return if argv.length <= 1 
    base = slash.base argv[1]
    if icon = iconMap[base]
        targetfile = slash.resolve argv[2] ? base + '.png'
        fakeicon = slash.join __dirname, '..' 'icons' icon + '.png'
        try
            fs.copyFileSync fakeicon, targetfile
            return true
        catch err
            error err
    false

exec = (argv...) ->
    
    try
        argv = ['help'] if empty argv
        
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
            
        wcexe = slash.unslash slash.resolve slash.join __dirname, '..' 'bin' 'wc.exe'
        
        if cmd == 'icon'
            if fakeIcon argv then return ''
            
        if cmd in ['launch']
            childp.spawn wcexe, argv, encoding:'utf8' shell:true detached:true stdio:'inherit'
            return ''
        else
            args = (kstr(s) for s in argv).join " "
            return childp.execSync wcexe+" #{args}" encoding:'utf8' shell:true
    catch err
        return ''
    
wc = ->
            
    out = exec.apply null, [].slice.call arguments, 0
        
    switch kstr arguments[0]
        when 'info' 'screen' 'mouse' 'trash'
            noon.parse out
        else
            out
            
wc.exec = exec
    
module.exports = wc
