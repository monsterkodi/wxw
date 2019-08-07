
import Cocoa
import Foundation
import SwiftSocket
import AudioToolbox

var udp:UDPClient? = nil

struct winInfo
{
    var title:String
    var path:String
    var pid:Int32 = 0
    var id:Int32  = 0
    var x      = 0
    var y      = 0
    var width  = 0
    var height = 0
    var status:String
}

struct appInfo
{
    var path:String
    var pid:Int32 = 0
}

func cmp(_ a:String, _ b:String) -> Bool
{
    return a==b;
}

func contains(_ a:String, _ b:String) -> Bool
{
    return a.lowercased().contains(b.lowercased())
}

// 00     00   0000000   000000000   0000000  000   000  
// 000   000  000   000     000     000       000   000  
// 000000000  000000000     000     000       000000000  
// 000 0 000  000   000     000     000       000   000  
// 000   000  000   000     000      0000000  000   000  

func matchWin(_ id:String) -> [winInfo]
{
    let options = CGWindowListOption(arrayLiteral: CGWindowListOption.excludeDesktopElements, CGWindowListOption.optionOnScreenOnly)
    let windowListInfo = CGWindowListCopyWindowInfo(options, CGWindowID(0))
    let infoList = windowListInfo as NSArray? as? [[String: AnyObject]]
    
    var infos:[winInfo] = []
    
    for info in infoList!
    {
        let bounds = CGRect(dictionaryRepresentation: info["kCGWindowBounds"] as! CFDictionary)!
        let pid = info["kCGWindowOwnerPID"] as! Int32
        let wid = info["kCGWindowNumber"] as! Int32
        let path = NSRunningApplication(processIdentifier: pid)!.bundleURL!.path
        
        if id.count > 0 && !contains(path, id) && wid != Int32(id) && id != "top" { continue }
        
        var status = "minimized"
        if info["kCGWindowIsOnscreen"] != nil { status = "normal" }
        
        infos.append(winInfo(
            title:  info["kCGWindowName"] as! String,
            path:   path,
            pid:    pid,
            id:     wid,
            x:      Int(bounds.minX),
            y:      Int(bounds.minY),
            width:  Int(bounds.width),
            height: Int(bounds.height),
            status: status
            ))
            
        if id == "top" { break }
    }
    
    return infos
}

func matchApp(_ id:String) -> [appInfo]
{
    var infos:[appInfo] = []    

    for app in NSWorkspace.shared.runningApplications
    {
        if app.bundleURL == nil { continue }
        if app.bundleURL!.pathExtension != "app" { continue }
        let path = app.bundleURL!.path
        if id.count > 0 && path != id && !contains(app.bundleURL!.lastPathComponent, id) && app.processIdentifier != Int32(id) { continue }
        
        infos.append(appInfo(
            path:   app.bundleURL!.path,
            pid:    app.processIdentifier))
    }
    
    return infos
}

func moveWindow()
{
//  pid_t pid = [[entry objectForKey:(id)kCGWindowOwnerPID] intValue];
//  AXUIElementRef appRef = AXUIElementCreateApplication(pid)
//
//  CFArrayRef windowList;
//  AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute, (CFTypeRef *)&windowList)
//  if ((!windowList) || CFArrayGetCount(windowList)<1)
//  continue;
//
//
//  AXUIElementRef windowRef = (AXUIElementRef) CFArrayGetValueAtIndex( windowList, 0)
//  CFTypeRef role;
//  AXUIElementCopyAttributeValue(windowRef, kAXRoleAttribute, (CFTypeRef *)&role)
//  CFTypeRef position;
//  CGPoint point;
//
//  AXUIElementCopyAttributeValue(windowRef, kAXPositionAttribute, (CFTypeRef *)&position)
//  AXValueGetValue(position, kAXValueCGPointType, &point)
//  CGPoint newPoint;
//  newPoint.x = 0;
//  newPoint.y = 0;
//  position = (CFTypeRef)(AXValueCreate(kAXValueCGPointType, (const void *)&newPoint))

//  AXUIElementSetAttributeValue(windowRef, kAXPositionAttribute, position)
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

// 000  000   000  00000000   0000000   
// 000  0000  000  000       000   000  
// 000  000 0 000  000000    000   000  
// 000  000  0000  000       000   000  
// 000  000   000  000        0000000   

func info(_ id:String)
{
    for win in matchWin(id)
    {
        print (".")
        print ("    title    ", win.title)
        print ("    path     ", win.path)
        print ("    pid      ", win.pid)
        print ("    id       ", win.id)
        print ("    x        ", win.x)
        print ("    y        ", win.y)
        print ("    width    ", win.width)
        print ("    height   ", win.height)
        print ("    status   ", win.status)
    }
}

func proclist(_ id:String)
{
    for app in matchApp(id)
    {
        print (".")
        print ("    path    ", app.path)
        print ("    pid     ", app.pid)
    }
}

// 000   000   0000000   000      000   000  00     00  00000000  
// 000   000  000   000  000      000   000  000   000  000       
//  000 000   000   000  000      000   000  000000000  0000000   
//    000     000   000  000      000   000  000 0 000  000       
//     0       0000000   0000000   0000000   000   000  00000000  

func volume(_ id:String)
{
    var defaultOutputDeviceID = AudioDeviceID(0)
    var defaultOutputDeviceIDSize = UInt32(MemoryLayout.size(ofValue: defaultOutputDeviceID))
    
    var getDefaultOutputDevicePropertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioHardwarePropertyDefaultOutputDevice,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: AudioObjectPropertyElement(kAudioObjectPropertyElementMaster))
    
    let status1 = AudioObjectGetPropertyData(
        AudioObjectID(kAudioObjectSystemObject),
        &getDefaultOutputDevicePropertyAddress,
        0,
        nil,
        &defaultOutputDeviceIDSize,
        &defaultOutputDeviceID)

    if (id.count == 0)
    {
        var volume = Float32(0.0)
        var volumeSize = UInt32(MemoryLayout.size(ofValue: volume))
        
        var volumePropertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwareServiceDeviceProperty_VirtualMasterVolume,
            mScope: kAudioDevicePropertyScopeOutput,
            mElement: kAudioObjectPropertyElementMaster)
        
        let status3 = AudioObjectGetPropertyData(
            defaultOutputDeviceID,
            &volumePropertyAddress,
            0,
            nil,
            &volumeSize,
            &volume)
            
        print(Int(volume*100))
    }
    else
    {
        var volume = Float32(id)!/100
        
        if volume < 0 { volume = 0 }
        if volume > 1 { volume = 1 }
        
        var volumeSize = UInt32(MemoryLayout.size(ofValue: volume))
        
        var volumePropertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwareServiceDeviceProperty_VirtualMasterVolume,
            mScope: kAudioDevicePropertyScopeOutput,
            mElement: kAudioObjectPropertyElementMaster)
        
        let status2 = AudioObjectSetPropertyData(
            defaultOutputDeviceID,
            &volumePropertyAddress,
            0,
            nil,
            volumeSize,
            &volume)
    }
}

// 000   000  00000000  000      00000000   
// 000   000  000       000      000   000  
// 000000000  0000000   000      00000000   
// 000   000  000       000      000        
// 000   000  00000000  0000000  000        

func help(_ id:String)
{
    if (false)
    {
    }
    else
    {
        print("no help available for", id)
    }
    
    print("")
}

// 000   000   0000000   0000000    0000000   00000000  
// 000   000  000       000   000  000        000       
// 000   000  0000000   000000000  000  0000  0000000   
// 000   000       000  000   000  000   000  000       
//  0000000   0000000   000   000   0000000   00000000  

func usage()
{
    print("")
    print("wxw [command] [args...]")
    print("")
    print("    commands:")
    print("")
    print("         info        wid")
    print("         raise       wid")
    print("         minimize    wid")
    print("         maximize    wid")
    print("         restore     wid")
    print("         focus       wid")
    print("         close       wid")
    print("         quit        wid")
    print("         bounds      wid [x y w h]")
    print("         move        wid x y")
    print("         size        wid w h")
    print("         launch      path")
    print("         proc       [pid|file]")
    print("         terminate  [pid|file]")
    print("         mouse")
    print("         key        [shift+|ctrl+|alt+]key")
    print("         help        command")
    print("         trash       count|empty|file")
    print("         screen     [size|user]")
    print("         screenshot [targetfile]")
    print("         icon        path [targetfile]")
    print("")
    print("    wid:")
    print("")
    print("         pid, path, id or 'top'")
    print("")
}

//  0000000   00000000    0000000   000   000  00     00  00000000  000   000  000000000   0000000  
// 000   000  000   000  000        000   000  000   000  000       0000  000     000     000       
// 000000000  0000000    000  0000  000   000  000000000  0000000   000 0 000     000     0000000   
// 000   000  000   000  000   000  000   000  000 0 000  000       000  0000     000          000  
// 000   000  000   000   0000000    0000000   000   000  00000000  000   000     000     0000000   

let argc = CommandLine.arguments.count
let argv = CommandLine.arguments

if (argc == 1)
{
    usage()
}
else
{
    let cmd = CommandLine.arguments[1]
        
    if (cmp(cmd, "help"))
    {
        if (argc == 2) { usage() }
        else           { help(argv[2]) }
    }
    else if (cmp(cmd, "info"))
    {
        if (argc == 2) { info("") }
        else           { info(argv[2]) }
    }
    else if (cmp(cmd, "raise"))
    {
        if (argc == 2) { help(cmd) }
        //else           { raise(argv[2]) }
    }
    else if (cmp(cmd, "minimize"))
    {
        if (argc == 2) { help(cmd) }
        //else           { minimize(argv[2]) }
    }
    else if (cmp(cmd, "maximize"))
    {
        if (argc == 2) { help(cmd) }
        //else           { maximize(argv[2]) }
    }
    else if (cmp(cmd, "restore"))
    {
        if (argc == 2) { help(cmd) }
        //else           { restore(argv[2]) }
    }
    else if (cmp(cmd, "focus"))
    {
        if (argc == 2) { help(cmd) }
        //else           { focus(argv[2]) }
    }
    else if (cmp(cmd, "launch"))
    {
        if (argc == 2) { help(cmd) }
        //else           { launch(argv[2]) }
    }
    else if (cmp(cmd, "close"))
    {
        if (argc == 2) { help(cmd) }
        //else           { close(argv[2]) }
    }
    else if (cmp(cmd, "quit"))
    {
        if (argc == 2) { help(cmd) }
        //else           { quit(argv[2]) }
    }
    else if (cmp(cmd, "terminate"))
    {
        if (argc == 2) { help(cmd) }
        //else           { terminate(argv[2]) }
    }
    else if (cmp(cmd, "kill"))
    {
        if (argc == 2) { help("terminate") }
        //else           { terminate(argv[2]) }
    }
    else if (cmp(cmd, "bounds"))
    {
        if (argc < 3 || argc != 3 && argc != 7) { help(cmd) }
        //else if (argc == 3) { bounds(argv[2]) }
        //else if (argc == 7) { bounds(argv[2], argv[3], argv[4], argv[5], argv[6]) }
    }
    else if (cmp(cmd, "move"))
    {
        if (argc <= 3 || argc != 5) { help(cmd) }
        //else           { move(argv[2], argv[3], argv[4]) }
    }
    else if (cmp(cmd, "size"))
    {
        if (argc <= 3 || argc != 5) { help(cmd) }
        //else           { size(argv[2], argv[3], argv[4]) }
    }
    else if (cmp(cmd, "screenshot"))
    {
        //if (argc == 2) { screenshot() }
        //else           { screenshot(argv[2]) }
    }
    else if (cmp(cmd, "screen"))
    {
        //if (argc == 2) { screen("size") }
        //else           { screen(argv[2]) }
    }
    else if (cmp(cmd, "icon"))
    {
        if (argc == 2) { help(cmd) }
        //else           { icon(argv[2], (argc >= 4) ? argv[3] : NULL) }
    }
    else if (cmp(cmd, "key"))
    {
        if (argc == 2) { help(cmd) }
        //else           { key(argv[2], (argc >= 4) ? argv[3] : "tap") }
    }
    else if (cmp(cmd, "mouse"))
    {
        //mouse()
    }
    else if (cmp(cmd, "trash"))
    {
        if (argc == 2) { help(cmd) }
        //else           { trash(argv[2]) }
    }
    else if (cmp(cmd, "volume"))
    {
        if (argc == 2) { volume("") }
        else           { volume(argv[2]) }
    }
    else if (cmp(cmd, "proc"))
    {
        if (argc == 2) { proclist("") }
        else           { proclist(argv[2]) }
    }
    else if (cmp(cmd, "hook"))
    {
        if (argc == 2) { help(cmd) }
        else { initHook(argv[2]) }
    }

}
    


