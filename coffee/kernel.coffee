###
000   000  00000000  00000000   000   000  00000000  000      
000  000   000       000   000  0000  000  000       000      
0000000    0000000   0000000    000 0 000  0000000   000      
000  000   000       000   000  000  0000  000       000      
000   000  00000000  000   000  000   000  00000000  0000000  
###

ffi = require 'ffi'

kernel = new ffi.Library 'kernel32',
    
    OpenProcess:                ['pointer', ['uint32', 'int', 'uint32']]
    CloseHandle:                ['int',     ['pointer']]
    QueryFullProcessImageNameW: ['int',     ['pointer', 'uint32', 'pointer', 'pointer']]
    GetCurrentThreadId:         ['uint32',  []]
    GetCurrentProcess:          ['pointer', []]

module.exports = kernel