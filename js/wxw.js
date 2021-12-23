// monsterkodi/kode 0.200.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var childp, exec, fs, kstr, noon, os, quit, slash, wcexe, wxw

os = require('os')
fs = require('fs')
kstr = require('kstr')
noon = require('noon')
slash = require('kslash')
childp = require('child_process')
if (os.platform() === 'win32')
{
    wcexe = slash.unslash(slash.resolve(slash.join(__dirname,'..','bin','wc.exe')))
}
else if (os.platform() === 'darwin')
{
    wcexe = slash.resolve(slash.join(__dirname,'..','bin','mc.app','Contents','MacOS','mc'))
}

quit = function (args)
{
    var out, pid, pidl, pids, proc, proclist, prts

    proclist = wxw('proc',slash.file(args[0]))
    if (proclist.length)
    {
        prts = new Set(proclist.map(function (p)
        {
            return p.parent
        }))
        pids = new Set(proclist.map(function (p)
        {
            return p.pid
        }))
        pidl = Array.from(pids).filter(function (p)
        {
            return prts.has(p)
        })
        out = ''
        while (pid = pidl.shift())
        {
            var list = _k_.list(proclist)
            for (var _30_21_ = 0; _30_21_ < list.length; _30_21_++)
            {
                proc = list[_30_21_]
                if (proc.pid === pid)
                {
                    out += wxw('terminate',pid)
                }
            }
        }
        return out
    }
    else
    {
        console.error('no process')
    }
    return ''
}

exec = function (...argv)
{
    var args, cmd, i, outp, pkg, s, _60_52_

    try
    {
        if (!argv.length)
        {
            argv = ['help']
        }
        cmd = argv[0]
        while (cmd[0] === '-')
        {
            cmd = cmd.slice(1)
        }
        if (cmd.length === 1)
        {
            switch (cmd)
            {
                case 'h':
                    cmd = "help"
                    break
                case 'i':
                    cmd = "info"
                    break
                case 'b':
                    cmd = "bounds"
                    break
                case 'v':
                    cmd = "version"
                    break
                case 'l':
                    cmd = "launch"
                    break
            }

        }
        if (cmd === 'version')
        {
            pkg = require(slash.join(__dirname,"..","package.json"))
            return pkg.version
        }
        for (var _59_18_ = i = 1, _59_22_ = argv.length; (_59_18_ <= _59_22_ ? i < argv.length : i > argv.length); (_59_18_ <= _59_22_ ? ++i : --i))
        {
            if (argv[i][0] !== '"' && (typeof argv[i].indexOf === "function" ? argv[i].indexOf(' ') : undefined) >= 0 && argv[i].slice(-1)[0] !== '"')
            {
                argv[i] = '"' + argv[i] + '"'
            }
        }
        argv[0] = cmd
        if (_k_.in(cmd,['launch','raise','focus','hook']))
        {
            return childp.spawn(`\"${wcexe}\"`,argv,{encoding:'utf8',shell:true,detached:true})
        }
        else
        {
            args = (function () { var result = []; var list = _k_.list(argv); for (var _68_34_ = 0; _68_34_ < list.length; _68_34_++)  { s = list[_68_34_];result.push(kstr(s))  } return result }).bind(this)().join(" ")
            outp = childp.execSync(`\"${wcexe}\" ${args}`,{encoding:'utf8',shell:true})
            if (cmd === 'quit' && !outp.startsWith('terminated'))
            {
                return quit(argv.slice(1))
            }
            return outp
        }
    }
    catch (err)
    {
        return ''
    }
}

wxw = function ()
{
    var out, _86_20_

    out = exec.apply(null,[].slice.call(arguments,0))
    switch (kstr(arguments[0]))
    {
        case 'info':
        case 'screen':
        case 'mouse':
        case 'trash':
        case 'proc':
            return noon.parse(out.trim())

        default:
            return (out.trim != null) && out.trim() || out
    }

}
wxw.exec = exec
module.exports = wxw