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
            childp.spawn("\"" + wcexe + "\"", argv, {
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
            return childp.execSync("\"" + wcexe + "\" " + args, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1FQUFBO0lBQUE7O0FBUUEsTUFBaUQsT0FBQSxDQUFRLEtBQVIsQ0FBakQsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQzs7QUFFMUMsUUFBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQVksU0FBWjtRQUNBLFVBQUEsRUFBWSxZQURaO1FBRUEsT0FBQSxFQUFZLFVBRlo7UUFHQSxPQUFBLEVBQVksVUFIWjtRQUlBLEtBQUEsRUFBWSxjQUpaO1FBS0EsTUFBQSxFQUFZLGNBTFo7UUFNQSxTQUFBLEVBQVksU0FOWjs7SUFRSixJQUFVLElBQUksQ0FBQyxNQUFMLElBQWUsQ0FBekI7QUFBQSxlQUFBOztJQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUssQ0FBQSxDQUFBLENBQWhCO0lBQ1AsSUFBRyxJQUFBLEdBQU8sT0FBUSxDQUFBLElBQUEsQ0FBbEI7UUFDSSxVQUFBLEdBQWEsS0FBSyxDQUFDLE9BQU4sbUNBQXdCLElBQUEsR0FBTyxNQUEvQjtRQUNiLFFBQUEsR0FBVyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsT0FBM0IsRUFBbUMsSUFBQSxHQUFPLE1BQTFDO0FBQ1g7WUFDSSxFQUFFLENBQUMsWUFBSCxDQUFnQixRQUFoQixFQUEwQixVQUExQjtBQUNBLG1CQUFPLEtBRlg7U0FBQSxhQUFBO1lBR007WUFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFKSDtTQUhKOztXQVFBO0FBckJPOztBQXVCWCxJQUFBLEdBQU8sU0FBQTtBQUVILFFBQUE7SUFGSTtBQUVKO1FBQ0ksSUFBbUIsS0FBQSxDQUFNLElB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LEVBQUUsQ0FBQyxJQUFILEdBQVU7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDBcbjAwMCAwIDAwMCAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICBcbjAwICAgICAwMCAgIDAwMDAwMDBcbiMjI1xuXG57IGNoaWxkcCwgc2xhc2gsIG5vb24sIGtsb2csIGVtcHR5LCBrc3RyLCBmcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5mYWtlSWNvbiA9IChhcmd2KSAtPlxuICAgIFxuICAgIGljb25NYXAgPSBcbiAgICAgICAgcmVjeWNsZTogICAgJ3JlY3ljbGUnXG4gICAgICAgIHJlY3ljbGVkb3Q6ICdyZWN5Y2xlZG90J1xuICAgICAgICBtaW5ndzMyOiAgICAndGVybWluYWwnXG4gICAgICAgIG1pbmd3NjQ6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbXN5czI6ICAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgbWludHR5OiAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgcHJvY2V4cDY0OiAgJ3Byb2NleHAnXG4gICAgXG4gICAgcmV0dXJuIGlmIGFyZ3YubGVuZ3RoIDw9IDEgXG4gICAgYmFzZSA9IHNsYXNoLmJhc2UgYXJndlsxXVxuICAgIGlmIGljb24gPSBpY29uTWFwW2Jhc2VdXG4gICAgICAgIHRhcmdldGZpbGUgPSBzbGFzaC5yZXNvbHZlIGFyZ3ZbMl0gPyBiYXNlICsgJy5wbmcnXG4gICAgICAgIGZha2VpY29uID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBpY29uICsgJy5wbmcnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jIGZha2VpY29uLCB0YXJnZXRmaWxlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgIGZhbHNlXG5cbmV4ZWMgPSAoYXJndi4uLikgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgYXJndiA9IFsnaGVscCddIGlmIGVtcHR5IGFyZ3ZcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICBcbiAgICAgICAgd2NleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZSdcbiAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAnaWNvbidcbiAgICAgICAgICAgIGlmIGZha2VJY29uIGFyZ3YgdGhlbiByZXR1cm4gJydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnXVxuICAgICAgICAgICAgY2hpbGRwLnNwYXduIFwiXFxcIiN7d2NleGV9XFxcIlwiLCBhcmd2LCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICAgICAgcmV0dXJuICcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFyZ3MgPSAoa3N0cihzKSBmb3IgcyBpbiBhcmd2KS5qb2luIFwiIFwiXG4gICAgICAgICAgICByZXR1cm4gY2hpbGRwLmV4ZWNTeW5jIFwiXFxcIiN7d2NleGV9XFxcIiAje2FyZ3N9XCIgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWVcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcmV0dXJuICcnXG4gICAgXG53YyA9IC0+XG4gICAgICAgICAgICBcbiAgICBvdXQgPSBleGVjLmFwcGx5IG51bGwsIFtdLnNsaWNlLmNhbGwgYXJndW1lbnRzLCAwXG4gICAgICAgIFxuICAgIHN3aXRjaCBrc3RyIGFyZ3VtZW50c1swXVxuICAgICAgICB3aGVuICdpbmZvJyAnc2NyZWVuJyAnbW91c2UnICd0cmFzaCdcbiAgICAgICAgICAgIG5vb24ucGFyc2Ugb3V0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dFxuICAgICAgICAgICAgXG53Yy5leGVjID0gZXhlY1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSB3Y1xuIl19
//# sourceURL=../coffee/wc.coffee