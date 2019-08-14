// koffee 1.4.0

/*
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00
 */
var childp, exec, fs, kstr, net, noon, os, quit, sendCmd, slash, udp, useSend, wcexe, wxw,
    slice = [].slice;

os = require('os');

fs = require('fs');

kstr = require('kstr');

noon = require('noon');

slash = require('kslash');

childp = require('child_process');

udp = require('./udp');

net = require('net');

useSend = false;

sendCmd = function(args) {
    var client, gotData;
    gotData = null;
    client = new net.Socket();
    client.on('data', function(data) {
        return gotData = data.toString('utf8');
    });
    client.on('error', function(err) {
        return console.error(JSON.stringify(err));
    });
    client.connect({
        port: 54321,
        host: 'localhost'
    }, function() {
        return client.write(JSON.stringify(args) + "\n\n");
    });
    require('deasync').loopWhile(function() {
        return !gotData;
    });
    return gotData;
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
        if (useSend && os.platform() === 'darwin' && (cmd !== 'hook')) {
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
            return out.trim();
    }
};

wxw.exec = exec;

module.exports = wxw;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRkFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRVYsT0FBQSxHQUFVOztBQUNWLE9BQUEsR0FBVSxTQUFDLElBQUQ7QUFFTixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsTUFBQSxHQUFTLElBQUksR0FBRyxDQUFDLE1BQVIsQ0FBQTtJQUVULE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFpQixTQUFDLElBQUQ7ZUFBVSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkO0lBQXBCLENBQWpCO0lBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQWtCLFNBQUMsR0FBRDtlQUFPLE9BQUEsQ0FBRSxLQUFGLENBQVEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLENBQVI7SUFBUCxDQUFsQjtJQUVBLE1BQU0sQ0FBQyxPQUFQLENBQWU7UUFBQSxJQUFBLEVBQUssS0FBTDtRQUFXLElBQUEsRUFBSyxXQUFoQjtLQUFmLEVBQTJDLFNBQUE7ZUFDdkMsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsQ0FBQSxHQUFxQixNQUFsQztJQUR1QyxDQUEzQztJQUdBLE9BQUEsQ0FBUSxTQUFSLENBQWtCLENBQUMsU0FBbkIsQ0FBNkIsU0FBQTtlQUFHLENBQUk7SUFBUCxDQUE3QjtXQUNBO0FBYk07O0FBZVYsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxRQUFqQyxDQUFkLENBQWQsRUFEWjtDQUFBLE1BRUssSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBcEI7SUFDRCxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsRUFBMEMsVUFBMUMsRUFBcUQsT0FBckQsRUFBNkQsSUFBN0QsQ0FBZCxFQURQOzs7QUFHTCxJQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsUUFBQTtJQUFBLFFBQUEsR0FBVyxHQUFBLENBQUksTUFBSixFQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSyxDQUFBLENBQUEsQ0FBaEIsQ0FBWDtJQUNYLElBQUcsUUFBUSxDQUFDLE1BQVo7UUFDSSxJQUFBLEdBQU8sSUFBSSxHQUFKLENBQVEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBYixDQUFSO1FBQ1AsSUFBQSxHQUFPLElBQUksR0FBSixDQUFRLFFBQVEsQ0FBQyxHQUFULENBQWEsU0FBQyxDQUFEO21CQUFPLENBQUMsQ0FBQztRQUFULENBQWIsQ0FBUjtRQUNQLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBZ0IsQ0FBQyxNQUFqQixDQUF3QixTQUFDLENBQUQ7bUJBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFUO1FBQVAsQ0FBeEI7UUFDUCxHQUFBLEdBQU07QUFDTixlQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFBLENBQVo7QUFDSSxpQkFBQSwwQ0FBQTs7Z0JBQ0ksSUFBRyxJQUFJLENBQUMsR0FBTCxLQUFZLEdBQWY7b0JBQ0ksR0FBQSxJQUFPLEdBQUEsQ0FBSSxXQUFKLEVBQWdCLEdBQWhCLEVBRFg7O0FBREo7UUFESjtBQUlBLGVBQU8sSUFUWDtLQUFBLE1BQUE7UUFXRyxPQUFBLENBQUMsS0FBRCxDQUFPLFlBQVAsRUFYSDs7V0FZQTtBQWZHOztBQWlCUCxJQUFBLEdBQU8sU0FBQTtBQUVILFFBQUE7SUFGSTtBQUVKO1FBQ0ksSUFBbUIsQ0FBSSxJQUFJLENBQUMsTUFBNUI7WUFBQSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVA7O1FBRUEsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBO0FBRVgsZUFBTSxHQUFJLENBQUEsQ0FBQSxDQUFKLEtBQVUsR0FBaEI7WUFBeUIsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVjtRQUEvQjtRQUVBLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtBQUNJLG9CQUFPLEdBQVA7QUFBQSxxQkFDUyxHQURUO29CQUNrQixHQUFBLEdBQU07QUFBZjtBQURULHFCQUVTLEdBRlQ7b0JBRWtCLEdBQUEsR0FBTTtBQUFmO0FBRlQscUJBR1MsR0FIVDtvQkFHa0IsR0FBQSxHQUFNO0FBQWY7QUFIVCxxQkFJUyxHQUpUO29CQUlrQixHQUFBLEdBQU07QUFBZjtBQUpULHFCQUtTLEdBTFQ7b0JBS2tCLEdBQUEsR0FBTTtBQUx4QixhQURKOztRQVFBLElBQUcsR0FBQSxLQUFPLFNBQVY7WUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixjQUEzQixDQUFSO0FBQ04sbUJBQU8sR0FBRyxDQUFDLFFBRmY7O0FBSUEsYUFBUyxvRkFBVDtZQUNJLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWQsMERBQTZCLENBQUMsUUFBUyxjQUFqQixJQUF5QixDQUEvQyxJQUFxRCxJQUFLLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQyxDQUFELENBQVIsS0FBZSxHQUF2RTtnQkFDSSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBLENBQVgsR0FBZ0IsSUFEOUI7O0FBREo7UUFJQSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVU7UUFFVixJQUFHLE9BQUEsSUFBWSxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBN0IsSUFBMEMsQ0FBQSxHQUFBLEtBQVksTUFBWixDQUE3QztBQUNJLG1CQUFPLE9BQUEsQ0FBUSxJQUFSLEVBRFg7U0FBQSxNQUFBO1lBSUksSUFBRyxHQUFBLEtBQVEsUUFBUixJQUFBLEdBQUEsS0FBaUIsT0FBakIsSUFBQSxHQUFBLEtBQXlCLE9BQXpCLElBQUEsR0FBQSxLQUFpQyxNQUFwQztBQUNJLHVCQUFPLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBQSxHQUFLLEtBQUwsR0FBVyxJQUF4QixFQUE2QixJQUE3QixFQUFtQztvQkFBQSxRQUFBLEVBQVMsTUFBVDtvQkFBZ0IsS0FBQSxFQUFNLElBQXRCO29CQUE0QixRQUFBLEVBQVMsSUFBckM7aUJBQW5DLEVBRFg7YUFBQSxNQUFBO2dCQUdJLElBQUEsR0FBTzs7QUFBQzt5QkFBQSxzQ0FBQTs7cUNBQUEsSUFBQSxDQUFLLENBQUw7QUFBQTs7b0JBQUQsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QjtnQkFDUCxJQUFBLEdBQU8sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBQSxHQUFLLEtBQUwsR0FBVyxLQUFYLEdBQWdCLElBQWhDLEVBQXVDO29CQUFBLFFBQUEsRUFBUyxNQUFUO29CQUFnQixLQUFBLEVBQU0sSUFBdEI7aUJBQXZDO2dCQUVQLElBQUcsR0FBQSxLQUFPLE1BQVAsSUFBa0IsQ0FBSSxJQUFJLENBQUMsVUFBTCxDQUFnQixZQUFoQixDQUF6QjtBQUNJLDJCQUFPLElBQUEsQ0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBTCxFQURYOztBQUdBLHVCQUFPLEtBVFg7YUFKSjtTQXpCSjtLQUFBLGFBQUE7UUF1Q007QUFDRixlQUFPLEdBeENYOztBQUZHOztBQTRDUCxHQUFBLEdBQU0sU0FBQTtBQUVGLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFDVixHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBVCxDQUFjLFNBQWQsRUFBeUIsQ0FBekIsQ0FBakI7QUFFTixZQUFPLElBQUEsQ0FBSyxTQUFVLENBQUEsQ0FBQSxDQUFmLENBQVA7QUFBQSxhQUNTLE1BRFQ7QUFBQSxhQUNnQixRQURoQjtBQUFBLGFBQ3lCLE9BRHpCO0FBQUEsYUFDaUMsT0FEakM7QUFBQSxhQUN5QyxNQUR6QzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFKLENBQUEsQ0FBWDtBQUZSO21CQUlRLEdBQUcsQ0FBQyxJQUFKLENBQUE7QUFKUjtBQUxFOztBQVdOLEdBQUcsQ0FBQyxJQUFKLEdBQVc7O0FBRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwIDAgMDAwICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgXG4wMDAwMDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuMDAgICAgIDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgXG4jIyNcblxub3MgICAgICA9IHJlcXVpcmUgJ29zJ1xuZnMgICAgICA9IHJlcXVpcmUgJ2ZzJ1xua3N0ciAgICA9IHJlcXVpcmUgJ2tzdHInXG5ub29uICAgID0gcmVxdWlyZSAnbm9vbidcbnNsYXNoICAgPSByZXF1aXJlICdrc2xhc2gnXG5jaGlsZHAgID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnVkcCAgICAgPSByZXF1aXJlICcuL3VkcCdcbm5ldCAgICAgPSByZXF1aXJlICduZXQnXG5cbnVzZVNlbmQgPSBmYWxzZVxuc2VuZENtZCA9IChhcmdzKSAtPlxuICAgIFxuICAgIGdvdERhdGEgPSBudWxsXG4gICAgXG4gICAgY2xpZW50ID0gbmV3IG5ldC5Tb2NrZXQoKVxuICAgIFxuICAgIGNsaWVudC5vbiAnZGF0YScgKGRhdGEpIC0+IGdvdERhdGEgPSBkYXRhLnRvU3RyaW5nKCd1dGY4JylcbiAgICBjbGllbnQub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBKU09OLnN0cmluZ2lmeShlcnIpXG5cbiAgICBjbGllbnQuY29ubmVjdCBwb3J0OjU0MzIxIGhvc3Q6J2xvY2FsaG9zdCcgLT4gXG4gICAgICAgIGNsaWVudC53cml0ZSBKU09OLnN0cmluZ2lmeShhcmdzKStcIlxcblxcblwiXG4gICAgXG4gICAgcmVxdWlyZSgnZGVhc3luYycpLmxvb3BXaGlsZSAtPiBub3QgZ290RGF0YVxuICAgIGdvdERhdGFcblxuaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgd2NleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZSdcbmVsc2UgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgIHdjZXhlID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnYmluJyAnbWMuYXBwJyAnQ29udGVudHMnICdNYWNPUycgJ21jJ1xuXG5xdWl0ID0gKGFyZ3MpIC0+XG4gICAgXG4gICAgcHJvY2xpc3QgPSB3eHcgJ3Byb2MnIHNsYXNoLmZpbGUgYXJnc1swXVxuICAgIGlmIHByb2NsaXN0Lmxlbmd0aFxuICAgICAgICBwcnRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGFyZW50XG4gICAgICAgIHBpZHMgPSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5waWRcbiAgICAgICAgcGlkbCA9IEFycmF5LmZyb20ocGlkcykuZmlsdGVyIChwKSAtPiBwcnRzLmhhcyBwXG4gICAgICAgIG91dCA9ICcnXG4gICAgICAgIHdoaWxlIHBpZCA9IHBpZGwuc2hpZnQoKVxuICAgICAgICAgICAgZm9yIHByb2MgaW4gcHJvY2xpc3RcbiAgICAgICAgICAgICAgICBpZiBwcm9jLnBpZCA9PSBwaWRcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHd4dyAndGVybWluYXRlJyBwaWRcbiAgICAgICAgcmV0dXJuIG91dFxuICAgIGVsc2VcbiAgICAgICAgZXJyb3IgJ25vIHByb2Nlc3MnXG4gICAgJydcbiAgICBcbmV4ZWMgPSAoYXJndi4uLikgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgYXJndiA9IFsnaGVscCddIGlmIG5vdCBhcmd2Lmxlbmd0aFxuICAgICAgICBcbiAgICAgICAgY21kID0gYXJndlswXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgY21kWzBdID09ICctJyB0aGVuIGNtZCA9IGNtZC5zbGljZSgxKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZC5sZW5ndGggPT0gMVxuICAgICAgICAgICAgc3dpdGNoIGNtZFxuICAgICAgICAgICAgICAgIHdoZW4gJ2gnIHRoZW4gY21kID0gXCJoZWxwXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnaScgdGhlbiBjbWQgPSBcImluZm9cIiAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdiJyB0aGVuIGNtZCA9IFwiYm91bmRzXCIgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3YnIHRoZW4gY21kID0gXCJ2ZXJzaW9uXCIgXG4gICAgICAgICAgICAgICAgd2hlbiAnbCcgdGhlbiBjbWQgPSBcImxhdW5jaFwiICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY21kID09ICd2ZXJzaW9uJ1xuICAgICAgICAgICAgcGtnID0gcmVxdWlyZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCIuLlwiIFwicGFja2FnZS5qc29uXCJcbiAgICAgICAgICAgIHJldHVybiBwa2cudmVyc2lvblxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzEuLi5hcmd2Lmxlbmd0aF1cbiAgICAgICAgICAgIGlmIGFyZ3ZbaV1bMF0gIT0gJ1wiJyBhbmQgYXJndltpXS5pbmRleE9mPygnICcpID49IDAgYW5kIGFyZ3ZbaV1bLTFdICE9ICdcIidcbiAgICAgICAgICAgICAgICBhcmd2W2ldID0gJ1wiJyArIGFyZ3ZbaV0gKyAnXCInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGFyZ3ZbMF0gPSBjbWRcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgdXNlU2VuZCBhbmQgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyBhbmQgY21kIG5vdCBpbiBbJ2hvb2snXVxuICAgICAgICAgICAgcmV0dXJuIHNlbmRDbWQgYXJndlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIGxvZyAnc3Bhd24nIGNtZFxuICAgICAgICAgICAgaWYgY21kIGluIFsnbGF1bmNoJyAncmFpc2UnICdmb2N1cycgJ2hvb2snXVxuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZHAuc3Bhd24gXCJcXFwiI3t3Y2V4ZX1cXFwiXCIsIGFyZ3YsIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlLCBkZXRhY2hlZDp0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IChrc3RyKHMpIGZvciBzIGluIGFyZ3YpLmpvaW4gXCIgXCJcbiAgICAgICAgICAgICAgICBvdXRwID0gY2hpbGRwLmV4ZWNTeW5jIFwiXFxcIiN7d2NleGV9XFxcIiAje2FyZ3N9XCIgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjbWQgPT0gJ3F1aXQnIGFuZCBub3Qgb3V0cC5zdGFydHNXaXRoICd0ZXJtaW5hdGVkJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVpdCBhcmd2LnNsaWNlIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0cFxuICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbnd4dyA9IC0+XG4gXG4gICAgdXNlU2VuZCA9IHRydWVcbiAgICBvdXQgPSBleGVjLmFwcGx5IG51bGwsIFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgIFxuICAgIHN3aXRjaCBrc3RyIGFyZ3VtZW50c1swXVxuICAgICAgICB3aGVuICdpbmZvJyAnc2NyZWVuJyAnbW91c2UnICd0cmFzaCcgJ3Byb2MnXG4gICAgICAgICAgICBub29uLnBhcnNlIG91dC50cmltKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0LnRyaW0oKVxuICAgICAgICAgICAgXG53eHcuZXhlYyA9IGV4ZWNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gd3h3XG4iXX0=
//# sourceURL=../coffee/wxw.coffee