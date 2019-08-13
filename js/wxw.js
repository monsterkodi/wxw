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
            return out;
    }
};

wxw.exec = exec;

module.exports = wxw;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRkFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRVYsT0FBQSxHQUFVOztBQUNWLE9BQUEsR0FBVSxTQUFDLElBQUQ7QUFFTixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsTUFBQSxHQUFTLElBQUksR0FBRyxDQUFDLE1BQVIsQ0FBQTtJQUVULE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFpQixTQUFDLElBQUQ7ZUFBVSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkO0lBQXBCLENBQWpCO0lBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQWtCLFNBQUMsR0FBRDtlQUFPLE9BQUEsQ0FBRSxLQUFGLENBQVEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLENBQVI7SUFBUCxDQUFsQjtJQUVBLE1BQU0sQ0FBQyxPQUFQLENBQWU7UUFBQSxJQUFBLEVBQUssS0FBTDtRQUFXLElBQUEsRUFBSyxXQUFoQjtLQUFmLEVBQTJDLFNBQUE7ZUFFdkMsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsQ0FBQSxHQUFxQixNQUFsQztJQUZ1QyxDQUEzQztJQUlBLE9BQUEsQ0FBUSxTQUFSLENBQWtCLENBQUMsU0FBbkIsQ0FBNkIsU0FBQTtlQUFHLENB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QSx1QkFBTyxLQVRYO2FBSko7U0F6Qko7S0FBQSxhQUFBO1FBdUNNO0FBQ0YsZUFBTyxHQXhDWDs7QUFGRzs7QUE0Q1AsR0FBQSxHQUFNLFNBQUE7QUFFRixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBQ1YsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQUFpQixFQUFFLENBQUMsS0FBSyxDQUFDLElBQVQsQ0FBYyxTQUFkLEVBQXlCLENBQXpCLENBQWpCO0FBRU4sWUFBTyxJQUFBLENBQUssU0FBVSxDQUFBLENBQUEsQ0FBZixDQUFQO0FBQUEsYUFDUyxNQURUO0FBQUEsYUFDZ0IsUUFEaEI7QUFBQSxhQUN5QixPQUR6QjtBQUFBLGFBQ2lDLE9BRGpDO0FBQUEsYUFDeUMsTUFEekM7bUJBRVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBSixDQUFBLENBQVg7QUFGUjttQkFJUTtBQUpSO0FBTEU7O0FBV04sR0FBRyxDQUFDLElBQUosR0FBVzs7QUFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgMCAwMDAgICAwMDAgMDAwICAgMDAwIDAgMDAwICBcbjAwMDAwMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4wMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICBcbiMjI1xuXG5vcyAgICAgID0gcmVxdWlyZSAnb3MnXG5mcyAgICAgID0gcmVxdWlyZSAnZnMnXG5rc3RyICAgID0gcmVxdWlyZSAna3N0cidcbm5vb24gICAgPSByZXF1aXJlICdub29uJ1xuc2xhc2ggICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmNoaWxkcCAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xudWRwICAgICA9IHJlcXVpcmUgJy4vdWRwJ1xubmV0ICAgICA9IHJlcXVpcmUgJ25ldCdcblxudXNlU2VuZCA9IGZhbHNlXG5zZW5kQ21kID0gKGFyZ3MpIC0+XG4gICAgXG4gICAgZ290RGF0YSA9IG51bGxcbiAgICBcbiAgICBjbGllbnQgPSBuZXcgbmV0LlNvY2tldCgpXG4gICAgXG4gICAgY2xpZW50Lm9uICdkYXRhJyAoZGF0YSkgLT4gZ290RGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKVxuICAgIGNsaWVudC5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIEpTT04uc3RyaW5naWZ5KGVycilcblxuICAgIGNsaWVudC5jb25uZWN0IHBvcnQ6NTQzMjEgaG9zdDonbG9jYWxob3N0JyAtPiBcbiAgICAgICAgIyBsb2cgSlNPTi5zdHJpbmdpZnkgYXJnc1xuICAgICAgICBjbGllbnQud3JpdGUgSlNPTi5zdHJpbmdpZnkoYXJncykrXCJcXG5cXG5cIlxuICAgIFxuICAgIHJlcXVpcmUoJ2RlYXN5bmMnKS5sb29wV2hpbGUgLT4gbm90IGdvdERhdGFcbiAgICAjIGxvZyBnb3REYXRhXG4gICAgZ290RGF0YVxuXG5pZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICB3Y2V4ZSA9IHNsYXNoLnVuc2xhc2ggc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnYmluJyAnd2MuZXhlJ1xuZWxzZSBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgd2NleGUgPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICdtYy5hcHAnICdDb250ZW50cycgJ01hY09TJyAnbWMnXG5cbnF1aXQgPSAoYXJncykgLT5cbiAgICBcbiAgICBwcm9jbGlzdCA9IHd4dyAncHJvYycgc2xhc2guZmlsZSBhcmdzWzBdXG4gICAgaWYgcHJvY2xpc3QubGVuZ3RoXG4gICAgICAgIHBydHMgPSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXJlbnRcbiAgICAgICAgcGlkcyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBpZFxuICAgICAgICBwaWRsID0gQXJyYXkuZnJvbShwaWRzKS5maWx0ZXIgKHApIC0+IHBydHMuaGFzIHBcbiAgICAgICAgb3V0ID0gJydcbiAgICAgICAgd2hpbGUgcGlkID0gcGlkbC5zaGlmdCgpXG4gICAgICAgICAgICBmb3IgcHJvYyBpbiBwcm9jbGlzdFxuICAgICAgICAgICAgICAgIGlmIHByb2MucGlkID09IHBpZFxuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gd3h3ICd0ZXJtaW5hdGUnIHBpZFxuICAgICAgICByZXR1cm4gb3V0XG4gICAgZWxzZVxuICAgICAgICBlcnJvciAnbm8gcHJvY2VzcydcbiAgICAnJ1xuICAgIFxuZXhlYyA9IChhcmd2Li4uKSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBhcmd2ID0gWydoZWxwJ10gaWYgbm90IGFyZ3YubGVuZ3RoXG4gICAgICAgIFxuICAgICAgICBjbWQgPSBhcmd2WzBdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBjbWRbMF0gPT0gJy0nIHRoZW4gY21kID0gY21kLnNsaWNlKDEpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY21kLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICBzd2l0Y2ggY21kXG4gICAgICAgICAgICAgICAgd2hlbiAnaCcgdGhlbiBjbWQgPSBcImhlbHBcIiAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdpJyB0aGVuIGNtZCA9IFwiaW5mb1wiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2InIHRoZW4gY21kID0gXCJib3VuZHNcIiAgXG4gICAgICAgICAgICAgICAgd2hlbiAndicgdGhlbiBjbWQgPSBcInZlcnNpb25cIiBcbiAgICAgICAgICAgICAgICB3aGVuICdsJyB0aGVuIGNtZCA9IFwibGF1bmNoXCIgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgPT0gJ3ZlcnNpb24nXG4gICAgICAgICAgICBwa2cgPSByZXF1aXJlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCBcIi4uXCIgXCJwYWNrYWdlLmpzb25cIlxuICAgICAgICAgICAgcmV0dXJuIHBrZy52ZXJzaW9uXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMS4uLmFyZ3YubGVuZ3RoXVxuICAgICAgICAgICAgaWYgYXJndltpXVswXSAhPSAnXCInIGFuZCBhcmd2W2ldLmluZGV4T2Y/KCcgJykgPj0gMCBhbmQgYXJndltpXVstMV0gIT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGFyZ3ZbaV0gPSAnXCInICsgYXJndltpXSArICdcIidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYXJndlswXSA9IGNtZFxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiB1c2VTZW5kIGFuZCBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nIGFuZCBjbWQgbm90IGluIFsnaG9vayddXG4gICAgICAgICAgICByZXR1cm4gc2VuZENtZCBhcmd2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgbG9nICdzcGF3bicgY21kXG4gICAgICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnICdyYWlzZScgJ2ZvY3VzJyAnaG9vayddXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUsIGRldGFjaGVkOnRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgICAgIG91dHAgPSBjaGlsZHAuZXhlY1N5bmMgXCJcXFwiI3t3Y2V4ZX1cXFwiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNtZCA9PSAncXVpdCcgYW5kIG5vdCBvdXRwLnN0YXJ0c1dpdGggJ3Rlcm1pbmF0ZWQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWl0IGFyZ3Yuc2xpY2UgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHJldHVybiAnJ1xuICAgIFxud3h3ID0gLT5cbiBcbiAgICB1c2VTZW5kID0gdHJ1ZVxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud3h3LmV4ZWMgPSBleGVjXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IHd4d1xuIl19
//# sourceURL=../coffee/wxw.coffee