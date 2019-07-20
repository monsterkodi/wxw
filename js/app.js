// koffee 1.3.0

/*
000   000  000   000  000   000         0000000   00000000   00000000   
000 0 000   000 000   000 0 000        000   000  000   000  000   000  
000000000    00000    000000000        000000000  00000000   00000000   
000   000   000 000   000   000        000   000  000        000        
00     00  000   000  00     00        000   000  000        000
 */
var Menu, _, about, action, app, args, childp, electron, karg, klog, minimizeWindow, moveWindow, pkg, post, prefs, ref, showAbout, slash, tray;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, about = ref.about, slash = ref.slash, childp = ref.childp, karg = ref.karg, klog = ref.klog, _ = ref._;

pkg = require('../package.json');

electron = require('electron');

app = electron.app;

Menu = electron.Menu;

tray = null;

args = karg("wxw\n    debug  . ? log debug    . = false . - D\n\nversion  " + pkg.version);

post.on('winlog', function(text) {
    return klog(">>> " + text);
});

action = function(act) {
    switch (act) {
        case 'minimize':
            return minimizeWindow();
        case 'screenzoom':
            return require('./screenzoom').start();
        default:
            return moveWindow(act);
    }
};

minimizeWindow = function() {
    var SW_MINIMIZE, ensureFocusWindow, hWnd;
    ensureFocusWindow = function() {
        if (!user.GetForegroundWindow()) {
            return console.error('no focus window!');
        }
    };
    if (hWnd = user.GetForegroundWindow()) {
        SW_MINIMIZE = 6;
        user.ShowWindow(hWnd, SW_MINIMIZE);
        return setTimeout(ensureFocusWindow, 50);
    }
};

moveWindow = function(dir) {
    var SWP_NOZORDER, ar, b, base, d, h, hWnd, info, ref1, sb, sl, sr, st, w, wr, x, y;
    ar = rect.workarea();
    if (hWnd = user.GetForegroundWindow()) {
        info = wininfo(hWnd);
        base = slash.base(info.path);
        if (base === 'electron' || base === 'ko' || base === 'konrad' || base === 'clippo' || base === 'klog' || base === 'kaligraf' || base === 'kalk' || base === 'uniko' || base === 'knot' || base === 'Hyper') {
            b = 0;
        } else {
            b = 10.9;
        }
        wr = rect.window(hWnd);
        d = 2 * b;
        ref1 = (function() {
            switch (dir) {
                case 'left':
                    return [-b, 0, ar.w / 2 + d, ar.h + b];
                case 'right':
                    return [ar.w / 2 - b, 0, ar.w / 2 + d, ar.h + b];
                case 'down':
                    return [ar.w / 4 - b, 0, ar.w / 2 + d, ar.h + b];
                case 'up':
                    return [ar.w / 6 - b, 0, 2 / 3 * ar.w + d, ar.h + b];
                case 'topleft':
                    return [-b, 0, ar.w / 3 + d, ar.h / 2];
                case 'top':
                    return [ar.w / 3 - b, 0, ar.w / 3 + d, ar.h / 2];
                case 'topright':
                    return [2 / 3 * ar.w - b, 0, ar.w / 3 + d, ar.h / 2];
                case 'botleft':
                    return [-b, ar.h / 2 - b, ar.w / 3 + d, ar.h / 2 + d];
                case 'bot':
                    return [ar.w / 3 - b, ar.h / 2 - b, ar.w / 3 + d, ar.h / 2 + d];
                case 'botright':
                    return [2 / 3 * ar.w - b, ar.h / 2 - b, ar.w / 3 + d, ar.h / 2 + d];
            }
        })(), x = ref1[0], y = ref1[1], w = ref1[2], h = ref1[3];
        sl = 20 > Math.abs(wr.x - x);
        sr = 20 > Math.abs(wr.x + wr.w - (x + w));
        st = 20 > Math.abs(wr.y - y);
        sb = 20 > Math.abs(wr.y + wr.h - (y + h));
        if (sl && sr && st && sb) {
            switch (dir) {
                case 'left':
                    w = ar.w / 4 + d;
                    break;
                case 'right':
                    w = ar.w / 4 + d;
                    x = 3 * ar.w / 4 - b;
                    break;
                case 'down':
                    h = ar.h / 2 + d;
                    y = ar.h / 2 - b;
                    break;
                case 'up':
                    w = ar.w + d;
                    x = -b;
            }
        }
        SWP_NOZORDER = 0x4;
        user.RestoreWindow(hWnd);
        return user.SetWindowPos(hWnd, null, x, y, w, h, SWP_NOZORDER);
    }
};

showAbout = function() {
    return about({
        img: __dirname + "/../img/about.png",
        background: "#222",
        size: 300,
        pkg: pkg
    });
};

app.on('window-all-closed', function(event) {
    return event.preventDefault();
});

app.on('ready', function() {
    var a, i, keys, len, ref1, ref2, results;
    tray = new electron.Tray(__dirname + "/../img/menu.png");
    tray.on('click', showAbout);
    tray.on('double-click', function() {
        app.exit(0);
        return process.exit(0);
    });
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: "Quit",
            click: function() {
                app.exit(0);
                return process.exit(0);
            }
        }, {
            label: "About",
            click: showAbout
        }
    ]));
    if ((ref1 = app.dock) != null) {
        ref1.hide();
    }
    keys = {
        left: 'ctrl+alt+left',
        right: 'ctrl+alt+right',
        up: 'ctrl+alt+up',
        down: 'ctrl+alt+down',
        topleft: 'ctrl+alt+1',
        botleft: 'ctrl+alt+2',
        topright: 'ctrl+alt+3',
        botright: 'ctrl+alt+4',
        top: 'ctrl+alt+5',
        bot: 'ctrl+alt+6',
        minimize: 'ctrl+alt+m',
        screenzoom: 'alt+z'
    };
    prefs.init(keys);
    if (!slash.isFile(prefs.store.file)) {
        prefs.save();
    }
    ref2 = _.keys(keys);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
        a = ref2[i];
        results.push(electron.globalShortcut.register(prefs.get(a), (function(a) {
            return function() {
                return action(a);
            };
        })(a)));
    }
    return results;
});

if (args.debug) {
    require('./screenzoom').start({
        debug: true
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF1RCxPQUFBLENBQVEsS0FBUixDQUF2RCxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGlCQUFmLEVBQXNCLGlCQUF0QixFQUE2QixtQkFBN0IsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQ7O0FBRWpELEdBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVYLEdBQUEsR0FBVyxRQUFRLENBQUM7O0FBQ3BCLElBQUEsR0FBVyxRQUFRLENBQUM7O0FBQ3BCLElBQUEsR0FBVzs7QUFFWCxJQUFBLEdBQU8sSUFBQSxDQUFLLCtEQUFBLEdBSUQsR0FBRyxDQUFDLE9BSlI7O0FBU1AsSUFBSSxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWtCLFNBQUMsSUFBRDtXQUFVLElBQUEsQ0FBSyxNQUFBLEdBQVMsSUFBZDtBQUFWLENBQWxCOztBQVFBLE1BQUEsR0FBUyxTQUFDLEdBQUQ7QUFFTCxZQUFPLEdBQVA7QUFBQSxhQUNTLFVBRFQ7bUJBQzJCLGNBQUEsQ0FBQTtBQUQzQixhQUVTLFlBRlQ7bUJBRTJCLE9BQUEsQ0FBUSxjQUFSLENBQXVCLENBQUMsS0FBeEIsQ0FBQTtBQUYzQjttQkFHUyxVQUFBLENBQVcsR0FBWDtBQUhUO0FBRks7O0FBYVQsY0FBQSxHQUFpQixTQUFBO0FBRWIsUUFBQTtJQUFBLGlCQUFBLEdBQW9CLFNBQUE7UUFFaEIsSUFBRyxDQUFJLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVA7bUJBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyxrQkFBUCxFQURIOztJQUZnQjtJQUtwQixJQUFHLElBQUEsR0FBTyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFWO1FBQ0ksV0FBQSxHQUFjO1FBQ2QsSUFBSSxDQUFDLFVBQUwsQ0FBZ0Is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O0FBREo7O0FBbkNZLENBQWhCOztBQXNDQSxJQUFHLElBQUksQ0FBQyxLQUFSO0lBQ0ksT0FBQSxDQUFRLGNBQVIsQ0FBdUIsQ0FBQyxLQUF4QixDQUE4QjtRQUFBLEtBQUEsRUFBTSxJQUFOO0tBQTlCLEVBREoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwIDAgMDAwICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuMDAgICAgIDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIyNcblxueyBwb3N0LCBwcmVmcywgYWJvdXQsIHNsYXNoLCBjaGlsZHAsIGthcmcsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxucGtnICAgICAgPSByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5hcHAgICAgICA9IGVsZWN0cm9uLmFwcFxuTWVudSAgICAgPSBlbGVjdHJvbi5NZW51XG50cmF5ICAgICA9IG51bGxcblxuYXJncyA9IGthcmcgXCJcIlwiXG53eHdcbiAgICBkZWJ1ZyAgLiA/IGxvZyBkZWJ1ZyAgICAuID0gZmFsc2UgLiAtIERcblxudmVyc2lvbiAgI3twa2cudmVyc2lvbn1cblwiXCJcIlxuXG4jIGFyZ3MuZGVidWcgPSB0cnVlXG5cbnBvc3Qub24gJ3dpbmxvZycsICh0ZXh0KSAtPiBrbG9nIFwiPj4+IFwiICsgdGV4dFxuXG4jICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbmFjdGlvbiA9IChhY3QpIC0+XG4gICAgXG4gICAgc3dpdGNoIGFjdFxuICAgICAgICB3aGVuICdtaW5pbWl6ZScgICB0aGVuIG1pbmltaXplV2luZG93KClcbiAgICAgICAgd2hlbiAnc2NyZWVuem9vbScgdGhlbiByZXF1aXJlKCcuL3NjcmVlbnpvb20nKS5zdGFydCgpXG4gICAgICAgIGVsc2UgbW92ZVdpbmRvdyBhY3RcbiAgICAgICAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAgICAgIDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5taW5pbWl6ZVdpbmRvdyA9IC0+XG5cbiAgICBlbnN1cmVGb2N1c1dpbmRvdyA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgdXNlci5HZXRGb3JlZ3JvdW5kV2luZG93KClcbiAgICAgICAgICAgIGVycm9yICdubyBmb2N1cyB3aW5kb3chJ1xuICAgICAgICBcbiAgICBpZiBoV25kID0gdXNlci5HZXRGb3JlZ3JvdW5kV2luZG93KClcbiAgICAgICAgU1dfTUlOSU1JWkUgPSA2XG4gICAgICAgIHVzZXIuU2hvd1dpbmRvdyBoV25kLCBTV19NSU5JTUlaRVxuICAgICAgICBzZXRUaW1lb3V0IGVuc3VyZUZvY3VzV2luZG93LCA1MFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbm1vdmVXaW5kb3cgPSAoZGlyKSAtPlxuICAgIFxuICAgIGFyID0gcmVjdC53b3JrYXJlYSgpXG4gICAgICAgIFxuICAgIGlmIGhXbmQgPSB1c2VyLkdldEZvcmVncm91bmRXaW5kb3coKVxuICAgICAgICBcbiAgICAgICAgaW5mbyA9IHdpbmluZm8gaFduZFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBpbmZvLnBhdGhcbiAgICAgICAgaWYgYmFzZSBpbiBbJ2VsZWN0cm9uJywgJ2tvJywgJ2tvbnJhZCcsICdjbGlwcG8nLCAna2xvZycsICdrYWxpZ3JhZicsICdrYWxrJywgJ3VuaWtvJywgJ2tub3QnLCAnSHlwZXInXVxuICAgICAgICAgICAgYiA9IDAgICAgIyBzYW5lIHdpbmRvdyBib3JkZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYiA9IDEwLjkgIyB0cmFuc3BhcmVudCB3aW5kb3cgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICB3ciA9IHJlY3Qud2luZG93IGhXbmRcbiAgICAgICAgZCA9IDIqYlxuICAgICAgICBbeCx5LHcsaF0gPSBzd2l0Y2ggZGlyXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgICAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgICAgdGhlbiBbYXIudy8yLWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgICAgdGhlbiBbYXIudy80LWIsICAgMCwgICAgICAgIGFyLncvMitkLCBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgICAgdGhlbiBbYXIudy82LWIsICAgMCwgICAgMi8zKmFyLncrZCwgICBhci5oK2JdXG4gICAgICAgICAgICB3aGVuICd0b3BsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3AnICAgICAgdGhlbiBbYXIudy8zLWIsICAgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICd0b3ByaWdodCcgdGhlbiBbMi8zKmFyLnctYiwgMCwgICAgICAgIGFyLncvMytkLCBhci5oLzJdXG4gICAgICAgICAgICB3aGVuICdib3RsZWZ0JyAgdGhlbiBbLWIsICAgICAgICAgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgICAgIHdoZW4gJ2JvdCcgICAgICB0aGVuIFthci53LzMtYiwgICBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICAgICAgd2hlbiAnYm90cmlnaHQnIHRoZW4gWzIvMyphci53LWIsIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgIFxuICAgICAgICBzbCA9IDIwID4gTWF0aC5hYnMgd3IueCAtICB4XG4gICAgICAgIHNyID0gMjAgPiBNYXRoLmFicyB3ci54K3dyLncgLSAoeCt3KVxuICAgICAgICBzdCA9IDIwID4gTWF0aC5hYnMgd3IueSAtICB5XG4gICAgICAgIHNiID0gMjAgPiBNYXRoLmFicyB3ci55K3dyLmggLSAoeStoKVxuICAgICAgICBcbiAgICAgICAgaWYgc2wgYW5kIHNyIGFuZCBzdCBhbmQgc2JcbiAgICAgICAgICAgIHN3aXRjaCBkaXJcbiAgICAgICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiB3ICA9IGFyLncvNCtkXG4gICAgICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gdyAgPSBhci53LzQrZDsgeCA9IDMqYXIudy80LWJcbiAgICAgICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBoICA9IGFyLmgvMitkOyB5ID0gYXIuaC8yLWJcbiAgICAgICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiB3ICA9IGFyLncrZDsgICB4ID0gLWJcbiAgICAgICAgXG4gICAgICAgIFNXUF9OT1pPUkRFUiA9IDB4NFxuICAgICAgICB1c2VyLlJlc3RvcmVXaW5kb3cgaFduZFxuICAgICAgICB1c2VyLlNldFdpbmRvd1BvcyBoV25kLCBudWxsLCB4LCB5LCB3LCBoLCBTV1BfTk9aT1JERVJcbiAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuXG5zaG93QWJvdXQgPSAtPlxuICAgIFxuICAgIGFib3V0IFxuICAgICAgICBpbWc6IFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9hYm91dC5wbmdcIlxuICAgICAgICBiYWNrZ3JvdW5kOiBcIiMyMjJcIlxuICAgICAgICBzaXplOiAzMDBcbiAgICAgICAgcGtnOiBwa2dcblxuYXBwLm9uICd3aW5kb3ctYWxsLWNsb3NlZCcsIChldmVudCkgLT4gZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgXG5cbmFwcC5vbiAncmVhZHknLCAtPlxuICAgIFxuICAgIHRyYXkgPSBuZXcgZWxlY3Ryb24uVHJheSBcIiN7X19kaXJuYW1lfS8uLi9pbWcvbWVudS5wbmdcIlxuICAgIHRyYXkub24gJ2NsaWNrJywgc2hvd0Fib3V0XG4gICAgdHJheS5vbiAnZG91YmxlLWNsaWNrJywgLT4gYXBwLmV4aXQgMDsgcHJvY2Vzcy5leGl0IDBcbiAgICBcbiAgICB0cmF5LnNldENvbnRleHRNZW51IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgW1xuICAgICAgICBsYWJlbDogXCJRdWl0XCJcbiAgICAgICAgY2xpY2s6IC0+IGFwcC5leGl0IDA7IHByb2Nlc3MuZXhpdCAwXG4gICAgLFxuICAgICAgICBsYWJlbDogXCJBYm91dFwiXG4gICAgICAgIGNsaWNrOiBzaG93QWJvdXRcbiAgICBdXG4gICAgXG4gICAgYXBwLmRvY2s/LmhpZGUoKVxuICAgIFxuICAgIGtleXMgPSBcbiAgICAgICAgbGVmdDogICAgICAgJ2N0cmwrYWx0K2xlZnQnXG4gICAgICAgIHJpZ2h0OiAgICAgICdjdHJsK2FsdCtyaWdodCdcbiAgICAgICAgdXA6ICAgICAgICAgJ2N0cmwrYWx0K3VwJ1xuICAgICAgICBkb3duOiAgICAgICAnY3RybCthbHQrZG93bidcbiAgICAgICAgdG9wbGVmdDogICAgJ2N0cmwrYWx0KzEnXG4gICAgICAgIGJvdGxlZnQ6ICAgICdjdHJsK2FsdCsyJ1xuICAgICAgICB0b3ByaWdodDogICAnY3RybCthbHQrMydcbiAgICAgICAgYm90cmlnaHQ6ICAgJ2N0cmwrYWx0KzQnXG4gICAgICAgIHRvcDogICAgICAgICdjdHJsK2FsdCs1J1xuICAgICAgICBib3Q6ICAgICAgICAnY3RybCthbHQrNidcbiAgICAgICAgbWluaW1pemU6ICAgJ2N0cmwrYWx0K20nXG4gICAgICAgIHNjcmVlbnpvb206ICdhbHQreidcbiAgICAgICAgXG4gICAgcHJlZnMuaW5pdCBrZXlzXG4gICAgXG4gICAgaWYgbm90IHNsYXNoLmlzRmlsZSBwcmVmcy5zdG9yZS5maWxlXG4gICAgICAgIHByZWZzLnNhdmUoKVxuXG4gICAgZm9yIGEgaW4gXy5rZXlzIGtleXNcbiAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KGEpLCAoKGEpIC0+IC0+IGFjdGlvbiBhKShhKVxuICBcbmlmIGFyZ3MuZGVidWdcbiAgICByZXF1aXJlKCcuL3NjcmVlbnpvb20nKS5zdGFydCBkZWJ1Zzp0cnVlXG4gICAgIl19
//# sourceURL=../coffee/app.coffee