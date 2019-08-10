/*
00000000   00000000    0000000    0000000  
000   000  000   000  000   000  000       
00000000   0000000    000   000  000       
000        000   000  000   000  000       
000        000   000   0000000    0000000  
*/

import Foundation
import Cocoa

struct procInfo
{
    var path:String
    var pid:Int32 = 0
}

// 00     00   0000000   000000000   0000000  000   000  
// 000   000  000   000     000     000       000   000  
// 000000000  000000000     000     000       000000000  
// 000 0 000  000   000     000     000       000   000  
// 000   000  000   000     000      0000000  000   000  

func matchProc(_ id:String) -> [procInfo]
{
    var infos:[procInfo] = []

    for app in NSWorkspace.shared.runningApplications
    {
        if app.bundleURL == nil { continue }
        if app.bundleURL!.pathExtension != "app" { continue }
        let path = app.bundleURL!.path
        
        if path.startsWith("/System/Library/CoreServices/") 
        { 
            if !cmp(base(path), "Finder") { continue }
        }
        if path.startsWith("/System/Library/PrivateFrameworks/") { continue }
        if cmp(base(path), "plugin-container") { continue }
        
        if id.count > 0 && path != id && !contains(app.bundleURL!.lastPathComponent, id) && app.processIdentifier != Int32(id) { continue }

        infos.append(procInfo(
            path:   app.bundleURL!.path,
            pid:    app.processIdentifier))
    }

    return infos
}

func allProcs() -> [procInfo]
{
    return matchProc("")
}
