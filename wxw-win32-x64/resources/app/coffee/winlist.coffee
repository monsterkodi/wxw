###
000   000  000  000   000  000      000   0000000  000000000  
000 0 000  000  0000  000  000      000  000          000     
000000000  000  000 0 000  000      000  0000000      000     
000   000  000  000  0000  000      000       000     000     
00     00  000  000   000  0000000  000  0000000      000     
###

{ slash, empty, log } = require 'kxk'

ffi    = require 'ffi'
ref    = require 'ref'
wchar  = require 'ref-wchar'

user   = require './user'
kernel = require './kernel'
zorder = require './zorder'

winList = ->
     
    WS_MINIMIZE = 0x20000000
    GWL_STYLE   = -16
    GW_OWNER    = 4
    
    windows = []
    
    enumProc = ffi.Callback 'int', ['pointer', 'pointer'], (hWnd, lParam) ->
    
        ownerID = ref.address user.GetWindow hWnd, GW_OWNER
        if ownerID
            return 1
  
        visible = user.IsWindowVisible hWnd
        if not visible
            return 1
        
        winID = ref.address hWnd
        
        titleLength = user.GetWindowTextLengthW(hWnd)+2
        titleBuffer = Buffer.alloc titleLength * 2
        user.GetWindowTextW hWnd, titleBuffer, titleLength
        titleClean = ref.reinterpretUntilZeros titleBuffer, wchar.size
        title      = wchar.toString titleClean
        
        if empty title
            return 1
            
        if title == 'Program Manager'
            return 1
        
        minimized  = user.GetWindowLongW(hWnd, GWL_STYLE) & WS_MINIMIZE
            
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
                
        windows.push
            zOrder:     zorder hWnd
            hwnd:       hWnd
            title:      title
            minimized:  minimized
            winID:      winID
            procID:     procID
            threadID:   threadID
            path:       path
            
        return 1
    
    user.EnumWindows enumProc, null
    windows.sort (a,b) -> b.zOrder - a.zOrder
    windows
        
module.exports = winList
