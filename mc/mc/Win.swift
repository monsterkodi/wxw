/*
000   000  000  000   000  
000 0 000  000  0000  000  
000000000  000  000 0 000  
000   000  000  000  0000  
00     00  000  000   000  
*/

import Foundation
import Cocoa

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

func winWithId(_ id:String, _ infos:[winInfo]?) -> winInfo?
{
    for w in infos ?? allWins() {
        if cmp(w.id, id) {
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

func winIndex(pid:Int32, id:String) -> Int
{
    for info in matchWin(String(pid))
    {
        if cmp(info.id, id)
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

func winBounds(_ id:String, _ infos:[winInfo]?) -> bounds?
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

func moveWin(id:String, x:Int, y:Int, width:Int, height:Int, infos:[winInfo]?)
{
    if let win = winWithId(id, infos)
    {
        var position: CFTypeRef
        var size: CFTypeRef
        var newPoint = CGPoint(x: x, y: y)
        var newSize = CGSize(width: width, height: height)

        position = AXValueCreate(AXValueType(rawValue: kAXValueCGPointType)!,&newPoint)!;
        AXUIElementSetAttributeValue(win.win, kAXPositionAttribute as CFString, position);

        size = AXValueCreate(AXValueType(rawValue: kAXValueCGSizeType)!,&newSize)!;
        AXUIElementSetAttributeValue(win.win, kAXSizeAttribute as CFString, size);
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
        if let bounds = winBounds(info.id, infos) 
        {
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
        if let bounds = winBounds(info.id, infos) 
        {
            moveWin(id:info.id, x:bounds.x, y:bounds.y, width:Int(width) ?? 500, height:Int(height) ?? 500, infos:infos)
        }
    }
}

// 00     00  000  000   000  000  00     00   0000000   000   000  
// 000   000  000  0000  000  000  000   000  000   000   000 000   
// 000000000  000  000 0 000  000  000000000  000000000    00000    
// 000 0 000  000  000  0000  000  000 0 000  000   000   000 000   
// 000   000  000  000   000  000  000   000  000   000  000   000  

func maximize(_ id:String)
{
    let s = screen("size")
    setBounds(id, "0", "0", String(s.width), String(s.height))
}

func minimize(_ id:String)
{    
    for win in matchWin(id)
    {
        AXUIElementSetAttributeValue(win.win, kAXMinimizedAttribute as CFString, kCFBooleanTrue);
    }    
}

func restore(_ id:String)
{
    for win in matchWin(id)
    {
        AXUIElementSetAttributeValue(win.win, kAXMinimizedAttribute as CFString, kCFBooleanFalse);
    }        
}

// 00000000    0000000   000   0000000  00000000  
// 000   000  000   000  000  000       000       
// 0000000    000000000  000  0000000   0000000   
// 000   000  000   000  000       000  000       
// 000   000  000   000  000  0000000   00000000  

func raise(_ id:String)
{
    for win in matchWin(id)
    {
        print("win", win)
        AXUIElementSetAttributeValue(win.win, kAXMinimizedAttribute as CFString, kCFBooleanFalse);
        if let app = NSRunningApplication(processIdentifier:win.pid)
        {
            print("raise", app)
            app.activate(options:.activateAllWindows)
        }
    }        
}

func focus(_ id:String) -> Bool
{
    for win in matchWin(id)
    {
        AXUIElementSetAttributeValue(win.win, kAXMinimizedAttribute as CFString, kCFBooleanFalse);
        if let app = NSRunningApplication(processIdentifier:win.pid)
        {
            app.activate(options:.activateIgnoringOtherApps)
        }
        return true
    }        
    return false
}

func launch(_ id:String)
{
    if (!focus(id))
    {
        print("launch", id)
    }
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
