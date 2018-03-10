###
 0000000  000   000  00000000  000      000        
000       000   000  000       000      000        
0000000   000000000  0000000   000      000        
     000  000   000  000       000      000        
0000000   000   000  00000000  0000000  0000000    
###

ffi = require 'ffi'

shell = new ffi.Library 'Shell32.dll',
    
    SHEmptyRecycleBinW:  ['int', ['pointer', 'pointer', 'uint32']]

module.exports = shell