
import Cocoa
import Foundation
import SwiftSocket

func cmp(_ a:String, _ b:String) -> Bool
{
    return a==b;
}

func klog(_ m:String) { print(m) }

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

func udpSend(string: String)
{
    let client = UDPClient(address: "127.0.0.1", port: 65432)
    _ = client.send(string: string)
    // print("\n\n", string)
    // print("\n")
}

// 000  000   000  00000000   0000000   
// 000  0000  000  000       000   000  
// 000  000 0 000  000000    000   000  
// 000  000  0000  000       000   000  
// 000  000   000  000        0000000   

func sendInfo()
{
    let options = CGWindowListOption(arrayLiteral: CGWindowListOption.excludeDesktopElements, CGWindowListOption.optionOnScreenOnly)
    let windowListInfo = CGWindowListCopyWindowInfo(options, CGWindowID(0))
    let infoList = windowListInfo as NSArray? as? [[String: AnyObject]]
    
    var s = String("")
    
    s += "{\"event\": \"info\",\n"
    s += " \"info\": [\n"
    
    for info in infoList!
    {
        //s += info.description
        
        let bounds = CGRect(dictionaryRepresentation: info["kCGWindowBounds"] as! CFDictionary)!
        
        s += "{\"title\": \"" + (info["kCGWindowName"] as! String) + "\",\n"
        if info["kCGWindowOwnerName"] != nil
        {
            s += " \"app\": \"" + (info["kCGWindowOwnerName"] as! String) + "\",\n"
        }
        s += String(format:" \"pid\": %d,\n", info["kCGWindowOwnerPID"]!.int64Value)
        s += String(format:" \"num\": %d,\n", info["kCGWindowNumber"]!.int64Value)
        s += String(format:" \"x\": %d,\n", bounds.minX)
        s += String(format:" \"y\": %d,\n", bounds.minY)
        s += String(format:" \"width\": %d,\n", bounds.width)
        s += String(format:" \"height\": %d\n", bounds.height)
        
        s += "},\n"
    }
    
    s += "{}]}"
    
    udpSend(string:s)
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
    
    for application in NSWorkspace.shared.runningApplications
    {
        s += "{\"path\": \"" + application.bundleURL!.path
        s += "\", \"pid\": " + String(application.processIdentifier)
        s += " },\n"
    }
    
    s += "{}]}"
    
    udpSend(string:s)
}

// 000   000   0000000    0000000   000   000  
// 000   000  000   000  000   000  000  000   
// 000000000  000   000  000   000  0000000    
// 000   000  000   000  000   000  000  000   
// 000   000   0000000    0000000   000   000  


func handler(event: NSEvent!) 
{
    let s = String(format:"{\"event\":\"mousemove\", \"x\":%.0f, \"y\":%.0f}", NSEvent.mouseLocation.x, NSScreen.main!.frame.size.height - NSEvent.mouseLocation.y)
    udpSend(string:s)
}

func initHook(_ id:String)
{
    if cmp(id, "input") 
    {
        _ = NSEvent.addGlobalMonitorForEvents(matching:NSEvent.EventTypeMask.mouseMoved, handler: handler)
        NSApplication.shared.run()
        return
    }
    while RunLoop.current.run(mode:.defaultRunLoopMode, before:Date.init(timeIntervalSinceNow:0.5)) 
    { 
        if cmp(id, "proc") { sendProc() }
        if cmp(id, "info") { sendInfo() }
    }
}

func info(_ id:String)
{
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
    
    klog("")
}

// 000   000   0000000   0000000    0000000   00000000  
// 000   000  000       000   000  000        000       
// 000   000  0000000   000000000  000  0000  0000000   
// 000   000       000  000   000  000   000  000       
//  0000000   0000000   000   000   0000000   00000000  

func usage()
{
    klog("")
    klog("wxw [command] [args...]")
    klog("")
    klog("    commands:")
    klog("")
    klog("         info       [id|title]")
    klog("         raise       id")
    klog("         minimize    id")
    klog("         maximize    id")
    klog("         restore     id")
    klog("         focus       id")
    klog("         close       id")
    klog("         quit        id")
    klog("         bounds      id [x y w h]")
    klog("         move        id x y")
    klog("         size        id w h")
    klog("         launch      path")
    klog("         proc       [pid|file]")
    klog("         terminate  [pid|file]")
    klog("         mouse")
    klog("         key        [shift+|ctrl+|alt+]key")
    klog("         help        command")
    klog("         trash       count|empty|file")
    klog("         screen     [size|user]")
    klog("         screenshot [targetfile]")
    klog("         icon        path [targetfile]")
    klog("")
    klog("    id:")
    klog("")
    klog("         process id")
    klog("         executable path")
    klog("         window handle")
    klog("         nickname")
    klog("")    
    klog("    nickname:")
    klog("")    
    klog("         normal|maximized|minimized")    
    klog("         top|topmost|front|frontmost|foreground")
    klog("")
}

// let frontmost = NSWorkspace.shared.frontmostApplication!
// let path = frontmost.bundleURL!.path
// print("frontmost", path)

// SIWindowInfo *frontWindowInfo = [SIWindowInfo windowInfoFromCGWindowInfoDictionary:[windowInfoList objectAtIndex:0]]

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
    else if (cmp(cmd, "proc"))
    {
        // if (argc == 2) { proclist() }
        //else           { proclist(argv[2]) }
    }
    else if (cmp(cmd, "hook"))
    {
        if (argc == 2) { help(cmd) }
        else { initHook(argv[2]) }
    }
}
    


