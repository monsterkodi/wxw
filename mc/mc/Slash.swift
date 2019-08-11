/*
 0000000  000       0000000    0000000  000   000    
000       000      000   000  000       000   000    
0000000   000      000000000  0000000   000000000    
     000  000      000   000       000  000   000    
0000000   0000000  000   000  0000000   000   000    
*/

import Foundation

// 00000000   00000000   0000000   0000000   000      000   000  00000000  
// 000   000  000       000       000   000  000      000   000  000       
// 0000000    0000000   0000000   000   000  000       000 000   0000000   
// 000   000  000            000  000   000  000         000     000       
// 000   000  00000000  0000000    0000000   0000000      0      00000000  

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

func ensureDir(_ p:String) -> Bool
{
    if !FileManager.default.fileExists(atPath: p) 
    {
        do 
        {
            try FileManager.default.createDirectory(atPath: p, withIntermediateDirectories: true, attributes: nil)
            return true
        } 
        catch 
        {
            print(error.localizedDescription);
        }
        return false
    }

    return true
}

// 00000000  000  000      00000000  
// 000       000  000      000       
// 000000    000  000      0000000   
// 000       000  000      000       
// 000       000  0000000  00000000  

func filename(_ p:String) -> String
{
    let url = URL(fileURLWithPath: p)
    return url.pathComponents.last ?? ""
}

func basename(_ p:String) -> String
{
    let url = URL(fileURLWithPath: p)
    return url.deletingPathExtension().pathComponents.last ?? ""
}

func dirname(_ p:String) -> String
{
    let url = URL(fileURLWithPath: p)
    return url.deletingLastPathComponent().path
}

//       000   0000000   000  000   000  
//       000  000   000  000  0000  000  
//       000  000   000  000  000 0 000  
// 000   000  000   000  000  000  0000  
//  0000000    0000000   000  000   000  

func join(_ dir:String, _ pth:String) -> String
{
    return dir + "/" + pth
}

// 00000000   0000000   000      0000000    00000000  00000000   
// 000       000   000  000      000   000  000       000   000  
// 000000    000   000  000      000   000  0000000   0000000    
// 000       000   000  000      000   000  000       000   000  
// 000        0000000   0000000  0000000    00000000  000   000  

func folder(_ id:String) -> String
{
    if cmp(id, "home")
    {
        return FileManager.default.homeDirectoryForCurrentUser.path
    }
    if cmp(id, "trash")
    {
        return join(folder("home"), ".Trash")
    }
    if cmp(id, "desktop")
    {
        return join(folder("home"), "Desktop")
    }
    return ""
}
