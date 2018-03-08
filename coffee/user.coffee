###
000   000   0000000  00000000  00000000   
000   000  000       000       000   000  
000   000  0000000   0000000   0000000    
000   000       000  000       000   000  
 0000000   0000000   00000000  000   000  
###

ffi = require 'ffi'

user = new ffi.Library 'User32.dll',
    
    AttachThreadInput:          ['int',     ['uint32', 'uint32', 'int']]
    BringWindowToTop:           ['int',     ['pointer']]
    EnumWindows:                ['int',     ['pointer', 'pointer']]
    GetForegroundWindow:        ['pointer', []]
    GetWindow:                  ['pointer', ['pointer', 'uint32']]
    GetWindowLongW:             ['long',    ['pointer', 'int']]
    GetWindowTextW:             ['int',     ['pointer', 'pointer', 'int']]
    GetWindowTextLengthW:       ['int',     ['pointer']]
    GetWindowThreadProcessId:   ['uint32',  ['pointer', 'uint32 *']]
    IsWindowVisible:            ['int',     ['pointer']]
    SetActiveWindow:            ['int',     ['pointer']]
    SetFocus:                   ['pointer', ['pointer']]
    SetForegroundWindow:        ['int',     ['pointer']]
    SetWindowPos:               ['int',     ['pointer', 'pointer', 'int', 'int', 'int', 'int', 'uint32']]
    ShowWindow:                 ['int',     ['pointer', 'uint32']]
    keybd_event:                ['void',    ['byte', 'char', 'uint32', 'pointer']]

module.exports = user