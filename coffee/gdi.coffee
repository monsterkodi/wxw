###
 0000000   0000000    000  
000        000   000  000  
000  0000  000   000  000  
000   000  000   000  000  
 0000000   0000000    000  
###

ffi = require 'ffi'

gdi = new ffi.Library 'Gdi32.dll',
    
    BitBlt:                 ['int',     ['pointer', 'int', 'int', 'int', 'int', 'pointer', 'int', 'int', 'uint32']]
    CreateCompatibleDC:     ['pointer', ['pointer']]
    CreateCompatibleBitmap: ['pointer', ['pointer', 'int', 'int']]
    SelectObject:           ['pointer', ['pointer', 'pointer']]
    
module.exports = gdi