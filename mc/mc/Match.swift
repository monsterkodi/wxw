/*
00     00   0000000   000000000   0000000  000   000
000   000  000   000     000     000       000   000
000000000  000000000     000     000       000000000
000 0 000  000   000     000     000       000   000
000   000  000   000     000      0000000  000   000
*/

import Cocoa
import Foundation

struct winInfo
{
    var title:String
    var path:String
    var pid:Int32 = 0
    var id:String
    var x      = 0
    var y      = 0
    var width  = 0
    var height = 0
    var index  = 0
    var status:String
    var win:AXUIElement
}

// 000   000  000  000   000  
// 000 0 000  000  0000  000  
// 000000000  000  000 0 000  
// 000   000  000  000  0000  
// 00     00  000  000   000  

func matchWin(_ id:String) -> [winInfo]
{
    var infos:[winInfo] = []
        
    var zindex = 0
    
    let cgWins = matchCGWin("")
    
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
                
                var ref:CFTypeRef? = nil
                
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

                // AXUIElementCopyAttributeValue(window, kAXFocusedAttribute as CFString, &ref);
                // let focus = ref as! Bool
                // if focus
                // {
                    // status += " top"
                // }

                var pid:Int32 = 0
                AXUIElementGetPid(window, &pid)
                
                let wid = "\(pid):\(index)"
                
                if id.count > 0 && !contains(proc.path, id) && id != wid && id != "top" && (Int(id) ?? 0) != pid 
                { 
                    continue 
                }
                
                if (title.count == 0 && cmp(base(proc.path), "Finder")) 
                {
                    continue
                }
                
                var wi = winInfo(
                    title:  title,
                    path:   proc.path,
                    pid:    proc.pid,
                    id:     wid,
                    x:      Int(point.x),
                    y:      Int(point.y),
                    width:  Int(size.width),
                    height: Int(size.height),
                    index:  -1,
                    status: status,
                    win:    window
                    )
                
                if let cg = winForWin(wi, cgWins)
                {
                    wi.index = cg.index
                    
                    if (cg.index == 0 && id == "top") 
                    {
                        return [wi]
                    }
                }
                
                // print ("info", title, index, status, point, size, pid, index, proc.path, proc.pid)
                
                infos.append(wi)
                    
                zindex += 1
            }
        }
    }   
    
    return infos
}

func winForWin(_ info:winInfo, _ infos:[winInfo]) -> winInfo?
{
    for win in infos
    {
        if win.x == info.x && win.y == info.y && win.width == info.width && win.height == info.height && win.pid == info.pid // && win.title == info.title
        {
            return win
        }
    }
    return nil
}

func matchCGWin(_ id:String) -> [winInfo]
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
                status: status,
                win:    AXUIElementCreateSystemWide()
                ))
    
            index += 1
                
            if id == "top" { break }
        }
    }
    //print(infos)
    return infos
}

func allWins() -> [winInfo]
{
    return matchWin("")
}
