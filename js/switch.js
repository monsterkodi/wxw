// koffee 1.3.0
var $, activate, activeApp, childp, clamp, done, drag, electron, elem, empty, getApps, highlight, initWin, karg, keyinfo, klog, kpos, loadApps, nextApp, onKeyDown, onKeyUp, onMouseDown, onMouseMove, pngPath, post, prefs, prevApp, quitApp, ref, slash, start, wc,
    indexOf = [].indexOf;

ref = require('kxk'), childp = ref.childp, post = ref.post, karg = ref.karg, slash = ref.slash, drag = ref.drag, elem = ref.elem, prefs = ref.prefs, clamp = ref.clamp, kpos = ref.kpos, empty = ref.empty, klog = ref.klog, keyinfo = ref.keyinfo, $ = ref.$;

wc = require('./wc');

electron = require('electron');

getApps = function() {
    var apps, i, info, infos, len, ref1;
    infos = wc('info');
    apps = [];
    for (i = 0, len = infos.length; i < len; i++) {
        info = infos[i];
        if (info.title !== 'wxw-switch') {
            if (ref1 = info.path, indexOf.call(apps, ref1) < 0) {
                apps.push(info.path);
            }
        }
    }
    return apps;
};

pngPath = function(appPath) {
    return slash.resolve(slash.join(slash.userData(), 'icons', slash.base(appPath) + ".png"));
};

start = function(opt) {
    var app, apps, as, border, data, height, html, i, len, png, ss, width, win;
    if (opt == null) {
        opt = {};
    }
    ss = electron.screen.getPrimaryDisplay().workAreaSize;
    as = 128;
    border = 20;
    apps = getApps();
    for (i = 0, len = apps.length; i < len; i++) {
        app = apps[i];
        png = pngPath(slash.base(app));
        if (!slash.fileExists(png)) {
            klog('icon', app, png);
            wc('icon', app, png);
        }
    }
    width = (as + border) * apps.length + border;
    height = as + border * 2;
    win = new electron.BrowserWindow({
        backgroundColor: '#00000000',
        transparent: true,
        preloadWindow: true,
        x: parseInt((ss.width - width) / 2),
        y: parseInt((ss.height - height) / 2),
        width: width,
        height: height,
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

highlight = function(e) {
    if (e.id) {
        if (activeApp != null) {
            activeApp.classList.remove('highlight');
        }
        e.classList.add('highlight');
        return activeApp = e;
    }
};

activate = function() {
    done();
    if (activeApp.id) {
        return wc('focus', activeApp.id);
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
    loadApps();
    return post.on('nextApp', function() {
        if (win.isVisible()) {
            return nextApp();
        } else {
            a = $('.apps');
            a.innerHTML = '';
            win.show();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSxnUUFBQTtJQUFBOztBQUFBLE1BQXlGLE9BQUEsQ0FBUSxLQUFSLENBQXpGLEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLGVBQWhCLEVBQXNCLGlCQUF0QixFQUE2QixlQUE3QixFQUFtQyxlQUFuQyxFQUF5QyxpQkFBekMsRUFBZ0QsaUJBQWhELEVBQXVELGVBQXZELEVBQTZELGlCQUE3RCxFQUFvRSxlQUFwRSxFQUEwRSxxQkFBMUUsRUFBbUY7O0FBRW5GLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7QUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBUVgsT0FBQSxHQUFVLFNBQUE7QUFFTixRQUFBO0lBQUEsS0FBQSxHQUFRLEVBQUEsQ0FBRyxNQUFIO0lBRVIsSUFBQSxHQUFPO0FBQ1AsU0FBQSx1Q0FBQTs7UUFDSSxJQUFHLElBQUksQ0FBQyxLQUFMLEtBQWMsWUFBakI7WUFDSSxXQUF1QixJQUFJLENBQUMsSUFBTCxFQUFBLGFBQWlCLElBQWpCLEVBQUEsSUFBQSxLQUF2QjtnQkFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxJQUFmLEVBQUE7YUFESjs7QUFESjtXQUlBO0FBVE07O0FBaUJWLE9BQUEsR0FBVSxTQUFDLE9BQUQ7V0FFTixLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFYLEVBQTZCLE9BQTdCLEVBQXNDLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLEdBQXNCLE1BQTVELENBQWQ7QUFGTTs7QUFVVixLQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosUUFBQTs7UUFGSyxNQUFJOztJQUVULEVBQUEsR0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENBQW1DLENBQUM7SUFFekMsRUFBQSxHQUFL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QUMsV0FBRixHQUFnQjtJQUNoQixDQUFDLENBQUMsU0FBRixHQUFnQjtJQUNoQixDQUFDLENBQUMsT0FBRixHQUFnQjtJQUtoQixRQUFBLENBQUE7V0FFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsRUFBa0IsU0FBQTtRQUVkLElBQUcsR0FBRyxDQUFDLFNBQUosQ0FBQSxDQUFIO21CQUNJLE9BQUEsQ0FBQSxFQURKO1NBQUEsTUFBQTtZQUdJLENBQUEsR0FBRyxDQUFBLENBQUUsT0FBRjtZQUNILENBQUMsQ0FBQyxTQUFGLEdBQWM7WUFDZCxHQUFHLENBQUMsSUFBSixDQUFBO21CQUNBLFFBQUEsQ0FBQSxFQU5KOztJQUZjLENBQWxCO0FBZk07O0FBK0JWLFFBQUEsR0FBVyxTQUFBO0FBRVAsUUFBQTtJQUFBLENBQUEsR0FBRyxDQUFBLENBQUUsT0FBRjtJQUNILENBQUMsQ0FBQyxTQUFGLEdBQWM7QUFFZDtBQUFBLFNBQUEsc0NBQUE7O1FBQ0ksQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFBLENBQUssS0FBTCxFQUNWO1lBQUEsRUFBQSxFQUFJLENBQUo7WUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLEtBRE47WUFFQSxHQUFBLEVBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFBLENBQVEsQ0FBUixDQUFkLENBRko7U0FEVSxDQUFkO0FBREo7SUFNQSxDQUFDLENBQUMsS0FBRixDQUFBO1dBRUEsU0FBQSxvREFBcUMsQ0FBQyxDQUFDLFVBQXZDO0FBYk87O0FBZVgsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLEtBQUEsRUFBTSxLQUFOO0lBQ0EsT0FBQSxFQUFRLE9BRFIiLCJzb3VyY2VzQ29udGVudCI6WyIjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG57IGNoaWxkcCwgcG9zdCwga2FyZywgc2xhc2gsIGRyYWcsIGVsZW0sIHByZWZzLCBjbGFtcCwga3BvcywgZW1wdHksIGtsb2csIGtleWluZm8sICQgfSA9IHJlcXVpcmUgJ2t4aydcblxud2MgPSByZXF1aXJlICcuL3djJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgIDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5nZXRBcHBzID0gLT5cblxuICAgIGluZm9zID0gd2MgJ2luZm8nXG4gICAgXG4gICAgYXBwcyA9IFtdXG4gICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgaWYgaW5mby50aXRsZSAhPSAnd3h3LXN3aXRjaCdcbiAgICAgICAgICAgIGFwcHMucHVzaCBpbmZvLnBhdGggaWYgaW5mby5wYXRoIG5vdCBpbiBhcHBzXG4gICAgICAgICAgICBcbiAgICBhcHBzXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxucG5nUGF0aCA9IChhcHBQYXRoKSAtPlxuICAgICMga2xvZyAnYXBwUGF0aCcgYXBwUGF0aCwgc2xhc2guYmFzZShhcHBQYXRoKVxuICAgIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5zdGFydCA9IChvcHQ9e30pIC0+IFxuXG4gICAgc3MgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBcbiAgICBhcyA9IDEyOFxuICAgIGJvcmRlciA9IDIwXG4gICAgXG4gICAgYXBwcyA9IGdldEFwcHMoKVxuICAgIFxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBwbmcgPSBwbmdQYXRoIHNsYXNoLmJhc2UgYXBwXG4gICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAga2xvZyAnaWNvbicgYXBwLCBwbmdcbiAgICAgICAgICAgIHdjICdpY29uJyBhcHAsIHBuZ1xuICAgIFxuICAgIHdpZHRoID0gKGFzK2JvcmRlcikqYXBwcy5sZW5ndGgrYm9yZGVyXG4gICAgaGVpZ2h0ID0gYXMrYm9yZGVyKjJcbiAgICAgICAgICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzAwMDAwMDAwJ1xuICAgICAgICB0cmFuc3BhcmVudDogICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgIHg6ICAgICAgICAgICAgICAgcGFyc2VJbnQgKHNzLndpZHRoLXdpZHRoKS8yXG4gICAgICAgIHk6ICAgICAgICAgICAgICAgcGFyc2VJbnQgKHNzLmhlaWdodC1oZWlnaHQpLzJcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICB3aWR0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgIGhlaWdodFxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICB0aGlja0ZyYW1lOiAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgc2hvdzogICAgICAgICAgICB0cnVlXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgPHRpdGxlPnd4dy1zd2l0Y2g8L3RpdGxlPlxuICAgICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICAqIHtcbiAgICAgICAgICAgICAgICBvdXRsaW5lLXdpZHRoOiAgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICAgICAgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHBzIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAgICAgICAgMTtcbiAgICAgICAgICAgICAgICB3aGl0ZS1zcGFjZTogICAgbm93cmFwO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgICBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICAgICAwcHg7XG4gICAgICAgICAgICAgICAgYm90dG9tOiAgICAgICAgIDBweDtcbiAgICAgICAgICAgICAgICByaWdodDogICAgICAgICAgMHB4O1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogICAgIHJnYigxNiwxNiwxNik7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogIDZweDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAgICAgICAgMTBweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICAgICAgICBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgIDEyOHB4O1xuICAgICAgICAgICAgICAgIGhlaWdodDogICAgICAgICAxMjhweDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAgICAgICAgMTBweDtcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIC5hcHA6aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjAsMjAsMjApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcC5oaWdobGlnaHQge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICAgICByZ2IoMjQsMjQsMjQpO1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXBwc1wiIHRhYmluZGV4PTA+PC9kaXY+XG4gICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICB2YXIgcHRoID0gcHJvY2Vzcy5yZXNvdXJjZXNQYXRoICsgXCIvYXBwL2pzL3N3aXRjaC5qc1wiO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzXFxcXFxcXFxlbGVjdHJvblxcXFxcXFxcZGlzdFxcXFxcXFxccmVzb3VyY2VzXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy9zd2l0Y2guanNcIjsgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cocHRoLCBwcm9jZXNzLnJlc291cmNlc1BhdGgpO1xuICAgICAgICAgICAgcmVxdWlyZShwdGgpLmluaXRXaW4oKTtcbiAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICBcIlwiXCJcblxuICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbClcbiAgICB3aW4ubG9hZFVSTCBkYXRhLCBiYXNlVVJMRm9yRGF0YVVSTDpzbGFzaC5maWxlVXJsIF9fZGlybmFtZSArICcvaW5kZXguaHRtbCdcblxuICAgIHdpbi5kZWJ1ZyA9IG9wdC5kZWJ1Z1xuICAgIFxuICAgIGlmIG9wdC5kZWJ1Z1xuICAgICAgICB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcbiAgICB3aW5cbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5kb25lID0gLT4gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5oaWRlKClcblxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxuYWN0aXZlQXBwID0gbnVsbFxuXG5oaWdobGlnaHQgPSAoZSkgLT5cbiAgICBpZiBlLmlkXG4gICAgICAgIGFjdGl2ZUFwcD8uY2xhc3NMaXN0LnJlbW92ZSAnaGlnaGxpZ2h0J1xuICAgICAgICBlLmNsYXNzTGlzdC5hZGQgJ2hpZ2hsaWdodCdcbiAgICAgICAgYWN0aXZlQXBwID0gZVxuXG5hY3RpdmF0ZSA9IC0+XG4gICAgZG9uZSgpXG4gICAgd2MgJ2ZvY3VzJyBhY3RpdmVBcHAuaWQgaWYgYWN0aXZlQXBwLmlkXG5cbm5leHRBcHAgPSAtPiBoaWdobGlnaHQgYWN0aXZlQXBwLm5leHRTaWJsaW5nID8gJCgnLmFwcHMnKS5maXJzdENoaWxkXG5wcmV2QXBwID0gLT4gaGlnaGxpZ2h0IGFjdGl2ZUFwcC5wcmV2aW91c1NpYmxpbmcgPyAkKCcuYXBwcycpLmxhc3RDaGlsZFxucXVpdEFwcCA9IC0+IGtsb2cgJ3F1aXRBcHAnIGFjdGl2ZUFwcC5pZFxuICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5vbk1vdXNlTW92ZSA9IChldmVudCkgLT4gaGlnaGxpZ2h0IGV2ZW50LnRhcmdldFxuICAgIFxub25Nb3VzZURvd24gPSAoZXZlbnQpIC0+IFxuICAgIGFjdGl2ZUFwcCA9IGV2ZW50LnRhcmdldFxuICAgIGFjdGl2YXRlKClcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbm9uS2V5RG93biA9IChldmVudCkgLT4gXG4gICAgXG4gICAgeyBtb2QsIGtleSwgY2hhciwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICBcbiAgICBzd2l0Y2gga2V5XG4gICAgICAgIHdoZW4gJ2VzYycgICB0aGVuIGRvbmUoKVxuICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBuZXh0QXBwKClcbiAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gcHJldkFwcCgpXG4gICAgICAgIHdoZW4gJ3EnICAgICB0aGVuIHF1aXRBcHAoKVxuICAgICAgICB3aGVuICdlbnRlcicgJ3JldHVybicgJ3NwYWNlJyB0aGVuIGFjdGl2YXRlKClcbiAgICAgICAgZWxzZSBrbG9nICdvbktleURvd24nIGNvbWJvXG4gICAgICAgIFxuICAgIHN3aXRjaCBjb21ib1xuICAgICAgICB3aGVuICdjdHJsK3NoaWZ0K3RhYicgdGhlbiBwcmV2QXBwKClcbiAgICAgICAgd2hlbiAnYWx0K2N0cmwrcScgICAgIHRoZW4gZWxlY3Ryb24ucmVtb3RlLmFwcC5xdWl0KClcbiAgICAgICAgXG5vbktleVVwID0gKGV2ZW50KSAtPiAgICAgICAgIFxuICAgIFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgIyBrbG9nIFwidXAgI3ttb2R9LCAje2tleX0sICN7Y2hhcn0sICN7Y29tYm99XCJcbiAgICBpZiBlbXB0eSBjb21ib1xuICAgICAgICBhY3RpdmF0ZSgpXG4gICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICBcblxuaW5pdFdpbiA9IC0+XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuICAgIFxuICAgIGEub25tb3VzZWRvd24gPSBvbk1vdXNlRG93blxuICAgIGEub25rZXlkb3duICAgPSBvbktleURvd25cbiAgICBhLm9ua2V5dXAgICAgID0gb25LZXlVcFxuICAgIFxuICAgICMgaWYgbm90IHdpbi5kZWJ1Z1xuICAgICAgICAjIGEub25ibHVyID0gZG9uZVxuICAgIFxuICAgIGxvYWRBcHBzKClcbiAgICAgICAgXG4gICAgcG9zdC5vbiAnbmV4dEFwcCcgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiB3aW4uaXNWaXNpYmxlKClcbiAgICAgICAgICAgIG5leHRBcHAoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhID0kICcuYXBwcydcbiAgICAgICAgICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIGxvYWRBcHBzKClcbiAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxubG9hZEFwcHMgPSAtPlxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuICAgIGEuaW5uZXJIVE1MID0gJydcbiAgICBcbiAgICBmb3IgcCBpbiBnZXRBcHBzKClcbiAgICAgICAgYS5hcHBlbmRDaGlsZCBlbGVtICdpbWcnLFxuICAgICAgICAgICAgaWQ6IHBcbiAgICAgICAgICAgIGNsYXNzOidhcHAnIFxuICAgICAgICAgICAgc3JjOnNsYXNoLmZpbGVVcmwgcG5nUGF0aCBwXG4gICAgICAgIFxuICAgIGEuZm9jdXMoKVxuICAgIFxuICAgIGhpZ2hsaWdodCBhLmZpcnN0Q2hpbGQubmV4dFNpYmxpbmcgPyBhLmZpcnN0Q2hpbGRcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBcbiAgICBzdGFydDpzdGFydFxuICAgIGluaXRXaW46aW5pdFdpblxuICAgIFxuICAgIFxuICAgICJdfQ==
//# sourceURL=../coffee/switch.coffee