###
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00  
###

if not module.parent?.filename? or module.parent.filename.endsWith 'default_app.asar\\main.js'
    
    require './app'

else
    
    module.exports = require './wc'