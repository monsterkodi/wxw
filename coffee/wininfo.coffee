###
000   000  000  000   000  000  000   000  00000000   0000000   
000 0 000  000  0000  000  000  0000  000  000       000   000  
000000000  000  000 0 000  000  000 0 000  000000    000   000  
000   000  000  000  0000  000  000  0000  000       000   000  
00     00  000  000   000  000  000   000  000        0000000   
###

{ slash } = require 'kxk'

user   = require './user'
kernel = require './kernel'
zorder = require './zorder'
ref    = require 'ref'
wchar  = require 'ref-wchar'

winTitle = (hWnd) ->

    titleLength = user.GetWindowTextLengthW(hWnd)+2
    titleBuffer = Buffer.alloc titleLength * 2
    user.GetWindowTextW hWnd, titleBuffer, titleLength
    titleClean = ref.reinterpretUntilZeros titleBuffer, wchar.size
    wchar.toString titleClean
    
isMinimized = (hWnd) ->
    
    GWL_STYLE   = -16
    WS_MINIMIZE = 0x20000000
    user.GetWindowLongW(hWnd, GWL_STYLE) & WS_MINIMIZE

winInfo = (hWnd) ->
                  
    procBuffer = ref.alloc 'uint32'
    threadID   = user.GetWindowThreadProcessId hWnd, procBuffer
    procID     = ref.get procBuffer
     
    procHandle = kernel.OpenProcess 0x1000, false, procID
    pathBuffer = Buffer.alloc 10000
    pathLength = ref.alloc 'uint32', 5000
    kernel.QueryFullProcessImageNameW procHandle, 0, pathBuffer, pathLength
    pathString = wchar.toString ref.reinterpretUntilZeros pathBuffer, wchar.size
    path       = pathString and slash.path(pathString) or ''
     
    kernel.CloseHandle procHandle
             
    hwnd:       hWnd
    zOrder:     zorder      hWnd
    title:      winTitle    hWnd
    minimized:  isMinimized hWnd
    winID:      ref.address hWnd
    procID:     procID
    threadID:   threadID
    path:       path
    
module.exports = winInfo
