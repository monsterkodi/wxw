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
    var args, argv, base, err, i, j, out, ref1, ref2, s, wcexe;
    try {
        argv = [].slice.call(arguments, 0);
        for (i = j = 1, ref1 = argv.length; 1 <= ref1 ? j < ref1 : j > ref1; i = 1 <= ref1 ? ++j : --j) {
            if (argv[i][0] !== '"' && (typeof (base = argv[i]).indexOf === "function" ? base.indexOf(' ') : void 0) >= 0 && argv[i][-1] !== '"') {
                argv[i] = '"' + argv[i] + '"';
            }
        }
        wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));
        if ((ref2 = argv[0]) === 'launch') {
            childp.spawn(wcexe, argv, {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
            out = '';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLEVBQUUsbUJBQUYsRUFBVSxpQkFBVixFQUFpQixlQUFqQixFQUF1QixlQUF2QixFQUE2Qjs7QUFFN0IsRUFBQSxHQUFLLFNBQUE7QUFFRCxRQUFBO0FBQUE7UUFDSSxJQUFBLEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFULENBQWMsU0FBZCxFQUF5QixDQUF6QjtBQUVQLGFBQVMseUZBQVQ7WUFDSSxJQUFHLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQVIsS0FBYyxHQUFkLDBEQUE2QixDQUFDLFFBQVMsY0FBakIsSUFBeUIsQ0FBL0MsSUFBcUQsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUMsQ0FBRCxDQUFSLEtBQWUsR0FBdkU7Z0JBQ0ksSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVLEdBQUEsR0FBTSxJQUFLLENBQUEsQ0FBQSxDQUFYLEdBQWdCLElBRDlCOztBQURKO1FBSUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsQ0FBZCxDQUFkO1FBRVIsWUFBRyxJQUFLLENBQUEsQ0FBQSxFQUFMLEtBQVksUUFBZjtZQUNJLE1BQU0sQ0FBQyxLQUFQLENBQWEsS0FBYixFQUFvQixJQUFwQixFQUEwQjtnQkFBQSxRQUFBLEVBQVMsTUFBVDtnQkFBZ0IsS0FBQSxFQUFNLElBQXRCO2dCQUEyQixRQUFBLEVBQVMsSUFBcEM7Z0JBQXlDLEtBQUEsRUFBTSxTQUEvQzthQUExQjtZQUNBLEdBQUEsR0FBTSxHQUZWO1NBQUEsTUFBQTtZQUlJLElBQUEsR0FBTzs7QUFBQztxQkFBQSxzQ0FBQTs7aUNBQUEsSUFBQSxDQUFLLENBQUw7QUFBQTs7Z0JBQUQsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QjtZQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFBLEdBQU0sQ0FBQSxHQUFBLEdBQUksSUFBSixDQUF0QixFQUFpQztnQkFBQSxRQUFBLEVBQVMsTUFBVDtnQkFBZ0IsS0FBQSxFQUFNLElBQXRCO2FBQWpDLEVBTFY7U0FUSjtLQUFBLGFBQUE7UUFlTTtRQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUDtBQUNDLGVBQU8sR0FqQlg7O0FBbUJBLFlBQU8sSUFBQSxDQUFLLFNBQVUsQ0FBQSxDQUFBLENBQWYsQ0FBUDtBQUFBLGFBQ1MsTUFEVDtBQUFBLGFBQ2dCLFFBRGhCO0FBQUEsYUFDeUIsT0FEekI7QUFBQSxhQUNpQyxPQURqQzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVg7QUFGUjttQkFJUTtBQUpSO0FBckJDOztBQTJCTCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMFxuMDAwIDAgMDAwICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgIFxuMDAgICAgIDAwICAgMDAwMDAwMFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCwgbm9vbiwga2xvZywga3N0ciB9ID0gcmVxdWlyZSAna3hrJ1xuXG53YyA9IC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGFyZ3YgPSBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMFxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzEuLi5hcmd2Lmxlbmd0aF1cbiAgICAgICAgICAgIGlmIGFyZ3ZbaV1bMF0gIT0gJ1wiJyBhbmQgYXJndltpXS5pbmRleE9mPygnICcpID49IDAgYW5kIGFyZ3ZbaV1bLTFdICE9ICdcIidcbiAgICAgICAgICAgICAgICBhcmd2W2ldID0gJ1wiJyArIGFyZ3ZbaV0gKyAnXCInXG4gICAgICAgICAgICBcbiAgICAgICAgd2NleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZSdcbiAgICAgICAgXG4gICAgICAgIGlmIGFyZ3ZbMF0gaW4gWydsYXVuY2gnXVxuICAgICAgICAgICAgY2hpbGRwLnNwYXduIHdjZXhlLCBhcmd2LCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICAgICAgb3V0ID0gJydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXJncyA9IChrc3RyKHMpIGZvciBzIGluIGFyZ3YpLmpvaW4gXCIgXCJcbiAgICAgICAgICAgIG91dCA9IGNoaWxkcC5leGVjU3luYyB3Y2V4ZStcIiAje2FyZ3N9XCIgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWVcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgIHJldHVybiAnJ1xuICAgIFxuICAgIHN3aXRjaCBrc3RyIGFyZ3VtZW50c1swXVxuICAgICAgICB3aGVuICdpbmZvJyAnc2NyZWVuJyAnbW91c2UnICd0cmFzaCdcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dFxuXG5tb2R1bGUuZXhwb3J0cyA9IHdjXG4iXX0=
//# sourceURL=../coffee/wc.coffee