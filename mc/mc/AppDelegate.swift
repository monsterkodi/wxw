
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate 
{
    func applicationDidFinishLaunching(_ aNotification: Notification) 
    {
        if execCmd(CommandLine.arguments)
        {
            NSApplication.shared.terminate(self)
        }
    }

    func applicationWillTerminate(_ aNotification: Notification) 
    {
    }
}
