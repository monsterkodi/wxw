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
    klog('appPath', appPath, slash.base(appPath));
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
            src: slash.fileUrl(pngPath(p))
        }));
    }
    return a.focus();
};

module.exports = {
    start: start,
    init: init
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSx3S0FBQTtJQUFBOztBQUFBLE1BQWtGLE9BQUEsQ0FBUSxLQUFSLENBQWxGLEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLGVBQWhCLEVBQXNCLGlCQUF0QixFQUE2QixlQUE3QixFQUFtQyxlQUFuQyxFQUF5QyxpQkFBekMsRUFBZ0QsaUJBQWhELEVBQXVELGVBQXZELEVBQTZELGVBQTdELEVBQW1FLHFCQUFuRSxFQUE0RTs7QUFFNUUsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSOztBQUNMLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFWCxPQUFBLEdBQVUsU0FBQTtBQUVOLFFBQUE7SUFBQSxLQUFBLEdBQVEsRUFBQSxDQUFHLE1BQUg7SUFFUixJQUFBLEdBQU87QUFDUCxTQUFBLHVDQUFBOztRQUNJLFdBQXVCLElBQUksQ0FBQyxJQUFMLEVBQUEsYUFBaUIsSUFBakIsRUFBQSxJQUFBLEtBQXZCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsSUFBZixFQUFBOztBQURKO0lBR0EsSUFBQSxDQUFLLE1BQUwsRUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQUMsQ0FBRDtlQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtJQUFQLENBQVQsQ0FBWjtXQUNBO0FBVE07O0FBV1YsT0FBQSxHQUFVLFNBQUMsT0FBRDtJQUNOLElBQUEsQ0FBSyxTQUFMLEVBQWUsT0FBZixFQUF3QixLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBeEI7V0FDQSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFYLEVBQTZCLE9BQTdCLEVBQXNDLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLEdBQXNCLE1BQTVELENBQWQ7QUFGTTs7QUFVVixLQUFB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Q0FBQyxXQUFGLENBQWMsSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sS0FBTjtZQUFZLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLE9BQUEsQ0FBUSxDQUFSLENBQWQsQ0FBaEI7U0FBWCxDQUFkO0FBREo7V0FHQSxDQUFDLENBQUMsS0FBRixDQUFBO0FBakJHOztBQW1CUCxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsS0FBQSxFQUFNLEtBQU47SUFDQSxJQUFBLEVBQUssSUFETCIsInNvdXJjZXNDb250ZW50IjpbIiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbnsgY2hpbGRwLCBwb3N0LCBrYXJnLCBzbGFzaCwgZHJhZywgZWxlbSwgcHJlZnMsIGNsYW1wLCBrcG9zLCBrbG9nLCBrZXlpbmZvLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbndjID0gcmVxdWlyZSAnLi93YydcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmdldEFwcHMgPSAtPlxuXG4gICAgaW5mb3MgPSB3YyAnaW5mbydcbiAgICBcbiAgICBhcHBzID0gW11cbiAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICBhcHBzLnB1c2ggaW5mby5wYXRoIGlmIGluZm8ucGF0aCBub3QgaW4gYXBwc1xuICAgICAgICAgICAgXG4gICAga2xvZyAnYXBwcycgYXBwcy5tYXAgKGEpIC0+IHNsYXNoLmJhc2UgYVxuICAgIGFwcHNcbiAgICBcbnBuZ1BhdGggPSAoYXBwUGF0aCkgLT5cbiAgICBrbG9nICdhcHBQYXRoJyBhcHBQYXRoLCBzbGFzaC5iYXNlKGFwcFBhdGgpXG4gICAgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucycsIHNsYXNoLmJhc2UoYXBwUGF0aCkgKyBcIi5wbmdcIlxuICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbnN0YXJ0ID0gKG9wdD17fSkgLT4gXG5cbiAgICBzcyA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgIFxuICAgIGFzID0gcGFyc2VJbnQgc3MuaGVpZ2h0LzEwXG4gICAgXG4gICAgYXBwcyA9IGdldEFwcHMoKVxuICAgIFxuICAgIGZvciBhcHAgaW4gYXBwc1xuICAgICAgICBwbmcgPSBwbmdQYXRoIHNsYXNoLmJhc2UgYXBwXG4gICAgICAgIGlmIG5vdCBzbGFzaC5maWxlRXhpc3RzIHBuZ1xuICAgICAgICAgICAga2xvZyAnaWNvbicgYXBwLCBwbmdcbiAgICAgICAgICAgIHdjICdpY29uJyBhcHAsIHBuZ1xuICAgIFxuICAgIHdpbiA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93XG5cbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzIyMjIyMidcbiAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICB0cnVlXG4gICAgICAgIHByZWxvYWRXaW5kb3c6ICAgdHJ1ZVxuICAgICAgICB4OiAgICAgICAgICAgICAgIHBhcnNlSW50IChzcy53aWR0aC1hcyphcHBzLmxlbmd0aCkvMlxuICAgICAgICB5OiAgICAgICAgICAgICAgIHBhcnNlSW50IChzcy5oZWlnaHQtYXMpLzJcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICBhcyphcHBzLmxlbmd0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgIGFzXG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgZmFsc2VcbiAgICAgICAgcmVzaXphYmxlOiAgICAgICBmYWxzZVxuICAgICAgICBmcmFtZTogICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRoaWNrRnJhbWU6ICAgICAgZmFsc2VcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgIHRydWVcbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgIHdlYlNlY3VyaXR5OiAgICAgZmFsc2VcbiAgICAgICAgICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGhlYWQ+XG4gICAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiAgICAgICAgIG5vbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAuYXBwcyB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgIGJvdHRvbTogICAgICAgICAwO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICAgICAgICBmbGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLmFwcCB7XG4gICAgICAgICAgICAgICAgZmxleDogICAgICAgICAgIDEgMSAwO1xuICAgICAgICAgICAgICAgIGJvcmRlcjogICAgICAgICAxcHggc29saWQgd2hpdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDwvaGVhZD5cbiAgICAgICAgPGJvZHk+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhcHBzXCIgdGFiaW5kZXg9MD48L2Rpdj5cbiAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIHZhciBwdGggPSBwcm9jZXNzLnJlc291cmNlc1BhdGggKyBcIi9hcHAvanMvc3dpdGNoLmpzXCI7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLmluZGV4T2YoXCJub2RlX21vZHVsZXNcXFxcXFxcXGVsZWN0cm9uXFxcXFxcXFxkaXN0XFxcXFxcXFxyZXNvdXJjZXNcIik+PTApIHsgcHRoID0gcHJvY2Vzcy5jd2QoKSArIFwiL2pzL3N3aXRjaC5qc1wiOyB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwdGgsIHByb2Nlc3MucmVzb3VyY2VzUGF0aCk7XG4gICAgICAgICAgICByZXF1aXJlKHB0aCkuaW5pdCgpO1xuICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9ib2R5PlxuICAgIFwiXCJcIlxuXG4gICAgZGF0YSA9IFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSShodG1sKSBcbiAgICB3aW4ubG9hZFVSTCBkYXRhLCBiYXNlVVJMRm9yRGF0YVVSTDpzbGFzaC5maWxlVXJsIF9fZGlybmFtZSArICcvaW5kZXguaHRtbCdcblxuICAgIHdpbi5kZWJ1ZyA9IG9wdC5kZWJ1Z1xuICAgIFxuICAgIGlmIG9wdC5kZWJ1Z1xuICAgICAgICB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcbiAgICB3aW5cbiAgICAgICAgXG5kb25lID0gLT4gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5jbG9zZSgpXG5cbm9uTW91c2VNb3ZlID0gKGV2ZW50KSAtPiBcbm9uTW91c2VEb3duID0gKGV2ZW50KSAtPiBkb25lKClcbm9uS2V5RG93biA9IChldmVudCkgLT4gXG4gICAgeyBtb2QsIGtleSwgY2hhciwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICBzd2l0Y2gga2V5XG4gICAgICAgIHdoZW4gJ2VzYycgdGhlbiBkb25lKClcbiAgICAgICAgZWxzZSBrbG9nICdvbktleURvd24nIGNvbWJvXG5cbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuXG5pbml0ID0gLT5cbiAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgXG4gICAgYSA9JCAnLmFwcHMnXG4gICAgXG4gICAgYS5vbm1vdXNlbW92ZSAgPSBvbk1vdXNlTW92ZVxuICAgIGEub25rZXlkb3duICAgID0gb25LZXlEb3duXG4gICAgXG4gICAgIyBpZiBub3Qgd2luLmRlYnVnXG4gICAgICAgICMgYS5vbmJsdXIgPSBkb25lXG4gICAgXG4gICAgYXBwcyA9IGdldEFwcHMoKVxuICAgICAgICBcbiAgICBmb3IgcCBpbiBhcHBzXG4gICAgICAgIGEuYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBjbGFzczonYXBwJyBzcmM6c2xhc2guZmlsZVVybCBwbmdQYXRoIHBcbiAgICAgICAgXG4gICAgYS5mb2N1cygpXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIHN0YXJ0OnN0YXJ0XG4gICAgaW5pdDppbml0XG4gICAgXG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/switch.coffee