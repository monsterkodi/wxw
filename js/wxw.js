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
        if (os.platform() === 'darwin' && (cmd === 'bounds' || cmd === 'launch' || cmd === 'raise' || cmd === 'focus')) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2RUFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFFVixJQUFBLEdBQU87O0FBQ1AsT0FBQSxHQUFVLFNBQUMsSUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFzQixDQUFJLElBQTFCO1FBQUEsSUFBQSxHQUFPLElBQUksR0FBSixDQUFRLEVBQVIsRUFBUDs7SUFDQSxFQUFBLEdBQUssU0FBQyxJQUFEO1FBQ0QsSUFBRyxPQUFPLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQWhCLENBQXlCLEtBQXpCLENBQUg7bUJBQ0ksT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiLEVBREo7O0lBREM7SUFHTCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0IsSUFBbEIsRUFBd0IsQ0FBQyxFQUFELENBQUksQ0FBQyxNQUFMLENBQVksSUFBWixDQUF4QjtXQUNBO0FBUE07O0FBU1YsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxRQUFqQyxDQUFkLENBQWQsRUFEWjtDQUFBLE1BRUssSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENB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QixDQUFqQjtBQUVOLFlBQU8sSUFBQSxDQUFLLFNBQVUsQ0FBQSxDQUFBLENBQWYsQ0FBUDtBQUFBLGFBQ1MsTUFEVDtBQUFBLGFBQ2dCLFFBRGhCO0FBQUEsYUFDeUIsT0FEekI7QUFBQSxhQUNpQyxPQURqQztBQUFBLGFBQ3lDLE1BRHpDO21CQUVRLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLElBQUosQ0FBQSxDQUFYO0FBRlI7bUJBSVE7QUFKUjtBQUpFOztBQVVOLEdBQUcsQ0FBQyxJQUFKLEdBQVc7O0FBRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwIDAgMDAwICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgXG4wMDAwMDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuMDAgICAgIDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgXG4jIyNcblxub3MgICAgICA9IHJlcXVpcmUgJ29zJ1xuZnMgICAgICA9IHJlcXVpcmUgJ2ZzJ1xua3N0ciAgICA9IHJlcXVpcmUgJ2tzdHInXG5ub29uICAgID0gcmVxdWlyZSAnbm9vbidcbnNsYXNoICAgPSByZXF1aXJlICdrc2xhc2gnXG5jaGlsZHAgID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnVkcCAgICAgPSByZXF1aXJlICcuL3VkcCdcblxudXNjayA9IG51bGxcbnNlbmRDbWQgPSAoYXJncykgLT5cblxuICAgIHVzY2sgPSBuZXcgdWRwKHt9KSBpZiBub3QgdXNja1xuICAgIGNiID0gKGRhdGEpIC0+IFxuICAgICAgICBpZiBwcm9jZXNzLmFyZ3ZbMV0uZW5kc1dpdGggJ3d4dydcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCAwXG4gICAgdXNjay5zZW5kQ0IuYXBwbHkgdXNjaywgW2NiXS5jb25jYXQgYXJnc1xuICAgICcnXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHdjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG5lbHNlIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICB3Y2V4ZSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ21jLmFwcCcgJ0NvbnRlbnRzJyAnTWFjT1MnICdtYydcblxucXVpdCA9IChhcmdzKSAtPlxuICAgIFxuICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJyBzbGFzaC5maWxlIGFyZ3NbMF1cbiAgICBpZiBwcm9jbGlzdC5sZW5ndGhcbiAgICAgICAgcHJ0cyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBhcmVudFxuICAgICAgICBwaWRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGlkXG4gICAgICAgIHBpZGwgPSBBcnJheS5mcm9tKHBpZHMpLmZpbHRlciAocCkgLT4gcHJ0cy5oYXMgcFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICB3aGlsZSBwaWQgPSBwaWRsLnNoaWZ0KClcbiAgICAgICAgICAgIGZvciBwcm9jIGluIHByb2NsaXN0XG4gICAgICAgICAgICAgICAgaWYgcHJvYy5waWQgPT0gcGlkXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB3eHcgJ3Rlcm1pbmF0ZScgcGlkXG4gICAgICAgIHJldHVybiBvdXRcbiAgICBlbHNlXG4gICAgICAgIGVycm9yICdubyBwcm9jZXNzJ1xuICAgICcnXG4gICAgXG5leGVjID0gKGFyZ3YuLi4pIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbJ2hlbHAnXSBpZiBub3QgYXJndi5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIGNtZCBpbiBbJ2JvdW5kcycgJ2xhdW5jaCcgJ3JhaXNlJyAnZm9jdXMnXVxuICAgICAgICAgICAgcmV0dXJuIHNlbmRDbWQgYXJndlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnICdyYWlzZScgJ2ZvY3VzJyAnaG9vayddXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUsIGRldGFjaGVkOnRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgICAgIG91dHAgPSBjaGlsZHAuZXhlY1N5bmMgXCJcXFwiI3t3Y2V4ZX1cXFwiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNtZCA9PSAncXVpdCcgYW5kIG5vdCBvdXRwLnN0YXJ0c1dpdGggJ3Rlcm1pbmF0ZWQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWl0IGFyZ3Yuc2xpY2UgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHJldHVybiAnJ1xuICAgIFxud3h3ID0gLT5cbiAgICAgICAgICAgIFxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud3h3LmV4ZWMgPSBleGVjXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IHd4d1xuIl19
//# sourceURL=../coffee/wxw.coffee