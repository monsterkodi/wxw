/*
00     00   0000000   000000000   0000000  000   000
000   000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000 0 000  000   000     000     000       000   000
000   000  000   000     000      0000000  000   000
*/

import Cocoa
import Foundation

struct appInfo
{
    var path:String
    var pid:Int32 = 0
}

// 000   000  000  000   000  
// 000 0 000  000  0000  000  
// 000000000  000  000 0 000  
// 000   000  000  000  0000  
// 00     00  000  000   000  

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

//  0000000   00000000   00000000   
// 000   000  000   000  000   000  
// 000000000  00000000   00000000   
// 000   000  000        000        
// 000   000  000        000        

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