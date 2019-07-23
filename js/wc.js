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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1FQUFBO0lBQUE7O0FBUUEsTUFBaUQsT0FBQSxDQUFRLEtBQVIsQ0FBakQsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQzs7QUFFMUMsUUFBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQVksU0FBWjtRQUNBLFVBQUEsRUFBWSxZQURaO1FBRUEsT0FBQSxFQUFZLFVBRlo7UUFHQSxPQUFBLEVBQVksVUFIWjtRQUlBLEtBQUEsRUFBWSxjQUpaO1FBS0EsU0FBQSxFQUFZLFNBTFo7O0lBT0osSUFBVSxJQUFJLENBQUMsTUFBTCxJQUFlLENBQXpCO0FBQUEsZUFBQTs7SUFDQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFLLENBQUEsQ0FBQSxDQUFoQjtJQUNQLElBQUcsSUFBQSxHQUFPLE9BQVEsQ0FBQSxJQUFBLENBQWxCO1FBQ0ksVUFBQSxHQUFhLEtBQUssQ0FBQyxPQUFOLG1DQUF3QixJQUFBLEdBQU8sTUFBL0I7UUFDYixRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQW1DLElBQUEsR0FBTyxNQUExQztBQUNYO1lBQ0ksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsUUFBaEIsRUFBMEIsVUFBMUI7QUFDQSxtQkFBTyxLQUZYO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBSkg7U0FISjs7V0FRQTtBQXBCTzs7QUFzQlgsSUFBQSxHQUFPLFNBQUE7QUFFSCxRQUFBO0lBRkk7QUFFSjtRQUNJLElBQW1CLEtBQUEsQ0FBTSxJQUFOLENBQW5CO1lBQUEsSUFBQSxH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R0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDBcbjAwMCAwIDAwMCAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICBcbjAwICAgICAwMCAgIDAwMDAwMDBcbiMjI1xuXG57IGNoaWxkcCwgc2xhc2gsIG5vb24sIGtsb2csIGVtcHR5LCBrc3RyLCBmcyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5mYWtlSWNvbiA9IChhcmd2KSAtPlxuICAgIFxuICAgIGljb25NYXAgPSBcbiAgICAgICAgcmVjeWNsZTogICAgJ3JlY3ljbGUnXG4gICAgICAgIHJlY3ljbGVkb3Q6ICdyZWN5Y2xlZG90J1xuICAgICAgICBtaW5ndzMyOiAgICAndGVybWluYWwnXG4gICAgICAgIG1pbmd3NjQ6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbXN5czI6ICAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgcHJvY2V4cDY0OiAgJ3Byb2NleHAnXG4gICAgXG4gICAgcmV0dXJuIGlmIGFyZ3YubGVuZ3RoIDw9IDEgXG4gICAgYmFzZSA9IHNsYXNoLmJhc2UgYXJndlsxXVxuICAgIGlmIGljb24gPSBpY29uTWFwW2Jhc2VdXG4gICAgICAgIHRhcmdldGZpbGUgPSBzbGFzaC5yZXNvbHZlIGFyZ3ZbMl0gPyBiYXNlICsgJy5wbmcnXG4gICAgICAgIGZha2VpY29uID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyBpY29uICsgJy5wbmcnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMuY29weUZpbGVTeW5jIGZha2VpY29uLCB0YXJnZXRmaWxlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgIGZhbHNlXG5cbmV4ZWMgPSAoYXJndi4uLikgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgYXJndiA9IFsnaGVscCddIGlmIGVtcHR5IGFyZ3ZcbiAgICAgICAgXG4gICAgICAgIGNtZCA9IGFyZ3ZbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGNtZFswXSA9PSAnLScgdGhlbiBjbWQgPSBjbWQuc2xpY2UoMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQubGVuZ3RoID09IDFcbiAgICAgICAgICAgIHN3aXRjaCBjbWRcbiAgICAgICAgICAgICAgICB3aGVuICdoJyB0aGVuIGNtZCA9IFwiaGVscFwiICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2knIHRoZW4gY21kID0gXCJpbmZvXCIgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnYicgdGhlbiBjbWQgPSBcImJvdW5kc1wiICBcbiAgICAgICAgICAgICAgICB3aGVuICd2JyB0aGVuIGNtZCA9IFwidmVyc2lvblwiIFxuICAgICAgICAgICAgICAgIHdoZW4gJ2wnIHRoZW4gY21kID0gXCJsYXVuY2hcIiAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAndmVyc2lvbidcbiAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiBcInBhY2thZ2UuanNvblwiXG4gICAgICAgICAgICByZXR1cm4gcGtnLnZlcnNpb25cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi4uYXJndi5sZW5ndGhdXG4gICAgICAgICAgICBpZiBhcmd2W2ldWzBdICE9ICdcIicgYW5kIGFyZ3ZbaV0uaW5kZXhPZj8oJyAnKSA+PSAwIGFuZCBhcmd2W2ldWy0xXSAhPSAnXCInXG4gICAgICAgICAgICAgICAgYXJndltpXSA9ICdcIicgKyBhcmd2W2ldICsgJ1wiJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBhcmd2WzBdID0gY21kXG4gICAgICAgICAgICBcbiAgICAgICAgd2NleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZSdcbiAgICAgICAgXG4gICAgICAgIGlmIGNtZCA9PSAnaWNvbidcbiAgICAgICAgICAgIGlmIGZha2VJY29uIGFyZ3YgdGhlbiByZXR1cm4gJydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjbWQgaW4gWydsYXVuY2gnXVxuICAgICAgICAgICAgY2hpbGRwLnNwYXduIHdjZXhlLCBhcmd2LCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0J1xuICAgICAgICAgICAgcmV0dXJuICcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFyZ3MgPSAoa3N0cihzKSBmb3IgcyBpbiBhcmd2KS5qb2luIFwiIFwiXG4gICAgICAgICAgICByZXR1cm4gY2hpbGRwLmV4ZWNTeW5jIHdjZXhlK1wiICN7YXJnc31cIiBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZVxuICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gJydcbiAgICBcbndjID0gLT5cbiAgICAgICAgICAgIFxuICAgIG91dCA9IGV4ZWMuYXBwbHkgbnVsbCwgW10uc2xpY2UuY2FsbCBhcmd1bWVudHMsIDBcbiAgICAgICAgXG4gICAgc3dpdGNoIGtzdHIgYXJndW1lbnRzWzBdXG4gICAgICAgIHdoZW4gJ2luZm8nICdzY3JlZW4nICdtb3VzZScgJ3RyYXNoJ1xuICAgICAgICAgICAgbm9vbi5wYXJzZSBvdXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0XG4gICAgICAgICAgICBcbndjLmV4ZWMgPSBleGVjXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IHdjXG4iXX0=
//# sourceURL=../coffee/wc.coffee