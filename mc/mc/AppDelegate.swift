
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate 
{
    func applicationDidFinishLaunching(_ aNotification: Notification) 
    {
        if appMain()
        {
            NSApplication.shared.terminate(self)
        }
    }

    func applicationWillTerminate(_ aNotification: Notification) 
    {
    }
}
