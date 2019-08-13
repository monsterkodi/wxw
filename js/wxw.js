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

useSend = true;

sendCmd = function(args) {
    var client, gotData;
    gotData = null;
    client = new net.Socket();
    client.on('data', function(data) {
        return gotData = data.toString('utf8');
    });
    client.on('close', function() {});
    client.on('end', function() {});
    client.on('error', function(err) {
        return console.error(JSON.stringify(err));
    });
    client.connect({
        port: 54321,
        host: 'localhost'
    }, function() {
        console.log(JSON.stringify(args));
        return client.write(JSON.stringify(args) + "\n\n");
    });
    require('deasync').loopWhile(function() {
        return !gotData;
    });
    console.log(gotData);
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
            console.log('spawn', cmd);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRkFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRVYsT0FBQSxHQUFVOztBQUNWLE9BQUEsR0FBVSxTQUFDLElBQUQ7QUFJTixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsTUFBQSxHQUFTLElBQUksR0FBRyxDQUFDLE1BQVIsQ0FBQTtJQUVULE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFpQixTQUFDLElBQUQ7ZUFBVSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkO0lBQXBCLENBQWpCO0lBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQW9CLFNBQUEsR0FBQSxDQUFwQjtJQUNBLE1BQU0sQ0FBQyxFQUFQLENBQVUsS0FBVixFQUFvQixTQUFBLEdBQUEsQ0FBcEI7SUFDQSxNQUFNLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBa0IsU0FBQyxHQUFEO2VBQU8sT0FBQSxDQUFFLEtBQUYsQ0FBUSxJQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsQ0FBUjtJQUFQLENBQWxCO0lBRUEsTUFBTSxDQUFDLE9BQVAsQ0FBZTtRQUFBLElBQUEsRUFBSyxLQUFMO1FBQVcsSUFBQSxFQUFLLFdBQWhCO0tBQWYsRUFBMkMsU0FBQTtRQUN4QyxPQUFBLENBQUMsR0FBRCxDQUFLLElBQUks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LFFBQVAsQ0FBZ0IsSUFBQSxHQUFLLEtBQUwsR0FBVyxLQUFYLEdBQWdCLElBQWhDLEVBQXVDO29CQUFBLFFBQUEsRUFBUyxNQUFUO29CQUFnQixLQUFBLEVBQU0sSUFBdEI7aUJBQXZDO2dCQUVQLElBQUcsR0FBQSxLQUFPLE1BQVAsSUFBa0IsQ0FBSSxJQUFJLENBQUMsVUFBTCxDQUFnQixZQUFoQixDQUF6QjtBQUNJLDJCQUFPLElBQUEsQ0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBTCxFQURYOztBQUdBLHVCQUFPLEtBVFg7YUFKSjtTQXpCSjtLQUFBLGFBQUE7UUF1Q007QUFDRixlQUFPLEdBeENYOztBQUZHOztBQTRDUCxHQUFBLEdBQU0sU0FBQTtBQUVGLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFDVixHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBVCxDQUFjLFNBQWQsRUFBeUIsQ0FBekIsQ0FBakI7QUFFTixZQUFPLElBQUEsQ0FBSyxTQUFVLENBQUEsQ0FBQSxDQUFmLENBQVA7QUFBQSxhQUNTLE1BRFQ7QUFBQSxhQUNnQixRQURoQjtBQUFBLGFBQ3lCLE9BRHpCO0FBQUEsYUFDaUMsT0FEakM7QUFBQSxhQUN5QyxNQUR6QzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFKLENBQUEsQ0FBWDtBQUZSO21CQUlRO0FBSlI7QUFMRTs7QUFXTixHQUFHLENBQUMsSUFBSixHQUFXOztBQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAwIDAwMCAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIFxuMDAwMDAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbjAwICAgICAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIFxuIyMjXG5cbm9zICAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICAgPSByZXF1aXJlICdmcydcbmtzdHIgICAgPSByZXF1aXJlICdrc3RyJ1xubm9vbiAgICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCAgID0gcmVxdWlyZSAna3NsYXNoJ1xuY2hpbGRwICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG51ZHAgICAgID0gcmVxdWlyZSAnLi91ZHAnXG5uZXQgICAgID0gcmVxdWlyZSAnbmV0J1xuXG51c2VTZW5kID0gdHJ1ZVxuc2VuZENtZCA9IChhcmdzKSAtPlxuICAgIFxuICAgICMgbG9nICdzZW5kQ21kJyBhcmdzXG4gICAgICAgIFxuICAgIGdvdERhdGEgPSBudWxsXG4gICAgXG4gICAgY2xpZW50ID0gbmV3IG5ldC5Tb2NrZXQoKVxuICAgIFxuICAgIGNsaWVudC5vbiAnZGF0YScgKGRhdGEpIC0+IGdvdERhdGEgPSBkYXRhLnRvU3RyaW5nKCd1dGY4JylcbiAgICBjbGllbnQub24gJ2Nsb3NlJyAgIC0+ICNsb2cgJ0NsaWVudCBzb2NrZXQgY2xvc2UuICdcbiAgICBjbGllbnQub24gJ2VuZCcgICAgIC0+ICNsb2cgJ0NsaWVudCBzb2NrZXQgZGlzY29ubmVjdC4gJ1xuICAgIGNsaWVudC5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIEpTT04uc3RyaW5naWZ5KGVycilcblxuICAgIGNsaWVudC5jb25uZWN0IHBvcnQ6NTQzMjEgaG9zdDonbG9jYWxob3N0JyAtPiBcbiAgICAgICAgbG9nIEpTT04uc3RyaW5naWZ5IGFyZ3NcbiAgICAgICAgY2xpZW50LndyaXRlIEpTT04uc3RyaW5naWZ5KGFyZ3MpK1wiXFxuXFxuXCJcbiAgICBcbiAgICByZXF1aXJlKCdkZWFzeW5jJykubG9vcFdoaWxlIC0+IG5vdCBnb3REYXRhXG4gICAgbG9nIGdvdERhdGFcbiAgICBnb3REYXRhXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHdjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG5lbHNlIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICB3Y2V4ZSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ21jLmFwcCcgJ0NvbnRlbnRzJyAnTWFjT1MnICdtYydcblxucXVpdCA9IChhcmdzKSAtPlxuICAgIFxuICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJyBzbGFzaC5maWxlIGFyZ3NbMF1cbiAgICBpZiBwcm9jbGlzdC5sZW5ndGhcbiAgICAgICAgcHJ0cyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBhcmVudFxuICAgICAgICBwaWRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGlkXG4gICAgICAgIHBpZGwgPSBBcnJheS5mcm9tKHBpZHMpLmZpbHRlciAocCkgLT4gcHJ0cy5oYXMgcFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICB3aGlsZSBwaWQgPSBwaWRsLnNoaWZ0KClcbiAgICAgICAgICAgIGZvciBwcm9jIGluIHByb2NsaXN0XG4gICAgICAgICAgICAgICAgaWYgcHJvYy5waWQgPT0gcGlkXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB3eHcgJ3Rlcm1pbmF0ZScgcGlkXG4gICAgICAgIHJldHVybiBvdXRcbiAgICBlbHNlXG4gICAgICAgIGVycm9yICdubyBwcm9jZXNzJ1xuICAgICcnXG4gICAgXG5leGVjID0gKGFyZ3YuLi4pIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbJ2hlbHAnXSBpZiBub3QgYXJndi5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHVzZVNlbmQgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIGNtZCBub3QgaW4gWydob29rJ11cbiAgICAgICAgICAgIHJldHVybiBzZW5kQ21kIGFyZ3ZcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9nICdzcGF3bicgY21kXG4gICAgICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnICdyYWlzZScgJ2ZvY3VzJyAnaG9vayddXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcC5zcGF3biBcIlxcXCIje3djZXhlfVxcXCJcIiwgYXJndiwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUsIGRldGFjaGVkOnRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgICAgIG91dHAgPSBjaGlsZHAuZXhlY1N5bmMgXCJcXFwiI3t3Y2V4ZX1cXFwiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNtZCA9PSAncXVpdCcgYW5kIG5vdCBvdXRwLnN0YXJ0c1dpdGggJ3Rlcm1pbmF0ZWQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWl0IGFyZ3Yuc2xpY2UgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHJldHVybiAnJ1xuICAgIFxud3h3ID0gLT5cbiBcbiAgICB1c2VTZW5kID0gdHJ1ZVxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud3h3LmV4ZWMgPSBleGVjXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IHd4d1xuIl19
//# sourceURL=../coffee/wxw.coffee