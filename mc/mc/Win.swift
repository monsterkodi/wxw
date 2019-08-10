/*
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000  
*/

import Foundation
import Cocoa

// 000  000   000  00000000   0000000   
// 000  0000  000  000       000   000  
// 000  000 0 000  000000    000   000  
// 000  000  0000  000       000   000  
// 000  000   000  000        0000000   

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

struct bounds
{
    var x:Int
    var y:Int
    var width:Int
    var height:Int
}

//  0000000   0000000  00000000   00000000  00000000  000   000  
// 000       000       000   000  000       000       0000  000  
// 0000000   000       0000000    0000000   0000000   000 0 000  
//      000  000       000   000  000       000       000  0000  
// 0000000    0000000  000   000  00000000  00000000  000   000  

func screen(_ id:String) -> bounds
{
    return bounds(x:0, y:0, width:Int(NSScreen.main!.frame.size.width), height:Int(NSScreen.main!.frame.size.width))
}

// 000  0000000    
// 000  000   000  
// 000  000   000  
// 000  000   000  
// 000  0000000    

func winWithId(_ id:Int32, _ infos:[winInfo]?) -> winInfo?
{
    for w in infos ?? allWins() {
        if w.id == id {
            return w
        }
    }
    return nil
}

// 000  000   000  0000000    00000000  000   000  
// 000  0000  000  000   000  000        000 000   
// 000  000 0 000  000   000  0000000     00000    
// 000  000  0000  000   000  000        000 000   
// 000  000   000  0000000    00000000  000   000  

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

func winBounds(_ id:Int32, _ infos:[winInfo]?) -> bounds?
{
    if let w = winWithId(id, infos)
    {
        return bounds(x: w.x, y: w.y, width: w.width, height: w.height)
    }
    return nil
}

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
        moveWin(id:info.id, x:Int(x) ?? 0, y:Int(y) ?? 0, width:Int(width) ?? 500, height:Int(height) ?? 500, infos:infos)
    }
}

// 00     00   0000000   000   000  00000000
// 000   000  000   000  000   000  000     
// 000000000  000   000   000 000   0000000 
// 000 0 000  000   000     000     000     
// 000   000   0000000       0      00000000

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

// 00     00   0000000   000   000  00000000  
// 000   000  000   000  000   000  000       
// 000000000  000   000   000 000   0000000   
// 000 0 000  000   000     000     000       
// 000   000   0000000       0      00000000  

func move(_ id:String, _ x:String, _ y:String)
{
    let infos = allWins()
    for info in matchWin(id)
    {
        if let bounds = winBounds(info.id, infos) {
            moveWin(id:info.id, x:Int(x) ?? 0, y:Int(y) ?? 0, width:bounds.width, height:bounds.height, infos:infos)
        }
    }
}

//  0000000  000  0000000  00000000  
// 000       000     000   000       
// 0000000   000    000    0000000   
//      000  000   000     000       
// 0000000   000  0000000  00000000  

func size(_ id:String, _ width:String, _ height:String)
{
    let infos = allWins()
    for info in matchWin(id)
    {
        if let bounds = winBounds(info.id, infos) {
            moveWin(id:info.id, x:bounds.x, y:bounds.y, width:Int(width) ?? 500, height:Int(height) ?? 500, infos:infos)
        }
    }
}

// 00     00  000  000   000  000  00     00   0000000   000   000  
// 000   000  000  0000  000  000  000   000  000   000   000 000   
// 000000000  000  000 0 000  000  000000000  000000000    00000    
// 000 0 000  000  000  0000  000  000 0 000  000   000   000 000   
// 000   000  000  000   000  000  000   000  000   000  000   000  

func minimize(_ id:String)
{    
    let infos = allWins()
    for info in matchWin(id)
    {
        if let win = winWithId(info.id, infos)
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
                    AXUIElementSetAttributeValue(window, kAXMinimizedAttribute as CFString, kCFBooleanTrue);
                }
            }
        }
    }    
}

func maximize(_ id:String)
{
    let s = screen("size")
    setBounds(id, "0", "0", String(s.width), String(s.height))
}

func restore(_ id:String)
{    
    _ = osascript(
    """
    use application \"System Events\"
    set value of attribute \"AXMinimized\" of (every window of process \"\(id)\" whose value of attribute \"AXMinimized\" is true) to false
    """)
}

// 00000000    0000000   000   0000000  00000000  
// 000   000  000   000  000  000       000       
// 0000000    000000000  000  0000000   0000000   
// 000   000  000   000  000       000  000       
// 000   000  000   000  000  0000000   00000000  

func raise(_ id:String)
{
}

func focus(_ id:String)
{
}

func launch(_ id:String)
{
}

//  0000000  000       0000000    0000000  00000000  
// 000       000      000   000  000       000       
// 000       000      000   000  0000000   0000000   
// 000       000      000   000       000  000       
//  0000000  0000000   0000000   0000000   00000000  

func close(_ id:String)
{
}

func quit(_ id:String)
{
}
