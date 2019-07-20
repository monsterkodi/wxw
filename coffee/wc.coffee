###
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
###

{ childp, slash, noon, klog, kstr } = require 'kxk'

wc = ->
    
    wcexe = slash.unslash slash.resolve slash.join __dirname, '..' 'bin' 'wc.exe'
    
    try
        args = (kstr(s) for s in [].slice.call arguments, 0).join " "
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
