
import Cocoa
import Foundation
import SwiftSocket

// 000  000   000  00000000   0000000
// 000  0000  000  000       000   000
// 000  000 0 000  000000    000   000
// 000  000  0000  000       000   000
// 000  000   000  000        0000000

func info(_ id:String)
{
    for win in matchWin(id)
    {
        print (".")
        print ("    title    ", win.title)
        print ("    path     ", win.path)
        print ("    pid      ", win.pid)
        print ("    id       ", win.id)
        print ("    x        ", win.x)
        print ("    y        ", win.y)
        print ("    width    ", win.width)
        print ("    height   ", win.height)
        print ("    index    ", win.index)
        print ("    status   ", win.status)
    }
}

func proc(_ id:String)
{
    for app in matchProc(id)
    {
        print (".")
        print ("    path    ", app.path)
        print ("    pid     ", app.pid)
    }
}

// 000   000  00000000  000      00000000
// 000   000  000       000      000   000
// 000000000  0000000   000      00000000
// 000   000  000       000      000
// 000   000  00000000  0000000  000

func help(_ id:String)
{
    if (false)
    {
    }
    else
    {
        print("no help available for", id)
    }

    print("")
}

// 000   000   0000000   0000000    0000000   00000000
// 000   000  000       000   000  000        000
// 000   000  0000000   000000000  000  0000  0000000
// 000   000       000  000   000  000   000  000
//  0000000   0000000   000   000   0000000   00000000

func usage()
{
    print("")
    print("wxw [command] [args...]")
    print("")
    print("    commands:")
    print("")
    print("         info        wid")
    print("         raise       wid")
    print("         minimize    wid")
    print("         maximize    wid")
    print("         restore     wid")
    print("         focus       wid")
    print("         close       wid")
    print("         quit        wid")
    print("         bounds      wid [x y w h]")
    print("         move        wid x y")
    print("         size        wid w h")
    print("         launch      path")
    print("         proc       [pid|file]")
    print("         terminate  [pid|file]")
    print("         mouse")
    print("         key        [shift+|ctrl+|alt+]key")
    print("         help        command")
    print("         trash       count|empty|file")
    print("         screen     [size|user]")
    print("         screenshot [targetfile]")
    print("         icon        path [targetfile]")
    print("")
    print("    wid:")
    print("")
    print("         pid, path, id or 'top'")
    print("")
}

//  0000000   00000000    0000000   000   000  00     00  00000000  000   000  000000000   0000000
// 000   000  000   000  000        000   000  000   000  000       0000  000     000     000
// 000000000  0000000    000  0000  000   000  000000000  0000000   000 0 000     000     0000000
// 000   000  000   000  000   000  000   000  000 0 000  000       000  0000     000          000
// 000   000  000   000   0000000    0000000   000   000  00000000  000   000     000     0000000

func appMain()
{
    let argc = CommandLine.arguments.count
    let argv = CommandLine.arguments

    if (argc == 1)
    {
        usage()
        //info("ko.app")
    }
    else
    {
        let cmd = CommandLine.arguments[1]

        if (cmp(cmd, "help"))
        {
            if (argc == 2) { usage() }
            else           { help(argv[2]) }
        }
        else if (cmp(cmd, "info"))
        {
            if (argc == 2) { info("") }
            else           { info(argv[2]) }
        }
        else if (cmp(cmd, "raise"))
        {
            if (argc == 2) { help(cmd) }
            else           { raise(argv[2]) }
        }
        else if (cmp(cmd, "minimize"))
        {
            if (argc == 2) { help(cmd) }
            else           { minimize(argv[2]) }
        }
        else if (cmp(cmd, "maximize"))
        {
            if (argc == 2) { help(cmd) }
            else           { maximize(argv[2]) }
        }
        else if (cmp(cmd, "restore"))
        {
            if (argc == 2) { help(cmd) }
            else           { restore(argv[2]) }
        }
        else if (cmp(cmd, "focus"))
        {
            if (argc == 2) { help(cmd) }
            else           { focus(argv[2]) }
        }
        else if (cmp(cmd, "launch"))
        {
            if (argc == 2) { help(cmd) }
            else           { launch(argv[2]) }
        }
        else if (cmp(cmd, "close"))
        {
            if (argc == 2) { help(cmd) }
            else           { close(argv[2]) }
        }
        else if (cmp(cmd, "quit"))
        {
            if (argc == 2) { help(cmd) }
            // else           { quit(argv[2]) }
        }
        else if (cmp(cmd, "terminate"))
        {
            if (argc == 2) { help(cmd) }
            //else           { terminate(argv[2]) }
        }
        else if (cmp(cmd, "kill"))
        {
            if (argc == 2) { help("terminate") }
            //else           { terminate(argv[2]) }
        }
        else if (cmp(cmd, "bounds"))
        {
            if (argc < 3 || argc != 3 && argc != 7) { help(cmd) }
            else if (argc == 3) { getBounds(argv[2]) }
            else if (argc == 7) { setBounds(argv[2], argv[3], argv[4], argv[5], argv[6]) }
        }
        else if (cmp(cmd, "move"))
        {
            if (argc <= 3 || argc != 5) { help(cmd) }
            else           { move(argv[2], argv[3], argv[4]) }
        }
        else if (cmp(cmd, "size"))
        {
            if (argc <= 3 || argc != 5) { help(cmd) }
            else           { size(argv[2], argv[3], argv[4]) }
        }
        else if (cmp(cmd, "screenshot"))
        {
            //if (argc == 2) { screenshot() }
            //else           { screenshot(argv[2]) }
        }
        else if (cmp(cmd, "screen"))
        {
            //if (argc == 2) { screen("size") }
            //else           { screen(argv[2]) }
        }
        else if (cmp(cmd, "icon"))
        {
            if (argc == 2) { help(cmd) }
            //else           { icon(argv[2], (argc >= 4) ? argv[3] : NULL) }
        }
        else if (cmp(cmd, "key"))
        {
            if (argc == 2) { help(cmd) }
            //else           { key(argv[2], (argc >= 4) ? argv[3] : "tap") }
        }
        else if (cmp(cmd, "mouse"))
        {
            //mouse()
        }
        else if (cmp(cmd, "trash"))
        {
            if (argc == 2) { help(cmd) }
            else           { trash(argv[2]) }
        }
        else if (cmp(cmd, "volume"))
        {
            if (argc == 2) { volume("") }
            else           { volume(argv[2]) }
        }
        else if (cmp(cmd, "proc"))
        {
            if (argc == 2) { proc("") }
            else           { proc(argv[2]) }
        }
        else if (cmp(cmd, "hook"))
        {
            if (argc == 2) { help(cmd) }
            else { initHook(argv[2]) }
        }
    }
}

