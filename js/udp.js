// monsterkodi/kode 0.200.0

var _k_

var dgram

dgram = require('dgram')
class udp
{
    constructor ({@pnum:54321,@onMsg:null})
    {
        this.close = this.close.bind(this)
        this.sendCB = this.sendCB.bind(this)
        this.send = this.send.bind(this)
        try
        {
            this.port = dgram.createSocket('udp4')
            if (this.onMsg)
            {
                this.port.on('listening',(function ()
                {
                    try
                    {
                        return this.port.setBroadcast(true)
                    }
                    catch (err)
                    {
                        console.error("[ERROR] can't listen:",err)
                    }
                }).bind(this))
                this.port.on('message',(function (message, rinfo)
                {
                    var messageString, msg

                    messageString = message.toString()
                    try
                    {
                        msg = JSON.parse(messageString)
                    }
                    catch (err)
                    {
                        console.error('conversion error',messageString,err)
                        return
                    }
                    return this.onMsg(msg)
                }).bind(this))
                this.port.on('error',(function (err)
                {
                    console.error('[ERROR] port error',err)
                }).bind(this))
                this.port.bind(this.addr)
            }
            else
            {
                this.port.bind((function ()
                {
                    var _42_35_

                    return (this.port != null ? this.port.setBroadcast(true) : undefined)
                }).bind(this))
            }
        }
        catch (err)
        {
            this.port = null
            console.error("[ERROR] can't create udp port:",err)
        }
    }

    send (...args)
    {
        var buf, msg

        if (!this.port)
        {
            return
        }
        if (args.length > 1)
        {
            msg = JSON.stringify(args)
        }
        else
        {
            msg = JSON.stringify(args[0])
        }
        buf = Buffer.from(msg,'utf8')
        return this.port.send(buf,0,buf.length,this.pnum,'127.0.0.1',function ()
        {})
    }

    sendCB (cb, ...args)
    {
        var buf, msg

        if (!this.port)
        {
            return
        }
        msg = JSON.stringify(args.length > 1 && args || args[0])
        buf = Buffer.from(msg,'utf8')
        return this.port.send(buf,0,buf.length,this.pnum,'127.0.0.1',function ()
        {
            return cb(buf)
        })
    }

    close ()
    {
        var _71_13_

        ;(this.port != null ? this.port.close() : undefined)
        return this.port = null
    }
}

module.exports = udp