// koffee 1.3.0
var $, borderScroll, borderTimer, childp, clamp, createWindow, doScroll, done, drag, electron, init, karg, kpos, mapRange, offset, onDblClick, onDragMove, onDragStart, onDragStop, onMouseMove, onWheel, post, prefs, ref, robotPos, scale, screenshotFile, scrollSpeed, slash, start, transform, vh, vw, wxw, zoomWin;

ref = require('kxk'), childp = ref.childp, post = ref.post, karg = ref.karg, slash = ref.slash, drag = ref.drag, prefs = ref.prefs, clamp = ref.clamp, kpos = ref.kpos, $ = ref.$;

electron = require('electron');

wxw = require('./wxw');

zoomWin = null;

vw = electron.screen.getPrimaryDisplay().workAreaSize.width;

vh = electron.screen.getPrimaryDisplay().workAreaSize.height;

screenshotFile = function() {
    return slash.unslash(slash.join(prefs.get('screenhotFolder', slash.resolve("~/Desktop")), 'screenshot.png'));
};

start = function(opt) {
    var pngFile, screenshotexe;
    if (opt == null) {
        opt = {};
    }
    screenshotexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'screenshot.exe')));
    if (!slash.isFile(screenshotexe)) {
        screenshotexe = slash.swapExt(screenshotexe, 'bat');
    }
    return pngFile = childp.exec("\"" + screenshotexe + "\" " + (screenshotFile()), function(err) {
        if (err) {
            return console.error(err);
        }
        return createWindow(opt);
    });
};

createWindow = function(opt) {
    var html, pngFile, win;
    win = new electron.BrowserWindow({
        backgroundColor: '#00000000',
        transparent: true,
        preloadWindow: true,
        x: 0,
        y: 0,
        width: vw,
        height: vh,
        hasShadow: false,
        resizable: false,
        frame: false,
        thickFrame: false,
        show: true,
        fullscreen: !opt.debug,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    zoomWin = win;
    pngFile = screenshotFile();
    html = "<head>\n<style type=\"text/css\">\n    body {\n        overflow:       hidden;\n        margin:         0;\n        border:         none;\n    }\n    #image {\n        position:       absolute;\n        left:           0;\n        top:            0;\n        width:          " + vw + "px;\n        height:         " + vh + "px;\n    }\n</style>\n</head>\n<body>\n<img id='image' tabindex=0 src=\"" + pngFile + "\"/>\n<script>\n    var pth = process.resourcesPath + \"/app/js/screenzoom.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/screenzoom.js\"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).init();\n</script>\n</body>";
    win.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
    win.debug = opt.debug;
    win.on('ready-to-show', function() {});
    if (opt.debug) {
        win.webContents.openDevTools();
    } else {
        win.maximize();
    }
    return win;
};

done = function() {
    var win;
    win = electron.remote.getCurrentWindow();
    win.close();
    if (win.debug) {
        return electron.remote.app.exit(0);
    }
};

init = function() {
    var a, win;
    post.on('slog', function(text) {
        console.log('slog', text);
        return post.toMain('winlog', text);
    });
    win = electron.remote.getCurrentWindow();
    a = $('image');
    a.ondblclick = onDblClick;
    a.onmousemove = onMouseMove;
    a.onmousewheel = onWheel;
    a.onkeydown = done;
    if (!win.debug) {
        a.onblur = done;
    }
    new drag({
        target: a,
        onStart: onDragStart,
        onMove: onDragMove,
        onStop: onDragStop
    });
    return a.focus();
};

scale = 1.0;

offset = kpos(0, 0);

transform = function() {
    var a, ox, oy;
    a = $('image');
    scale = clamp(1, 20, scale);
    ox = vw * (scale - 1) / (2 * scale);
    oy = vh * (scale - 1) / (2 * scale);
    offset.x = clamp(-ox, ox, offset.x);
    offset.y = clamp(-oy, oy, offset.y);
    return a.style.transform = "scaleX(" + scale + ") scaleY(" + scale + ") translateX(" + offset.x + "px) translateY(" + offset.y + "px)";
};

onDblClick = function(event) {
    scale = 1;
    return transform();
};

onWheel = function(event) {
    var mp, newPos, newScale, oldPos, scaleFactor;
    scaleFactor = 1 - event.deltaY / 400.0;
    newScale = clamp(1, 20, scale * scaleFactor);
    mp = kpos(event).minus(kpos(vw, vh).times(0.5));
    oldPos = offset.plus(kpos(mp).times(1 / scale));
    newPos = offset.plus(kpos(mp).times(1 / newScale));
    offset.add(newPos.minus(oldPos));
    scale *= scaleFactor;
    return transform();
};

robotPos = function() {
    return kpos(wxw.mouse());
};

borderTimer = null;

onMouseMove = function(event) {
    if (!borderTimer) {
        return borderScroll();
    }
};

mapRange = function(value, valueRange, targetRange) {
    var clampedValue, relativeValue, targetWidth, valueWidth;
    targetWidth = targetRange[1] - targetRange[0];
    valueWidth = valueRange[1] - valueRange[0];
    clampedValue = clamp(valueRange[0], valueRange[1], value);
    relativeValue = (clampedValue - valueRange[0]) / valueWidth;
    return targetRange[0] + targetWidth * relativeValue;
};

scrollSpeed = 0;

doScroll = function() {
    var ms;
    transform();
    ms = mapRange(scrollSpeed, [0, 1], [1000 / 10, 1000 / 30]);
    return borderTimer = setTimeout(borderScroll, ms);
};

borderScroll = function() {
    var border, direction, mousePos, scroll;
    clearTimeout(borderTimer);
    borderTimer = null;
    mousePos = robotPos();
    scroll = false;
    border = 200;
    direction = kpos(vw, vh).times(0.5).to(mousePos).mul(kpos(1 / vw, 1 / vh)).times(-1);
    if (mousePos.x < border) {
        scrollSpeed = (border - mousePos.x) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    } else if (mousePos.x > vw - border) {
        scrollSpeed = (border - (vw - mousePos.x)) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    }
    if (mousePos.y < border) {
        scrollSpeed = (border - mousePos.y) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    } else if (mousePos.y > vh - border) {
        scrollSpeed = (border - (vh - mousePos.y)) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    }
    if (scroll) {
        return doScroll();
    }
};

onDragStart = function(drag, event) {
    if (event.button !== 0) {
        if (event.button === 1) {
            done();
        }
        return 'skip';
    } else if (scale === 1) {
        done();
        return 'skip';
    }
};

onDragStop = function(drag, event) {};

onDragMove = function(drag, event) {
    offset.add(drag.delta.times(1 / scale));
    return transform();
};

module.exports = {
    start: start,
    init: init
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBNkQsT0FBQSxDQUFRLEtBQVIsQ0FBN0QsRUFBRSxtQkFBRixFQUFVLGVBQVYsRUFBZ0IsZUFBaEIsRUFBc0IsaUJBQXRCLEVBQTZCLGVBQTdCLEVBQW1DLGlCQUFuQyxFQUEwQyxpQkFBMUMsRUFBaUQsZUFBakQsRUFBdUQ7O0FBRXZELFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0FBRU4sT0FBQSxHQUFXOztBQUVYLEVBQUEsR0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENBQW1DLENBQUMsWUFBWSxDQUFDOztBQUN0RCxFQUFBLEdBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaEIsQ0FBQSxDQUFtQyxDQUFDLFlBQVksQ0FBQzs7QUFFdEQsY0FBQSxHQUFpQixTQUFBO1dBQ2IsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsaUJBQVYsRUFBNkIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxXQUFkLENBQTdCLENBQVgsRUFBb0UsZ0JBQXBFLENBQWQ7QUFEYTs7QUFTakIsS0FBQSxHQUFRLFNBQUMsR0FBRDtBQUVKLFFBQUE7O1FBRkssTUFBSTs7SUFFVCxhQUFBLEdBQWdCLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsSUFBckIsRUFBMEIsS0FBMUIsRUFBZ0MsZ0JBQWhDLENBQWQsQ0FBZDtJQUVoQixJQUFHLENBQUksS0FBSyxDQUFDLE1BQU4sQ0FBYSxhQUFiLENBQVA7UUFDSSxhQUFBLEdBQWdCLEtBQUssQ0FBQyxPQUFOLENBQWMsYUFBZCxFQUE2QixLQUE3QixFQURwQjs7V0FHQSxPQUFB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S0FBbkIsQ0FBWDtXQUNBLFNBQUEsQ0FBQTtBQUhVOztBQUtkLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxLQUFBLEVBQU0sS0FBTjtJQUNBLElBQUEsRUFBSyxJQURMIiwic291cmNlc0NvbnRlbnQiOlsiIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiMgICAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbnsgY2hpbGRwLCBwb3N0LCBrYXJnLCBzbGFzaCwgZHJhZywgcHJlZnMsIGNsYW1wLCBrcG9zLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG53eHcgPSByZXF1aXJlICcuL3d4dydcblxuem9vbVdpbiAgPSBudWxsXG5cbnZ3ID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLndpZHRoXG52aCA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS5oZWlnaHRcblxuc2NyZWVuc2hvdEZpbGUgPSAtPlxuICAgIHNsYXNoLnVuc2xhc2ggc2xhc2guam9pbiBwcmVmcy5nZXQoJ3NjcmVlbmhvdEZvbGRlcicsIHNsYXNoLnJlc29sdmUgXCJ+L0Rlc2t0b3BcIiksICdzY3JlZW5zaG90LnBuZydcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbnN0YXJ0ID0gKG9wdD17fSkgLT5cbiAgICBcbiAgICBzY3JlZW5zaG90ZXhlID0gc2xhc2gudW5zbGFzaCBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4oX19kaXJuYW1lLCcuLicsJ2JpbicsJ3NjcmVlbnNob3QuZXhlJylcbiAgICBcbiAgICBpZiBub3Qgc2xhc2guaXNGaWxlIHNjcmVlbnNob3RleGVcbiAgICAgICAgc2NyZWVuc2hvdGV4ZSA9IHNsYXNoLnN3YXBFeHQgc2NyZWVuc2hvdGV4ZSwgJ2JhdCdcbiAgICAgICAgXG4gICAgcG5nRmlsZSA9IFxuICAgICAgICBcbiAgICBjaGlsZHAuZXhlYyBcIlxcXCIje3NjcmVlbnNob3RleGV9XFxcIiAje3NjcmVlbnNob3RGaWxlKCl9XCIsIChlcnIpIC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGVycm9yIGVyciBpZiBlcnJcbiAgICAgICAgY3JlYXRlV2luZG93IG9wdFxuXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuY3JlYXRlV2luZG93ID0gKG9wdCkgLT5cbiAgICAgICAgXG4gICAgd2luID0gbmV3IGVsZWN0cm9uLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzAwMDAwMDAwJ1xuICAgICAgICB0cmFuc3BhcmVudDogICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICB0cnVlXG4gICAgICAgIHg6ICAgICAgICAgICAgICAgMCBcbiAgICAgICAgeTogICAgICAgICAgICAgICAwIFxuICAgICAgICB3aWR0aDogICAgICAgICAgIHZ3XG4gICAgICAgIGhlaWdodDogICAgICAgICAgdmhcbiAgICAgICAgaGFzU2hhZG93OiAgICAgICBmYWxzZVxuICAgICAgICByZXNpemFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgZmFsc2VcbiAgICAgICAgdGhpY2tGcmFtZTogICAgICBmYWxzZVxuICAgICAgICBzaG93OiAgICAgICAgICAgIHRydWVcbiAgICAgICAgZnVsbHNjcmVlbjogICAgICBub3Qgb3B0LmRlYnVnXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICB6b29tV2luID0gd2luXG4gICAgXG4gICAgcG5nRmlsZSA9IHNjcmVlbnNob3RGaWxlKClcbiAgICAgICAgICAgIFxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGhlYWQ+XG4gICAgICAgIDxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5cbiAgICAgICAgICAgIGJvZHkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAgICAgICBoaWRkZW47XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiAgICAgICAgIG5vbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjaW1hZ2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAgICAgICBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICBsZWZ0OiAgICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICB0b3A6ICAgICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICB3aWR0aDogICAgICAgICAgI3t2d31weDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgI3t2aH1weDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgPGltZyBpZD0naW1hZ2UnIHRhYmluZGV4PTAgc3JjPVwiI3twbmdGaWxlfVwiLz5cbiAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIHZhciBwdGggPSBwcm9jZXNzLnJlc291cmNlc1BhdGggKyBcIi9hcHAvanMvc2NyZWVuem9vbS5qc1wiO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzXFxcXFxcXFxlbGVjdHJvblxcXFxcXFxcZGlzdFxcXFxcXFxccmVzb3VyY2VzXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy9zY3JlZW56b29tLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0KCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICB3aW4ubG9hZFVSTCBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbCkgXG4gICAgd2luLmRlYnVnID0gb3B0LmRlYnVnXG4gICAgd2luLm9uICdyZWFkeS10by1zaG93JywgLT5cbiAgICBpZiBvcHQuZGVidWdcbiAgICAgICAgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG4gICAgZWxzZVxuICAgICAgICB3aW4ubWF4aW1pemUoKVxuICAgIHdpblxuICAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuXG5kb25lID0gLT4gXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIHdpbi5jbG9zZSgpXG4gICAgaWYgd2luLmRlYnVnIHRoZW4gZWxlY3Ryb24ucmVtb3RlLmFwcC5leGl0IDBcbiAgICAgICAgXG5pbml0ID0gLT5cbiAgICBcbiAgICBwb3N0Lm9uICdzbG9nJywgKHRleHQpIC0+XG4gICAgXG4gICAgICAgIGNvbnNvbGUubG9nICdzbG9nJywgdGV4dFxuICAgICAgICBwb3N0LnRvTWFpbiAnd2lubG9nJywgdGV4dFxuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICBcbiAgICBhID0kICdpbWFnZSdcbiAgICBhLm9uZGJsY2xpY2sgICA9IG9uRGJsQ2xpY2tcbiAgICBhLm9ubW91c2Vtb3ZlICA9IG9uTW91c2VNb3ZlXG4gICAgYS5vbm1vdXNld2hlZWwgPSBvbldoZWVsXG4gICAgYS5vbmtleWRvd24gICAgPSBkb25lXG4gICAgaWYgbm90IHdpbi5kZWJ1Z1xuICAgICAgICBhLm9uYmx1ciA9IGRvbmVcbiAgICBuZXcgZHJhZ1xuICAgICAgICB0YXJnZXQ6ICBhXG4gICAgICAgIG9uU3RhcnQ6IG9uRHJhZ1N0YXJ0XG4gICAgICAgIG9uTW92ZTogIG9uRHJhZ01vdmVcbiAgICAgICAgb25TdG9wOiAgb25EcmFnU3RvcFxuICAgIGEuZm9jdXMoKVxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAgICAgIDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuXG5zY2FsZSAgPSAxLjBcbm9mZnNldCA9IGtwb3MgMCAwXG5cbnRyYW5zZm9ybSA9IC0+XG4gICAgYSA9JCAnaW1hZ2UnXG5cbiAgICBzY2FsZSA9IGNsYW1wIDEsIDIwLCBzY2FsZVxuICAgIFxuICAgIG94ID0gdncgKiAoc2NhbGUtMSkvKDIqc2NhbGUpXG4gICAgb3kgPSB2aCAqIChzY2FsZS0xKS8oMipzY2FsZSlcbiAgICBvZmZzZXQueCA9IGNsYW1wIC1veCwgb3gsIG9mZnNldC54XG4gICAgb2Zmc2V0LnkgPSBjbGFtcCAtb3ksIG95LCBvZmZzZXQueVxuICAgIFxuICAgIGEuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZVgoI3tzY2FsZX0pIHNjYWxlWSgje3NjYWxlfSkgdHJhbnNsYXRlWCgje29mZnNldC54fXB4KSB0cmFuc2xhdGVZKCN7b2Zmc2V0Lnl9cHgpXCJcblxub25EYmxDbGljayA9IChldmVudCkgLT4gXG4gICAgc2NhbGUgPSAxIFxuICAgIHRyYW5zZm9ybSgpXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcblxub25XaGVlbCA9IChldmVudCkgLT5cbiAgICBcbiAgICBzY2FsZUZhY3RvciA9KDEgLSBldmVudC5kZWx0YVkgLyA0MDAuMClcbiAgICBuZXdTY2FsZSA9IGNsYW1wIDEsIDIwLCBzY2FsZSAqIHNjYWxlRmFjdG9yXG4gICAgXG4gICAgbXAgPSBrcG9zKGV2ZW50KS5taW51cyBrcG9zKHZ3LCB2aCkudGltZXMgMC41XG4gICAgXG4gICAgb2xkUG9zID0gb2Zmc2V0LnBsdXMga3BvcyhtcCkudGltZXMgMS9zY2FsZVxuICAgIG5ld1BvcyA9IG9mZnNldC5wbHVzIGtwb3MobXApLnRpbWVzIDEvbmV3U2NhbGVcbiAgICBvZmZzZXQuYWRkIG5ld1Bvcy5taW51cyBvbGRQb3NcbiAgICBcbiAgICBzY2FsZSAqPSBzY2FsZUZhY3RvclxuICAgIHRyYW5zZm9ybSgpXG4gICAgXG5yb2JvdFBvcyA9IC0+IFxuXG4gICAga3BvcyB3eHcubW91c2UoKVxuICAgICMgcG9zKHJvYm90LmdldE1vdXNlUG9zKCkpLmRpdihwb3Mocm9ib3QuZ2V0U2NyZWVuU2l6ZSgpLndpZHRoLHJvYm90LmdldFNjcmVlblNpemUoKS5oZWlnaHQpKS5tdWwgcG9zKHZ3LHZoKVxuXG5ib3JkZXJUaW1lciA9IG51bGxcbm9uTW91c2VNb3ZlID0gKGV2ZW50KSAtPlxuICAgIGlmIG5vdCBib3JkZXJUaW1lclxuICAgICAgICBib3JkZXJTY3JvbGwoKVxuXG5tYXBSYW5nZSA9ICh2YWx1ZSwgdmFsdWVSYW5nZSwgdGFyZ2V0UmFuZ2UpIC0+XG4gICAgdGFyZ2V0V2lkdGggICA9IHRhcmdldFJhbmdlWzFdIC0gdGFyZ2V0UmFuZ2VbMF1cbiAgICB2YWx1ZVdpZHRoICAgID0gdmFsdWVSYW5nZVsxXSAgLSB2YWx1ZVJhbmdlWzBdXG4gICAgY2xhbXBlZFZhbHVlICA9IGNsYW1wIHZhbHVlUmFuZ2VbMF0sIHZhbHVlUmFuZ2VbMV0sIHZhbHVlXG4gICAgcmVsYXRpdmVWYWx1ZSA9IChjbGFtcGVkVmFsdWUgLSB2YWx1ZVJhbmdlWzBdKSAvIHZhbHVlV2lkdGhcbiAgICB0YXJnZXRSYW5nZVswXSArIHRhcmdldFdpZHRoICogcmVsYXRpdmVWYWx1ZVxuICAgICAgICBcbnNjcm9sbFNwZWVkID0gMFxuZG9TY3JvbGwgPSAtPlxuICAgIHRyYW5zZm9ybSgpXG4gICAgbXMgPSBtYXBSYW5nZSBzY3JvbGxTcGVlZCwgWzAsMV0sIFsxMDAwLzEwLCAxMDAwLzMwXVxuICAgIGJvcmRlclRpbWVyID0gc2V0VGltZW91dCBib3JkZXJTY3JvbGwsIG1zXG4gICAgXG5ib3JkZXJTY3JvbGwgPSAtPlxuXG4gICAgY2xlYXJUaW1lb3V0IGJvcmRlclRpbWVyXG4gICAgYm9yZGVyVGltZXIgPSBudWxsXG4gICAgXG4gICAgbW91c2VQb3MgPSByb2JvdFBvcygpXG4gICAgXG4gICAgc2Nyb2xsID0gZmFsc2VcbiAgICBib3JkZXIgPSAyMDBcbiAgICBcbiAgICBkaXJlY3Rpb24gPSBrcG9zKHZ3LHZoKS50aW1lcygwLjUpLnRvKG1vdXNlUG9zKS5tdWwoa3BvcygxL3Z3LDEvdmgpKS50aW1lcygtMSlcbiAgICBcbiAgICBpZiBtb3VzZVBvcy54IDwgYm9yZGVyXG4gICAgICAgIHNjcm9sbFNwZWVkID0gKGJvcmRlci1tb3VzZVBvcy54KS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgIGVsc2UgaWYgbW91c2VQb3MueCA+IHZ3LWJvcmRlclxuICAgICAgICBzY3JvbGxTcGVlZCA9IChib3JkZXItKHZ3LW1vdXNlUG9zLngpKS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBtb3VzZVBvcy55IDwgYm9yZGVyXG4gICAgICAgIHNjcm9sbFNwZWVkID0gKGJvcmRlci1tb3VzZVBvcy55KS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgIGVsc2UgaWYgbW91c2VQb3MueSA+IHZoLWJvcmRlclxuICAgICAgICBzY3JvbGxTcGVlZCA9IChib3JkZXItKHZoLW1vdXNlUG9zLnkpKS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBzY3JvbGxcbiAgICAgICAgZG9TY3JvbGwoKVxuICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5vbkRyYWdTdGFydCA9IChkcmFnLCBldmVudCkgLT4gXG4gICAgXG4gICAgaWYgZXZlbnQuYnV0dG9uICE9IDBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9uID09IDFcbiAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gJ3NraXAnXG4gICAgZWxzZSBpZiBzY2FsZSA9PSAxXG4gICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gJ3NraXAnXG4gICAgXG5vbkRyYWdTdG9wICA9IChkcmFnLCBldmVudCkgLT4gXG5vbkRyYWdNb3ZlICA9IChkcmFnLCBldmVudCkgLT4gXG4gICAgXG4gICAgb2Zmc2V0LmFkZCBkcmFnLmRlbHRhLnRpbWVzIDEvc2NhbGVcbiAgICB0cmFuc2Zvcm0oKVxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBcbiAgICBzdGFydDpzdGFydFxuICAgIGluaXQ6aW5pdFxuICAgICJdfQ==
//# sourceURL=../coffee/zoom.coffee