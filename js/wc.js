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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtHQUFBO0lBQUE7O0FBUUEsTUFBNEQsT0FBQSxDQUFRLEtBQVIsQ0FBNUQsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsZUFBM0MsRUFBaUQsV0FBakQsRUFBcUQ7O0FBRXJELElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCO0lBQ0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsQ0FBZCxDQUFkLEVBRFo7Q0FBQSxNQUVLLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQXBCO0lBQ0QsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLFFBQWpDLEVBQTBDLFVBQTFDLEVBQXFELE9BQXJELEVBQTZELElBQTdELENBQWQsRUFEUDs7O0FBR0wsUUFBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQVksU0FBWjtRQUNBLFVBQUEsRUFBWSxZQURaO1FBRUEsT0FBQSxFQUFZLFVBRlo7UUFHQSxPQUFBLEVBQVksVUFIWjtRQUlBLEtBQUEsRUFBWSxjQUpaO1FBS0EsTUFBQSxFQUFZLGNBTFo7UUFNQSxTQUFBLEVBQVksU0FOWjs7SUFRSixJQUFVLElBQUksQ0FBQyxNQUFMLElBQWUsQ0FBekI7QUFBQSxlQUFBOztJQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFX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S0FBSyxDQUFDLElBQVQsQ0FBYyxTQUFkLEVBQXlCLENBQXpCLENBQWpCO0FBRU4sWUFBTyxJQUFBLENBQUssU0FBVSxDQUFBLENBQUEsQ0FBZixDQUFQO0FBQUEsYUFDUyxNQURUO0FBQUEsYUFDZ0IsUUFEaEI7QUFBQSxhQUN5QixPQUR6QjtBQUFBLGFBQ2lDLE9BRGpDO0FBQUEsYUFDeUMsTUFEekM7bUJBRVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBSixDQUFBLENBQVg7QUFGUjttQkFJUTtBQUpSO0FBSkM7O0FBVUwsRUFBRSxDQUFDLElBQUgsR0FBVTs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMFxuMDAwIDAgMDAwICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgIFxuMDAgICAgIDAwICAgMDAwMDAwMFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCwgbm9vbiwga2xvZywgZW1wdHksIGZpcnN0LCBrc3RyLCBvcywgZnMgfSA9IHJlcXVpcmUgJ2t4aydcblxuaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgd2NleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZSdcbmVsc2UgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgIHdjZXhlID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnYmluJyAnbWMuYXBwJyAnQ29udGVudHMnICdNYWNPUycgJ21jJ1xuXG5mYWtlSWNvbiA9IChhcmd2KSAtPlxuICAgIFxuICAgIGljb25NYXAgPSBcbiAgICAgICAgcmVjeWNsZTogICAgJ3JlY3ljbGUnXG4gICAgICAgIHJlY3ljbGVkb3Q6ICdyZWN5Y2xlZG90J1xuICAgICAgICBtaW5ndzMyOiAgICAndGVybWluYWwnXG4gICAgICAgIG1pbmd3NjQ6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbXN5czI6ICAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgbWludHR5OiAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgcHJvY2V4cDY0OiAgJ3Byb2NleHAnXG4gICAgXG4gICAgcmV0dXJuIGlmIGFyZ3YubGVuZ3RoIDw9IDFcbiAgICBiYXNlID0gc2xhc2guYmFzZSBhcmd2WzFdXG4gICAgaWYgaWNvbiA9IGljb25NYXBbYmFzZV1cbiAgICAgICAgdGFyZ2V0ZmlsZSA9IHNsYXNoLnJlc29sdmUgYXJndlsyXSA/IGJhc2UgKyAnLnBuZydcbiAgICAgICAgZmFrZWljb24gPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnIGljb24gKyAnLnBuZydcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmcy5jb3B5RmlsZVN5bmMgZmFrZWljb24sIHRhcmdldGZpbGVcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgZmFsc2VcblxucXVpdFByb2Nlc3MgPSAoYXJncykgLT5cbiAgICBcbiAgICBwcm9jbGlzdCA9IHdjICdwcm9jJyBzbGFzaC5maWxlIGFyZ3NbMF1cbiAgICBpZiBwcm9jbGlzdC5sZW5ndGhcbiAgICAgICAgcHJ0cyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBhcmVudFxuICAgICAgICBwaWRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGlkXG4gICAgICAgIHBpZGwgPSBBcnJheS5mcm9tKHBpZHMpLmZpbHRlciAocCkgLT4gcHJ0cy5oYXMgcFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICB3aGlsZSBwaWQgPSBwaWRsLnNoaWZ0KClcbiAgICAgICAgICAgIGZvciBwcm9jIGluIHByb2NsaXN0XG4gICAgICAgICAgICAgICAgaWYgcHJvYy5waWQgPT0gcGlkXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB3YyAndGVybWluYXRlJyBwaWRcbiAgICAgICAgcmV0dXJuIG91dFxuICAgIGVsc2VcbiAgICAgICAgZXJyb3IgJ25vIHByb2Nlc3MnXG4gICAgJydcbiAgICBcbmV4ZWMgPSAoYXJndi4uLikgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgYXJndiA9IFsnaGVscCddIGlmIGVtcHR5IGFyZ3ZcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY21kID09ICdpY29uJ1xuICAgICAgICAgICAgaWYgZmFrZUljb24gYXJndiB0aGVuIHJldHVybiAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCBpbiBbJ2xhdW5jaCcgJ3JhaXNlJyAnZm9jdXMnICdob29rJ11cbiAgICAgICAgICAgIHJldHVybiBjaGlsZHAuc3Bhd24gXCJcXFwiI3t3Y2V4ZX1cXFwiXCIsIGFyZ3YsIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlICNzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXJncyA9IChrc3RyKHMpIGZvciBzIGluIGFyZ3YpLmpvaW4gXCIgXCJcbiAgICAgICAgICAgIG91dHAgPSBjaGlsZHAuZXhlY1N5bmMgXCJcXFwiI3t3Y2V4ZX1cXFwiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjbWQgPT0gJ3F1aXQnIGFuZCBub3Qgb3V0cC5zdGFydHNXaXRoICd0ZXJtaW5hdGVkJ1xuICAgICAgICAgICAgICAgIHJldHVybiBxdWl0UHJvY2VzcyBhcmd2LnNsaWNlIDFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIG91dHBcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcmV0dXJuICcnXG4gICAgXG53YyA9IC0+XG4gICAgICAgICAgICBcbiAgICBvdXQgPSBleGVjLmFwcGx5IG51bGwsIFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgIFxuICAgIHN3aXRjaCBrc3RyIGFyZ3VtZW50c1swXVxuICAgICAgICB3aGVuICdpbmZvJyAnc2NyZWVuJyAnbW91c2UnICd0cmFzaCcgJ3Byb2MnXG4gICAgICAgICAgICBub29uLnBhcnNlIG91dC50cmltKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0XG4gICAgICAgICAgICBcbndjLmV4ZWMgPSBleGVjXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IHdjXG5cblxuIl19
//# sourceURL=../coffee/wc.coffee