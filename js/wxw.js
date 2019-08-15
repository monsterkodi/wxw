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
            return (out.trim != null) && out.trim() || out;
    }
};

wxw.exec = exec;

module.exports = wxw;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRkFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRVYsT0FBQSxHQUFVOztBQUNWLE9BQUEsR0FBVSxTQUFDLElBQUQ7QUFFTixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsTUFBQSxHQUFTLElBQUksR0FBRyxDQUFDLE1BQVIsQ0FBQTtJQUVULE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFpQixTQUFDLElBQUQ7ZUFBVSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkO0lBQXBCLENBQWpCO0lBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQWtCLFNBQUMsR0FBRDtlQUFPLE9BQUEsQ0FBRSxLQUFGLENBQVEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLENBQVI7SUFBUCxDQUFsQjtJQUVBLE1BQU0sQ0FBQyxPQUFQLENBQWU7UUFBQSxJQUFBLEVBQUssS0FBTDtRQUFXLElBQUEsRUFBSyxXQUFoQjtLQUFmLEVBQTJDLFNBQUE7ZUFDdkMsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsQ0FBQSxHQUFxQixNQUFsQztJQUR1QyxDQUEzQztJQUdBLE9BQUEsQ0FBUSxTQUFSLENBQWtCLENBQUMsU0FBbkIsQ0FBNkIsU0FBQTtlQUFHLENBQUk7SUFBUCxDQUE3QjtXQUNBO0FBYk07O0FBZVYsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxRQUFqQyxDQUFkLENBQWQsRUFEWjtDQUFBLE1BRUssSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBcEI7SUFDRCxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsRUFBMEMsVUFBMUMsRUFBcUQsT0FBckQsRUFBNkQsSUFBN0QsQ0FBZCxFQURQOzs7QUFHTCxJQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsUUFBQTtJQUFBLFFBQUEsR0FBVyxHQUFBLENBQUksTUFBSixFQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSyxDQUFBLENBQUEsQ0FBaEIsQ0FBWDtJQUNYLElBQUcsUUFBUSxDQUFDLE1BQVo7UUFDSSxJQUFBLEdBQU8sSUFBSSxHQUFKLENBQVEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBYixDQUFSO1FBQ1AsSUFBQSxHQUFPLElBQUksR0FBSixDQUFRLFFBQVEsQ0FBQyxHQUFULENBQWEsU0FBQyxDQUFEO21CQUFPLENBQUMsQ0FBQztRQUFULENBQWIsQ0FBUjtRQUNQLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBZ0IsQ0FBQyxNQUFqQixDQUF3QixTQUFDLENBQUQ7bUJBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFUO1FBQVAsQ0FBeEI7UUFDUCxHQUFBLEdBQU07QUFDTixlQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFBLENBQVo7QUFDSSxpQkFBQSwwQ0FBQTs7Z0JBQ0ksSUFBRyxJQUFJLENBQUMsR0FBTCxLQUFZLEdBQWY7b0JBQ0ksR0FBQSxJQUFPLEdBQUEsQ0FBSSxXQUFKLEVBQWdCLEdBQWhCLEVBRFg7O0FBREo7UUFESjtBQUlBLGVBQU8sSUFUWDtLQUFBLE1BQUE7UUFXRyxPQUFBLENBQUMsS0FBRCxDQUFPLFlBQVAsRUFYSDs7V0FZQTtBQWZHOztBQWlCUCxJQUFBLEdBQU8sU0FBQTtBQUVILFFBQUE7SUFGSTtBQUVKO1FBQ0ksSUFBbUIsQ0FBSSxJQUFJLENBQUMsTUFBNUI7WUFBQSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVA7O1FBRUEsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBO0FBRVgsZUFBTSxHQUFJLENBQUEsQ0FBQSxDQUFKLEtBQVUsR0FBaEI7WUFBeUIsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVjtRQUEvQjtRQUVBLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtBQUNJLG9CQUFPLEdBQVA7QUFBQSxxQkFDUyxHQURUO29CQUNrQixHQUFBLEdBQU07QUFBZjtBQURULHFCQUVTLEdBRlQ7b0JBRWtCLEdBQUEsR0FBTTtBQUFmO0FBRlQscUJBR1MsR0FIVDtvQkFHa0IsR0FBQSxHQUFNO0FBQWY7QUFIVCxxQkFJUyxHQUpUO29CQUlrQixHQUFBLEdBQU07QUFBZjtBQUpULHFCQUtTLEdBTFQ7b0JBS2tCLEdBQUEsR0FBTTtBQUx4QixhQURKOztRQVFBLElBQUcsR0FBQSxLQUFPLFNBQVY7WUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixjQUEzQixDQUFSO0FBQ04sbUJBQU8sR0FBRyxDQUFDLFFBRmY7O0FBSUEsYUFBUyxvRkFBVDtZQUNJLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWQsMERBQTZCLENBQUMsUUFBUyxjQUFqQixJQUF5QixDQUEvQyxJQUFxRCxJQUFLLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQyxDQUFELENBQVIsS0FBZSxHQUF2RTtnQkFDSSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBLENBQVgsR0FBZ0IsSUFEOUI7O0FBREo7UUFJQSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVU7UUFFVixJQUFHLE9BQUEsSUFBWSxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBN0IsSUFBMEMsQ0FBQSxHQUFBLEtBQVksTUFBWixDQUE3QztBQUNJLG1CQUFPLE9BQUEsQ0FBUSxJQUFSLEVBRFg7U0FBQSxNQUFBO1lBSUksSUFBRyxHQUFBLEtBQVEsUUFBUixJQUFBLEdBQUEsS0FBaUIsT0FBakIsSUFBQSxHQUFBLEtBQXlCLE9BQXpCLElBQUEsR0FBQSxLQUFpQyxNQUFwQztBQUNJLHVCQUFPLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBQSxHQUFLLEtBQUwsR0FBVyxJQUF4QixFQUE2QixJQUE3QixFQUFtQztvQkFBQSxRQUFBLEVBQVMsTUFBVDtvQkFBZ0IsS0FBQSxFQUFNLElBQXRCO29CQUE0QixRQUFBLEVBQVMsSUFBckM7aUJBQW5DLEVBRFg7YUFBQSxNQUFBO2dCQUdJLElBQUEsR0FBTzs7QUFBQzt5QkFBQSxzQ0FBQTs7cUNBQUEsSUFBQSxDQUFLLENBQUw7QUFBQTs7b0JBQUQsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QjtnQkFDUCxJQUFBLEdBQU8sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBQSxHQUFLLEtBQUwsR0FBVyxLQUFYLEdBQWdCLElBQWhDLEVBQXVDO29CQUFBLFFBQUEsRUFBUyxNQUFUO29CQUFnQixLQUFBLEVBQU0sSUFBdEI7aUJBQXZDO2dCQUVQLElBQUcsR0FBQSxLQUFPLE1BQVAsSUFBa0IsQ0FBSSxJQUFJLENBQUMsVUFBTCxDQUFnQixZQUFoQixDQUF6QjtBQUNJLDJCQUFPLElBQUEsQ0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBTCxFQURYOztBQUdBLHVCQUFPLEtBVFg7YUFKSjtTQXpCSjtLQUFBLGFBQUE7UUF1Q007QUFDRixlQUFPLEdBeENYOztBQUZHOztBQTRDUCxHQUFBLEdBQU0sU0FBQTtBQUVGLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFDVixHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBVCxDQUFjLFNBQWQsRUFBeUIsQ0FBekIsQ0FBakI7QUFFTixZQUFPLElBQUEsQ0FBSyxTQUFVLENBQUEsQ0FBQSxDQUFmLENBQVA7QUFBQSxhQUNTLE1BRFQ7QUFBQSxhQUNnQixRQURoQjtBQUFBLGFBQ3lCLE9BRHpCO0FBQUEsYUFDaUMsT0FEakM7QUFBQSxhQUN5QyxNQUR6QzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFKLENBQUEsQ0FBWDtBQUZSO21CQUlRLGtCQUFBLElBQWMsR0FBRyxDQUFDLElBQUosQ0FBQSxDQUFkLElBQTRCO0FBSnBDO0FBTEU7O0FBV04sR0FBRyxDQUFDLElBQUosR0FBVzs7QUFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgMCAwMDAgICAwMDAgMDAwICAgMDAwIDAgMDAwICBcbjAwMDAwMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4wMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICBcbiMjI1xuXG5vcyAgICAgID0gcmVxdWlyZSAnb3MnXG5mcyAgICAgID0gcmVxdWlyZSAnZnMnXG5rc3RyICAgID0gcmVxdWlyZSAna3N0cidcbm5vb24gICAgPSByZXF1aXJlICdub29uJ1xuc2xhc2ggICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmNoaWxkcCAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xudWRwICAgICA9IHJlcXVpcmUgJy4vdWRwJ1xubmV0ICAgICA9IHJlcXVpcmUgJ25ldCdcblxudXNlU2VuZCA9IGZhbHNlXG5zZW5kQ21kID0gKGFyZ3MpIC0+XG4gICAgXG4gICAgZ290RGF0YSA9IG51bGxcbiAgICBcbiAgICBjbGllbnQgPSBuZXcgbmV0LlNvY2tldCgpXG4gICAgXG4gICAgY2xpZW50Lm9uICdkYXRhJyAoZGF0YSkgLT4gZ290RGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKVxuICAgIGNsaWVudC5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIEpTT04uc3RyaW5naWZ5KGVycilcblxuICAgIGNsaWVudC5jb25uZWN0IHBvcnQ6NTQzMjEgaG9zdDonbG9jYWxob3N0JyAtPiBcbiAgICAgICAgY2xpZW50LndyaXRlIEpTT04uc3RyaW5naWZ5KGFyZ3MpK1wiXFxuXFxuXCJcbiAgICBcbiAgICByZXF1aXJlKCdkZWFzeW5jJykubG9vcFdoaWxlIC0+IG5vdCBnb3REYXRhXG4gICAgZ290RGF0YVxuXG5pZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICB3Y2V4ZSA9IHNsYXNoLnVuc2xhc2ggc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnYmluJyAnd2MuZXhlJ1xuZWxzZSBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgd2NleGUgPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICdtYy5hcHAnICdDb250ZW50cycgJ01hY09TJyAnbWMnXG5cbnF1aXQgPSAoYXJncykgLT5cbiAgICBcbiAgICBwcm9jbGlzdCA9IHd4dyAncHJvYycgc2xhc2guZmlsZSBhcmdzWzBdXG4gICAgaWYgcHJvY2xpc3QubGVuZ3RoXG4gICAgICAgIHBydHMgPSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXJlbnRcbiAgICAgICAgcGlkcyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBpZFxuICAgICAgICBwaWRsID0gQXJyYXkuZnJvbShwaWRzKS5maWx0ZXIgKHApIC0+IHBydHMuaGFzIHBcbiAgICAgICAgb3V0ID0gJydcbiAgICAgICAgd2hpbGUgcGlkID0gcGlkbC5zaGlmdCgpXG4gICAgICAgICAgICBmb3IgcHJvYyBpbiBwcm9jbGlzdFxuICAgICAgICAgICAgICAgIGlmIHByb2MucGlkID09IHBpZFxuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gd3h3ICd0ZXJtaW5hdGUnIHBpZFxuICAgICAgICByZXR1cm4gb3V0XG4gICAgZWxzZVxuICAgICAgICBlcnJvciAnbm8gcHJvY2VzcydcbiAgICAnJ1xuICAgIFxuZXhlYyA9IChhcmd2Li4uKSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBhcmd2ID0gWydoZWxwJ10gaWYgbm90IGFyZ3YubGVuZ3RoXG4gICAgICAgIFxuICAgICAgICBjbWQgPSBhcmd2WzBdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBjbWRbMF0gPT0gJy0nIHRoZW4gY21kID0gY21kLnNsaWNlKDEpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY21kLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICBzd2l0Y2ggY21kXG4gICAgICAgICAgICAgICAgd2hlbiAnaCcgdGhlbiBjbWQgPSBcImhlbHBcIiAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdpJyB0aGVuIGNtZCA9IFwiaW5mb1wiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2InIHRoZW4gY21kID0gXCJib3VuZHNcIiAgXG4gICAgICAgICAgICAgICAgd2hlbiAndicgdGhlbiBjbWQgPSBcInZlcnNpb25cIiBcbiAgICAgICAgICAgICAgICB3aGVuICdsJyB0aGVuIGNtZCA9IFwibGF1bmNoXCIgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgPT0gJ3ZlcnNpb24nXG4gICAgICAgICAgICBwa2cgPSByZXF1aXJlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcIi4uXCIgXCJwYWNrYWdlLmpzb25cIlxuICAgICAgICAgICAgcmV0dXJuIHBrZy52ZXJzaW9uXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMS4uLmFyZ3YubGVuZ3RoXVxuICAgICAgICAgICAgaWYgYXJndltpXVswXSAhPSAnXCInIGFuZCBhcmd2W2ldLmluZGV4T2Y/KCcgJykgPj0gMCBhbmQgYXJndltpXVstMV0gIT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGFyZ3ZbaV0gPSAnXCInICsgYXJndltpXSArICdcIidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYXJndlswXSA9IGNtZFxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiB1c2VTZW5kIGFuZCBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nIGFuZCBjbWQgbm90IGluIFsnaG9vayddXG4gICAgICAgICAgICByZXR1cm4gc2VuZENtZCBhcmd2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgbG9nICdzcGF3bicgY21kXG4gICAgICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnICdyYWlzZScgJ2ZvY3VzJyAnaG9vayddXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUsIGRldGFjaGVkOnRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgICAgIG91dHAgPSBjaGlsZHAuZXhlY1N5bmMgXCJcXFwiI3t3Y2V4ZX1cXFwiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNtZCA9PSAncXVpdCcgYW5kIG5vdCBvdXRwLnN0YXJ0c1dpdGggJ3Rlcm1pbmF0ZWQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWl0IGFyZ3Yuc2xpY2UgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHJldHVybiAnJ1xuICAgIFxud3h3ID0gLT5cbiBcbiAgICB1c2VTZW5kID0gdHJ1ZVxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXQudHJpbT8gYW5kIG91dC50cmltKCkgb3Igb3V0XG4gICAgICAgICAgICBcbnd4dy5leGVjID0gZXhlY1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSB3eHdcbiJdfQ==
//# sourceURL=../coffee/wxw.coffee