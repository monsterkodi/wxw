// koffee 1.3.0

/*
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
 */
var childp, klog, kstr, noon, ref, slash, wc;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, noon = ref.noon, klog = ref.klog, kstr = ref.kstr;

wc = function() {
    var args, argv, err, escape, out, s, wcexe;
    try {
        argv = [].slice.call(arguments, 0);
        if (argv[0] === 'icon') {
            escape = function(i) {
                if (i < argv.length && argv[i].indexOf(' ') >= 0 && argv[i][0] !== '"' && argv[i][-1] !== '"') {
                    return argv[i] = '"' + argv[i] + '"';
                }
            };
            escape(1);
            escape(2);
        }
        args = ((function() {
            var j, len, results;
            results = [];
            for (j = 0, len = argv.length; j < len; j++) {
                s = argv[j];
                results.push(kstr(s));
            }
            return results;
        })()).join(" ");
        wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));
        out = childp.execSync(wcexe + (" " + args), {
            encoding: 'utf8',
            shell: true
        });
    } catch (error) {
        err = error;
        console.error(err);
        return '';
    }
    switch (kstr(arguments[0])) {
        case 'info':
        case 'screen':
        case 'mouse':
        case 'trash':
            return noon.parse(out);
        default:
            return out;
    }
};

module.exports = wc;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLEVBQUUsbUJBQUYsRUFBVSxpQkFBVixFQUFpQixlQUFqQixFQUF1QixlQUF2QixFQUE2Qjs7QUFFN0IsRUFBQSxHQUFLLFNBQUE7QUFFRCxRQUFBO0FBQUE7UUFDSSxJQUFBLEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFULENBQWMsU0FBZCxFQUF5QixDQUF6QjtRQUVQLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTCxLQUFXLE1BQWQ7WUFFSSxNQUFBLEdBQVMsU0FBQyxDQUFEO2dCQUNMLElBQUcsQ0FBQSxHQUFJLElBQUksQ0FBQyxNQUFULElBQW9CLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFSLENBQWdCLEdBQWhCLENBQUEsSUFBd0IsQ0FBNUMsSUFBa0QsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWhFLElBQXdFLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFDLENBQUQsQ0FBUixLQUFlLEdBQTFGOzJCQUNJLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxHQUFBLEdBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWCxHQUFnQixJQUQ5Qjs7WUFESztZQUdULE1BQUEsQ0FBTyxDQUFQO1lBQ0EsTUFBQSxDQUFPLENBQVAsRUFOSjs7UUFRQSxJQUFBLEdBQU87O0FBQUM7aUJBQUEsc0NBQUE7OzZCQUFBLElBQUEsQ0FBSyxDQUFMO0FBQUE7O1lBQUQsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QjtRQUNQLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLFFBQWpDLENBQWQsQ0FBZDtRQUNSLEdBQUEsR0FBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFBLEdBQU0sQ0FBQSxHQUFBLEdBQUksSUFBSixDQUF0QixFQUFpQztZQUFBLFFBQUEsRUFBUyxNQUFUO1lBQWdCLEtBQUEsRUFBTSxJQUF0QjtTQUFqQyxFQWJWO0tBQUEsYUFBQTtRQWNNO1FBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQO0FBQ0MsZUFBTyxHQWhCWDs7QUFrQkEsWUFBTyxJQUFBLENBQUssU0FBVSxDQUFBLENBQUEsQ0FBZixDQUFQO0FBQUEsYUFDUyxNQURUO0FBQUEsYUFDZ0IsUUFEaEI7QUFBQSxhQUN5QixPQUR6QjtBQUFBLGFBQ2lDLE9BRGpDO21CQUVRLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWDtBQUZSO21CQUlRO0FBSlI7QUFwQkM7O0FBMEJMLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwXG4wMDAgMCAwMDAgIDAwMCAgICAgXG4wMDAwMDAwMDAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgXG4wMCAgICAgMDAgICAwMDAwMDAwXG4jIyNcblxueyBjaGlsZHAsIHNsYXNoLCBub29uLCBrbG9nLCBrc3RyIH0gPSByZXF1aXJlICdreGsnXG5cbndjID0gLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgYXJndiA9IFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgIFxuICAgICAgICBpZiBhcmd2WzBdID09ICdpY29uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlc2NhcGUgPSAoaSkgLT5cbiAgICAgICAgICAgICAgICBpZiBpIDwgYXJndi5sZW5ndGggYW5kIGFyZ3ZbaV0uaW5kZXhPZignICcpID49IDAgYW5kIGFyZ3ZbaV1bMF0gIT0gJ1wiJyBhbmQgYXJndltpXVstMV0gIT0gJ1wiJ1xuICAgICAgICAgICAgICAgICAgICBhcmd2W2ldID0gJ1wiJyArIGFyZ3ZbaV0gKyAnXCInXG4gICAgICAgICAgICBlc2NhcGUgMVxuICAgICAgICAgICAgZXNjYXBlIDJcbiAgICAgICAgXG4gICAgICAgIGFyZ3MgPSAoa3N0cihzKSBmb3IgcyBpbiBhcmd2KS5qb2luIFwiIFwiXG4gICAgICAgIHdjZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdiaW4nICd3Yy5leGUnXG4gICAgICAgIG91dCA9IGNoaWxkcC5leGVjU3luYyB3Y2V4ZStcIiAje2FyZ3N9XCIgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWVcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgIHJldHVybiAnJ1xuICAgIFxuICAgIHN3aXRjaCBrc3RyIGFyZ3VtZW50c1swXVxuICAgICAgICB3aGVuICdpbmZvJyAnc2NyZWVuJyAnbW91c2UnICd0cmFzaCdcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dFxuXG5tb2R1bGUuZXhwb3J0cyA9IHdjXG4iXX0=
//# sourceURL=../coffee/wc.coffee