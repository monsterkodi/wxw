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

                AXUIElementCopyAttributeValue(window, kAXFocusedAttribute as CFString, &ref);

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
                    status: status,
                    win:    window
                    ))
                    
                zindex += 1
            }
        }
    }   
    
    return infos
}

func allWins() -> [winInfo]
{
    return matchWin("")
}
