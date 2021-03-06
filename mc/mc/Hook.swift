/*
000   000   0000000    0000000   000   000    
000   000  000   000  000   000  000  000     
000000000  000   000  000   000  0000000      
000   000  000   000  000   000  000  000     
000   000   0000000    0000000   000   000    
*/

import Cocoa
import Foundation
import SwiftSocket

var udp:UDPClient? = nil
var srv:TCPServer? = nil

//  0000000  00     00  0000000    
// 000       000   000  000   000  
// 000       000000000  000   000  
// 000       000 0 000  000   000  
//  0000000  000   000  0000000    

func recvCmd()
{
    if (srv != nil)
    {
        if let client = srv!.accept()
        {
            let ret = client.read(1024*10, timeout:0)
            if (ret != nil)
            {
                do
                {
                    if let array = try JSONSerialization.jsonObject(with: Data(ret!)) as? NSArray
                    {
                        var argv = ["wxw"]
                        for item in array
                        {
                            if let num = item as? NSNumber
                            {
                                argv.append(String(num as! Int))
                            }
                            else
                            {
                                var arg = String(item as! NSString)
                                if arg.startsWith("\"") && arg.endsWith("\"")
                                {
                                    arg = String(arg.dropLast().dropFirst())
                                }
                                
                                argv.append(arg)
                            }
                        }
                        
                        //print(argv)

                        KLOG.toString = String("")
                        
                        _ = execCmd(argv)
                        
                        if KLOG.toString!.count == 0 { KLOG.toString = "OK" }
                        
                        //print(KLOG.toString!)
                        
                        _ = client.send(string: KLOG.toString!)
                        client.close()
                        
                        KLOG.toString = nil
                    }
                    else { print("no array?") }
                }
                catch
                {
                    print(error.localizedDescription)
                }
            }
            else { print("nuttin") }
        }
        else { print("no accept?") }
    }
    else { print("no srv?") }
}

func cmdServer() -> Bool
{
    srv = TCPServer(address: "127.0.0.1", port: 54321)
    if srv != nil
    {
        if srv!.listen().isSuccess
        {
            _ = Timer.scheduledTimer(withTimeInterval: 0.01, repeats:true) {_ in recvCmd() }
        }
        return true
    }
    return false
}

// 000  000   000  00000000   0000000
// 000  0000  000  000       000   000
// 000  000 0 000  000000    000   000
// 000  000  0000  000       000   000
// 000  000   000  000        0000000

func sendInfo()
{
    var s = String("")

    s += "{\"event\": \"info\",\n"
    s += " \"info\": [\n"

    for info in matchWin("")
    {
        s += "{\"title\": \"" + info.title.replace("\"", with:"\\\"") + "\",\n"
        s += " \"path\": \"" + info.path + "\",\n"
        s += String(format:" \"pid\": %d,\n",       info.pid)
        s += " \"id\": \"" + info.id + "\",\n"
        s += String(format:" \"x\": %d,\n",         info.x)
        s += String(format:" \"y\": %d,\n",         info.y)
        s += String(format:" \"width\": %d,\n",     info.width)
        s += String(format:" \"height\": %d,\n",    info.height)
        s += String(format:" \"index\": %d,\n",     info.index)
        s += " \"status\": \"" + info.status + "\"\n"
        s += "},\n"
    }

    s += "{}]}"

    _ = udp!.send(string:s)
}

// 00000000   00000000    0000000    0000000
// 000   000  000   000  000   000  000
// 00000000   0000000    000   000  000
// 000        000   000  000   000  000
// 000        000   000   0000000    0000000

func sendProc()
{
    var s = String("")

    s += "{\"event\": \"proc\",\n"
    s += " \"proc\": [\n"

    for app in matchProc("")
    {
        s += "{\"path\": \"" + app.path
        s += String(format:"\", \"pid\": %d", app.pid)
        s += " },\n"
    }

    s += "{}]}"

    _ = udp!.send(string:s)
}

// 000   000   0000000    0000000   000   000
// 000   000  000   000  000   000  000  000
// 000000000  000   000  000   000  0000000
// 000   000  000   000  000   000  000  000
// 000   000   0000000    0000000   000   000

func onInput(event: NSEvent!)
{
    let s = String(format:"{\"event\":\"mousemove\", \"x\":%.0f, \"y\":%.0f}", NSEvent.mouseLocation.x, NSScreen.main!.frame.size.height - NSEvent.mouseLocation.y)
    _ = udp!.send(string:s)
}

func initHook(_ id:String) -> Bool
{
    _ = isTrusted()

    if (cmp(id, "cmd"))
    {
        return cmdServer()
    }
    
    udp = UDPClient(address: "127.0.0.1", port: 65432)

    if cmp(id, "input")
    {
        _ = NSEvent.addGlobalMonitorForEvents(matching:NSEvent.EventTypeMask.mouseMoved, handler:onInput)
    }
    else if (cmp(id, "proc"))
    {
        _ = Timer.scheduledTimer(withTimeInterval: 0.5, repeats:true) {_ in sendProc() }
    }
    else if (cmp(id, "info"))
    {
        _ = Timer.scheduledTimer(withTimeInterval: 0.5, repeats:true) {_ in sendInfo() }
    }   
    else
    {
        print("unknown hook", id)
        return false
    }
    
    return true
}
