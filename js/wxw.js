// koffee 1.3.0

/*
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00
 */
var childp, exec, fs, kstr, net, noon, os, quit, sendCmd, slash, udp, usck, useSend, wcexe, wxw,
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

usck = null;

sendCmd = function(args) {
    var client, option;
    console.log('sendCmd', args);
    option = {
        host: 'localhost',
        port: 54321
    };
    client = new net.Socket();
    client.on('data', function(data) {
        return console.log('return data: ' + data);
    });
    client.on('close', function() {
        return console.log('Client socket close. ');
    });
    client.on('end', function() {
        return console.log('Client socket disconnect. ');
    });
    client.on('timeout', function() {
        return console.log('Client connection timeout. ');
    });
    client.on('error', function(err) {
        return console.error(JSON.stringify(err));
    });
    client.connect(54321, 'localhost', function() {
        console.log('connected!', JSON.stringify(args));
        return client.write(JSON.stringify(args));
    });
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
    console.log('useSend', arguments);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyRkFBQTtJQUFBOztBQVFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7QUFDVixFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztBQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztBQUNWLEdBQUEsR0FBVSxPQUFBLENBQVEsT0FBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRVYsT0FBQSxHQUFVOztBQUVWLElBQUEsR0FBTzs7QUFDUCxPQUFBLEdBQVUsU0FBQyxJQUFEO0FBQ1AsUUFBQTtJQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssU0FBTCxFQUFlLElBQWY7SUFFQyxNQUFBLEdBQ0k7UUFBQSxJQUFBLEVBQUssV0FBTDtRQUNBLElBQUEsRUFBTSxLQUROOztJQUdKLE1BQUEsR0FBUyxJQUFJLEdBQUcsQ0FBQyxNQUFSLENBQUE7SUFRVCxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBaUIsU0FBQyxJQUFEO2VBQVEsT0FBQSxDQUFFLEdBQUYsQ0FBTSxlQUFBLEdBQWtCLElBQXhCO0lBQVIsQ0FBakI7SUFDQSxNQUFNLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBa0IsU0FBQTtlQUFDLE9BQUEsQ0FBRSxHQUFGLENBQU0sdUJBQU47SUFBRCxDQUFsQjtJQUNBLE1BQU0sQ0FBQyxFQUFQLENBQVUsS0FBVixFQUFnQixTQUFBO2VBQUMsT0FBQSxDQUFFLEdBQUYsQ0FBTSw0QkFBTjtJQUFELENBQWhCO0lBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQW9CLFNBQUE7ZUFBQyxPQUFBLENBQUUsR0FBRixDQUFN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Q0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAwIDAwMCAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIFxuMDAwMDAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbjAwICAgICAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIFxuIyMjXG5cbm9zICAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICAgPSByZXF1aXJlICdmcydcbmtzdHIgICAgPSByZXF1aXJlICdrc3RyJ1xubm9vbiAgICA9IHJlcXVpcmUgJ25vb24nXG5zbGFzaCAgID0gcmVxdWlyZSAna3NsYXNoJ1xuY2hpbGRwICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG51ZHAgICAgID0gcmVxdWlyZSAnLi91ZHAnXG5uZXQgICAgID0gcmVxdWlyZSAnbmV0J1xuXG51c2VTZW5kID0gZmFsc2VcblxudXNjayA9IG51bGxcbnNlbmRDbWQgPSAoYXJncykgLT5cbiAgICBsb2cgJ3NlbmRDbWQnIGFyZ3NcbiAgICAgICAgXG4gICAgb3B0aW9uID0gXG4gICAgICAgIGhvc3Q6J2xvY2FsaG9zdCdcbiAgICAgICAgcG9ydDogNTQzMjFcblxuICAgIGNsaWVudCA9IG5ldyBuZXQuU29ja2V0KClcbiAgICAjIGNsaWVudCA9IG5ldC5jcmVhdGVDb25uZWN0aW9uIG9wdGlvbiwgLT5cbiAgICAgICAgIyBsb2cgJ0Nvbm5lY3Rpb24gbG9jYWwgYWRkcmVzcyA6ICcgKyBjbGllbnQubG9jYWxBZGRyZXNzICsgXCI6XCIgKyBjbGllbnQubG9jYWxQb3J0XG4gICAgICAgICMgbG9nICdDb25uZWN0aW9uIHJlbW90ZSBhZGRyZXNzIDogJyArIGNsaWVudC5yZW1vdGVBZGRyZXNzICsgXCI6XCIgKyBjbGllbnQucmVtb3RlUG9ydFxuXG4gICAgIyBjbGllbnQuc2V0VGltZW91dCAxMDAwMFxuICAgICMgY2xpZW50LnNldEVuY29kaW5nICd1dGY4J1xuXG4gICAgY2xpZW50Lm9uICdkYXRhJyAoZGF0YSkgLT4gbG9nICdyZXR1cm4gZGF0YTogJyArIGRhdGFcbiAgICBjbGllbnQub24gJ2Nsb3NlJyAtPiBsb2cgJ0NsaWVudCBzb2NrZXQgY2xvc2UuICdcbiAgICBjbGllbnQub24gJ2VuZCcgLT4gbG9nICdDbGllbnQgc29ja2V0IGRpc2Nvbm5lY3QuICdcbiAgICBjbGllbnQub24gJ3RpbWVvdXQnIC0+IGxvZyAnQ2xpZW50IGNvbm5lY3Rpb24gdGltZW91dC4gJ1xuICAgIGNsaWVudC5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIEpTT04uc3RyaW5naWZ5KGVycilcblxuICAgIGNsaWVudC5jb25uZWN0IDU0MzIxLCAnbG9jYWxob3N0JywgLT5cbiAgICAgICAgbG9nICdjb25uZWN0ZWQhJyBKU09OLnN0cmluZ2lmeShhcmdzKVxuICAgICAgICBjbGllbnQud3JpdGUgSlNPTi5zdHJpbmdpZnkoYXJncylcbiAgICBcbiAgICAjIHVzY2sgPSBuZXcgdWRwKHt9KSBpZiBub3QgdXNja1xuICAgICMgY2IgPSAoZGF0YSkgLT4gXG4gICAgICAgICMgaWYgcHJvY2Vzcy5hcmd2WzFdPy5lbmRzV2l0aCAnd3h3J1xuICAgICAgICAgICAgIyBwcm9jZXNzLmV4aXQgMFxuICAgICMgdXNjay5zZW5kQ0IuYXBwbHkgdXNjaywgW2NiXS5jb25jYXQgYXJnc1xuICAgICcnXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHdjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG5lbHNlIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICB3Y2V4ZSA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ21jLmFwcCcgJ0NvbnRlbnRzJyAnTWFjT1MnICdtYydcblxucXVpdCA9IChhcmdzKSAtPlxuICAgIFxuICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJyBzbGFzaC5maWxlIGFyZ3NbMF1cbiAgICBpZiBwcm9jbGlzdC5sZW5ndGhcbiAgICAgICAgcHJ0cyA9IG5ldyBTZXQgcHJvY2xpc3QubWFwIChwKSAtPiBwLnBhcmVudFxuICAgICAgICBwaWRzID0gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGlkXG4gICAgICAgIHBpZGwgPSBBcnJheS5mcm9tKHBpZHMpLmZpbHRlciAocCkgLT4gcHJ0cy5oYXMgcFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICB3aGlsZSBwaWQgPSBwaWRsLnNoaWZ0KClcbiAgICAgICAgICAgIGZvciBwcm9jIGluIHByb2NsaXN0XG4gICAgICAgICAgICAgICAgaWYgcHJvYy5waWQgPT0gcGlkXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB3eHcgJ3Rlcm1pbmF0ZScgcGlkXG4gICAgICAgIHJldHVybiBvdXRcbiAgICBlbHNlXG4gICAgICAgIGVycm9yICdubyBwcm9jZXNzJ1xuICAgICcnXG4gICAgXG5leGVjID0gKGFyZ3YuLi4pIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbJ2hlbHAnXSBpZiBub3QgYXJndi5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHVzZVNlbmQgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIGNtZCBpbiBbJ2JvdW5kcycgJ2xhdW5jaCcgJ3JhaXNlJyAnZm9jdXMnICdtaW5pbWl6ZScgJ21heGltaXplJ11cbiAgICAgICAgICAgIHJldHVybiBzZW5kQ21kIGFyZ3ZcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgY21kIGluIFsnbGF1bmNoJyAncmFpc2UnICdmb2N1cycgJ2hvb2snXVxuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZHAuc3Bhd24gXCJcXFwiI3t3Y2V4ZX1cXFwiXCIsIGFyZ3YsIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlLCBkZXRhY2hlZDp0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IChrc3RyKHMpIGZvciBzIGluIGFyZ3YpLmpvaW4gXCIgXCJcbiAgICAgICAgICAgICAgICBvdXRwID0gY2hpbGRwLmV4ZWNTeW5jIFwiXFxcIiN7d2NleGV9XFxcIiAje2FyZ3N9XCIgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjbWQgPT0gJ3F1aXQnIGFuZCBub3Qgb3V0cC5zdGFydHNXaXRoICd0ZXJtaW5hdGVkJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVpdCBhcmd2LnNsaWNlIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0cFxuICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbnd4dyA9IC0+XG4gXG4gICAgbG9nICd1c2VTZW5kJyBhcmd1bWVudHNcbiAgICBcbiAgICB1c2VTZW5kID0gdHJ1ZVxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJyAncHJvYydcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0LnRyaW0oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud3h3LmV4ZWMgPSBleGVjXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IHd4d1xuIl19
//# sourceURL=../coffee/wxw.coffee