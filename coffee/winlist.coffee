###
000   000  000  000   000  000      000   0000000  000000000  
000 0 000  000  0000  000  000      000  000          000     
000000000  000  000 0 000  000      000  0000000      000     
000   000  000  000  0000  000      000       000     000     
00     00  000  000   000  0000000  000  0000000      000     
###

{ empty, log } = require 'kxk'

ffi   = require 'ffi'
ref   = require 'ref'
wchar = require 'ref-wchar'

user    = require './user'
wininfo = require './wininfo'

winList = ->
     
    GW_OWNER = 4
    
    windows = []
    
    enumProc = ffi.Callback 'int', ['pointer', 'pointer'], (hWnd, lParam) ->
    
        ownerID = ref.address user.GetWindow hWnd, GW_OWNER
        if ownerID
            return 1
  
        visible = user.IsWindowVisible hWnd
        if not visible
            return 1
        
        win = wininfo hWnd
        
        if empty win.title
            return 1
            
        if win.title == 'Program Manager'
            return 1
        
        windows.push win
            
        return 1
    
    user.EnumWindows enumProc, null
    windows.sort (a,b) -> b.zOrder - a.zOrder
    windows
        
module.exports = winList
