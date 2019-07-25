// koffee 1.3.0
var $, activate, activeApp, apps, childp, clamp, done, drag, electron, elem, empty, getApps, highlight, initWin, karg, keyinfo, klog, kpos, last, loadApps, nextApp, onKeyDown, onKeyUp, onMouseDown, onMouseMove, pngPath, post, prefs, prevApp, quitApp, ref, slash, start, wc, winRect,
    indexOf = [].indexOf;

ref = require('kxk'), childp = ref.childp, post = ref.post, karg = ref.karg, slash = ref.slash, drag = ref.drag, elem = ref.elem, prefs = ref.prefs, clamp = ref.clamp, kpos = ref.kpos, empty = ref.empty, last = ref.last, klog = ref.klog, keyinfo = ref.keyinfo, $ = ref.$;

wc = require('./wc');

electron = require('electron');

apps = [];

getApps = function() {
    var file, i, info, infos, len, name, ref1, ref2;
    infos = wc('info');
    apps = [];
    for (i = 0, len = infos.length; i < len; i++) {
        info = infos[i];
        if (info.title === 'wxw-switch') {
            continue;
        }
        file = slash.file(info.path);
        if (file === 'ApplicationFrameHost.exe') {
            name = last(info.title.split(' ?- '));
            if (name === 'Calendar' || name === 'Mail') {
                if (indexOf.call(apps, name) < 0) {
                    apps.push(name);
                }
            } else if ((ref1 = info.title) === 'Settings' || ref1 === 'Calculator' || ref1 === 'Microsoft Store') {
                apps.push(info.title);
            }
        } else {
            if (ref2 = info.path, indexOf.call(apps, ref2) < 0) {
                apps.push(info.path);
            }
        }
    }
    return apps;
};

pngPath = function(appPath) {
    var pth;
    pth = slash.resolve(slash.join(slash.userData(), 'icons', slash.base(appPath) + ".png"));
    return pth;
};

winRect = function(numApps) {
    var as, border, height, screen, ss, width;
    screen = (electron.remote != null) && electron.remote.screen || electron.screen;
    ss = screen.getPrimaryDisplay().workAreaSize;
    as = 128;
    border = 20;
    width = (as + border) * apps.length + border;
    height = as + border * 2;
    return {
        x: parseInt((ss.width - width) / 2),
        y: parseInt((ss.height - height) / 2),
        width: width,
        height: height
    };
};

start = function(opt) {
    var app, data, html, i, len, png, win, wr;
    if (opt == null) {
        opt = {};
    }
    apps = getApps();
    for (i = 0, len = apps.length; i < len; i++) {
        app = apps[i];
        png = pngPath(app);
        if (!slash.fileExists(png)) {
            wc('icon', app, png);
        }
    }
    wr = winRect(apps.length);
    win = new electron.BrowserWindow({
        backgroundColor: '#00000000',
        transparent: true,
        preloadWindow: true,
        x: wr.x,
        y: wr.y,
        width: wr.width,
        height: wr.height,
        hasShadow: false,
        resizable: false,
        frame: false,
        thickFrame: false,
        fullscreen: false,
        show: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    html = "<head>\n<title>wxw-switch</title>\n<style type=\"text/css\">\n    * {\n        outline-width:  0;\n    }\n    \n    body {\n        overflow:       hidden;\n        margin:         0;\n    }\n    .apps {\n        opacity:        1;\n        white-space:    nowrap;\n        position:       absolute;\n        left:           0px;\n        top:            0px;\n        bottom:         0px;\n        right:          0px;\n        overflow:       hidden;\n        background:     rgb(16,16,16);\n        border-radius:  6px;\n        padding:        10px;\n    }\n    .app {\n        display:        inline-block;\n        width:          128px;\n        height:         128px;\n        padding:        10px;\n    }            \n    .app:hover {\n        background:     rgb(20,20,20);\n    }\n    .app.highlight {\n        background:     rgb(24,24,24);\n    }\n</style>\n</head>\n<body>\n<div class=\"apps\" tabindex=0></div>\n<script>\n    var pth = process.resourcesPath + \"/app/js/switch.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).initWin();\n</script>\n</body>";
    data = "data:text/html;charset=utf-8," + encodeURI(html);
    win.loadURL(data, {
        baseURLForDataURL: slash.fileUrl(__dirname + '/index.html')
    });
    win.debug = opt.debug;
    if (opt.debug) {
        win.webContents.openDevTools();
    }
    return win;
};

done = function() {
    return electron.remote.getCurrentWindow().hide();
};

activeApp = null;

activate = function() {
    var i, info, infos, j, len, len1, ref1, ref2;
    done();
    if (activeApp.id) {
        if ((ref1 = activeApp.id) === 'Mail' || ref1 === 'Calendar') {
            infos = wc('info', 'ApplicationFrameHost.exe');
            for (i = 0, len = infos.length; i < len; i++) {
                info = infos[i];
                if (info.title.endsWith(activeApp.id)) {
                    wc('focus', info.hwnd);
                    return;
                }
            }
            return childp.spawn('start', [
                {
                    Mail: 'outlookmail:',
                    Calendar: 'outlookcal:'
                }[activeApp.id]
            ], {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
        } else if ((ref2 = activeApp.id) === 'Calculator' || ref2 === 'Settings' || ref2 === 'Microsoft Store') {
            infos = wc('info', 'ApplicationFrameHost.exe');
            for (j = 0, len1 = infos.length; j < len1; j++) {
                info = infos[j];
                if (info.title === activeApp.id) {
                    wc('focus', info.hwnd);
                    return;
                }
            }
            return childp.spawn('start', [
                {
                    Calculator: 'calculator:',
                    Settings: 'ms-settings:',
                    'Microsoft Store': 'ms-windows-store:'
                }[activeApp.id]
            ], {
                encoding: 'utf8',
                shell: true,
                detached: true,
                stdio: 'inherit'
            });
        } else {
            return wc('focus', activeApp.id);
        }
    }
};

highlight = function(e) {
    if (e.id) {
        if (activeApp != null) {
            activeApp.classList.remove('highlight');
        }
        e.classList.add('highlight');
        return activeApp = e;
    }
};

nextApp = function() {
    var ref1;
    return highlight((ref1 = activeApp.nextSibling) != null ? ref1 : $('.apps').firstChild);
};

prevApp = function() {
    var ref1;
    return highlight((ref1 = activeApp.previousSibling) != null ? ref1 : $('.apps').lastChild);
};

quitApp = function() {
    return klog('quitApp', activeApp.id);
};

onMouseMove = function(event) {
    return highlight(event.target);
};

onMouseDown = function(event) {
    activeApp = event.target;
    return activate();
};

onKeyDown = function(event) {
    var char, combo, key, mod, ref1;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    switch (key) {
        case 'esc':
            done();
            break;
        case 'right':
            nextApp();
            break;
        case 'left':
            prevApp();
            break;
        case 'q':
            quitApp();
            break;
        case 'enter':
        case 'return':
        case 'space':
            activate();
            break;
        default:
            klog('onKeyDown', combo);
    }
    switch (combo) {
        case 'ctrl+shift+tab':
            return prevApp();
        case 'alt+ctrl+q':
            return electron.remote.app.quit();
    }
};

onKeyUp = function(event) {
    var char, combo, key, mod, ref1;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    if (empty(combo)) {
        return activate();
    }
};

initWin = function() {
    var a, win;
    win = electron.remote.getCurrentWindow();
    a = $('.apps');
    a.onmousedown = onMouseDown;
    a.onkeydown = onKeyDown;
    a.onkeyup = onKeyUp;
    if (!win.debug) {
        a.onblur = done;
    }
    loadApps();
    return post.on('nextApp', function() {
        var restore;
        if (win.isVisible()) {
            return nextApp();
        } else {
            win.setPosition(-10000, -10000);
            win.show();
            a = $('.apps');
            a.innerHTML = '';
            restore = function() {
                var wr;
                wr = winRect(apps.length);
                return win.setBounds(wr);
            };
            setTimeout(restore, 30);
            return loadApps();
        }
    });
};

loadApps = function() {
    var a, i, len, p, ref1, ref2;
    a = $('.apps');
    a.innerHTML = '';
    ref1 = getApps();
    for (i = 0, len = ref1.length; i < len; i++) {
        p = ref1[i];
        a.appendChild(elem('img', {
            id: p,
            "class": 'app',
            src: slash.fileUrl(pngPath(p))
        }));
    }
    a.focus();
    return highlight((ref2 = a.firstChild.nextSibling) != null ? ref2 : a.firstChild);
};

module.exports = {
    start: start,
    initWin: initWin
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSxxUkFBQTtJQUFBOztBQUFBLE1BQStGLE9BQUEsQ0FBUSxLQUFSLENBQS9GLEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLGVBQWhCLEVBQXNCLGlCQUF0QixFQUE2QixlQUE3QixFQUFtQyxlQUFuQyxFQUF5QyxpQkFBekMsRUFBZ0QsaUJBQWhELEVBQXVELGVBQXZELEVBQTZELGlCQUE3RCxFQUFvRSxlQUFwRSxFQUEwRSxlQUExRSxFQUFnRixxQkFBaEYsRUFBeUY7O0FBRXpGLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7QUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBUVgsSUFBQSxHQUFPOztBQUNQLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLEtBQUEsR0FBUSxFQUFBLENBQUcsTUFBSDtJQUVSLElBQUEsR0FBTztBQUNQLFNBQUEsdUNBQUE7O1FBQ0ksSUFBWSxJQUFJLENBQUMsS0FBTCxLQUFjLFlBQTFCO0FBQUEscUJBQUE7O1FBR0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLElBQWhCO1FBQ1AsSUFBRyxJQUFBLEtBQVEsMEJBQVg7WUFDSSxJQUFBLEdBQU8sSUFBQSxDQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWCxDQUFpQixNQUFqQixDQUFMO1lBQ1AsSUFBRyxJQUFBLEtBQVMsVUFBVCxJQUFBLElBQUEsS0FBb0IsTUFBdkI7Z0JBQ0ksSUFBa0IsYUFBWSxJQUFaLEVBQUEsSUFBQSxLQUFsQjtvQkFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBQTtpQkFESjthQUFBLE1BRUssWUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLFVBQWYsSUFBQSxJQUFBLEtBQTBCLFlBQTFCLElBQUEsSUFBQSxLQUF1QyxpQkFBMUM7Z0JBQ0QsSUFBSSxDQUFDLElB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MDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxueyBjaGlsZHAsIHBvc3QsIGthcmcsIHNsYXNoLCBkcmFnLCBlbGVtLCBwcmVmcywgY2xhbXAsIGtwb3MsIGVtcHR5LCBsYXN0LCBrbG9nLCBrZXlpbmZvLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbndjID0gcmVxdWlyZSAnLi93YydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuYXBwcyA9IFtdXG5nZXRBcHBzID0gLT5cblxuICAgIGluZm9zID0gd2MgJ2luZm8nXG4gICAgXG4gICAgYXBwcyA9IFtdXG4gICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgY29udGludWUgaWYgaW5mby50aXRsZSA9PSAnd3h3LXN3aXRjaCdcbiAgICAgICAgIyBjb250aW51ZSBpZiBpbmZvLnBhdGguZW5kc1dpdGggJ0ltbWVyc2l2ZUNvbnRyb2xQYW5lbFxcU3lzdGVtU2V0dGluZ3MuZXhlJ1xuICAgICAgICAjIGNvbnRpbnVlIGlmIGluZm8ucGF0aC5pbmRleE9mKCdcXFxcV2luZG93c0FwcHNcXFxcJykgPj0gMFxuICAgICAgICBmaWxlID0gc2xhc2guZmlsZSBpbmZvLnBhdGhcbiAgICAgICAgaWYgZmlsZSA9PSAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgbmFtZSA9IGxhc3QgaW5mby50aXRsZS5zcGxpdCAnID8tICdcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydDYWxlbmRhcicgJ01haWwnXVxuICAgICAgICAgICAgICAgIGFwcHMucHVzaCBuYW1lIGlmIG5hbWUgbm90IGluIGFwcHNcbiAgICAgICAgICAgIGVsc2UgaWYgaW5mby50aXRsZSBpbiBbJ1NldHRpbmdzJyAnQ2FsY3VsYXRvcicgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8udGl0bGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXBwcy5wdXNoIGluZm8ucGF0aCBpZiBpbmZvLnBhdGggbm90IGluIGFwcHNcbiAgICBhcHBzXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxucG5nUGF0aCA9IChhcHBQYXRoKSAtPlxuICAgICMga2xvZyAnYXBwUGF0aCcgYXBwUGF0aCwgc2xhc2guYmFzZShhcHBQYXRoKVxuICAgIHB0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICAjIGtsb2cgcHRoXG4gICAgcHRoXG4gICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxud2luUmVjdCA9IChudW1BcHBzKSAtPlxuICAgIFxuICAgIHNjcmVlbiA9IGVsZWN0cm9uLnJlbW90ZT8gYW5kIGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4gb3IgZWxlY3Ryb24uc2NyZWVuXG4gICAgc3MgPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBhcyA9IDEyOFxuICAgIGJvcmRlciA9IDIwXG4gICAgd2lkdGggPSAoYXMrYm9yZGVyKSphcHBzLmxlbmd0aCtib3JkZXJcbiAgICBoZWlnaHQgPSBhcytib3JkZXIqMlxuICAgIFxuICAgIHg6cGFyc2VJbnQgKHNzLndpZHRoLXdpZHRoKS8yXG4gICAgeTpwYXJzZUludCAoc3MuaGVpZ2h0LWhlaWdodCkvMlxuICAgIHdpZHRoOndpZHRoXG4gICAgaGVpZ2h0OmhlaWdodFxuXG5zdGFydCA9IChvcHQ9e30pIC0+IFxuICAgIFxuICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICBcbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgcG5nID0gcG5nUGF0aCBhcHBcbiAgICAgICAgaWYgbm90IHNsYXNoLmZpbGVFeGlzdHMgcG5nXG4gICAgICAgICAgICAjIGtsb2cgJ2ljb24nIGFwcCwgcG5nXG4gICAgICAgICAgICB3YyAnaWNvbicgYXBwLCBwbmdcbiAgICAgICAgXG4gICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMDAwMDAwMCdcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICB0cnVlXG4gICAgICAgIHByZWxvYWRXaW5kb3c6ICAgdHJ1ZVxuICAgICAgICB4OiAgICAgICAgICAgICAgIHdyLnhcbiAgICAgICAgeTogICAgICAgICAgICAgICB3ci55XG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgd3Iud2lkdGhcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICB3ci5oZWlnaHRcbiAgICAgICAgaGFzU2hhZG93OiAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgdGhpY2tGcmFtZTogICAgICBmYWxzZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICB3ZWJQcmVmZXJlbmNlczpcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgd2ViU2VjdXJpdHk6ICAgICBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGhlYWQ+XG4gICAgICAgIDx0aXRsZT53eHctc3dpdGNoPC90aXRsZT5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgKiB7XG4gICAgICAgICAgICAgICAgb3V0bGluZS13aWR0aDogIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogICAgICAgIDE7XG4gICAgICAgICAgICAgICAgd2hpdGUtc3BhY2U6ICAgIG5vd3JhcDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgcmlnaHQ6ICAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMTYsMTYsMTYpO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6ICA2cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgMTI4cHg7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogICAgICAgIDEwcHg7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgICAgICAuYXBwOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDIwLDIwLDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAuaGlnaGxpZ2h0IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAgICAgcmdiKDI0LDI0LDI0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFwcHNcIiB0YWJpbmRleD0wPjwvZGl2PlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgdmFyIHB0aCA9IHByb2Nlc3MucmVzb3VyY2VzUGF0aCArIFwiL2FwcC9qcy9zd2l0Y2guanNcIjtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnJlc291cmNlc1BhdGguaW5kZXhPZihcIm5vZGVfbW9kdWxlc1xcXFxcXFxcZWxlY3Ryb25cXFxcXFxcXGRpc3RcXFxcXFxcXHJlc291cmNlc1wiKT49MCkgeyBwdGggPSBwcm9jZXNzLmN3ZCgpICsgXCIvanMvc3dpdGNoLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0V2luKCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICBcbiAgICBpZiBvcHQuZGVidWdcbiAgICAgICAgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG4gICAgd2luXG4gICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxuZG9uZSA9IC0+IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkuaGlkZSgpXG5cbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxuYWN0aXZlQXBwID0gbnVsbFxuYWN0aXZhdGUgPSAtPlxuICAgIGRvbmUoKVxuICAgIGlmIGFjdGl2ZUFwcC5pZFxuICAgICAgICBpZiBhY3RpdmVBcHAuaWQgaW4gWydNYWlsJyAnQ2FsZW5kYXInXVxuICAgICAgICAgICAgaW5mb3MgPSB3YyAnaW5mbycgJ0FwcGxpY2F0aW9uRnJhbWVIb3N0LmV4ZSdcbiAgICAgICAgICAgIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgaWYgaW5mby50aXRsZS5lbmRzV2l0aCBhY3RpdmVBcHAuaWRcbiAgICAgICAgICAgICAgICAgICAgd2MgJ2ZvY3VzJyBpbmZvLmh3bmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBjaGlsZHAuc3Bhd24gJ3N0YXJ0JywgW3tNYWlsOidvdXRsb29rbWFpbDonIENhbGVuZGFyOidvdXRsb29rY2FsOid9W2FjdGl2ZUFwcC5pZF1dLCBlbmNvZGluZzondXRmOCcgc2hlbGw6dHJ1ZSBkZXRhY2hlZDp0cnVlIHN0ZGlvOidpbmhlcml0JyAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGFjdGl2ZUFwcC5pZCBpbiBbJ0NhbGN1bGF0b3InICdTZXR0aW5ncycgJ01pY3Jvc29mdCBTdG9yZSddXG4gICAgICAgICAgICBpbmZvcyA9IHdjICdpbmZvJyAnQXBwbGljYXRpb25GcmFtZUhvc3QuZXhlJ1xuICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICBpZiBpbmZvLnRpdGxlID09IGFjdGl2ZUFwcC5pZFxuICAgICAgICAgICAgICAgICAgICB3YyAnZm9jdXMnIGluZm8uaHduZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNoaWxkcC5zcGF3biAnc3RhcnQnLCBbe0NhbGN1bGF0b3I6J2NhbGN1bGF0b3I6JyBTZXR0aW5nczonbXMtc2V0dGluZ3M6JyAnTWljcm9zb2Z0IFN0b3JlJzonbXMtd2luZG93cy1zdG9yZTonfVthY3RpdmVBcHAuaWRdXSwgZW5jb2Rpbmc6J3V0ZjgnIHNoZWxsOnRydWUgZGV0YWNoZWQ6dHJ1ZSBzdGRpbzonaW5oZXJpdCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2MgJ2ZvY3VzJyBhY3RpdmVBcHAuaWQgXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmhpZ2hsaWdodCA9IChlKSAtPlxuICAgIGlmIGUuaWRcbiAgICAgICAgYWN0aXZlQXBwPy5jbGFzc0xpc3QucmVtb3ZlICdoaWdobGlnaHQnXG4gICAgICAgIGUuY2xhc3NMaXN0LmFkZCAnaGlnaGxpZ2h0J1xuICAgICAgICBhY3RpdmVBcHAgPSBlXG5cbm5leHRBcHAgPSAtPiBoaWdobGlnaHQgYWN0aXZlQXBwLm5leHRTaWJsaW5nID8gJCgnLmFwcHMnKS5maXJzdENoaWxkXG5wcmV2QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5wcmV2aW91c1NpYmxpbmcgPyAkKCcuYXBwcycpLmxhc3RDaGlsZFxucXVpdEFwcCA9IC0+IGtsb2cgJ3F1aXRBcHAnIGFjdGl2ZUFwcC5pZFxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5vbk1vdXNlTW92ZSA9IChldmVudCkgLT4gaGlnaGxpZ2h0IGV2ZW50LnRhcmdldFxuICAgIFxub25Nb3VzZURvd24gPSAoZXZlbnQpIC0+IFxuICAgIGFjdGl2ZUFwcCA9IGV2ZW50LnRhcmdldFxuICAgIGFjdGl2YXRlKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbm9uS2V5RG93biA9IChldmVudCkgLT4gXG4gICAgXG4gICAgeyBtb2QsIGtleSwgY2hhciwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICBcbiAgICBzd2l0Y2gga2V5XG4gICAgICAgIHdoZW4gJ2VzYycgICB0aGVuIGRvbmUoKVxuICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gcHJldkFwcCgpXG4gICAgICAgIHdoZW4gJ3EnICAgICB0aGVuIHF1aXRBcHAoKVxuICAgICAgICB3aGVuICdlbnRlcicgJ3JldHVybicgJ3NwYWNlJyB0aGVuIGFjdGl2YXRlKClcbiAgICAgICAgZWxzZSBrbG9nICdvbktleURvd24nIGNvbWJvXG4gICAgICAgIFxuICAgIHN3aXRjaCBjb21ib1xuICAgICAgICB3aGVuICdjdHJsK3NoaWZ0K3RhYicgdGhlbiBwcmV2QXBwKClcbiAgICAgICAgd2hlbiAnYWx0K2N0cmwrcScgICAgIHRoZW4gZWxlY3Ryb24ucmVtb3RlLmFwcC5xdWl0KClcbiAgICAgICAgXG5vbktleVVwID0gKGV2ZW50KSAtPiAgICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgIyBrbG9nIFwidXAgI3ttb2R9LCAje2tleX0sICN7Y2hhcn0sICN7Y29tYm99XCJcbiAgICBpZiBlbXB0eSBjb21ib1xuICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcblxuaW5pdFdpbiA9IC0+XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuICAgIFxuICAgIGEub25tb3VzZWRvd24gPSBvbk1vdXNlRG93blxuICAgIGEub25rZXlkb3duICAgPSBvbktleURvd25cbiAgICBhLm9ua2V5dXAgICAgID0gb25LZXlVcFxuICAgIFxuICAgIGlmIG5vdCB3aW4uZGVidWdcbiAgICAgICAgYS5vbmJsdXIgPSBkb25lXG4gICAgXG4gICAgbG9hZEFwcHMoKVxuICAgICAgICBcbiAgICBwb3N0Lm9uICduZXh0QXBwJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIHdpbi5pc1Zpc2libGUoKVxuICAgICAgICAgICAgbmV4dEFwcCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2luLnNldFBvc2l0aW9uIC0xMDAwMCwtMTAwMDAgIyBtb3ZlIHdpbmRvdyBvZmZzY3JlZW4gYmVmb3JlIHNob3dcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIGEgPSQgJy5hcHBzJ1xuICAgICAgICAgICAgYS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXN0b3JlID0gLT4gXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd3IgPSB3aW5SZWN0IGFwcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2luLnNldEJvdW5kcyB3clxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNldFRpbWVvdXQgcmVzdG9yZSwgMzAgIyBnaXZlIHdpbmRvd3Mgc29tZSB0aW1lIHRvIGRvIGl0J3MgZmxpY2tlcmluZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsb2FkQXBwcygpXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmxvYWRBcHBzID0gLT5cbiAgICBcbiAgICBhID0kICcuYXBwcydcbiAgICBhLmlubmVySFRNTCA9ICcnXG4gICAgXG4gICAgZm9yIHAgaW4gZ2V0QXBwcygpXG4gICAgICAgIGEuYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyxcbiAgICAgICAgICAgIGlkOiBwXG4gICAgICAgICAgICBjbGFzczonYXBwJyBcbiAgICAgICAgICAgIHNyYzpzbGFzaC5maWxlVXJsIHBuZ1BhdGggcFxuICAgICAgICBcbiAgICBhLmZvY3VzKClcbiAgICBcbiAgICBoaWdobGlnaHQgYS5maXJzdENoaWxkLm5leHRTaWJsaW5nID8gYS5maXJzdENoaWxkXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gXG4gICAgc3RhcnQ6c3RhcnRcbiAgICBpbml0V2luOmluaXRXaW5cbiAgICBcbiAgICBcbiAgICAiXX0=
//# sourceURL=../coffee/switch.coffee