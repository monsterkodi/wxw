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
        case 'trash':
            return noon.parse(out);
        default:
            return out;
    }
};

module.exports = wc;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLEVBQUUsbUJBQUYsRUFBVSxpQkFBVixFQUFpQixlQUFqQixFQUF1QixlQUF2QixFQUE2Qjs7QUFFN0IsRUFBQSxHQUFLLFNBQUE7QUFFRCxRQUFBO0lBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsQ0FBZCxDQUFkO0FBRVI7UUFDSSxJQUFBLEdBQU87O0FBQUM7QUFBQTtpQkFBQSxzQ0FBQTs7NkJBQUEsSUFBQSxDQUFLLENBQUw7QUFBQTs7aUNBQUQsQ0FBNkMsQ0FBQyxJQUE5QyxDQUFtRCxHQUFuRDtRQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFBLEdBQU0sQ0FBQSxHQUFBLEdBQUksSUFBSixDQUF0QixFQUFpQztZQUFBLFFBQUEsRUFBUyxNQUFUO1lBQWdCLEtBQUEsRUFBTSxJQUF0QjtTQUFqQyxFQUZWO0tBQUEsYUFBQTtRQUdNO1FBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQO0FBQ0MsZUFBTyxHQUxYOztBQU9BLFlBQU8sSUFBQSxDQUFLLFNBQVUsQ0FBQSxDQUFBLENBQWYsQ0FBUDtBQUFBLGFBQ1MsTUFEVDtBQUFBLGFBQ2dCLFFBRGhCO0FBQUEsYUFDeUIsT0FEekI7QUFBQSxhQUNpQyxPQURqQzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVg7QUFGUjttQkFJUTtBQUpSO0FBWEM7O0FBaUJMLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwXG4wMDAgMCAwMDAgIDAwMCAgICAgXG4wMDAwMDAwMDAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgXG4wMCAgICAgMDAgICAwMDAwMDAwXG4jIyNcblxueyBjaGlsZHAsIHNsYXNoLCBub29uLCBrbG9nLCBrc3RyIH0gPSByZXF1aXJlICdreGsnXG5cbndjID0gLT5cbiAgICBcbiAgICB3Y2V4ZSA9IHNsYXNoLnVuc2xhc2ggc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnYmluJyAnd2MuZXhlJ1xuICAgIFxuICAgIHRyeVxuICAgICAgICBhcmdzID0gKGtzdHIocykgZm9yIHMgaW4gW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDApLmpvaW4gXCIgXCJcclxuICAgICAgICBvdXQgPSBjaGlsZHAuZXhlY1N5bmMgd2NleGUrXCIgI3thcmdzfVwiIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIGVycm9yIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbiAgICBzd2l0Y2gga3N0ciBhcmd1bWVudHNbMF1cbiAgICAgICAgd2hlbiAnaW5mbycgJ3NjcmVlbicgJ21vdXNlJyAndHJhc2gnXG4gICAgICAgICAgICBub29uLnBhcnNlIG91dFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcblxubW9kdWxlLmV4cG9ydHMgPSB3Y1xuIl19
//# sourceURL=../coffee/wc.coffee