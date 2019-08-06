
import Cocoa
import Foundation
import SwiftSocket

func moveWindow()
{
//  pid_t pid = [[entry objectForKey:(id)kCGWindowOwnerPID] intValue];
//  AXUIElementRef appRef = AXUIElementCreateApplication(pid);
//
//  CFArrayRef windowList;
//  AXUIElementCopyAttributeValue(appRef, kAXWindowsAttribute, (CFTypeRef *)&windowList);
//  if ((!windowList) || CFArrayGetCount(windowList)<1)
//  continue;
//
//
//  AXUIElementRef windowRef = (AXUIElementRef) CFArrayGetValueAtIndex( windowList, 0);
//  CFTypeRef role;
//  AXUIElementCopyAttributeValue(windowRef, kAXRoleAttribute, (CFTypeRef *)&role);
//  CFTypeRef position;
//  CGPoint point;
//
//  AXUIElementCopyAttributeValue(windowRef, kAXPositionAttribute, (CFTypeRef *)&position);
//  AXValueGetValue(position, kAXValueCGPointType, &point);
//  CGPoint newPoint;
//  newPoint.x = 0;
//  newPoint.y = 0;
//  position = (CFTypeRef)(AXValueCreate(kAXValueCGPointType, (const void *)&newPoint));

//  AXUIElementSetAttributeValue(windowRef, kAXPositionAttribute, position);
}

func udpSend(string: String)
{
    let client = UDPClient(address: "127.0.0.1", port: 65432)
    _ = client.send(string: string)
    print("\n\n", string)
    print("\n")
}

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

// let frontmost = NSWorkspace.shared.frontmostApplication!
// let path = frontmost.bundleURL!.path
// print("frontmost", path)

// SIWindowInfo *frontWindowInfo = [SIWindowInfo windowInfoFromCGWindowInfoDictionary:[windowInfoList objectAtIndex:0]]

print(CommandLine.arguments)

sendProc()
sendInfo()
    


