/*
00     00   0000000   000000000   0000000  000   000
000   000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000 0 000  000   000     000     000       000   000
000   000  000   000     000      0000000  000   000
*/

import Cocoa
import Foundation

// 000   000  000  000   000  
// 000 0 000  000  0000  000  
// 000000000  000  000 0 000  
// 000   000  000  000  0000  
// 00     00  000  000   000  

func matchWin(_ id:String) -> [winInfo]
{
    var infos:[winInfo] = []
        
    var zindex = 0
    
    for proc in allProcs()
    {
        let appRef = AXUIElementCreateApplication(proc.pid)

        var value: AnyObject?
        _ = AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute as CFString, &value)

        if let windowList = value as? [AXUIElement]
        {
            for index in 0..<windowList.count
            {
                let window = windowList[index]
                
                var ref: CFTypeRef? = nil
                
                var point:CGPoint = CGPoint(x: 0, y: 0)
                AXUIElementCopyAttributeValue(window, kAXPositionAttribute as CFString, &ref);
                AXValueGetValue(ref as! AXValue, AXValueType(rawValue: kAXValueCGPointType)!, &point);

                var size:CGSize = CGSize(width: 0, height: 0)
                AXUIElementCopyAttributeValue(window, kAXSizeAttribute as CFString, &ref);
                AXValueGetValue(ref as! AXValue, AXValueType(rawValue: kAXValueCGSizeType)!, &size);
                
                var status = "normal"
                AXUIElementCopyAttributeValue(window, kAXMinimizedAttribute as CFString, &ref);
                if ref as! Bool
                {
                    status = "minimized"
                }
                
                AXUIElementCopyAttributeValue(window, kAXTitleAttribute as CFString, &ref);
                let title = ref as? String ?? "";

                AXUIElementCopyAttributeValue(window, kAXFocusedAttribute as CFString, &ref);

                var pid:Int32 = 0
                AXUIElementGetPid(window, &pid)
                
                let wid = "\(pid):\(index)"
                
                if id.count > 0 && !contains(proc.path, id) && id != wid && id != "top" && (Int(id) ?? 0) != pid 
                { 
                    continue 
                }
                
                // print ("info", title, index, status, point, size, pid, index, proc.path, proc.pid)
                
                infos.append(winInfo(
                    title:  title,
                    path:   proc.path,
                    pid:    proc.pid,
                    id:     wid,
                    x:      Int(point.x),
                    y:      Int(point.y),
                    width:  Int(size.width),
                    height: Int(size.height),
                    index:  zindex,
                    status: status
                    ))
                    
                zindex += 1
            }
        }
    }   
    
    // return matchWinOld(id)
    return infos
}

func matchWinOld(_ id:String) -> [winInfo]
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
                id:     String(wid),
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
