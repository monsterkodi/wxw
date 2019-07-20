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
    var args, err, out, s, wcexe;
    wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));
    try {
        args = ((function() {
            var i, len, ref1, results;
            ref1 = [].slice.call(arguments, 0);
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                s = ref1[i];
                results.push(kstr(s));
            }
            return results;
        }).apply(this, arguments)).join(" ");
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
            return noon.parse(out);
        default:
            return out;
    }
};

module.exports = wc;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLEVBQUUsbUJBQUYsRUFBVSxpQkFBVixFQUFpQixlQUFqQixFQUF1QixlQUF2QixFQUE2Qjs7QUFFN0IsRUFBQSxHQUFLLFNBQUE7QUFFRCxRQUFBO0lBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsQ0FBZCxDQUFkO0FBRVI7UUFDSSxJQUFBLEdBQU87O0FBQUM7QUFBQTtpQkFBQSxzQ0FBQTs7NkJBQUEsSUFBQSxDQUFLLENBQUw7QUFBQTs7aUNBQUQsQ0FBNkMsQ0FBQyxJQUE5QyxDQUFtRCxHQUFuRDtRQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFBLEdBQU0sQ0FBQSxHQUFBLEdBQUksSUFBSixDQUF0QixFQUFpQztZQUFBLFFBQUEsRUFBUyxNQUFUO1lBQWdCLEtBQUEsRUFBTSxJQUF0QjtTQUFqQyxFQUZWO0tBQUEsYUFBQTtRQUdNO1FBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQO0FBQ0MsZUFBTyxHQUxYOztBQU9BLFlBQU8sSUFBQSxDQUFLLFNBQVUsQ0FBQSxDQUFBLENBQWYsQ0FBUDtBQUFBLGFBQ1MsTUFEVDtBQUFBLGFBQ2dCLFFBRGhCO0FBQUEsYUFDeUIsT0FEekI7bUJBRVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYO0FBRlI7bUJBSVE7QUFKUjtBQVhDOztBQWlCTCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMFxuMDAwIDAgMDAwICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgIFxuMDAgICAgIDAwICAgMDAwMDAwMFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCwgbm9vbiwga2xvZywga3N0ciB9ID0gcmVxdWlyZSAna3hrJ1xuXG53YyA9IC0+XG4gICAgXG4gICAgd2NleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZSdcbiAgICBcbiAgICB0cnlcbiAgICAgICAgYXJncyA9IChrc3RyKHMpIGZvciBzIGluIFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwKS5qb2luIFwiIFwiXHJcbiAgICAgICAgb3V0ID0gY2hpbGRwLmV4ZWNTeW5jIHdjZXhlK1wiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgIGNhdGNoIGVyclxuICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgcmV0dXJuICcnXG4gICAgXG4gICAgc3dpdGNoIGtzdHIoYXJndW1lbnRzWzBdKVxuICAgICAgICB3aGVuICdpbmZvJyAnc2NyZWVuJyAnbW91c2UnXG4gICAgICAgICAgICBub29uLnBhcnNlIG91dFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcblxubW9kdWxlLmV4cG9ydHMgPSB3Y1xuIl19
//# sourceURL=../coffee/wc.coffee