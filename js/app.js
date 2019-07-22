// koffee 1.3.0

/*
000   000  000   000  000   000         0000000   00000000   00000000   
000 0 000   000 000   000 0 000        000   000  000   000  000   000  
000000000    00000    000000000        000000000  00000000   00000000   
000   000   000 000   000   000        000   000  000        000        
00     00  000   000  00     00        000   000  000        000
 */
var Menu, _, about, action, app, args, childp, electron, karg, klog, moveWindow, onAppSwitch, pkg, post, prefs, ref, showAbout, slash, swtch, tray, wc;

ref = require('kxk'), post = ref.post, prefs = ref.prefs, about = ref.about, slash = ref.slash, childp = ref.childp, karg = ref.karg, klog = ref.klog, _ = ref._;

wc = require('./wc');

pkg = require('../package.json');

electron = require('electron');

app = electron.app;

Menu = electron.Menu;

tray = null;

swtch = null;

args = karg("wxw\n    debug  . ? log debug    . = false . - D\n\nversion  " + pkg.version);

post.on('winlog', function(text) {
    return klog(">>> " + text);
});

action = function(act) {
    switch (act) {
        case 'maximize':
            return wc('maximize', 'top');
        case 'minimize':
            return wc('minimize', 'top');
        case 'taskbar':
            return wc('taskbar', 'toggle');
        case 'close':
            return wc('close', 'top');
        case 'screenzoom':
            return require('./zoom').start();
        case 'appswitch':
            return onAppSwitch();
        default:
            return moveWindow(act);
    }
};

moveWindow = function(dir) {
    var ar, b, base, d, h, info, ref1, sb, screen, sl, sr, st, w, wr, x, y;
    screen = wc('screen', 'user');
    ar = {
        w: screen.width,
        h: screen.height
    };
    if (info = wc('info', 'top')[0]) {
        base = slash.base(info.path);
        if (base === 'electron' || base === 'ko' || base === 'konrad' || base === 'clippo' || base === 'klog' || base === 'kaligraf' || base === 'kalk' || base === 'uniko' || base === 'knot' || base === 'kachel' || base === 'space' || base === 'ruler') {
            b = 0;
        } else {
            b = 11;
        }
        wr = {
            x: info.x,
            y: info.y,
            w: info.width,
            h: info.height
        };
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
        return wc('bounds', info.hwnd, x, y, w, h);
    }
};

onAppSwitch = function() {
    if (!swtch) {
        swtch = require('./switch').start();
        return;
    }
    return post.toWin(swtch.id, 'nextApp');
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
        close: 'ctrl+alt+w',
        taskbar: 'ctrl+alt+t',
        appswitch: 'ctrl+tab',
        screenzoom: 'alt+z'
    };
    prefs.init({
        defaults: keys
    });
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

if (app.requestSingleInstanceLock != null) {
    if (!app.requestSingleInstanceLock()) {
        app.quit();
    }
}

if (args.debug) {
    require('./zoom').start({
        debug: true
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF1RCxPQUFBLENBQVEsS0FBUixDQUF2RCxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGlCQUFmLEVBQXNCLGlCQUF0QixFQUE2QixtQkFBN0IsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQ7O0FBRWpELEVBQUEsR0FBVyxPQUFBLENBQVEsTUFBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFWCxHQUFBLEdBQVcsUUFBUSxDQUFDOztBQUNwQixJQUFBLEdBQVcsUUFBUSxDQUFDOztBQUNwQixJQUFBLEdBQVc7O0FBQ1gsS0FBQSxHQUFXOztBQUVYLElBQUEsR0FBTyxJQUFBLENBQUssK0RBQUEsR0FJRCxHQUFHLENBQUMsT0FKUjs7QUFTUCxJQUFJLENBQUMsRUFBTCxDQUFRLFFBQVIsRUFBa0IsU0FBQyxJQUFEO1dBQVUsSUFBQSxDQUFLLE1BQUEsR0FBUyxJQUFkO0FBQVYsQ0FBbEI7O0FBUUEsTUFBQSxHQUFTLFNBQUMsR0FBRDtBQUVMLFlBQU8sR0FBUDtBQUFBLGFBQ1MsVUFEVDttQkFDMkIsRUFBQSxDQUFHLFVBQUgsRUFBYyxLQUFkO0FBRDNCLGFBRVMsVUFGVDttQkFFMkIsRUFBQSxDQUFHLFVBQUgsRUFBYyxLQUFkO0FBRjNCLGFBR1MsU0FIVDttQkFHMkIsRUFBQSxDQUFHLFNBQUgsRUFBYyxRQUFkO0FBSDNCLGFBSVMsT0FKVDttQkFJMkIsRUFBQSxDQUFHLE9BQUgsRUFBYyxLQUFkO0FBSjNCLGFBS1MsWUFMVDttQkFLMkIsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxLQUFsQixDQUFBO0FBTDNCLGFBTVMsV0FOVDttQkFNMkIsV0FBQSxDQUFBO0FBTjNCO21CQU9TLFVBQUEsQ0FBVyxHQUFY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Y0EsVUFBQSxFQUFZLE9BZFo7O0lBZ0JKLEtBQUssQ0FBQyxJQUFOLENBQVc7UUFBQSxRQUFBLEVBQVMsSUFBVDtLQUFYO0FBRUE7QUFBQTtTQUFBLHNDQUFBOztxQkFDSSxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQXhCLENBQWlDLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFqQyxFQUErQyxDQUFDLFNBQUMsQ0FBRDttQkFBTyxTQUFBO3VCQUFHLE1BQUEsQ0FBTyxDQUFQO1lBQUg7UUFBUCxDQUFELENBQUEsQ0FBcUIsQ0FBckIsQ0FBL0M7QUFESjs7QUFuQ1ksQ0FBaEI7O0FBc0NBLElBQUcscUNBQUg7SUFDSSxJQUFHLENBQUMsR0FBRyxDQUFDLHlCQUFKLENBQUEsQ0FBSjtRQUNJLEdBQUcsQ0FBQyxJQUFKLENBQUEsRUFESjtLQURKOzs7QUFJQSxJQUFHLElBQUksQ0FBQyxLQUFSO0lBQ0ksT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxLQUFsQixDQUF3QjtRQUFBLEtBQUEsRUFBTSxJQUFOO0tBQXhCLEVBREoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwIDAgMDAwICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuMDAgICAgIDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jIyNcblxueyBwb3N0LCBwcmVmcywgYWJvdXQsIHNsYXNoLCBjaGlsZHAsIGthcmcsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxud2MgICAgICAgPSByZXF1aXJlICcuL3djJ1xucGtnICAgICAgPSByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5hcHAgICAgICA9IGVsZWN0cm9uLmFwcFxuTWVudSAgICAgPSBlbGVjdHJvbi5NZW51XG50cmF5ICAgICA9IG51bGxcbnN3dGNoICAgID0gbnVsbFxuXG5hcmdzID0ga2FyZyBcIlwiXCJcbnd4d1xuICAgIGRlYnVnICAuID8gbG9nIGRlYnVnICAgIC4gPSBmYWxzZSAuIC0gRFxuXG52ZXJzaW9uICAje3BrZy52ZXJzaW9ufVxuXCJcIlwiXG5cbiMgYXJncy5kZWJ1ZyA9IHRydWVcblxucG9zdC5vbiAnd2lubG9nJywgKHRleHQpIC0+IGtsb2cgXCI+Pj4gXCIgKyB0ZXh0XG5cbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuYWN0aW9uID0gKGFjdCkgLT5cblxuICAgIHN3aXRjaCBhY3RcbiAgICAgICAgd2hlbiAnbWF4aW1pemUnICAgdGhlbiB3YyAnbWF4aW1pemUnICd0b3AnXG4gICAgICAgIHdoZW4gJ21pbmltaXplJyAgIHRoZW4gd2MgJ21pbmltaXplJyAndG9wJ1xuICAgICAgICB3aGVuICd0YXNrYmFyJyAgICB0aGVuIHdjICd0YXNrYmFyJyAgJ3RvZ2dsZSdcbiAgICAgICAgd2hlbiAnY2xvc2UnICAgICAgdGhlbiB3YyAnY2xvc2UnICAgICd0b3AnXG4gICAgICAgIHdoZW4gJ3NjcmVlbnpvb20nIHRoZW4gcmVxdWlyZSgnLi96b29tJykuc3RhcnQoKVxuICAgICAgICB3aGVuICdhcHBzd2l0Y2gnICB0aGVuIG9uQXBwU3dpdGNoKClcbiAgICAgICAgZWxzZSBtb3ZlV2luZG93IGFjdFxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbm1vdmVXaW5kb3cgPSAoZGlyKSAtPlxuICAgIFxuICAgIHNjcmVlbiA9IHdjICdzY3JlZW4nICd1c2VyJ1xuICAgIFxuICAgIGFyID0gdzpzY3JlZW4ud2lkdGgsIGg6c2NyZWVuLmhlaWdodFxuICAgIFxuICAgIGlmIGluZm8gPSB3YygnaW5mbycgJ3RvcCcpWzBdXG4gICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBpbmZvLnBhdGhcbiAgICAgICAgaWYgYmFzZSBpbiBbJ2VsZWN0cm9uJyAna28nICdrb25yYWQnICdjbGlwcG8nICdrbG9nJyAna2FsaWdyYWYnICdrYWxrJyAndW5pa28nICdrbm90JyAna2FjaGVsJyAnc3BhY2UnICdydWxlciddXG4gICAgICAgICAgICBiID0gMCAgICAjIHNhbmUgd2luZG93IGJvcmRlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIGIgPSAxMC45ICMgdHJhbnNwYXJlbnQgd2luZG93IGJvcmRlclxuICAgICAgICAgICAgYiA9IDExICAgIyB0cmFuc3BhcmVudCB3aW5kb3cgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICB3ciA9IHg6aW5mby54LCB5OmluZm8ueSwgdzppbmZvLndpZHRoLCBoOmluZm8uaGVpZ2h0XG4gICAgICAgIGQgPSAyKmJcbiAgICAgICAgW3gseSx3LGhdID0gc3dpdGNoIGRpclxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgICAgIHRoZW4gWy1iLCAgICAgICAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAncmlnaHQnICAgIHRoZW4gW2FyLncvMi1iLCAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAnZG93bicgICAgIHRoZW4gW2FyLncvNC1iLCAgIDAsICAgICAgICBhci53LzIrZCwgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAndXAnICAgICAgIHRoZW4gW2FyLncvNi1iLCAgIDAsICAgIDIvMyphci53K2QsICAgYXIuaCtiXVxuICAgICAgICAgICAgd2hlbiAndG9wbGVmdCcgIHRoZW4gWy1iLCAgICAgICAgIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAndG9wJyAgICAgIHRoZW4gW2FyLncvMy1iLCAgIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAndG9wcmlnaHQnIHRoZW4gWzIvMyphci53LWIsIDAsICAgICAgICBhci53LzMrZCwgYXIuaC8yXVxuICAgICAgICAgICAgd2hlbiAnYm90bGVmdCcgIHRoZW4gWy1iLCAgICAgICAgIGFyLmgvMi1iLCBhci53LzMrZCwgYXIuaC8yK2RdXG4gICAgICAgICAgICB3aGVuICdib3QnICAgICAgdGhlbiBbYXIudy8zLWIsICAgYXIuaC8yLWIsIGFyLncvMytkLCBhci5oLzIrZF1cbiAgICAgICAgICAgIHdoZW4gJ2JvdHJpZ2h0JyB0aGVuIFsyLzMqYXIudy1iLCBhci5oLzItYiwgYXIudy8zK2QsIGFyLmgvMitkXVxuICAgICAgICBcbiAgICAgICAgc2wgPSAyMCA+IE1hdGguYWJzIHdyLnggLSAgeFxuICAgICAgICBzciA9IDIwID4gTWF0aC5hYnMgd3IueCt3ci53IC0gKHgrdylcbiAgICAgICAgc3QgPSAyMCA+IE1hdGguYWJzIHdyLnkgLSAgeVxuICAgICAgICBzYiA9IDIwID4gTWF0aC5hYnMgd3IueSt3ci5oIC0gKHkraClcbiAgICAgICAgXG4gICAgICAgIGlmIHNsIGFuZCBzciBhbmQgc3QgYW5kIHNiXG4gICAgICAgICAgICBzd2l0Y2ggZGlyXG4gICAgICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gdyAgPSBhci53LzQrZFxuICAgICAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIHcgID0gYXIudy80K2Q7IHggPSAzKmFyLncvNC1iXG4gICAgICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gaCAgPSBhci5oLzIrZDsgeSA9IGFyLmgvMi1iXG4gICAgICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gdyAgPSBhci53K2Q7ICAgeCA9IC1iXG4gICAgICAgIFxuICAgICAgICB3YyAnYm91bmRzJyBpbmZvLmh3bmQsIHgsIHksIHcsIGhcbiAgICAgICBcbm9uQXBwU3dpdGNoID0gLT5cbiAgICBcbiAgICBpZiBub3Qgc3d0Y2ggXG4gICAgICAgIHN3dGNoID0gcmVxdWlyZSgnLi9zd2l0Y2gnKS5zdGFydCgpXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIHBvc3QudG9XaW4gc3d0Y2guaWQsICduZXh0QXBwJ1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuXG5zaG93QWJvdXQgPSAtPlxuICAgIFxuICAgIGFib3V0IFxuICAgICAgICBpbWc6IFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9hYm91dC5wbmdcIlxuICAgICAgICBiYWNrZ3JvdW5kOiBcIiMyMjJcIlxuICAgICAgICBzaXplOiAzMDBcbiAgICAgICAgcGtnOiBwa2dcblxuYXBwLm9uICd3aW5kb3ctYWxsLWNsb3NlZCcgKGV2ZW50KSAtPiBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICBcblxuYXBwLm9uICdyZWFkeScsIC0+XG4gICAgXG4gICAgdHJheSA9IG5ldyBlbGVjdHJvbi5UcmF5IFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9tZW51LnBuZ1wiXG4gICAgdHJheS5vbiAnY2xpY2snIHNob3dBYm91dFxuICAgIHRyYXkub24gJ2RvdWJsZS1jbGljaycgLT4gYXBwLmV4aXQgMDsgcHJvY2Vzcy5leGl0IDBcbiAgICBcbiAgICB0cmF5LnNldENvbnRleHRNZW51IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgW1xuICAgICAgICBsYWJlbDogXCJRdWl0XCJcbiAgICAgICAgY2xpY2s6IC0+IGFwcC5leGl0IDA7IHByb2Nlc3MuZXhpdCAwXG4gICAgLFxuICAgICAgICBsYWJlbDogXCJBYm91dFwiXG4gICAgICAgIGNsaWNrOiBzaG93QWJvdXRcbiAgICBdXG4gICAgXG4gICAgYXBwLmRvY2s/LmhpZGUoKVxuICAgIFxuICAgIGtleXMgPSBcbiAgICAgICAgbGVmdDogICAgICAgJ2N0cmwrYWx0K2xlZnQnXG4gICAgICAgIHJpZ2h0OiAgICAgICdjdHJsK2FsdCtyaWdodCdcbiAgICAgICAgdXA6ICAgICAgICAgJ2N0cmwrYWx0K3VwJ1xuICAgICAgICBkb3duOiAgICAgICAnY3RybCthbHQrZG93bidcbiAgICAgICAgdG9wbGVmdDogICAgJ2N0cmwrYWx0KzEnXG4gICAgICAgIGJvdGxlZnQ6ICAgICdjdHJsK2FsdCsyJ1xuICAgICAgICB0b3ByaWdodDogICAnY3RybCthbHQrMydcbiAgICAgICAgYm90cmlnaHQ6ICAgJ2N0cmwrYWx0KzQnXG4gICAgICAgIHRvcDogICAgICAgICdjdHJsK2FsdCs1J1xuICAgICAgICBib3Q6ICAgICAgICAnY3RybCthbHQrNidcbiAgICAgICAgbWluaW1pemU6ICAgJ2N0cmwrYWx0K20nXG4gICAgICAgIGNsb3NlOiAgICAgICdjdHJsK2FsdCt3J1xuICAgICAgICB0YXNrYmFyOiAgICAnY3RybCthbHQrdCdcbiAgICAgICAgYXBwc3dpdGNoOiAgJ2N0cmwrdGFiJ1xuICAgICAgICBzY3JlZW56b29tOiAnYWx0K3onXG4gICAgICAgIFxuICAgIHByZWZzLmluaXQgZGVmYXVsdHM6a2V5c1xuICAgIFxuICAgIGZvciBhIGluIF8ua2V5cyBrZXlzXG4gICAgICAgIGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyIHByZWZzLmdldChhKSwgKChhKSAtPiAtPiBhY3Rpb24gYSkoYSlcbiAgXG5pZiBhcHAucmVxdWVzdFNpbmdsZUluc3RhbmNlTG9jaz8gXG4gICAgaWYgIWFwcC5yZXF1ZXN0U2luZ2xlSW5zdGFuY2VMb2NrKClcbiAgICAgICAgYXBwLnF1aXQoKVxuICAgICAgICBcbmlmIGFyZ3MuZGVidWdcbiAgICByZXF1aXJlKCcuL3pvb20nKS5zdGFydCBkZWJ1Zzp0cnVlXG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/app.coffee