###
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
###

{ childp, slash } = require 'kxk'

wc = (cmd='help', id='') ->
    
    childp.execSync slash.join(__dirname, '..' 'bin' 'wc.exe')+" #{cmd} #{id}", 'utf8'

module.exports = wc
