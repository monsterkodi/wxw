// koffee 1.4.0

/*
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00
 */
var childp, exec, fs, kstr, noon, os, quit, sendCmd, slash, udp, usck, wcexe, wxw,
    slice = [].slice;

os = require('os');

fs = require('fs');

kstr = require('kstr');

noon = require('noon');

slash = require('kslash');

childp = require('child_process');

udp = require('./udp');

usck = null;

sendCmd = function(args) {
    var cb;
    if (!usck) {
        usck = new udp({});
    }
    cb = function(data) {
        if (process.argv[1].endsWith('wxw')) {
            return process.exit(0);
        }
    };
    usck.sendCB.apply(usck, [cb].concat(args));
    if (cmd === 'launch' || cmd === 'raise' || cmd === 'focus') {
        return '';
    }
    return 'should use socket!';
};

if (os.platform() === 'win32') {
    wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));
} else if (os.platform() === 'darwin') {
    wcexe = slash.resolve(slash.join(__dirname, '..', 'bin', 'mc.app', 'Contents', 'MacOS', 'mc'));
}

quit = function(args) {
    var j, len, out, pid, pidl, pids, proc, proclist, prts;
    proclist = wxw('proc', slash.file(args[0]));
    if (proclist.length) {
        prts = new Set(proclist.map(function(p) {
            return p.parent;
        }));
        pids = new Set(proclist.map(function(p) {
            return p.pid;
        }));
        pidl = Array.from(pids).filter(function(p) {
            return prts.has(p);
        });
        out = '';
        while (pid = pidl.shift()) {
            for (j = 0, len = proclist.length; j < len; j++) {
                proc = proclist[j];
                if (proc.pid === pid) {
                    out += wxw('terminate', pid);
                }
            }
        }
        return out;
    } else {
        console.error('no process');
    }
    return '';
};

exec = function() {
    var args, argv, base, cmd, err, i, j, outp, pkg, ref, s;
    argv = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    try {
        if (!argv.length) {
            argv = ['help'];
        }
        cmd = argv[0];
        while (cmd[0] === '-') {
            cmd = cmd.slice(1);
        }
        if (cmd.length === 1) {
            switch (cmd) {
                case 'h':
                    cmd = "help";
                    break;
                case 'i':
                    cmd = "info";
                    break;
                case 'b':
                    cmd = "bounds";
                    break;
                case 'v':
                    cmd = "version";
                    break;
                case 'l':
                    cmd = "launch";
            }
        }
        if (cmd === 'version') {
            pkg = require(slash.join(__dirname, "..", "package.json"));
            return pkg.version;
        }
        for (i = j = 1, ref = argv.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
            if (argv[i][0] !== '"' && (typeof (base = argv[i]).indexOf === "function" ? base.indexOf(' ') : void 0) >= 0 && argv[i][-1] !== '"') {
                argv[i] = '"' + argv[i] + '"';
            }
        }
        argv[0] = cmd;
        if (true) {
            if (cmd === 'launch' || cmd === 'raise' || cmd === 'focus' || cmd === 'hook') {
                return childp.spawn("\"" + wcexe + "\"", argv, {
                    encoding: 'utf8',
                    shell: true
                });
            } else {
                args = ((function() {
                    var k, len, results;
                    results = [];
                    for (k = 0, len = argv.length; k < len; k++) {
                        s = argv[k];
                        results.push(kstr(s));
                    }
                    return results;
                })()).join(" ");
                outp = childp.execSync("\"" + wcexe + "\" " + args, {
                    encoding: 'utf8',
                    shell: true
                });
                if (cmd === 'quit' && !outp.startsWith('terminated')) {
                    return quit(argv.slice(1));
                }
                return outp;
            }
        }
    } catch (error) {
        err = error;
        return '';
    }
};

wxw = function() {
    var out;
    out = exec.apply(null, [].slice.call(arguments, 0));
    switch (kstr(arguments[0])) {
        case 'info':
        case 'screen':
        case 'mouse':
        case 'trash':
        case 'proc':
            return noon.parse(out.trim());
        default:
            return out;
    }
};

wxw.exec = exec;

module.exports = wxw;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2RUFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFFVixJQUFBLEdBQU87O0FBQ1AsT0FBQSxHQUFVLFNBQUMsSUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFzQixDQUFJLElBQTFCO1FBQUEsSUFBQSxHQUFPLElBQUksR0FBSixDQUFRLEVBQVIsRUFBUDs7SUFDQSxFQUFBLEdBQUssU0FBQyxJQUFEO1FBQ0QsSUFBRyxPQUFPLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQWhCLENBQXlCLEtBQXpCLENBQUg7bUJBQ0ksT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiLEVBREo7O0lBREM7SUFHTCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0IsSUFBbEIsRUFBd0IsQ0FBQyxFQUFELENBQUksQ0FBQyxNQUFMLENBQVksSUFBWixDQUF4QjtJQUNBLElBQUcsR0FBQSxLQUFRLFFBQVIsSUFBQSxHQUFBLEtBQWlCLE9BQWpCLElBQUEsR0FBQSxLQUF5QixPQUE1QjtBQUNJLGVBQU8sR0FEWDs7QUFFQSxXQUFPO0FBVEQ7O0FBV1YsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FB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QUEsYUFDaUMsT0FEakM7QUFBQSxhQUN5QyxNQUR6QzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFKLENBQUEsQ0FBWDtBQUZSO21CQUlRO0FBSlI7QUFKRTs7QUFVTixHQUFHLENBQUMsSUFBSixHQUFXOztBQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAwIDAwMCAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIFxuMDAwMDAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbjAwICAgICAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIFxuIyMjXG5cbm9zICAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICAgPSByZXF1aXJlICdmcydcbmtzdHIgICAgPSByZXF1aXJlICdrc3RyJ1xubm9vbiAgICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCAgID0gcmVxdWlyZSAna3NsYXNoJ1xuY2hpbGRwICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG51ZHAgICAgID0gcmVxdWlyZSAnLi91ZHAnXG5cbnVzY2sgPSBudWxsXG5zZW5kQ21kID0gKGFyZ3MpIC0+XG5cbiAgICB1c2NrID0gbmV3IHVkcCh7fSkgaWYgbm90IHVzY2tcbiAgICBjYiA9IChkYXRhKSAtPiBcbiAgICAgICAgaWYgcHJvY2Vzcy5hcmd2WzFdLmVuZHNXaXRoICd3eHcnXG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQgMFxuICAgIHVzY2suc2VuZENCLmFwcGx5IHVzY2ssIFtjYl0uY29uY2F0IGFyZ3NcbiAgICBpZiBjbWQgaW4gWydsYXVuY2gnICdyYWlzZScgJ2ZvY3VzJ11cbiAgICAgICAgcmV0dXJuICcnXG4gICAgcmV0dXJuICdzaG91bGQgdXNlIHNvY2tldCEnXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHdjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG5lbHNlIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICB3Y2V4ZSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ21jLmFwcCcgJ0NvbnRlbnRzJyAnTWFjT1MnICdtYydcblxucXVpdCA9IChhcmdzKSAtPlxuICAgIFxuICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJyBzbGFzaC5maWxlIGFyZ3NbMF1cbiAgICBpZiBwcm9jbGlzdC5sZW5ndGhcbiAgICAgICAgcHJ0cyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBhcmVudFxuICAgICAgICBwaWRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGlkXG4gICAgICAgIHBpZGwgPSBBcnJheS5mcm9tKHBpZHMpLmZpbHRlciAocCkgLT4gcHJ0cy5oYXMgcFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICB3aGlsZSBwaWQgPSBwaWRsLnNoaWZ0KClcbiAgICAgICAgICAgIGZvciBwcm9jIGluIHByb2NsaXN0XG4gICAgICAgICAgICAgICAgaWYgcHJvYy5waWQgPT0gcGlkXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB3eHcgJ3Rlcm1pbmF0ZScgcGlkXG4gICAgICAgIHJldHVybiBvdXRcbiAgICBlbHNlXG4gICAgICAgIGVycm9yICdubyBwcm9jZXNzJ1xuICAgICcnXG4gICAgXG5leGVjID0gKGFyZ3YuLi4pIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbJ2hlbHAnXSBpZiBub3QgYXJndi5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyBhbmQgY21kIG5vdCBpbiBbJ2hvb2snXVxuICAgICAgICAgICAgIyByZXR1cm4gc2VuZENtZCBhcmd2XG4gICAgICAgICMgZWxzZVxuICAgICAgICBpZiB0cnVlXG4gICAgICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnICdyYWlzZScgJ2ZvY3VzJyAnaG9vayddXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgI3N0ZGlvOidpbmhlcml0J1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFyZ3MgPSAoa3N0cihzKSBmb3IgcyBpbiBhcmd2KS5qb2luIFwiIFwiXG4gICAgICAgICAgICAgICAgb3V0cCA9IGNoaWxkcC5leGVjU3luYyBcIlxcXCIje3djZXhlfVxcXCIgI3thcmdzfVwiIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgY21kID09ICdxdWl0JyBhbmQgbm90IG91dHAuc3RhcnRzV2l0aCAndGVybWluYXRlZCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1aXQgYXJndi5zbGljZSAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dHBcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcmV0dXJuICcnXG4gICAgXG53eHcgPSAtPlxuICAgICAgICAgICAgXG4gICAgb3V0ID0gZXhlYy5hcHBseSBudWxsLCBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMFxuICAgICAgICBcbiAgICBzd2l0Y2gga3N0ciBhcmd1bWVudHNbMF1cbiAgICAgICAgd2hlbiAnaW5mbycgJ3NjcmVlbicgJ21vdXNlJyAndHJhc2gnICdwcm9jJ1xuICAgICAgICAgICAgbm9vbi5wYXJzZSBvdXQudHJpbSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dFxuICAgICAgICAgICAgXG53eHcuZXhlYyA9IGV4ZWNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gd3h3XG4iXX0=
//# sourceURL=../coffee/wxw.coffee