// koffee 1.4.0

/*
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
 */
var childp, empty, exec, fakeIcon, first, fs, klog, kstr, noon, os, quitProcess, ref, slash, wc, wcexe,
    slice = [].slice;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, noon = ref.noon, klog = ref.klog, empty = ref.empty, first = ref.first, kstr = ref.kstr, os = ref.os, fs = ref.fs;

if (os.platform() === 'win32') {
    wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));
} else if (os.platform() === 'darwin') {
    wcexe = slash.resolve(slash.join(__dirname, '..', 'bin', 'mc.app', 'Contents', 'MacOS', 'mc'));
}

fakeIcon = function(argv) {
    var base, err, fakeicon, icon, iconMap, ref1, targetfile;
    iconMap = {
        recycle: 'recycle',
        recycledot: 'recycledot',
        mingw32: 'terminal',
        mingw64: 'terminal',
        msys2: 'terminaldark',
        mintty: 'terminaldark',
        procexp64: 'procexp'
    };
    if (argv.length <= 1) {
        return;
    }
    base = slash.base(argv[1]);
    if (icon = iconMap[base]) {
        targetfile = slash.resolve((ref1 = argv[2]) != null ? ref1 : base + '.png');
        fakeicon = slash.join(__dirname, '..', 'icons', icon + '.png');
        try {
            fs.copyFileSync(fakeicon, targetfile);
            return true;
        } catch (error) {
            err = error;
            console.error(err);
        }
    }
    return false;
};

quitProcess = function(args) {
    var j, len, out, pid, pidl, pids, proc, proclist, prts;
    proclist = wc('proc', slash.file(args[0]));
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
                    out += wc('terminate', pid);
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
    var args, argv, base1, cmd, err, i, j, outp, pkg, ref1, s;
    argv = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    try {
        if (empty(argv)) {
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
        for (i = j = 1, ref1 = argv.length; 1 <= ref1 ? j < ref1 : j > ref1; i = 1 <= ref1 ? ++j : --j) {
            if (argv[i][0] !== '"' && (typeof (base1 = argv[i]).indexOf === "function" ? base1.indexOf(' ') : void 0) >= 0 && argv[i][-1] !== '"') {
                argv[i] = '"' + argv[i] + '"';
            }
        }
        argv[0] = cmd;
        if (cmd === 'icon') {
            if (fakeIcon(argv)) {
                return '';
            }
        }
        if (cmd === 'launch' || cmd === 'raise' || cmd === 'focus' || cmd === 'hook' || cmd === 'bounds') {
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
                return quitProcess(argv.slice(1));
            }
            return outp;
        }
    } catch (error) {
        err = error;
        return '';
    }
};

wc = function() {
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

wc.exec = exec;

module.exports = wc;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtHQUFBO0lBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsZUFBM0MsRUFBaUQsV0FBakQsRUFBcUQ7O0FBRXJELElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCO0lBQ0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsQ0FBZCxDQUFkLEVBRFo7Q0FBQSxNQUVLLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQXBCO0lBQ0QsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLFFBQWpDLEVBQTBDLFVBQTFDLEVBQXFELE9BQXJELEVBQTZELElBQTdELENBQWQsRUFEUDs7O0FBR0wsUUFBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQVksU0FBWjtRQUNBLFVBQUEsRUFBWSxZQURaO1FBRUEsT0FBQSxFQUFZLFVBRlo7UUFHQSxPQUFBLEVBQVksVUFIWjtRQUlBLEtBQUEsRUFBWSxjQUpaO1FBS0EsTUFBQSxFQUFZLGNBTFo7UUFNQSxTQUFBLEVBQVksU0FOWjs7SUFRSixJQUFVLElBQUksQ0FBQyxNQUFMLElBQWUsQ0FBekI7QUFBQSxlQUFBOztJQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFX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LElBQVgsRUFBaUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFULENBQWMsU0FBZCxFQUF5QixDQUF6QixDQUFqQjtBQUVOLFlBQU8sSUFBQSxDQUFLLFNBQVUsQ0FBQSxDQUFBLENBQWYsQ0FBUDtBQUFBLGFBQ1MsTUFEVDtBQUFBLGFBQ2dCLFFBRGhCO0FBQUEsYUFDeUIsT0FEekI7QUFBQSxhQUNpQyxPQURqQztBQUFBLGFBQ3lDLE1BRHpDO21CQUVRLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLElBQUosQ0FBQSxDQUFYO0FBRlI7bUJBSVE7QUFKUjtBQUpDOztBQVVMLEVBQUUsQ0FBQyxJQUFILEdBQVU7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDBcbjAwMCAwIDAwMCAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICBcbjAwICAgICAwMCAgIDAwMDAwMDBcbiMjI1xuXG57IGNoaWxkcCwgc2xhc2gsIG5vb24sIGtsb2csIGVtcHR5LCBmaXJzdCwga3N0ciwgb3MsIGZzIH0gPSByZXF1aXJlICdreGsnXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHdjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG5lbHNlIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICB3Y2V4ZSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ21jLmFwcCcgJ0NvbnRlbnRzJyAnTWFjT1MnICdtYydcblxuZmFrZUljb24gPSAoYXJndikgLT5cbiAgICBcbiAgICBpY29uTWFwID0gXG4gICAgICAgIHJlY3ljbGU6ICAgICdyZWN5Y2xlJ1xuICAgICAgICByZWN5Y2xlZG90OiAncmVjeWNsZWRvdCdcbiAgICAgICAgbWluZ3czMjogICAgJ3Rlcm1pbmFsJ1xuICAgICAgICBtaW5ndzY0OiAgICAndGVybWluYWwnXG4gICAgICAgIG1zeXMyOiAgICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIG1pbnR0eTogICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIHByb2NleHA2NDogICdwcm9jZXhwJ1xuICAgIFxuICAgIHJldHVybiBpZiBhcmd2Lmxlbmd0aCA8PSAxXG4gICAgYmFzZSA9IHNsYXNoLmJhc2UgYXJndlsxXVxuICAgIGlmIGljb24gPSBpY29uTWFwW2Jhc2VdXG4gICAgICAgIHRhcmdldGZpbGUgPSBzbGFzaC5yZXNvbHZlIGFyZ3ZbMl0gPyBiYXNlICsgJy5wbmcnXG4gICAgICAgIGZha2VpY29uID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBpY29uICsgJy5wbmcnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jIGZha2VpY29uLCB0YXJnZXRmaWxlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgIGZhbHNlXG5cbnF1aXRQcm9jZXNzID0gKGFyZ3MpIC0+XG4gICAgXG4gICAgcHJvY2xpc3QgPSB3YyAncHJvYycgc2xhc2guZmlsZSBhcmdzWzBdXG4gICAgaWYgcHJvY2xpc3QubGVuZ3RoXG4gICAgICAgIHBydHMgPSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXJlbnRcbiAgICAgICAgcGlkcyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBpZFxuICAgICAgICBwaWRsID0gQXJyYXkuZnJvbShwaWRzKS5maWx0ZXIgKHApIC0+IHBydHMuaGFzIHBcbiAgICAgICAgb3V0ID0gJydcbiAgICAgICAgd2hpbGUgcGlkID0gcGlkbC5zaGlmdCgpXG4gICAgICAgICAgICBmb3IgcHJvYyBpbiBwcm9jbGlzdFxuICAgICAgICAgICAgICAgIGlmIHByb2MucGlkID09IHBpZFxuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gd2MgJ3Rlcm1pbmF0ZScgcGlkXG4gICAgICAgIHJldHVybiBvdXRcbiAgICBlbHNlXG4gICAgICAgIGVycm9yICdubyBwcm9jZXNzJ1xuICAgICcnXG4gICAgXG5leGVjID0gKGFyZ3YuLi4pIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbJ2hlbHAnXSBpZiBlbXB0eSBhcmd2XG4gICAgICAgIFxuICAgICAgICBjbWQgPSBhcmd2WzBdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBjbWRbMF0gPT0gJy0nIHRoZW4gY21kID0gY21kLnNsaWNlKDEpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY21kLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICBzd2l0Y2ggY21kXG4gICAgICAgICAgICAgICAgd2hlbiAnaCcgdGhlbiBjbWQgPSBcImhlbHBcIiAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdpJyB0aGVuIGNtZCA9IFwiaW5mb1wiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2InIHRoZW4gY21kID0gXCJib3VuZHNcIiAgXG4gICAgICAgICAgICAgICAgd2hlbiAndicgdGhlbiBjbWQgPSBcInZlcnNpb25cIiBcbiAgICAgICAgICAgICAgICB3aGVuICdsJyB0aGVuIGNtZCA9IFwibGF1bmNoXCIgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgPT0gJ3ZlcnNpb24nXG4gICAgICAgICAgICBwa2cgPSByZXF1aXJlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcIi4uXCIgXCJwYWNrYWdlLmpzb25cIlxuICAgICAgICAgICAgcmV0dXJuIHBrZy52ZXJzaW9uXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMS4uLmFyZ3YubGVuZ3RoXVxuICAgICAgICAgICAgaWYgYXJndltpXVswXSAhPSAnXCInIGFuZCBhcmd2W2ldLmluZGV4T2Y/KCcgJykgPj0gMCBhbmQgYXJndltpXVstMV0gIT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGFyZ3ZbaV0gPSAnXCInICsgYXJndltpXSArICdcIidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYXJndlswXSA9IGNtZFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAnaWNvbidcbiAgICAgICAgICAgIGlmIGZha2VJY29uIGFyZ3YgdGhlbiByZXR1cm4gJydcbiAgICAgICAgICAgIFxuICAgICAgICAjIGlmIGNtZCBpbiBbJ2xhdW5jaCcgJ3JhaXNlJyAnZm9jdXMnICdob29rJ11cbiAgICAgICAgaWYgY21kIGluIFsnbGF1bmNoJyAncmFpc2UnICdmb2N1cycgJ2hvb2snICdib3VuZHMnXVxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgI3N0ZGlvOidpbmhlcml0J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgb3V0cCA9IGNoaWxkcC5leGVjU3luYyBcIlxcXCIje3djZXhlfVxcXCIgI3thcmdzfVwiIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNtZCA9PSAncXVpdCcgYW5kIG5vdCBvdXRwLnN0YXJ0c1dpdGggJ3Rlcm1pbmF0ZWQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHF1aXRQcm9jZXNzIGFyZ3Yuc2xpY2UgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gb3V0cFxuICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbndjID0gLT5cbiAgICAgICAgICAgIFxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud2MuZXhlYyA9IGV4ZWNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gd2NcblxuXG4iXX0=
//# sourceURL=../coffee/wc.coffee