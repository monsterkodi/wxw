/*
000000000  00000000    0000000    0000000  000   000
   000     000   000  000   000  000       000   000
   000     0000000    000000000  0000000   000000000
   000     000   000  000   000       000  000   000
   000     000   000  000   000  0000000   000   000
*/

import Foundation

func trash(_ id:String)
{
    if (cmp(id, "empty"))
    {
        _ = osascript(
        """
        tell application \"Finder\" 
            empty
        end tell
        """)
    }
    else if (cmp(id, "count"))
    {
        do {
            let files = try FileManager.default.contentsOfDirectory(atPath:folder("trash"))
            print(files.count)
        }
        catch let error as NSError {
            print("Error: \(error)")
        }
    }
    else if (id.count > 0)
    {
        let abs = resolve(id)
        _ = osascript(
        """
        tell application \"Finder\"
            set posixpath to POSIX file \"\(abs)\"
            delete posixpath
        end tell
        """)
    }
}