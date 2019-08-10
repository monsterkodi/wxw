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
        s += "{\"title\": \"" + info.title + "\",\n"
        s += " \"path\": \"" + info.path + "\",\n"
        s += String(format:" \"pid\": %d,\n",       info.pid)
        s += String(format:" \"id\": %d,\n",        info.id)
        s += String(format:" \"x\": %d,\n",         info.x)
        s += String(format:" \"y\": %d,\n",         info.y)
        s += String(format:" \"width\": %d,\n",     info.width)
        s += String(format:" \"height\": %d,\n",     info.height)
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

    for app in matchApp("")
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

func initHook(_ id:String)
{
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

    NSApplication.shared.run()
}
