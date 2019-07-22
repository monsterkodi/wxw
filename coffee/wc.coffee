###
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
###

{ childp, slash, noon, klog, kstr } = require 'kxk'

wc = ->
    
    try
        argv = [].slice.call arguments, 0
        
        for i in [1...argv.length]
            if argv[i][0] != '"' and argv[i].indexOf?(' ') >= 0 and argv[i][-1] != '"'
                argv[i] = '"' + argv[i] + '"'
            
        wcexe = slash.unslash slash.resolve slash.join __dirname, '..' 'bin' 'wc.exe'
        
        if argv[0] in ['launch']
            childp.spawn wcexe, argv, encoding:'utf8' shell:true detached:true stdio:'inherit'
            out = ''
        else
            args = (kstr(s) for s in argv).join " "
            out = childp.execSync wcexe+" #{args}" encoding:'utf8' shell:true
    catch err
        error err
        return ''
    
    switch kstr arguments[0]
        when 'info' 'screen' 'mouse' 'trash'
            noon.parse out
        else
            out

module.exports = wc
