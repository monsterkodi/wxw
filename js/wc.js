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
    var args, argv, err, escape, out, ref1, s, wcexe;
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
        wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));
        if ((ref1 = argv[0]) === 'launch') {
            childp.spawn(wcexe, argv, {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
            out = '';
        } else {
            args = ((function() {
                var j, len, results;
                results = [];
                for (j = 0, len = argv.length; j < len; j++) {
                    s = argv[j];
                    results.push(kstr(s));
                }
                return results;
            })()).join(" ");
            out = childp.execSync(wcexe + (" " + args), {
                encoding: 'utf8',
                shell: true
            });
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLEVBQUUsbUJBQUYsRUFBVSxpQkFBVixFQUFpQixlQUFqQixFQUF1QixlQUF2QixFQUE2Qjs7QUFFN0IsRUFBQSxHQUFLLFNBQUE7QUFFRCxRQUFBO0FBQUE7UUFDSSxJQUFBLEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFULENBQWMsU0FBZCxFQUF5QixDQUF6QjtRQUVQLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTCxLQUFXLE1BQWQ7WUFFSSxNQUFBLEdBQVMsU0FBQyxDQUFEO2dCQUNMLElBQUcsQ0FBQSxHQUFJLElBQUksQ0FBQyxNQUFULElBQW9CLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFSLENBQWdCLEdBQWhCLENBQUEsSUFBd0IsQ0FBNUMsSUFBa0QsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWhFLElBQXdFLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFDLENBQUQsQ0FBUixLQUFlLEdBQTFGOzJCQUNJLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxHQUFBLEdBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWCxHQUFnQixJQUQ5Qjs7WUFESztZQUdULE1BQUEsQ0FBTyxDQUFQO1lBQ0EsTUFBQSxDQUFPLENBQVAsRUFOSjs7UUFRQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxRQUFqQyxDQUFkLENBQWQ7UUFFUixZQUFHLElBQUssQ0FBQSxDQUFBLEVBQUwsS0FBWSxRQUFmO1lBQ0ksTUFBTSxDQUFDLEtBQVAsQ0FBYSxLQUFiLEVBQW9CLElBQXBCLEVBQTBCO2dCQUFBLFFBQUEsRUFBUyxNQUFUO2dCQUFnQixLQUFBLEVBQU0sSUFBdEI7Z0JBQTJCLFFBQUEsRUFBUyxJQUFwQztnQkFBeUMsS0FBQSxFQUFNLFNBQS9DO2FBQTFCO1lBQ0EsR0FBQSxHQUFNLEdBRlY7U0FBQSxNQUFBO1lBSUksSUFBQSxHQUFPOztBQUFDO3FCQUFBLHNDQUFBOztpQ0FBQSxJQUFBLENBQUssQ0FBTDtBQUFBOztnQkFBRCxDQUF1QixDQUFDLElBQXhCLENBQTZCLEdBQTdCO1lBQ1AsR0FBQSxHQUFNLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEtBQUEsR0FBTSxDQUFBLEdBQUEsR0FBSSxJQUFKLENBQXRCLEVBQWlDO2dCQUFBLFFBQUEsRUFBUyxNQUFUO2dCQUFnQixLQUFBLEVBQU0sSUFBdEI7YUFBakMsRUFMVjtTQWJKO0tBQUEsYUFBQTtRQW1CTTtRQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUDtBQUNDLGVBQU8sR0FyQlg7O0FBdUJBLFlBQU8sSUFBQSxDQUFLLFNBQVUsQ0FBQSxDQUFBLENBQWYsQ0FBUDtBQUFBLGFBQ1MsTUFEVDtBQUFBLGFBQ2dCLFFBRGhCO0FBQUEsYUFDeUIsT0FEekI7QUFBQSxhQUNpQyxPQURqQzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVg7QUFGUjttQkFJUTtBQUpSO0FBekJDOztBQStCTCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMFxuMDAwIDAgMDAwICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgIFxuMDAgICAgIDAwICAgMDAwMDAwMFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCwgbm9vbiwga2xvZywga3N0ciB9ID0gcmVxdWlyZSAna3hrJ1xuXG53YyA9IC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMFxuICAgICAgICBcbiAgICAgICAgaWYgYXJndlswXSA9PSAnaWNvbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXNjYXBlID0gKGkpIC0+XG4gICAgICAgICAgICAgICAgaWYgaSA8IGFyZ3YubGVuZ3RoIGFuZCBhcmd2W2ldLmluZGV4T2YoJyAnKSA+PSAwIGFuZCBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV1bLTFdICE9ICdcIidcbiAgICAgICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgZXNjYXBlIDFcbiAgICAgICAgICAgIGVzY2FwZSAyXG4gICAgICAgIFxuICAgICAgICB3Y2V4ZSA9IHNsYXNoLnVuc2xhc2ggc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnYmluJyAnd2MuZXhlJ1xuICAgICAgICBcbiAgICAgICAgaWYgYXJndlswXSBpbiBbJ2xhdW5jaCddXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gd2NleGUsIGFyZ3YsIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnXG4gICAgICAgICAgICBvdXQgPSAnJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gYXJndikuam9pbiBcIiBcIlxuICAgICAgICAgICAgb3V0ID0gY2hpbGRwLmV4ZWNTeW5jIHdjZXhlK1wiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgIGNhdGNoIGVyclxuICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgcmV0dXJuICcnXG4gICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJ1xuICAgICAgICAgICAgbm9vbi5wYXJzZSBvdXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0XG5cbm1vZHVsZS5leHBvcnRzID0gd2NcbiJdfQ==
//# sourceURL=../coffee/wc.coffee