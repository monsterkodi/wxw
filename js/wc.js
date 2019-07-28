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
        if (cmd === 'launch') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhGQUFBO0lBQUE7O0FBUUEsTUFBd0QsT0FBQSxDQUFRLEtBQVIsQ0FBeEQsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQyxpQkFBcEMsRUFBMkMsZUFBM0MsRUFBaUQ7O0FBRWpELEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLFFBQWpDLENBQWQsQ0FBZDs7QUFFUixRQUFBLEdBQVcsU0FBQyxJQUFEO0FBRVAsUUFBQTtJQUFBLE9BQUEsR0FDSTtRQUFBLE9BQUEsRUFBWSxTQUFaO1FBQ0EsVUFBQSxFQUFZLFlBRFo7UUFFQSxPQUFBLEVBQVksVUFGWjtRQUdBLE9BQUEsRUFBWSxVQUhaO1FBSUEsS0FBQSxFQUFZLGNBSlo7UUFLQSxNQUFBLEVBQVksY0FMWjtRQU1BLFNBQUEsRUFBWSxTQU5aOztJQVFKLElBQVUsSUFBSSxDQUFDLE1BQUwsSUFBZSxDQUF6QjtBQUFBLGVBQUE7O0lBQ0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSyxDQUFBLENBQUEsQ0FBaEI7SUFDUCxJQUFHLElBQUEsR0FBTyxPQUFRLENBQUEsSUFBQSxDQUFsQjtRQUNJLFVBQUEsR0FBYSxLQUFLLENBQUMsT0FBTixtQ0FBd0IsSUFBQSxHQUFPLE1BQS9CO1FBQ2IsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixPQUEzQixFQUFtQyxJQUFBLEdBQU8sTUFBMUM7QUFDWDtZQUNJLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQTBCLFVBQTFCO0FBQ0EsbUJBQU8sS0FGWDtTQUFBLGFBQUE7WUFHTTtZQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQUpIO1NBSEo7O1dBUUE7QUFyQk87O0FBdUJYLFdBQUEsR0FBYyxTQUFDLElBQUQ7QUFFVixRQUFBO0lBQUEsUUFBQSxHQUFXLEVBQUEsQ0FBRyxNQUFILEVBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFLLENBQUEsQ0FBQSxDQUFoQixDQUFWO0lBQ1gsSUFBRyxRQUFRLENBQUMsTUFBWjtRQUNJLElBQUEsR0FBTyxJQUFJLEdBQUosQ0FBUSxRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUM7UUFBVCxDQUFiLENBQVI7UUFDUCxJQUFBLEdBQU8sSUFBSSxHQUFKLENBQVEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBYixDQUFSO1FBQ1AsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFnQixDQUFDLE1BQWpCLENBQXdCLFNBQUMsQ0FBRDttQkFBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQ7UUFBUCxDQUF4QjtRQUNQLEdBQUEsR0FBTTtBQUNOLGVBQU0sR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQUEsQ0FBWjtBQUNJLGlCQUFBLDBDQUFBOztnQkFDSSxJQUFHLElBQUksQ0FBQyxHQUFMLEtBQVksR0FBZjtvQkFDSSxHQUFBLElBQU8sRUFBQSxDQUFHLFdBQUgsRUFBZSxHQUFmLEVBRFg7O0FBREo7UUFESjtBQUlBLGVBQU8sSUFUWDtLQUFBLE1BQUE7UUFXRyxPQUFBLENBQUMsS0FBRCxDQUFPLFlBQVAsRUFYSDs7V0FZQTtBQWZVOztBQWlCZCxJQUFBLEdBQU8sU0FBQTtBQUVILFFBQUE7SUFGSTtBQUVKO1FBQ0ksSUFBbUIsS0FBQSxDQUFNLElBQU4sQ0FBbkI7WUFBQSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVA7O1FBRUEsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBO0FBRVgsZUFBTSxHQUFJLENBQUEsQ0FBQSxDQUFKLEtBQVUsR0FBaEI7WUFBeUIsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVjtRQUEvQjtRQUVBLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtBQUNJLG9CQUFPLEdBQVA7QUFBQSxxQkFDUyxHQURUO29CQUNrQixHQUFBLEdBQU07QUFBZjtBQURULHFCQUVTLEdBRlQ7b0JBRWtCLEdBQUEsR0FBTTtBQUFmO0FBRlQscUJBR1MsR0FIVDtvQkFHa0IsR0FBQSxHQUFNO0FBQWY7QUFIVCxxQkFJUyxHQUpUO29CQUlrQixHQUFBLEdBQU07QUFBZjtBQUpULHFCQUtTLEdBTFQ7b0JBS2tCLEdBQUEsR0FBTTtBQUx4QixhQURKOztRQVFBLElBQUcsR0FBQSxLQUFPLFNBQVY7WUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixjQUEzQixDQUFSO0FBQ04sbUJBQU8sR0FBRyxDQUFDLFFBRmY7O0FBSUEsYUFBUyx5RkFBVDtZQUNJLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWQsNERBQTZCLENBQUMsUUFBUyxjQUFqQixJQUF5QixDQUEvQyxJQUFxRCxJQUFLLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQyxDQUFELENBQVIsS0FBZSxHQUF2RTtnQkFDSSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBLENBQVgsR0FBZ0IsSUFEOUI7O0FBREo7UUFJQSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVU7UUFFVixJQUFHLEdBQUEsS0FBTyxNQUFWO1lBQ0ksSUFBRyxRQUFBLENBQVMsSUFBVCxDQUFIO0FBQXNCLHVCQUFPLEdBQTdCO2FBREo7O1FBR0EsSUFBRyxHQUFBLEtBQVEsUUFBWDtZQUNJLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBQSxHQUFLLEtBQUwsR0FBVyxJQUF4QixFQUE2QixJQUE3QixFQUFtQztnQkFBQSxRQUFBLEVBQVMsTUFBVDtnQkFBZ0IsS0FBQSxFQUFNLElBQXRCO2dCQUEyQixRQUFBLEVBQVMsSUFBcEM7Z0JBQXlDLEtBQUEsRUFBTSxTQUEvQzthQUFuQztBQUNBLG1CQUFPLEdBRlg7U0FBQSxNQUFBO1lBSUksSUFBQSxHQUFPOztBQUFDO3FCQUFBLHNDQUFBOztpQ0FBQSxJQUFBLENBQUssQ0FBTDtBQUFBOztnQkFBRCxDQUF1QixDQUFDLElBQXhCLENBQTZCLEdBQTdCO1lBQ1AsSUFBQSxHQUFPLE1BQU0sQ0FBQyxRQUFQLENBQWdCLElBQUEsR0FBSyxLQUFMLEdBQVcsS0FBWCxHQUFnQixJQUFoQyxFQUF1QztnQkFBQSxRQUFBLEVBQVMsTUFBVDtnQkFBZ0IsS0FBQSxFQUFNLElBQXRCO2FBQXZDO1lBRVAsSUFBRyxHQUFBLEtBQU8sTUFBUCxJQUFrQixDQUFJLElBQUksQ0FBQyxVQUFMLENBQWdCLFlBQWhCLENBQXpCO0FBQ0ksdUJBQU8sV0FBQSxDQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxDQUFaLEVBRFg7O0FBR0EsbUJBQU8sS0FWWDtTQTVCSjtLQUFBLGFBQUE7UUF1Q007QUFDRixlQUFPLEdBeENYOztBQUZHOztBQTRDUCxFQUFBLEdBQUssU0FBQTtBQUVELFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBVCxDQUFjLFNBQWQsRUFBeUIsQ0FBekIsQ0FBakI7QUFFTixZQUFPLElBQUEsQ0FBSyxTQUFVLENBQUEsQ0FBQSxDQUFmLENBQVA7QUFBQSxhQUNTLE1BRFQ7QUFBQSxhQUNnQixRQURoQjtBQUFBLGFBQ3lCLE9BRHpCO0FBQUEsYUFDaUMsT0FEakM7QUFBQSxhQUN5QyxNQUR6QzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFKLENBQUEsQ0FBWDtBQUZSO21CQUlRO0FBSlI7QUFKQzs7QUFVTCxFQUFFLENBQUMsSUFBSCxHQUFVOztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwXG4wMDAgMCAwMDAgIDAwMCAgICAgXG4wMDAwMDAwMDAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgXG4wMCAgICAgMDAgICAwMDAwMDAwXG4jIyNcblxueyBjaGlsZHAsIHNsYXNoLCBub29uLCBrbG9nLCBlbXB0eSwgZmlyc3QsIGtzdHIsIGZzIH0gPSByZXF1aXJlICdreGsnXG5cbndjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG5cbmZha2VJY29uID0gKGFyZ3YpIC0+XG4gICAgXG4gICAgaWNvbk1hcCA9IFxuICAgICAgICByZWN5Y2xlOiAgICAncmVjeWNsZSdcbiAgICAgICAgcmVjeWNsZWRvdDogJ3JlY3ljbGVkb3QnXG4gICAgICAgIG1pbmd3MzI6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbWluZ3c2NDogICAgJ3Rlcm1pbmFsJ1xuICAgICAgICBtc3lzMjogICAgICAndGVybWluYWxkYXJrJ1xuICAgICAgICBtaW50dHk6ICAgICAndGVybWluYWxkYXJrJ1xuICAgICAgICBwcm9jZXhwNjQ6ICAncHJvY2V4cCdcbiAgICBcbiAgICByZXR1cm4gaWYgYXJndi5sZW5ndGggPD0gMVxuICAgIGJhc2UgPSBzbGFzaC5iYXNlIGFyZ3ZbMV1cbiAgICBpZiBpY29uID0gaWNvbk1hcFtiYXNlXVxuICAgICAgICB0YXJnZXRmaWxlID0gc2xhc2gucmVzb2x2ZSBhcmd2WzJdID8gYmFzZSArICcucG5nJ1xuICAgICAgICBmYWtlaWNvbiA9IHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgaWNvbiArICcucG5nJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyBmYWtlaWNvbiwgdGFyZ2V0ZmlsZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnJcbiAgICBmYWxzZVxuXG5xdWl0UHJvY2VzcyA9IChhcmdzKSAtPlxuICAgIFxuICAgIHByb2NsaXN0ID0gd2MgJ3Byb2MnIHNsYXNoLmZpbGUgYXJnc1swXVxuICAgIGlmIHByb2NsaXN0Lmxlbmd0aFxuICAgICAgICBwcnRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGFyZW50XG4gICAgICAgIHBpZHMgPSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5waWRcbiAgICAgICAgcGlkbCA9IEFycmF5LmZyb20ocGlkcykuZmlsdGVyIChwKSAtPiBwcnRzLmhhcyBwXG4gICAgICAgIG91dCA9ICcnXG4gICAgICAgIHdoaWxlIHBpZCA9IHBpZGwuc2hpZnQoKVxuICAgICAgICAgICAgZm9yIHByb2MgaW4gcHJvY2xpc3RcbiAgICAgICAgICAgICAgICBpZiBwcm9jLnBpZCA9PSBwaWRcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHdjICd0ZXJtaW5hdGUnIHBpZFxuICAgICAgICByZXR1cm4gb3V0XG4gICAgZWxzZVxuICAgICAgICBlcnJvciAnbm8gcHJvY2VzcydcbiAgICAnJ1xuICAgIFxuZXhlYyA9IChhcmd2Li4uKSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBhcmd2ID0gWydoZWxwJ10gaWYgZW1wdHkgYXJndlxuICAgICAgICBcbiAgICAgICAgY21kID0gYXJndlswXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgY21kWzBdID09ICctJyB0aGVuIGNtZCA9IGNtZC5zbGljZSgxKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZC5sZW5ndGggPT0gMVxuICAgICAgICAgICAgc3dpdGNoIGNtZFxuICAgICAgICAgICAgICAgIHdoZW4gJ2gnIHRoZW4gY21kID0gXCJoZWxwXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnaScgdGhlbiBjbWQgPSBcImluZm9cIiAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdiJyB0aGVuIGNtZCA9IFwiYm91bmRzXCIgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3YnIHRoZW4gY21kID0gXCJ2ZXJzaW9uXCIgXG4gICAgICAgICAgICAgICAgd2hlbiAnbCcgdGhlbiBjbWQgPSBcImxhdW5jaFwiICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY21kID09ICd2ZXJzaW9uJ1xuICAgICAgICAgICAgcGtnID0gcmVxdWlyZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCIuLlwiIFwicGFja2FnZS5qc29uXCJcbiAgICAgICAgICAgIHJldHVybiBwa2cudmVyc2lvblxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzEuLi5hcmd2Lmxlbmd0aF1cbiAgICAgICAgICAgIGlmIGFyZ3ZbaV1bMF0gIT0gJ1wiJyBhbmQgYXJndltpXS5pbmRleE9mPygnICcpID49IDAgYW5kIGFyZ3ZbaV1bLTFdICE9ICdcIidcbiAgICAgICAgICAgICAgICBhcmd2W2ldID0gJ1wiJyArIGFyZ3ZbaV0gKyAnXCInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGFyZ3ZbMF0gPSBjbWRcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgPT0gJ2ljb24nXG4gICAgICAgICAgICBpZiBmYWtlSWNvbiBhcmd2IHRoZW4gcmV0dXJuICcnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY21kIGluIFsnbGF1bmNoJ11cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgICAgIHJldHVybiAnJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgb3V0cCA9IGNoaWxkcC5leGVjU3luYyBcIlxcXCIje3djZXhlfVxcXCIgI3thcmdzfVwiIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNtZCA9PSAncXVpdCcgYW5kIG5vdCBvdXRwLnN0YXJ0c1dpdGggJ3Rlcm1pbmF0ZWQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHF1aXRQcm9jZXNzIGFyZ3Yuc2xpY2UgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gb3V0cFxuICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbndjID0gLT5cbiAgICAgICAgICAgIFxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud2MuZXhlYyA9IGV4ZWNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gd2NcblxuXG4iXX0=
//# sourceURL=../coffee/wc.coffee