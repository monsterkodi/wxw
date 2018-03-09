###
0000000   0000000   00000000   0000000    00000000  00000000   
   000   000   000  000   000  000   000  000       000   000  
  000    000   000  0000000    000   000  0000000   0000000    
 000     000   000  000   000  000   000  000       000   000  
0000000   0000000   000   000  0000000    00000000  000   000  
###

user = require './user'
ref  = require 'ref'

zOrder = (hWnd) ->
    
    GW_HWNDPREV = 3
    
    count = 0
    while (nextWnd = user.GetWindow(hWnd, GW_HWNDPREV)) and ref.address nextWnd
        hWnd = nextWnd
        count += 1
    count
    
module.exports = zOrder