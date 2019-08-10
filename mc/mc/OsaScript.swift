/*
 0000000    0000000   0000000    0000000   0000000  00000000   000  00000000   000000000
000   000  000       000   000  000       000       000   000  000  000   000     000
000   000  0000000   000000000  0000000   000       0000000    000  00000000      000
000   000       000  000   000       000  000       000   000  000  000           000
 0000000   0000000   000   000  0000000    0000000  000   000  000  000           000
*/

import Foundation

func osascript(_ script:String) -> String
{
    // print(script)
    
    if let osa = NSAppleScript(source:script)
    {
        var error: NSDictionary?
        let result:NSAppleEventDescriptor? = osa.executeAndReturnError(&error)
        if result == nil
        {
            return "error: \(String(describing: error))"
        }
        else
        {
            return result?.stringValue ?? ""
        }
    }
    else
    {
        return "can't create applescript"
    }
}

    // let r = osascript(
    // """
    // tell application \"System Events\"
        // set t to ""
        // repeat with theProcess in (processes whose background only = false)
            // set t to t & name of theProcess & \"\\n\"
            // set allWindows to (windows of theProcess)
            // repeat with theWindow in allWindows
                // set p to position of theWindow
                // set s to size of theWindow
                // set x to p's item 1 as text
                // set y to p's item 2 as text
                // set w to s's item 1 as text
                // set h to s's item 2 as text
                // set n to theWindow's name
                // set t to t & x & \" \" & y & \" \" & w & \" \" & h & \" \" & n & \"\\n\"
            // end repeat
        // end repeat
        // return t
    // end tell
    // """
    // )
    //     
    // print(r)
