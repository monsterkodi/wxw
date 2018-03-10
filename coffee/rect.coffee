###
00000000   00000000   0000000  000000000    
000   000  000       000          000       
0000000    0000000   000          000       
000   000  000       000          000       
000   000  00000000   0000000     000       
###

user   = require './user'
struct = require './struct'

convert = (rect) ->

    x:rect.left
    y:rect.top
    w:rect.right-rect.left
    h:rect.bottom-rect.top

module.exports = 
    
    workarea: ->
        
        rect = new struct.Rect
        SPI_GETWORKAREA = 0x30
        user.SystemParametersInfoW SPI_GETWORKAREA, 0, rect.ref(), 0
        convert rect
        
    window: (hWnd) -> 
        
        rect = new struct.Rect
        user.GetWindowRect hWnd, rect.ref()
        convert rect