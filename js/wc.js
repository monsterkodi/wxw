// koffee 1.3.0

/*
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
 */
var childp, empty, exec, fakeIcon, fs, klog, kstr, noon, ref, slash, wc,
    slice = [].slice;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, noon = ref.noon, klog = ref.klog, empty = ref.empty, kstr = ref.kstr, fs = ref.fs;

fakeIcon = function(argv) {
    var base, err, fakeicon, icon, iconMap, ref1, targetfile;
    iconMap = {
        recycle: 'recycle',
        recycledot: 'recycledot',
        mingw32: 'terminal',
        mingw64: 'terminal',
        msys2: 'terminaldark',
        mintty: 'terminaldark',
        procexp64: 'procexp'
    };
    if (argv.length <= 1) {
        return;
    }
    base = slash.base(argv[1]);
    if (icon = iconMap[base]) {
        targetfile = slash.resolve((ref1 = argv[2]) != null ? ref1 : base + '.png');
        fakeicon = slash.join(__dirname, '..', 'icons', icon + '.png');
        try {
            fs.copyFileSync(fakeicon, targetfile);
            return true;
        } catch (error) {
            err = error;
            console.error(err);
        }
    }
    return false;
};

exec = function() {
    var args, argv, base1, cmd, err, i, j, pkg, ref1, s, wcexe;
    argv = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    try {
        if (empty(argv)) {
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
        for (i = j = 1, ref1 = argv.length; 1 <= ref1 ? j < ref1 : j > ref1; i = 1 <= ref1 ? ++j : --j) {
            if (argv[i][0] !== '"' && (typeof (base1 = argv[i]).indexOf === "function" ? base1.indexOf(' ') : void 0) >= 0 && argv[i][-1] !== '"') {
                argv[i] = '"' + argv[i] + '"';
            }
        }
        argv[0] = cmd;
        wcexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'wc.exe')));
        if (cmd === 'icon') {
            if (fakeIcon(argv)) {
                return '';
            }
        }
        if (cmd === 'launch') {
            childp.spawn(wcexe, argv, {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
            return '';
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
            return childp.execSync(wcexe + (" " + args), {
                encoding: 'utf8',
                shell: true
            });
        }
    } catch (error) {
        err = error;
        return '';
    }
};

wc = function() {
    var out;
    out = exec.apply(null, [].slice.call(arguments, 0));
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

wc.exec = exec;

module.exports = wc;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1FQUFBO0lBQUE7O0FBUUEsTUFBaUQsT0FBQSxDQUFRLEtBQVIsQ0FBakQsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQzs7QUFFMUMsUUFBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQVksU0FBWjtRQUNBLFVBQUEsRUFBWSxZQURaO1FBRUEsT0FBQSxFQUFZLFVBRlo7UUFHQSxPQUFBLEVBQVksVUFIWjtRQUlBLEtBQUEsRUFBWSxjQUpaO1FBS0EsTUFBQSxFQUFZLGNBTFo7UUFNQSxTQUFBLEVBQVksU0FOWjs7SUFRSixJQUFVLElBQUksQ0FBQyxNQUFMLElBQWUsQ0FBekI7QUFBQSxlQUFBOztJQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUssQ0FBQSxDQUFBLENBQWhCO0lBQ1AsSUFBRyxJQUFBLEdBQU8sT0FBUSxDQUFBLElBQUEsQ0FBbEI7UUFDSSxVQUFBLEdBQWEsS0FBSyxDQUFDLE9BQU4sbUNBQXdCLElBQUEsR0FBTyxNQUEvQjtRQUNiLFFBQUEsR0FBVyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsT0FBM0IsRUFBbUMsSUFBQSxHQUFPLE1BQTFDO0FBQ1g7WUFDSSxFQUFFLENBQUMsWUFBSCxDQUFnQixRQUFoQixFQUEwQixVQUExQjtBQUNBLG1CQUFPLEtBRlg7U0FBQSxhQUFBO1lBR007WUFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFKSDtTQUhKOztXQVFBO0FBckJPOztBQXVCWCxJQUFBLEdBQU8sU0FBQTtBQUVILFFBQUE7SUFGSTtBQUVKO1FBQ0ksSUFBbUIsS0FBQSxDQUFNLElBQU4sQ0FBbkI7WUFBQSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVA7O1FBRUEsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBO0FBRVgsZUFBTSxHQUFJLENBQUEsQ0FBQSxDQUFKLEtBQVUsR0FBaEI7WUFBeUIsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsQ0FBVjtRQUEvQjtRQUVBLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtBQUNJLG9CQUFPLEdBQVA7QUFBQSxxQkFDUyxHQURUO29CQUNrQixHQUFBLEdBQU07QUFBZjtBQURULHFCQUVTLEdBRlQ7b0JBRWtCLEdBQUEsR0FBTTtBQUFmO0FBRlQscUJBR1MsR0FIVDtvQkFHa0IsR0FBQSxHQUFNO0FBQWY7QUFIVCxxQkFJUyxHQUpUO29CQUlrQixHQUFBLEdBQU07QUFBZjtBQUpULHFCQUtTLEdBTFQ7b0JBS2tCLEdBQUEsR0FBTTtBQUx4QixhQURKOztRQVFBLElBQUcsR0FBQSxLQUFPLFNBQVY7WUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixjQUEzQixDQUFSO0FBQ04sbUJBQU8sR0FBRyxDQUFDLFFBRmY7O0FBSUEsYUFBUyx5RkFBVDtZQUNJLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWQsNERBQTZCLENBQUMsUUFBUyxjQUFqQixJQUF5QixDQUEvQyxJQUFxRCxJQUFLLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQyxDQUFELENBQVIsS0FBZSxHQUF2RTtnQkFDSSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBLENBQVgsR0FBZ0IsSUFEOUI7O0FBREo7UUFJQSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVU7UUFFVixLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxRQUFqQyxDQUFkLENBQWQ7UUFFUixJQUFHLEdBQUEsS0FBTyxNQUFWO1lBQ0ksSUFBRyxRQUFBLENBQVMsSUFBVCxDQUFIO0FBQXNCLHVCQUFPLEdBQTdCO2FBREo7O1FBR0EsSUFBRyxHQUFBLEtBQVEsUUFBWDtZQUNJLE1BQU0sQ0FBQyxLQUFQLENBQWEsS0FBYixFQUFvQixJQUFwQixFQUEwQjtnQkFBQSxRQUFBLEVBQVMsTUFBVDtnQkFBZ0IsS0FBQSxFQUFNLElBQXRCO2dCQUEyQixRQUFBLEVBQVMsSUFBcEM7Z0JBQXlDLEtBQUEsRUFBTSxTQUEvQzthQUExQjtBQUNBLG1CQUFPLEdBRlg7U0FBQSxNQUFBO1lBSUksSUFBQSxHQUFPOztBQUFDO3FCQUFBLHNDQUFBOztpQ0FBQSxJQUFBLENBQUssQ0FBTDtBQUFBOztnQkFBRCxDQUF1QixDQUFDLElBQXhCLENBQTZCLEdBQTdCO0FBQ1AsbUJBQU8sTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsS0FBQSxHQUFNLENBQUEsR0FBQSxHQUFJLElBQUosQ0FBdEIsRUFBaUM7Z0JBQUEsUUFBQSxFQUFTLE1BQVQ7Z0JBQWdCLEtBQUEsRUFBTSxJQUF0QjthQUFqQyxFQUxYO1NBOUJKO0tBQUEsYUFBQTtRQW9DTTtBQUNGLGVBQU8sR0FyQ1g7O0FBRkc7O0FBeUNQLEVBQUEsR0FBSyxTQUFBO0FBRUQsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFBaUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFULENBQWMsU0FBZCxFQUF5QixDQUF6QixDQUFqQjtBQUVOLFlBQU8sSUFBQSxDQUFLLFNBQVUsQ0FBQSxDQUFBLENBQWYsQ0FBUDtBQUFBLGFBQ1MsTUFEVDtBQUFBLGFBQ2dCLFFBRGhCO0FBQUEsYUFDeUIsT0FEekI7QUFBQSxhQUNpQyxPQURqQzttQkFFUSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVg7QUFGUjttQkFJUTtBQUpSO0FBSkM7O0FBVUwsRUFBRSxDQUFDLElBQUgsR0FBVTs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMFxuMDAwIDAgMDAwICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgIFxuMDAgICAgIDAwICAgMDAwMDAwMFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCwgbm9vbiwga2xvZywgZW1wdHksIGtzdHIsIGZzIH0gPSByZXF1aXJlICdreGsnXG5cbmZha2VJY29uID0gKGFyZ3YpIC0+XG4gICAgXG4gICAgaWNvbk1hcCA9IFxuICAgICAgICByZWN5Y2xlOiAgICAncmVjeWNsZSdcbiAgICAgICAgcmVjeWNsZWRvdDogJ3JlY3ljbGVkb3QnXG4gICAgICAgIG1pbmd3MzI6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbWluZ3c2NDogICAgJ3Rlcm1pbmFsJ1xuICAgICAgICBtc3lzMjogICAgICAndGVybWluYWxkYXJrJ1xuICAgICAgICBtaW50dHk6ICAgICAndGVybWluYWxkYXJrJ1xuICAgICAgICBwcm9jZXhwNjQ6ICAncHJvY2V4cCdcbiAgICBcbiAgICByZXR1cm4gaWYgYXJndi5sZW5ndGggPD0gMSBcbiAgICBiYXNlID0gc2xhc2guYmFzZSBhcmd2WzFdXG4gICAgaWYgaWNvbiA9IGljb25NYXBbYmFzZV1cbiAgICAgICAgdGFyZ2V0ZmlsZSA9IHNsYXNoLnJlc29sdmUgYXJndlsyXSA/IGJhc2UgKyAnLnBuZydcbiAgICAgICAgZmFrZWljb24gPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnIGljb24gKyAnLnBuZydcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmcy5jb3B5RmlsZVN5bmMgZmFrZWljb24sIHRhcmdldGZpbGVcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgZmFsc2VcblxuZXhlYyA9IChhcmd2Li4uKSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBhcmd2ID0gWydoZWxwJ10gaWYgZW1wdHkgYXJndlxuICAgICAgICBcbiAgICAgICAgY21kID0gYXJndlswXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgY21kWzBdID09ICctJyB0aGVuIGNtZCA9IGNtZC5zbGljZSgxKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZC5sZW5ndGggPT0gMVxuICAgICAgICAgICAgc3dpdGNoIGNtZFxuICAgICAgICAgICAgICAgIHdoZW4gJ2gnIHRoZW4gY21kID0gXCJoZWxwXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnaScgdGhlbiBjbWQgPSBcImluZm9cIiAgICBcbiAgICAgICAgICAgICAgICB3aGVuICdiJyB0aGVuIGNtZCA9IFwiYm91bmRzXCIgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3YnIHRoZW4gY21kID0gXCJ2ZXJzaW9uXCIgXG4gICAgICAgICAgICAgICAgd2hlbiAnbCcgdGhlbiBjbWQgPSBcImxhdW5jaFwiICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY21kID09ICd2ZXJzaW9uJ1xuICAgICAgICAgICAgcGtnID0gcmVxdWlyZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgXCIuLlwiIFwicGFja2FnZS5qc29uXCJcbiAgICAgICAgICAgIHJldHVybiBwa2cudmVyc2lvblxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzEuLi5hcmd2Lmxlbmd0aF1cbiAgICAgICAgICAgIGlmIGFyZ3ZbaV1bMF0gIT0gJ1wiJyBhbmQgYXJndltpXS5pbmRleE9mPygnICcpID49IDAgYW5kIGFyZ3ZbaV1bLTFdICE9ICdcIidcbiAgICAgICAgICAgICAgICBhcmd2W2ldID0gJ1wiJyArIGFyZ3ZbaV0gKyAnXCInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGFyZ3ZbMF0gPSBjbWRcbiAgICAgICAgICAgIFxuICAgICAgICB3Y2V4ZSA9IHNsYXNoLnVuc2xhc2ggc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnYmluJyAnd2MuZXhlJ1xuICAgICAgICBcbiAgICAgICAgaWYgY21kID09ICdpY29uJ1xuICAgICAgICAgICAgaWYgZmFrZUljb24gYXJndiB0aGVuIHJldHVybiAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCBpbiBbJ2xhdW5jaCddXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gd2NleGUsIGFyZ3YsIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlIGRldGFjaGVkOnRydWUgc3RkaW86J2luaGVyaXQnXG4gICAgICAgICAgICByZXR1cm4gJydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXJncyA9IChrc3RyKHMpIGZvciBzIGluIGFyZ3YpLmpvaW4gXCIgXCJcbiAgICAgICAgICAgIHJldHVybiBjaGlsZHAuZXhlY1N5bmMgd2NleGUrXCIgI3thcmdzfVwiIGVuY29kaW5nOid1dGY4JyBzaGVsbDp0cnVlXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHJldHVybiAnJ1xuICAgIFxud2MgPSAtPlxuICAgICAgICAgICAgXG4gICAgb3V0ID0gZXhlYy5hcHBseSBudWxsLCBbXS5zbGljZS5jYWxsIGFyZ3VtZW50cywgMFxuICAgICAgICBcbiAgICBzd2l0Y2gga3N0ciBhcmd1bWVudHNbMF1cbiAgICAgICAgd2hlbiAnaW5mbycgJ3NjcmVlbicgJ21vdXNlJyAndHJhc2gnXG4gICAgICAgICAgICBub29uLnBhcnNlIG91dFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRcbiAgICAgICAgICAgIFxud2MuZXhlYyA9IGV4ZWNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gd2NcbiJdfQ==
//# sourceURL=../coffee/wc.coffee