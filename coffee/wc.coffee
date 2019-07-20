###
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
###

{ childp, slash, noon } = require 'kxk'

wc = (cmd='help', id='') ->
    
    out = childp.execSync slash.join(__dirname, '..' 'bin' 'wc.exe')+" #{cmd} #{id}", 'utf8'
    
    switch cmd
        when 'mouse' 
            s = out.split ' '
            x: parseInt s[0]
            y: parseInt s[1]
        when 'info'
            noon.parse out
        when 'screen'
            s = out.split ' '
            x:      0
            y:      0
            width:  parseInt s[0]
            height: parseInt s[1]
        else
            klog "wc #{cmd} #{id}: " out
            out

module.exports = wc
