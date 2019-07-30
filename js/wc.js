// koffee 1.3.0

/*
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
 */
var childp, empty, exec, fakeIcon, first, fs, klog, kstr, noon, quitProcess, ref, slash, wc, wcexe,
    slice = [].slice;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, noon = ref.noon, klog = ref.klog, empty = ref.empty, first = ref.first, kstr = ref.kstr, fs = ref.fs;

wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));

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
        if (cmd === 'launch' || cmd === 'raise' || cmd === 'focus') {
            childp.spawn("\"" + wcexe + "\"", argv, {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
            return '';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhGQUFBO0lBQUE7O0FBUUEsTUFBd0QsT0FBQSxDQUFRLEtBQVIsQ0FBeEQsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsZUFBM0MsRUFBaUQ7O0FBRWpELEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLFFBQWpDLENBQWQsQ0FBZDs7QUFFUixRQUFBLEdBQVcsU0FBQyxJQUFEO0FBRVAsUUFBQTtJQUFBLE9BQUEsR0FDSTtRQUFBLE9BQUEsRUFBWSxTQUFaO1FBQ0EsVUFBQSxFQUFZLFlBRFo7UUFFQSxPQUFBLEVBQVksVUFGWjtRQUdBLE9BQUEsRUFBWSxVQUhaO1FBSUEsS0FBQSxFQUFZLGNBSlo7UUFLQSxNQUFBLEVBQVksY0FMWjtRQU1BLFNBQUEsRUFBWSxTQU5aOztJQVFKLElBQVUsSUFBSSxDQUFDLE1BQUwsSUFBZSxDQUF6QjtBQUFBLGVBQUE7O0lBQ0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSyxDQUFBLENBQUEsQ0FBaEI7SUFDUCxJQUFHLElBQUEsR0FBTyxPQUFRLENBQUEsSUFBQSxDQUFsQjtRQUNJLFVBQUEsR0FBYSxLQUFLLENBQUMsT0FBTixtQ0FBd0IsSUFBQSxHQUFPLE1BQS9CO1FBQ2IsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixPQUEzQixFQUFtQyxJQUFBLEdBQU8sTUFBMUM7QUFDWDtZQUNJLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQTBCLFVBQTFCO0FBQ0EsbUJB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SVE7QUFKUjtBQUpDOztBQVVMLEVBQUUsQ0FBQyxJQUFILEdBQVU7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDBcbjAwMCAwIDAwMCAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICBcbjAwICAgICAwMCAgIDAwMDAwMDBcbiMjI1xuXG57IGNoaWxkcCwgc2xhc2gsIG5vb24sIGtsb2csIGVtcHR5LCBmaXJzdCwga3N0ciwgZnMgfSA9IHJlcXVpcmUgJ2t4aydcblxud2NleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZSdcblxuZmFrZUljb24gPSAoYXJndikgLT5cbiAgICBcbiAgICBpY29uTWFwID0gXG4gICAgICAgIHJlY3ljbGU6ICAgICdyZWN5Y2xlJ1xuICAgICAgICByZWN5Y2xlZG90OiAncmVjeWNsZWRvdCdcbiAgICAgICAgbWluZ3czMjogICAgJ3Rlcm1pbmFsJ1xuICAgICAgICBtaW5ndzY0OiAgICAndGVybWluYWwnXG4gICAgICAgIG1zeXMyOiAgICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIG1pbnR0eTogICAgICd0ZXJtaW5hbGRhcmsnXG4gICAgICAgIHByb2NleHA2NDogICdwcm9jZXhwJ1xuICAgIFxuICAgIHJldHVybiBpZiBhcmd2Lmxlbmd0aCA8PSAxXG4gICAgYmFzZSA9IHNsYXNoLmJhc2UgYXJndlsxXVxuICAgIGlmIGljb24gPSBpY29uTWFwW2Jhc2VdXG4gICAgICAgIHRhcmdldGZpbGUgPSBzbGFzaC5yZXNvbHZlIGFyZ3ZbMl0gPyBiYXNlICsgJy5wbmcnXG4gICAgICAgIGZha2VpY29uID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBpY29uICsgJy5wbmcnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jIGZha2VpY29uLCB0YXJnZXRmaWxlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgIGZhbHNlXG5cbnF1aXRQcm9jZXNzID0gKGFyZ3MpIC0+XG4gICAgXG4gICAgcHJvY2xpc3QgPSB3YyAncHJvYycgc2xhc2guZmlsZSBhcmdzWzBdXG4gICAgaWYgcHJvY2xpc3QubGVuZ3RoXG4gICAgICAgIHBydHMgPSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXJlbnRcbiAgICAgICAgcGlkcyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBpZFxuICAgICAgICBwaWRsID0gQXJyYXkuZnJvbShwaWRzKS5maWx0ZXIgKHApIC0+IHBydHMuaGFzIHBcbiAgICAgICAgb3V0ID0gJydcbiAgICAgICAgd2hpbGUgcGlkID0gcGlkbC5zaGlmdCgpXG4gICAgICAgICAgICBmb3IgcHJvYyBpbiBwcm9jbGlzdFxuICAgICAgICAgICAgICAgIGlmIHByb2MucGlkID09IHBpZFxuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gd2MgJ3Rlcm1pbmF0ZScgcGlkXG4gICAgICAgIHJldHVybiBvdXRcbiAgICBlbHNlXG4gICAgICAgIGVycm9yICdubyBwcm9jZXNzJ1xuICAgICcnXG4gICAgXG5leGVjID0gKGFyZ3YuLi4pIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbJ2hlbHAnXSBpZiBlbXB0eSBhcmd2XG4gICAgICAgIFxuICAgICAgICBjbWQgPSBhcmd2WzBdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBjbWRbMF0gPT0gJy0nIHRoZW4gY21kID0gY21kLnNsaWNlKDEpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY21kLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICBzd2l0Y2ggY21kXG4gICAgICAgICAgICAgICAgd2hlbiAnaCcgdGhlbiBjbWQgPSBcImhlbHBcIiAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdpJyB0aGVuIGNtZCA9IFwiaW5mb1wiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2InIHRoZW4gY21kID0gXCJib3VuZHNcIiAgXG4gICAgICAgICAgICAgICAgd2hlbiAndicgdGhlbiBjbWQgPSBcInZlcnNpb25cIiBcbiAgICAgICAgICAgICAgICB3aGVuICdsJyB0aGVuIGNtZCA9IFwibGF1bmNoXCIgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgPT0gJ3ZlcnNpb24nXG4gICAgICAgICAgICBwa2cgPSByZXF1aXJlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcIi4uXCIgXCJwYWNrYWdlLmpzb25cIlxuICAgICAgICAgICAgcmV0dXJuIHBrZy52ZXJzaW9uXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMS4uLmFyZ3YubGVuZ3RoXVxuICAgICAgICAgICAgaWYgYXJndltpXVswXSAhPSAnXCInIGFuZCBhcmd2W2ldLmluZGV4T2Y/KCcgJykgPj0gMCBhbmQgYXJndltpXVstMV0gIT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGFyZ3ZbaV0gPSAnXCInICsgYXJndltpXSArICdcIidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYXJndlswXSA9IGNtZFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAnaWNvbidcbiAgICAgICAgICAgIGlmIGZha2VJY29uIGFyZ3YgdGhlbiByZXR1cm4gJydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnICdyYWlzZScgJ2ZvY3VzJ11cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgICAgIHJldHVybiAnJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgb3V0cCA9IGNoaWxkcC5leGVjU3luYyBcIlxcXCIje3djZXhlfVxcXCIgI3thcmdzfVwiIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNtZCA9PSAncXVpdCcgYW5kIG5vdCBvdXRwLnN0YXJ0c1dpdGggJ3Rlcm1pbmF0ZWQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHF1aXRQcm9jZXNzIGFyZ3Yuc2xpY2UgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gb3V0cFxuICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbndjID0gLT5cbiAgICAgICAgICAgIFxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud2MuZXhlYyA9IGV4ZWNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gd2NcblxuXG4iXX0=
//# sourceURL=../coffee/wc.coffee