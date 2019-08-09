
import Cocoa
import Foundation
import SwiftSocket
import AudioToolbox

extension StringProtocol {

    subscript(offset: Int) -> Element {
        return self[index(startIndex, offsetBy: offset)]
    }
    subscript(_ range: Range<Int>) -> SubSequence {
        return prefix(range.lowerBound + range.count)
            .suffix(range.count)
    }
    subscript(range: ClosedRange<Int>) -> SubSequence {
        return prefix(range.lowerBound + range.count)
            .suffix(range.count)
    }
    subscript(range: PartialRangeThrough<Int>) -> SubSequence {
        return prefix(range.upperBound.advanced(by: 1))
    }
    subscript(range: PartialRangeUpTo<Int>) -> SubSequence {
        return prefix(range.upperBound)
    }
    subscript(range: PartialRangeFrom<Int>) -> SubSequence {
        return suffix(Swift.max(0, count - range.lowerBound))
    }
}

extension String {
    mutating func replaceSubrange(_ range: CountableClosedRange<Int>, with: String) -> String {
        self.replaceSubrange(Range(NSMakeRange(range.lowerBound,range.upperBound), in:self)!, with:with)
        return self
    }
}

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
    var index  = 0
    var status:String
}

struct appInfo
{
    var path:String
    var pid:Int32 = 0
}

struct bounds
{
    var x:Int
    var y:Int
    var width:Int
    var height:Int
}

func cmp(_ a:String, _ b:String) -> Bool
{
    return a==b;
}

func contains(_ a:String, _ b:String) -> Bool
{
    return a.lowercased().contains(b.lowercased())
}

func resolve(_ p:String) -> String
{
    if p[0] == "/"
    {
        return p
    }
    else if p[0] == "~"
    {
        var s = p
        s = "." + s[1...]
        return URL(fileURLWithPath:s, relativeTo:FileManager.default.homeDirectoryForCurrentUser).path
    }

    let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
    return URL(fileURLWithPath:p, relativeTo:cwd).path
}

//  0000000    0000000   0000000    0000000   0000000  00000000   000  00000000   000000000
// 000   000  000       000   000  000       000       000   000  000  000   000     000
// 000   000  0000000   000000000  0000000   000       0000000    000  00000000      000
// 000   000       000  000   000       000  000       000   000  000  000           000
//  0000000   0000000   000   000  0000000    0000000  000   000  000  000           000

func osascript(_ script:String) -> String
{
    // print(script)
    
    if let osa = NSAppleScript(source:script)
    {
        var error: NSDictionary?
        let result:NSAppleEventDescriptor? = osa.executeAndReturnError(&error)
        if result == nil
        {
            return "error: \(String(describing: error))"
        }
        else
        {
            return result!.stringValue!
        }
    }
    else
    {
        return "can't create applescript"
    }
}

// 00     00   0000000   000000000   0000000  000   000
// 000   000  000   000     000     000       000   000
// 000000000  000000000     000     000       000000000
// 000 0 000  000   000     000     000       000   000
// 000   000  000   000     000      0000000  000   000

func matchWin(_ id:String) -> [winInfo]
{
    var infos:[winInfo] = []

    var index = 0
    
    let options = CGWindowListOption(arrayLiteral: .excludeDesktopElements, .optionOnScreenOnly)
    if let infoList = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[ String : Any]]
    {
        for info in infoList
        {
            let bounds = CGRect(dictionaryRepresentation: info["kCGWindowBounds"] as! CFDictionary)!
            let pid = info["kCGWindowOwnerPID"] as! Int32
            let wid = info["kCGWindowNumber"] as! Int32
            let path = NSRunningApplication(processIdentifier: pid)!.bundleURL!.path
    
            if id.count > 0 && !contains(path, id) && wid != Int32(id) && id != "top" && (Int(id) ?? 0) != pid { continue }
    
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
                index:  index,
                status: status
                ))
    
            index += 1
                
            if id == "top" { break }
        }
    }

    return infos
}

func allWins() -> [winInfo]
{
    return matchWin("")
}

func winWithId(_ id:Int32, _ infos:[winInfo]?) -> winInfo?
{
    for w in infos ?? allWins() {
        if w.id == id {
            return w
        }
    }
    return nil
}

func winBounds(_ id:Int32, _ infos:[winInfo]?) -> bounds?
{
    if let w = winWithId(id, infos)
    {
        return bounds(x: w.x, y: w.y, width: w.width, height: w.height)
    }
    return nil
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

// 00     00   0000000   000   000  00000000  000   000  000  000   000  
// 000   000  000   000  000   000  000       000 0 000  000  0000  000  
// 000000000  000   000   000 000   0000000   000000000  000  000 0 000  
// 000 0 000  000   000     000     000       000   000  000  000  0000  
// 000   000   0000000       0      00000000  00     00  000  000   000  

func moveWin(id:Int32, x:Int, y:Int, width:Int, height:Int, infos:[winInfo]?)
{
    if let win = winWithId(id, infos)
    {
        let appRef = AXUIElementCreateApplication(win.pid)

        var value: AnyObject?
        _ = AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute as CFString, &value)

        if let windowList = value as? [AXUIElement]
        {
            let index = winIndex(pid:win.pid, id:win.id)
            if index < windowList.count
            {
                let window = windowList[index]

                var position : CFTypeRef
                var size : CFTypeRef
                var newPoint = CGPoint(x: x, y: y)
                var newSize = CGSize(width: width, height: height)

                position = AXValueCreate(AXValueType(rawValue: kAXValueCGPointType)!,&newPoint)!;
                AXUIElementSetAttributeValue(window, kAXPositionAttribute as CFString, position);

                size = AXValueCreate(AXValueType(rawValue: kAXValueCGSizeType)!,&newSize)!;
                AXUIElementSetAttributeValue(window, kAXSizeAttribute as CFString, size);
            }
        }
    }
}

// 000   000  000  000   000  000  000   000  0000000    00000000  000   000  
// 000 0 000  000  0000  000  000  0000  000  000   000  000        000 000   
// 000000000  000  000 0 000  000  000 0 000  000   000  0000000     00000    
// 000   000  000  000  0000  000  000  0000  000   000  000        000 000   
// 00     00  000  000   000  000  000   000  0000000    00000000  000   000  

func winIndex(pid:Int32, id:Int32) -> Int
{
    for info in matchWin(String(pid))
    {
        if info.id == id
        {
            return info.index
        }
    }
    return 0
}

// 0000000     0000000   000   000  000   000  0000000     0000000  
// 000   000  000   000  000   000  0000  000  000   000  000       
// 0000000    000   000  000   000  000 0 000  000   000  0000000   
// 000   000  000   000  000   000  000  0000  000   000       000  
// 0000000     0000000    0000000   000   000  0000000    0000000   

func getBounds(_ id:String)
{
    for win in matchWin(id)
    {
        print (".")
        print ("    id       ", win.id)
        print ("    x        ", win.x)
        print ("    y        ", win.y)
        print ("    width    ", win.width)
        print ("    height   ", win.height)
    }
}

func setBounds(_ id:String, _ x:String, _ y:String, _ width:String, _ height:String)
{
    let infos = allWins()
    for info in matchWin(id)
    {
        moveWin(id:info.id, x:Int(x)!, y:Int(y)!, width:Int(width)!, height:Int(height)!, infos:infos)
    }
}

func move(_ id:String, _ x:String, _ y:String)
{
    let infos = allWins()
    for info in matchWin(id)
    {
        if let bounds = winBounds(info.id, infos) {
            moveWin(id:info.id, x:Int(x)!, y:Int(y)!, width:bounds.width, height:bounds.height, infos:infos)
        }
    }
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
    // let r = osascript(
    // """
    // tell application \"System Events\"
        // set t to ""
        // repeat with theProcess in (processes whose background only = false)
            // set t to t & name of theProcess & \"\\n\"
            // set allWindows to (windows of theProcess)
            // repeat with theWindow in allWindows
                // set p to position of theWindow
                // set s to size of theWindow
                // set x to p's item 1 as text
                // set y to p's item 2 as text
                // set w to s's item 1 as text
                // set h to s's item 2 as text
                // set n to theWindow's name
                // set t to t & x & \" \" & y & \" \" & w & \" \" & h & \" \" & n & \"\\n\"
            // end repeat
        // end repeat
        // return t
    // end tell
    // """
    // )
    //     
    // print(r)

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
        print ("    index    ", win.index)
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

    _ = AudioObjectGetPropertyData(
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

        _ = AudioObjectGetPropertyData(
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

        let volumeSize = UInt32(MemoryLayout.size(ofValue: volume))

        var volumePropertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwareServiceDeviceProperty_VirtualMasterVolume,
            mScope: kAudioDevicePropertyScopeOutput,
            mElement: kAudioObjectPropertyElementMaster)

        _ = AudioObjectSetPropertyData(
            defaultOutputDeviceID,
            &volumePropertyAddress,
            0,
            nil,
            volumeSize,
            &volume)
    }
}

// 000000000  00000000    0000000    0000000  000   000
//    000     000   000  000   000  000       000   000
//    000     0000000    000000000  0000000   000000000
//    000     000   000  000   000       000  000   000
//    000     000   000  000   000  0000000   000   000

func trash (_ id:String)
{
    if (cmp(id, "empty"))
    {
        _ = osascript("tell app \"Finder\" to empty")
    }
    else if (cmp(id, "count"))
    {
    }
    else if (id.count > 0)
    {
        let abs = resolve(id)
        _ = osascript(
        """
        tell application \"Finder\"
            set posixpath to POSIX file \"\(abs)\"
            delete posixpath
        end tell
        """)
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

func appMain()
{
    let argc = CommandLine.arguments.count
    let argv = CommandLine.arguments

    if (argc == 1)
    {
        usage()
        //info("ko.app")
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
            else if (argc == 3) { getBounds(argv[2]) }
            else if (argc == 7) { setBounds(argv[2], argv[3], argv[4], argv[5], argv[6]) }
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
            else           { trash(argv[2]) }
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
}

