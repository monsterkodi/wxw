// koffee 1.3.0
var $, childp, clamp, done, drag, electron, elem, getApps, init, karg, keyinfo, klog, kpos, onKeyDown, onMouseDown, onMouseMove, pngPath, post, prefs, ref, slash, start, wc,
    indexOf = [].indexOf;

ref = require('kxk'), childp = ref.childp, post = ref.post, karg = ref.karg, slash = ref.slash, drag = ref.drag, elem = ref.elem, prefs = ref.prefs, clamp = ref.clamp, kpos = ref.kpos, klog = ref.klog, keyinfo = ref.keyinfo, $ = ref.$;

wc = require('./wc');

electron = require('electron');

getApps = function() {
    var apps, i, info, infos, len, ref1;
    infos = wc('info');
    apps = [];
    for (i = 0, len = infos.length; i < len; i++) {
        info = infos[i];
        if (ref1 = info.path, indexOf.call(apps, ref1) < 0) {
            apps.push(info.path);
        }
    }
    klog('apps', apps.map(function(a) {
        return slash.base(a);
    }));
    return apps;
};

pngPath = function(appPath) {
    return slash.resolve(slash.join(slash.userData(), 'icons', slash.base(appPath) + ".png"));
};

start = function(opt) {
    var app, apps, as, data, html, i, len, png, ss, win;
    if (opt == null) {
        opt = {};
    }
    ss = electron.screen.getPrimaryDisplay().workAreaSize;
    as = parseInt(ss.height / 10);
    apps = getApps();
    for (i = 0, len = apps.length; i < len; i++) {
        app = apps[i];
        png = pngPath(slash.base(app));
        if (!slash.fileExists(png)) {
            klog('icon', app, png);
            wc('icon', app, png);
        }
    }
    win = new electron.BrowserWindow({
        backgroundColor: '#222222',
        transparent: true,
        preloadWindow: true,
        x: parseInt((ss.width - as * apps.length) / 2),
        y: parseInt((ss.height - as) / 2),
        width: as * apps.length,
        height: as,
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
    html = "<head>\n<style type=\"text/css\">\n    body {\n        overflow:       hidden;\n        margin:         0;\n        border:         none;\n    }\n    .apps {\n        position:       absolute;\n        left:           0;\n        top:            0;\n        bottom:         0;\n        right:          0;\n        display:        flex;\n    }\n    .app {\n        flex:           1 1 0;\n        border:         1px solid white;\n    }\n</style>\n</head>\n<body>\n<div class=\"apps\" tabindex=0></div>\n<script>\n    var pth = process.resourcesPath + \"/app/js/switch.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/switch.js\"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).init();\n</script>\n</body>";
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
    return electron.remote.getCurrentWindow().close();
};

onMouseMove = function(event) {};

onMouseDown = function(event) {
    return done();
};

onKeyDown = function(event) {
    var char, combo, key, mod, ref1;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, char = ref1.char, combo = ref1.combo;
    switch (key) {
        case 'esc':
            return done();
        default:
            return klog('onKeyDown', combo);
    }
};

init = function() {
    var a, apps, i, len, p, win;
    win = electron.remote.getCurrentWindow();
    a = $('.apps');
    a.onmousemove = onMouseMove;
    a.onkeydown = onKeyDown;
    apps = getApps();
    for (i = 0, len = apps.length; i < len; i++) {
        p = apps[i];
        a.appendChild(elem('img', {
            "class": 'app',
            src: slash.fileUrl(pngPath(p.path))
        }));
    }
    return a.focus();
};

module.exports = {
    start: start,
    init: init
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSx3S0FBQTtJQUFBOztBQUFBLE1BQWtGLE9BQUEsQ0FBUSxLQUFSLENBQWxGLEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLGVBQWhCLEVBQXNCLGlCQUF0QixFQUE2QixlQUE3QixFQUFtQyxlQUFuQyxFQUF5QyxpQkFBekMsRUFBZ0QsaUJBQWhELEVBQXVELGVBQXZELEVBQTZELGVBQTdELEVBQW1FLHFCQUFuRSxFQUE0RTs7QUFFNUUsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSOztBQUNMLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFWCxPQUFBLEdBQVUsU0FBQTtBQUVOLFFBQUE7SUFBQSxLQUFBLEdBQVEsRUFBQSxDQUFHLE1BQUg7SUFFUixJQUFBLEdBQU87QUFDUCxTQUFBLHVDQUFBOztRQUNJLFdBQXVCLElBQUksQ0FBQyxJQUFMLEVBQUEsYUFBaUIsSUFBakIsRUFBQSxJQUFBLEtBQXZCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsSUFBZixFQUFBOztBQURKO0lBR0EsSUFBQSxDQUFLLE1BQUwsRUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQUMsQ0FBRDtlQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtJQUFQLENBQVQsQ0FBWjtXQUNBO0FBVE07O0FBV1YsT0FBQSxHQUFVLFNBQUMsT0FBRDtXQUVOLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0IsRUFBcUMsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLENBQUEsR0FBc0IsTUFBM0QsQ0FBZDtBQUZNOztBQVVWLEtBQUEsR0FBUSxTQUFDLEdBQUQ7QUFFSixRQUFBOztRQUZLLE1BQUk7O0lBRVQsRUFBQSxHQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQztJQUV6QyxFQUFBLEdBQUssUUFBQSxDQUFTLEVBQUUsQ0FBQyxNQUFILEdBQVUsRUFBbkI7SUFFTCxJQUFBLEdBQU8sT0FBQSxDQUFBO0FBRVAsU0FBQSxzQ0FBQTs7UUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxDQUFSO1FBQ04sSUFBRyxDQUFJLEtBQUssQ0FBQyxVQUFOLENBQWlCLEdBQWpCLENBQVA7WUFDSSxJQUFBLENBQUssTUFBTCxFQUFZLEdBQVosRUFBaUIsR0FBakI7WUFDQSxFQUFBLENBQUcsTUFBSCxFQUFVLEdBQVYsRUFBZSxHQUFmLEVBRko7O0FBRko7SUFNQSxHQUFBLEdBQU0sSUFBSSxRQUFRLENBQUMsYUFBYixDQUVGO1FBQUEsZUFBQSxFQUFpQixTQUFqQjtRQUNBLFdBQUEsRUFBaUIsSUFEakI7UUFFQSxhQUFBLEVBQWlCLElBRmpCO1FBR0EsQ0FBQSxFQUFpQixRQUFBLENBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSCxHQUFTLEVBQUEsR0FBRyxJQUFJLENBQUMsTUFBbEIsQ0FBQSxHQUEwQixDQUFuQyxDQUhqQjtRQUlBLENBQUEsRUFBaUIsUUFBQSxDQUFTLENBQUMsRUFBRSxDQUFDLE1BQUgsR0FBVSxFQUFYLENBQUEsR0FBZSxDQUF4QixDQUpqQjtRQUtBLEtBQUEsRUFBaUIsRUFBQSxHQUFHLElBQUksQ0FBQyxNQUx6QjtRQU1BLE1BQUEsRUFBaUIsRUFOakI7UUFPQSxTQUFBLEVBQWlCLEtBUGpCO1FBUUEsU0FBQSxFQUFpQixLQVJqQjtRQVNBLEtBQUEsRUFBaUIsS0FUakI7UUFVQSxVQUFBLEVBQWlCLEtBVmpCO1FBV0EsVUFBQSxFQUFpQixLQVhqQjtRQVlBLElBQUEsRUFBaUIsSUFaakI7UUFhQSxjQUFBLEVBQ0k7WUFBQSxlQUFBLEVBQWlCLElBQWpCO1lBQ0EsV0FBQSxFQUFpQixLQURqQjtTQWRKO0tBRkU7SUFtQk4sSUFBQSxHQUFPO0lBaUNQLElBQUEsR0FBTywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtJQUN6QyxHQUFHLENBQUMsT0FBSixDQUFZLElBQVosRUFBa0I7UUFBQSxpQkFBQSxFQUFrQixLQUFLLENBQUMsT0FBTixDQUFjLFNBQUEsR0FBWSxhQUExQixDQUFsQjtLQUFsQjtJQUVBLEdBQUcsQ0FBQyxLQUFKLEdBQVksR0FBRyxDQUFDO0lBRWhCLElBQUcsR0FBRyxDQUFDLEtBQVA7UUFDSSxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQWhCLENBQUEsRUFESjs7V0FFQTtBQXpFSTs7QUEyRVIsSUFBQSxHQUFPLFNBQUE7V0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFoQixDQUFBLENBQWtDLENBQUMsS0FBbkMsQ0FBQTtBQUFIOztBQUVQLFdBQUEsR0FBYyxTQUFDLEtBQUQsR0FBQTs7QUFDZCxXQUFBLEdBQWMsU0FBQyxLQUFEO1dBQVcsSUFBQSxDQUFBO0FBQVg7O0FBQ2QsU0FBQSxHQUFZLFNBQUMsS0FBRDtBQUNSLFFBQUE7SUFBQSxPQUE0QixPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUE1QixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVksZ0JBQVosRUFBa0I7QUFDbEIsWUFBTyxHQUFQO0FBQUEsYUFDUyxLQURUO21CQUNvQixJQUFBLENBQUE7QUFEcEI7bUJBRVMsSUFBQSxDQUFLLFdBQUwsRUFBaUIsS0FBakI7QUFGVDtBQUZROztBQVlaLElBQUEsR0FBTyxTQUFBO0FBRUgsUUFBQTtJQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFoQixDQUFBO0lBRU4sQ0FBQSxHQUFHLENBQUEsQ0FBRSxPQUFGO0lBRUgsQ0FBQyxDQUFDLFdBQUYsR0FBaUI7SUFDakIsQ0FBQyxDQUFDLFNBQUYsR0FBaUI7SUFLakIsSUFBQSxHQUFPLE9BQUEsQ0FBQTtBQUVQLFNBQUEsc0NBQUE7O1FBQ0ksQ0FBQyxDQUFDLFdBQUYsQ0FBYyxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxLQUFOO1lBQVksR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBQSxDQUFRLENBQUMsQ0FBQyxJQUFWLENBQWQsQ0FBaEI7U0FBWCxDQUFkO0FBREo7V0FHQSxDQUFDLENBQUMsS0FBRixDQUFBO0FBakJHOztBQW1CUCxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsS0FBQSxFQUFNLEtBQU47SUFDQSxJQUFBLEVBQUssSUFETCIsInNvdXJjZXNDb250ZW50IjpbIiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbnsgY2hpbGRwLCBwb3N0LCBrYXJnLCBzbGFzaCwgZHJhZywgZWxlbSwgcHJlZnMsIGNsYW1wLCBrcG9zLCBrbG9nLCBrZXlpbmZvLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbndjID0gcmVxdWlyZSAnLi93YydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmdldEFwcHMgPSAtPlxuXG4gICAgaW5mb3MgPSB3YyAnaW5mbydcbiAgICBcbiAgICBhcHBzID0gW11cbiAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICBhcHBzLnB1c2ggaW5mby5wYXRoIGlmIGluZm8ucGF0aCBub3QgaW4gYXBwc1xuICAgICAgICAgICAgXG4gICAga2xvZyAnYXBwcycgYXBwcy5tYXAgKGEpIC0+IHNsYXNoLmJhc2UgYVxuICAgIGFwcHNcbiAgICBcbnBuZ1BhdGggPSAoYXBwUGF0aCkgLT5cbiAgICBcbiAgICBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJyBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5zdGFydCA9IChvcHQ9e30pIC0+IFxuXG4gICAgc3MgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICBcbiAgICBhcyA9IHBhcnNlSW50IHNzLmhlaWdodC8xMFxuICAgIFxuICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICBcbiAgICBmb3IgYXBwIGluIGFwcHNcbiAgICAgICAgcG5nID0gcG5nUGF0aCBzbGFzaC5iYXNlIGFwcFxuICAgICAgICBpZiBub3Qgc2xhc2guZmlsZUV4aXN0cyBwbmdcbiAgICAgICAgICAgIGtsb2cgJ2ljb24nIGFwcCwgcG5nXG4gICAgICAgICAgICB3YyAnaWNvbicgYXBwLCBwbmdcbiAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMyMjIyMjInXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICBwcmVsb2FkV2luZG93OiAgIHRydWVcbiAgICAgICAgeDogICAgICAgICAgICAgICBwYXJzZUludCAoc3Mud2lkdGgtYXMqYXBwcy5sZW5ndGgpLzJcbiAgICAgICAgeTogICAgICAgICAgICAgICBwYXJzZUludCAoc3MuaGVpZ2h0LWFzKS8yXG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgYXMqYXBwcy5sZW5ndGhcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICBhc1xuICAgICAgICBoYXNTaGFkb3c6ICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICB0aGlja0ZyYW1lOiAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgZmFsc2VcbiAgICAgICAgc2hvdzogICAgICAgICAgICB0cnVlXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxoZWFkPlxuICAgICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICAgICAgICBib2R5IHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogICAgICAgaGlkZGVuO1xuICAgICAgICAgICAgICAgIG1hcmdpbjogICAgICAgICAwO1xuICAgICAgICAgICAgICAgIGJvcmRlcjogICAgICAgICBub25lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcHMge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgICBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICBib3R0b206ICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICByaWdodDogICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAgICAgICAgZmxleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC5hcHAge1xuICAgICAgICAgICAgICAgIGZsZXg6ICAgICAgICAgICAxIDEgMDtcbiAgICAgICAgICAgICAgICBib3JkZXI6ICAgICAgICAgMXB4IHNvbGlkIHdoaXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXBwc1wiIHRhYmluZGV4PTA+PC9kaXY+XG4gICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICB2YXIgcHRoID0gcHJvY2Vzcy5yZXNvdXJjZXNQYXRoICsgXCIvYXBwL2pzL3N3aXRjaC5qc1wiO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzXFxcXFxcXFxlbGVjdHJvblxcXFxcXFxcZGlzdFxcXFxcXFxccmVzb3VyY2VzXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy9zd2l0Y2guanNcIjsgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cocHRoLCBwcm9jZXNzLnJlc291cmNlc1BhdGgpO1xuICAgICAgICAgICAgcmVxdWlyZShwdGgpLmluaXQoKTtcbiAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICBcIlwiXCJcblxuICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbCkgXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICBcbiAgICBpZiBvcHQuZGVidWdcbiAgICAgICAgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG4gICAgd2luXG4gICAgICAgIFxuZG9uZSA9IC0+IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkuY2xvc2UoKVxuXG5vbk1vdXNlTW92ZSA9IChldmVudCkgLT4gXG5vbk1vdXNlRG93biA9IChldmVudCkgLT4gZG9uZSgpXG5vbktleURvd24gPSAoZXZlbnQpIC0+IFxuICAgIHsgbW9kLCBrZXksIGNoYXIsIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgc3dpdGNoIGtleVxuICAgICAgICB3aGVuICdlc2MnIHRoZW4gZG9uZSgpXG4gICAgICAgIGVsc2Uga2xvZyAnb25LZXlEb3duJyBjb21ib1xuXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgICBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcblxuaW5pdCA9IC0+XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIFxuICAgIGEgPSQgJy5hcHBzJ1xuICAgIFxuICAgIGEub25tb3VzZW1vdmUgID0gb25Nb3VzZU1vdmVcbiAgICBhLm9ua2V5ZG93biAgICA9IG9uS2V5RG93blxuICAgIFxuICAgICMgaWYgbm90IHdpbi5kZWJ1Z1xuICAgICAgICAjIGEub25ibHVyID0gZG9uZVxuICAgIFxuICAgIGFwcHMgPSBnZXRBcHBzKClcbiAgICAgICAgXG4gICAgZm9yIHAgaW4gYXBwc1xuICAgICAgICBhLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2FwcCcgc3JjOnNsYXNoLmZpbGVVcmwgcG5nUGF0aCBwLnBhdGhcbiAgICAgICAgXG4gICAgYS5mb2N1cygpXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIHN0YXJ0OnN0YXJ0XG4gICAgaW5pdDppbml0XG4gICAgXG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/switch.coffee