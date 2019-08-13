
import Cocoa
import Foundation
import SwiftSocket

var asked   = false
var trusted = false

func isTrusted() -> Bool
{
    if asked { return trusted }
    let checkOptPrompt = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as NSString
    let options = [checkOptPrompt: true]
    trusted = AXIsProcessTrustedWithOptions(options as CFDictionary)
    
    if !trusted
    {
        print("not trusted!")
    }
//    else
//    {
//        print("trusted")
//    }
    
    asked = true
    return trusted
}

// 00     00   0000000   000   000   0000000  00000000  
// 000   000  000   000  000   000  000       000       
// 000000000  000   000  000   000  0000000   0000000   
// 000 0 000  000   000  000   000       000  000       
// 000   000   0000000    0000000   0000000   00000000  

func mouse() -> NSPoint
{
    let mouseLoc = NSEvent.mouseLocation
    klog ("x ", Int(mouseLoc.x))
    klog ("y ", screenSize().height - Int(mouseLoc.y))
    return mouseLoc
}

func getKey()
{
    let flags = NSEvent.modifierFlags
    var mods:[String] = []
    if (flags.isSuperset(of: NSEvent.ModifierFlags.option))  { mods.append("alt") }
    if (flags.isSuperset(of: NSEvent.ModifierFlags.control)) { mods.append("ctrl")}
    if (flags.isSuperset(of: NSEvent.ModifierFlags.command)) { mods.append("cmd")}
    if (flags.isSuperset(of: NSEvent.ModifierFlags.shift))   { mods.append("shift")}

    klog(mods.joined(separator:"+"))
}

//  0000000   0000000  00000000   00000000  00000000  000   000   0000000  000   000   0000000   000000000  
// 000       000       000   000  000       000       0000  000  000       000   000  000   000     000     
// 0000000   000       0000000    0000000   0000000   000 0 000  0000000   000000000  000   000     000     
//      000  000       000   000  000       000       000  0000       000  000   000  000   000     000     
// 0000000    0000000  000   000  00000000  00000000  000   000  0000000   000   000   0000000      000     

func screenshot(_ id:String)
{
    let displayID = CGMainDisplayID()
    let imageRef  = CGDisplayCreateImage(displayID)
    
    let bitmapRep = NSBitmapImageRep(cgImage: imageRef!)
    let pngData  = bitmapRep.representation(using: NSBitmapImageRep.FileType.png, properties: [:])!
    
    var fileUrl:URL
    if (id.count > 0)
    {
        fileUrl = URL(fileURLWithPath:resolve(id))
    }
    else
    {
        fileUrl = URL(fileURLWithPath:join(folder("desktop"), "screenshot.png"))
    }
    
    do 
    {
        try pngData.write(to: fileUrl, options: .atomic)
    }
    catch 
    {
        print(error.localizedDescription)
    }
}

// 000   0000000   0000000   000   000  
// 000  000       000   000  0000  000  
// 000  000       000   000  000 0 000  
// 000  000       000   000  000  0000  
// 000   0000000   0000000   000   000  

func writeImage(_ icon:NSImage, _ target:String)
{
    let bitmapRep = NSBitmapImageRep(data: icon.tiffRepresentation!)!
    let pngData  = bitmapRep.representation(using: NSBitmapImageRep.FileType.png, properties: [:])!
    
    let fileUrl:URL = URL(fileURLWithPath:resolve(target))
    do
    {
        if ensureDir(dirname(fileUrl.path))
        {
            try pngData.write(to:fileUrl, options: .atomic)
            klog(fileUrl.path)
        }
    }
    catch
    {
        print(error.localizedDescription)
    }
}

func icon(_ id:String, _ target:String)
{
    var path:String = target
    for proc in matchProc(id)
    {
        if let app = NSRunningApplication(processIdentifier:proc.pid)
        {
            if app.icon != nil
            {
                if target.count == 0
                {
                    path = join(resolve("."), basename(proc.path)+".png")
                }

                writeImage(app.icon!, path)
                return
            }
        }
    }

    if target.count == 0
    {
        path = join(resolve("."), basename(id)+".png")
    }

    let icon = NSWorkspace.shared.icon(forFile:id)

    writeImage(icon, path)
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
        klog (".")
        klog ("    title    ", win.title)
        klog ("    path     ", win.path)
        klog ("    pid      ", win.pid)
        klog ("    id       ", win.id)
        klog ("    x        ", win.x)
        klog ("    y        ", win.y)
        klog ("    width    ", win.width)
        klog ("    height   ", win.height)
        klog ("    index    ", win.index)
        klog ("    status   ", win.status)
    }
}

func proc(_ id:String)
{
    for app in matchProc(id)
    {
        klog (".")
        klog ("    path    ", app.path)
        klog ("    pid     ", app.pid)
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
        // insert help!
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

// 00000000  000   000  00000000   0000000   0000000  00     00  0000000    
// 000        000 000   000       000       000       000   000  000   000  
// 0000000     00000    0000000   000       000       000000000  000   000  
// 000        000 000   000       000       000       000 0 000  000   000  
// 00000000  000   000  00000000   0000000   0000000  000   000  0000000    

func execCmd(_ argv:[String]) -> Bool
{
    let argc = argv.count
    if (argc == 1)
    {
        usage()
    }
    else
    {
        let cmd = argv[1]

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
            else           { raise(argv[2]) }
        }
        else if (cmp(cmd, "minimize"))
        {
            if (argc == 2) { help(cmd) }
            else           { minimize(argv[2]) }
        }
        else if (cmp(cmd, "maximize"))
        {
            if (argc == 2) { help(cmd) }
            else           { maximize(argv[2]) }
        }
        else if (cmp(cmd, "restore"))
        {
            if (argc == 2) { help(cmd) }
            else           { restore(argv[2]) }
        }
        else if (cmp(cmd, "focus"))
        {
            if (argc == 2) { help(cmd) }
            else           { _ = focus(argv[2]) }
        }
        else if (cmp(cmd, "launch"))
        {
            if (argc == 2) { help(cmd) }
            else           { launch(argv[2]) }
        }
        else if (cmp(cmd, "close"))
        {
            if (argc == 2) { help(cmd) }
            else           { close(argv[2]) }
        }
        else if (cmp(cmd, "quit"))
        {
            if (argc == 2) { help(cmd) }
            else           { quit(argv[2]) }
        }
        else if (cmp(cmd, "terminate"))
        {
            if (argc == 2) { help(cmd) }
            else           { terminate(argv[2]) }
        }
        else if (cmp(cmd, "kill"))
        {
            if (argc == 2) { help("terminate") }
            else           { terminate(argv[2]) }
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
            else           { move(argv[2], argv[3], argv[4]) }
        }
        else if (cmp(cmd, "size"))
        {
            if (argc <= 3 || argc != 5) { help(cmd) }
            else           { size(argv[2], argv[3], argv[4]) }
        }
        else if (cmp(cmd, "screenshot"))
        {
            if (argc == 2) { screenshot("") }
            else           { screenshot(argv[2]) }
        }
        else if (cmp(cmd, "screen"))
        {
            if (argc == 2) { _ = screen("size") }
            else           { _ = screen(argv[2]) }
        }
        else if (cmp(cmd, "icon"))
        {
            if (argc == 2) { help(cmd) }
            else           
            { 
                var target = ""
                for i in 3..<argc 
                {
                    target += argv[i]
                    if i < argc-1
                    {
                        target += " "
                    }
                }
                icon(argv[2], target) 
            }
        }
        else if (cmp(cmd, "key"))
        {
            if (argc == 2) { getKey() }
            //else           { key(argv[2], (argc >= 4) ? argv[3] : "tap") }
        }
        else if (cmp(cmd, "mouse"))
        {
            _ = mouse()
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
            if (argc == 2) { proc("") }
            else           { proc(argv[2]) }
        }
        else if (cmp(cmd, "hook"))
        {
            if (argc == 2) { help(cmd) }
            else 
            { 
                if initHook(argv[2]) { return false }
            }
        }
    }
    return true
}
