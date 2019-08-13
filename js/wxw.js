// koffee 1.4.0

/*
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00
 */
var childp, exec, fs, kstr, noon, os, quit, sendCmd, slash, udp, usck, useSend, wcexe, wxw,
    slice = [].slice;

os = require('os');

fs = require('fs');

kstr = require('kstr');

noon = require('noon');

slash = require('kslash');

childp = require('child_process');

udp = require('./udp');

useSend = false;

usck = null;

sendCmd = function(args) {
    var cb;
    if (!usck) {
        usck = new udp({});
    }
    cb = function(data) {
        var ref;
        if ((ref = process.argv[1]) != null ? ref.endsWith('wxw') : void 0) {
            return process.exit(0);
        }
    };
    usck.sendCB.apply(usck, [cb].concat(args));
    return '';
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
        if (useSend && os.platform() === 'darwin' && (cmd === 'bounds' || cmd === 'launch' || cmd === 'raise' || cmd === 'focus' || cmd === 'minimize' || cmd === 'maximize')) {
            return sendCmd(argv);
        } else {
            if (cmd === 'launch' || cmd === 'raise' || cmd === 'focus' || cmd === 'hook') {
                return childp.spawn("\"" + wcexe + "\"", argv, {
                    encoding: 'utf8',
                    shell: true,
                    detached: true
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
    useSend = true;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxzRkFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFFVixPQUFBLEdBQVU7O0FBRVYsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFDLElBQUQ7QUFFTixRQUFBO0lBQUEsSUFBc0IsQ0FBSSxJQUExQjtRQUFBLElBQUEsR0FBTyxJQUFJLEdBQUosQ0FBUSxFQUFSLEVBQVA7O0lBQ0EsRUFBQSxHQUFLLFNBQUMsSUFBRDtBQUNELFlBQUE7UUFBQSx5Q0FBa0IsQ0FBRSxRQUFqQixDQUEwQixLQUExQixVQUFIO21CQUNJLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYixFQURKOztJQURDO0lBR0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFaLENBQWtCLElBQWxCLEVBQXdCLENBQUMsRUFBRCxDQUFJLENBQUMsTUFBTCxDQUFZLElBQVosQ0FBeEI7V0FDQTtBQVBNOztBQVNWLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCO0lBQ0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsQ0FBZCxDQUFkLEVBRFo7Q0FBQSxNQUVLLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFB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LEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBVCxDQUFjLFNBQWQsRUFBeUIsQ0FBekIsQ0FBakI7QUFFTixZQUFPLElBQUEsQ0FBSyxTQUFVLENBQUEsQ0FBQSxDQUFmLENBQVA7QUFBQSxhQUNTLE1BRFQ7QUFBQSxhQUNnQixRQURoQjtBQUFBLGFBQ3lCLE9BRHpCO0FBQUEsYUFDaUMsT0FEakM7QUFBQSxhQUN5QyxNQUR6QzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFKLENBQUEsQ0FBWDtBQUZSO21CQUlRO0FBSlI7QUFMRTs7QUFXTixHQUFHLENBQUMsSUFBSixHQUFXOztBQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAwIDAwMCAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIFxuMDAwMDAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbjAwICAgICAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIFxuIyMjXG5cbm9zICAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICAgPSByZXF1aXJlICdmcydcbmtzdHIgICAgPSByZXF1aXJlICdrc3RyJ1xubm9vbiAgICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCAgID0gcmVxdWlyZSAna3NsYXNoJ1xuY2hpbGRwICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG51ZHAgICAgID0gcmVxdWlyZSAnLi91ZHAnXG5cbnVzZVNlbmQgPSBmYWxzZVxuXG51c2NrID0gbnVsbFxuc2VuZENtZCA9IChhcmdzKSAtPlxuXG4gICAgdXNjayA9IG5ldyB1ZHAoe30pIGlmIG5vdCB1c2NrXG4gICAgY2IgPSAoZGF0YSkgLT4gXG4gICAgICAgIGlmIHByb2Nlc3MuYXJndlsxXT8uZW5kc1dpdGggJ3d4dydcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgdXNjay5zZW5kQ0IuYXBwbHkgdXNjaywgW2NiXS5jb25jYXQgYXJnc1xuICAgICcnXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHdjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG5lbHNlIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICB3Y2V4ZSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ21jLmFwcCcgJ0NvbnRlbnRzJyAnTWFjT1MnICdtYydcblxucXVpdCA9IChhcmdzKSAtPlxuICAgIFxuICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJyBzbGFzaC5maWxlIGFyZ3NbMF1cbiAgICBpZiBwcm9jbGlzdC5sZW5ndGhcbiAgICAgICAgcHJ0cyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBhcmVudFxuICAgICAgICBwaWRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGlkXG4gICAgICAgIHBpZGwgPSBBcnJheS5mcm9tKHBpZHMpLmZpbHRlciAocCkgLT4gcHJ0cy5oYXMgcFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICB3aGlsZSBwaWQgPSBwaWRsLnNoaWZ0KClcbiAgICAgICAgICAgIGZvciBwcm9jIGluIHByb2NsaXN0XG4gICAgICAgICAgICAgICAgaWYgcHJvYy5waWQgPT0gcGlkXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB3eHcgJ3Rlcm1pbmF0ZScgcGlkXG4gICAgICAgIHJldHVybiBvdXRcbiAgICBlbHNlXG4gICAgICAgIGVycm9yICdubyBwcm9jZXNzJ1xuICAgICcnXG4gICAgXG5leGVjID0gKGFyZ3YuLi4pIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbJ2hlbHAnXSBpZiBub3QgYXJndi5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHVzZVNlbmQgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIGNtZCBpbiBbJ2JvdW5kcycgJ2xhdW5jaCcgJ3JhaXNlJyAnZm9jdXMnICdtaW5pbWl6ZScgJ21heGltaXplJ11cbiAgICAgICAgICAgIHJldHVybiBzZW5kQ21kIGFyZ3ZcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgY21kIGluIFsnbGF1bmNoJyAncmFpc2UnICdmb2N1cycgJ2hvb2snXVxuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZHAuc3Bhd24gXCJcXFwiI3t3Y2V4ZX1cXFwiXCIsIGFyZ3YsIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlLCBkZXRhY2hlZDp0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IChrc3RyKHMpIGZvciBzIGluIGFyZ3YpLmpvaW4gXCIgXCJcbiAgICAgICAgICAgICAgICBvdXRwID0gY2hpbGRwLmV4ZWNTeW5jIFwiXFxcIiN7d2NleGV9XFxcIiAje2FyZ3N9XCIgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjbWQgPT0gJ3F1aXQnIGFuZCBub3Qgb3V0cC5zdGFydHNXaXRoICd0ZXJtaW5hdGVkJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVpdCBhcmd2LnNsaWNlIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0cFxuICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbnd4dyA9IC0+XG4gICAgICAgIFxuICAgIHVzZVNlbmQgPSB0cnVlXG4gICAgb3V0ID0gZXhlYy5hcHBseSBudWxsLCBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMFxuICAgICAgICBcbiAgICBzd2l0Y2gga3N0ciBhcmd1bWVudHNbMF1cbiAgICAgICAgd2hlbiAnaW5mbycgJ3NjcmVlbicgJ21vdXNlJyAndHJhc2gnICdwcm9jJ1xuICAgICAgICAgICAgbm9vbi5wYXJzZSBvdXQudHJpbSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dFxuICAgICAgICAgICAgXG53eHcuZXhlYyA9IGV4ZWNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gd3h3XG4iXX0=
//# sourceURL=../coffee/wxw.coffee