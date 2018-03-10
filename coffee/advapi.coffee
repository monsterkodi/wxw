###
 0000000   0000000    000   000   0000000   00000000   000  
000   000  000   000  000   000  000   000  000   000  000  
000000000  000   000   000 000   000000000  00000000   000  
000   000  000   000     000     000   000  000        000  
000   000  0000000        0      000   000  000        000  
###

ffi = require 'ffi'

advapi = new ffi.Library 'Advapi32',

    AdjustTokenPrivileges:  ['int', ['pointer', 'int', 'pointer', 'uint32', 'pointer', 'pointer']]
    GetTokenInformation:    ['int', ['pointer', 'uint32', 'pointer', 'uint32', 'pointer']]
    LookupPrivilegeValueW:  ['int', ['pointer', 'pointer', 'pointer']]
    OpenProcessToken:       ['int', ['pointer', 'uint32', 'pointer']]

module.exports = advapi