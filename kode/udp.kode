###
000   000  0000000    00000000   
000   000  000   000  000   000  
000   000  000   000  00000000   
000   000  000   000  000        
 0000000   0000000    000        
###

dgram = require 'dgram'

class udp

    @: ({@pnum:54321, @onMsg:null}) ->
               
        try
            @port = dgram.createSocket 'udp4'
                        
            if @onMsg
                
                @port.on 'listening', => 
                    try
                        @port.setBroadcast true
                    catch err
                        error "[ERROR] can't listen:", err
                        
                @port.on 'message', (message, rinfo) =>

                    messageString = message.toString()
                    try
                        msg = JSON.parse messageString
                    catch err
                        error 'conversion error', messageString, err
                        return
                    @onMsg msg
                    
                @port.on 'error', (err) =>
                    error '[ERROR] port error', err
                    
                @port.bind @addr
                
            else
                @port.bind => @port?.setBroadcast true
                
        catch err
            @port = null
            error "[ERROR] can't create udp port:", err
                
    send: (args...) =>

        return if not @port
        
        if args.length > 1
            msg = JSON.stringify args
        else
            msg = JSON.stringify args[0]
            
        buf = Buffer.from msg, 'utf8'

        @port.send buf, 0, buf.length, @pnum, '127.0.0.1', ->

    sendCB: (cb, args...) =>

        return if not @port
        
        msg = JSON.stringify args.length > 1 and args or args[0]
        buf = Buffer.from msg, 'utf8'
        @port.send buf, 0, buf.length, @pnum, '127.0.0.1', -> cb buf
        
    close: =>
        
        @port?.close()
        @port = null

module.exports = udp
    