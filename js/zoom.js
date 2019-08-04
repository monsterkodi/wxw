// koffee 1.3.0
var $, borderScroll, borderTimer, childp, clamp, createWindow, doScroll, done, drag, dragging, electron, init, karg, klog, kpos, mapRange, offset, onDblClick, onDragMove, onDragStart, onDragStop, onMouseMove, onWheel, post, prefs, ref, scale, screenshotFile, screenshotPath, scrollSpeed, slash, start, startScroll, taskbar, transform, wc;

ref = require('kxk'), childp = ref.childp, post = ref.post, karg = ref.karg, slash = ref.slash, drag = ref.drag, prefs = ref.prefs, clamp = ref.clamp, kpos = ref.kpos, klog = ref.klog, $ = ref.$;

wc = require('./wc');

electron = require('electron');

taskbar = false;

screenshotPath = function() {
    return slash.resolve(slash.join(prefs.get('screenhotFolder', slash.resolve("~/Desktop")), 'screenshot.png'));
};

screenshotFile = function() {
    return slash.unslash(screenshotPath());
};

start = function(opt) {
    if (opt == null) {
        opt = {};
    }
    wc('screenshot', screenshotFile());
    return createWindow(opt);
};

createWindow = function(opt) {
    var data, html, pngFile, ss, win;
    ss = electron.screen.getPrimaryDisplay().size;
    win = new electron.BrowserWindow({
        backgroundColor: '#00000000',
        x: 0,
        y: 0,
        width: ss.width,
        height: ss.height,
        minWidth: ss.width,
        minHeight: ss.height,
        hasShadow: false,
        resizable: false,
        frame: false,
        thickFrame: false,
        fullscreen: false,
        transparent: true,
        preloadWindow: true,
        alwaysOnTop: true,
        enableLargerThanScreen: true,
        acceptFirstMouse: true,
        show: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    pngFile = slash.fileUrl(screenshotPath());
    html = "<head>\n<style type=\"text/css\">\n    body {\n        overflow:       hidden;\n        margin:         1px;\n        border:         none;\n    }\n    img {\n        position:       absolute;\n        left:           0;\n        top:            0;\n        width:          " + ss.width + "px;\n        height:         " + ss.height + "px;\n    }\n</style>\n</head>\n<body>\n<img class=\"screenshot\" tabindex=0 src=\"" + pngFile + "\"/>\n<script>\n    var pth = process.resourcesPath + \"/app/js/zoom.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/zoom.js\"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).init();\n</script>\n</body>";
    data = "data:text/html;charset=utf-8," + encodeURI(html);
    win.loadURL(data, {
        baseURLForDataURL: slash.fileUrl(__dirname + '/index.html')
    });
    win.debug = opt.debug;
    win.webContents.on('dom-ready', function() {
        var info;
        info = wc('info', 'taskbar')[0];
        if (info.status !== 'hidden') {
            return post.toWin(win.id, 'taskbar', true);
        } else {
            return post.toWin(win.id, 'taskbar', false);
        }
    });
    if (opt.debug) {
        win.webContents.openDevTools({
            mode: 'detach'
        });
    }
    return win;
};

done = function() {
    var win;
    win = electron.remote.getCurrentWindow();
    win.close();
    if (window.taskbar) {
        wc('taskbar', 'show');
    }
    if (win.debug) {
        return electron.remote.app.exit(0);
    }
};

init = function() {
    var a, win;
    post.on('taskbar', function(show) {
        return window.taskbar = show;
    });
    win = electron.remote.getCurrentWindow();
    a = $('.screenshot');
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

dragging = false;

transform = function() {
    var a, ox, oy, ss;
    ss = electron.remote.screen.getPrimaryDisplay().size;
    a = $('.screenshot');
    scale = clamp(1, 20, scale);
    ox = ss.width * (scale - 1) / (2 * scale);
    oy = ss.height * (scale - 1) / (2 * scale);
    offset.x = clamp(-ox, ox, offset.x);
    offset.y = clamp(-oy, oy, offset.y);
    return a.style.transform = "scaleX(" + scale + ") scaleY(" + scale + ") translateX(" + offset.x + "px) translateY(" + offset.y + "px)";
};

onDblClick = function(event) {
    scale = 1;
    return transform();
};

onWheel = function(event) {
    var mp, newPos, newScale, oldPos, scaleFactor, ss;
    scaleFactor = 1 - event.deltaY / 400.0;
    newScale = clamp(1, 20, scale * scaleFactor);
    if (newScale === 1) {
        dragging = false;
    }
    ss = electron.remote.screen.getPrimaryDisplay().size;
    mp = kpos(event).minus(kpos(ss.width, ss.height).times(0.5));
    oldPos = offset.plus(kpos(mp).times(1 / scale));
    newPos = offset.plus(kpos(mp).times(1 / newScale));
    offset.add(newPos.minus(oldPos));
    scale *= scaleFactor;
    return transform();
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
    transform();
    return startScroll();
};

startScroll = function() {
    var ms;
    ms = mapRange(scrollSpeed, [0, 1], [1000 / 10, 1000 / 30]);
    return borderTimer = setTimeout(borderScroll, ms);
};

borderScroll = function() {
    var border, direction, mousePos, scroll, ss;
    clearTimeout(borderTimer);
    borderTimer = null;
    if (dragging) {
        return;
    }
    mousePos = kpos(wc('mouse'));
    scroll = false;
    border = 200;
    ss = electron.remote.screen.getPrimaryDisplay().size;
    direction = kpos(ss.width, ss.height).times(0.5).to(mousePos).mul(kpos(1 / ss.width, 1 / ss.height)).times(-1);
    if (mousePos.x < border) {
        scrollSpeed = (border - mousePos.x) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    } else if (mousePos.x > ss.width - border) {
        scrollSpeed = (border - (ss.width - mousePos.x)) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    }
    if (mousePos.y < border) {
        scrollSpeed = (border - mousePos.y) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    } else if (mousePos.y > ss.height - border) {
        scrollSpeed = (border - (ss.height - mousePos.y)) / border;
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
    return dragging = true;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBbUUsT0FBQSxDQUFRLEtBQVIsQ0FBbkUsRUFBRSxtQkFBRixFQUFVLGVBQVYsRUFBZ0IsZUFBaEIsRUFBc0IsaUJBQXRCLEVBQTZCLGVBQTdCLEVBQW1DLGlCQUFuQyxFQUEwQyxpQkFBMUMsRUFBaUQsZUFBakQsRUFBdUQsZUFBdkQsRUFBNkQ7O0FBRTdELEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7QUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRVgsT0FBQSxHQUFVOztBQUVWLGNBQUEsR0FBaUIsU0FBQTtXQUNiLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsR0FBTixDQUFVLGlCQUFWLEVBQTZCLEtBQUssQ0FBQyxPQUFOLENBQWMsV0FBZCxDQUE3QixDQUFYLEVBQW9FLGdCQUFwRSxDQUFkO0FBRGE7O0FBR2pCLGNBQUEsR0FBaUIsU0FBQTtXQUNiLEtBQUssQ0FBQyxPQUFOLENBQWMsY0FBQSxDQUFBLENBQWQ7QUFEYTs7QUFTakIsS0FBQSxHQUFRLFNBQUMsR0FBRDs7UUFBQyxNQUFJOztJQUVULEVBQUEsQ0FBRyxZQUFILEVBQWdCLGNBQUEsQ0FBQSxDQUFoQjtXQUNBLFlBQUEsQ0FBYSxHQUFiO0FBSEk7O0FBV1IsWUFBQSxHQUFlLFNBQUMsR0FBRDtBQUVYLFFBQUE7SUFBQSxFQUFBLEdBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaEIsQ0FBQSxDQUFtQyxDQUFDO0lBRXpDLEdBQUEsR0FBTSxJQUFJLFFBQVEsQ0FBQyxhQUFiLENBQ0Y7UUFBQSxlQUFBLEVBQXdCLFdBQXhCO1FBQ0EsQ0FBQSxFQUF3QixDQUR4QjtRQUVBLENBQUEsRUFBd0IsQ0FGeEI7UUFHQSxLQUFBLEVBQXdCLEVBQUUsQ0FBQyxLQUgzQjtRQUlBLE1BQUEsRUFBd0IsRUFBRSxDQUFDLE1BSjNCO1FBS0EsUUFBQSxFQUF3QixFQUFFLENBQUMsS0FMM0I7UUFNQSxTQUFBLEVBQXdCLEVBQUUsQ0FBQyxNQU4zQjtRQU9BLFNBQUEsRUFBd0IsS0FQeEI7UUFRQSxTQUFBLEVBQXdCLEtBUnhCO1FBU0EsS0FBQSxFQUF3QixLQVR4QjtRQVVBLFVBQUEsRUFBd0IsS0FWeEI7UUFXQSxVQUFBLEVBQXdCLEtBWHhCO1FBWUEsV0FBQSxFQUF3QixJQVp4QjtRQWFBLGFBQUEsRUFBd0IsSUFieEI7UUFjQSxXQUFBLEVBQXdCLElBZHhCO1FBZUEsc0JBQUEsRUFBd0IsSUFmeEI7UUFnQkEsZ0JBQUEsRUFBd0IsSUFoQnhCO1FBaUJBLElBQUEsRUFBd0IsSUFqQnhCO1FBa0JBLGNBQUEsRUFDSTtZQUFBLGVBQUEsRUFBaUIsSUFBakI7WUFDQSxXQUFBLEVBQWlCLEtBRGpCO1NBbkJKO0tBREU7SUF1Qk4sT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsY0FBQSxDQUFBLENBQWQ7SUFFVixJQUFBLEdBQU8sb1JBQUEsR0FZdUIsRUFBRSxDQUFDLEtBWjFCLEdBWWdDLCtCQVpoQyxHQWF1QixFQUFFLENBQUMsTUFiMUIsR0FhaUMsb0ZBYmpDLEdBa0J1QyxPQWxCdkMsR0FrQitDO0lBVXRELElBQUEsR0FBTywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtJQUN6QyxHQUFHLENBQUMsT0FBSixDQUFZLElBQVosRUFBa0I7UUFBQSxpQkFBQSxFQUFrQixLQUFLLENBQUMsT0FBTixDQUFjLFNBQUEsR0FBWSxhQUExQixDQUFsQjtLQUFsQjtJQUVBLEdBQUcsQ0FBQyxLQUFKLEdBQVksR0FBRyxDQUFDO0lBRWhCLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBaEIsQ0FBbUIsV0FBbkIsRUFBK0IsU0FBQTtBQUMzQixZQUFBO1FBQUEsSUFBQSxHQUFPLEVBQUEsQ0FBRyxNQUFILEVBQVUsU0FBVixDQUFxQixDQUFBLENBQUE7UUFDNUIsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLFFBQWxCO21CQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLEVBQWYsRUFBbUIsU0FBbkIsRUFBNkIsSUFBN0IsRUFESjtTQUFBLE1BQUE7bUJBR0ksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsRUFBZixFQUFtQixTQUFuQixFQUE2QixLQUE3QixFQUhKOztJQUYyQixDQUEvQjtJQU9BLElBQUcsR0FBRyxDQUFDLEtBQVA7UUFBa0IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFoQixDQUE2QjtZQUFBLElBQUEsRUFBSyxRQUFMO1NBQTdCLEVBQWxCOztXQUVBO0FBdkVXOztBQStFZixJQUFBLEdBQU8sU0FBQTtBQUNILFFBQUE7SUFBQSxHQUFBLEdBQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBaEIsQ0FBQTtJQUNOLEdBQUcsQ0FBQyxLQUFKLENBQUE7SUFDQSxJQUFHLE1BQU0sQ0FBQyxPQUFWO1FBQ0ksRUFBQSxDQUFHLFNBQUgsRUFBYSxNQUFiLEVBREo7O0lBRUEsSUFBRyxHQUFHLENBQUMsS0FBUDtlQUFrQixRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFwQixDQUF5QixDQUF6QixFQUFsQjs7QUFMRzs7QUFhUCxJQUFBLEdBQU8sU0FBQTtBQUVILFFBQUE7SUFBQSxJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsRUFBa0IsU0FBQyxJQUFEO2VBQVUsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBM0IsQ0FBbEI7SUFFQSxHQUFBLEdBQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBaEIsQ0FBQTtJQUVOLENBQUEsR0FBRyxDQUFBLENBQUUsYUFBRjtJQUVILENBQUMsQ0FBQyxVQUFGLEdBQWlCO0lBQ2pCLENBQUMsQ0FBQyxXQUFGLEdBQWlCO0lBQ2pCLENBQUMsQ0FBQyxZQUFGLEdBQWlCO0lBQ2pCLENBQUMsQ0FBQyxTQUFGLEdBQWlCO0lBRWpCLElBQUcsQ0FBSSxHQUFHLENBQUMsS0FBWDtRQUNJLENBQUMsQ0FBQyxNQUFGLEdBQVcsS0FEZjs7SUFHQSxJQUFJLElBQUosQ0FDSTtRQUFBLE1BQUEsRUFBUyxDQUFUO1FBQ0EsT0FBQSxFQUFTLFdBRFQ7UUFFQSxNQUFBLEVBQVMsVUFGVDtRQUdBLE1BQUEsRUFBUyxVQUhUO0tBREo7V0FNQSxDQUFDLENBQUMsS0FBRixDQUFBO0FBdEJHOztBQThCUCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTLElBQUEsQ0FBSyxDQUFMLEVBQU8sQ0FBUDs7QUFDVCxRQUFBLEdBQVc7O0FBRVgsU0FBQSxHQUFZLFNBQUE7QUFFUixRQUFBO0lBQUEsRUFBQSxHQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUF2QixDQUFBLENBQTBDLENBQUM7SUFFaEQsQ0FBQSxHQUFHLENBQUEsQ0FBRSxhQUFGO0lBRUgsS0FBQSxHQUFRLEtBQUEsQ0FBTSxDQUFOLEVBQVEsRUFBUixFQUFXLEtBQVg7SUFFUixFQUFBLEdBQUssRUFBRSxDQUFDLEtBQUgsR0FBWSxDQUFDLEtBQUEsR0FBTSxDQUFQLENBQVosR0FBc0IsQ0FBQyxDQUFBLEdBQUUsS0FBSDtJQUMzQixFQUFBLEdBQUssRUFBRSxDQUFDLE1BQUgsR0FBWSxDQUFDLEtBQUEsR0FBTSxDQUFQLENBQVosR0FBc0IsQ0FBQyxDQUFBLEdBQUUsS0FBSDtJQUMzQixNQUFNLENBQUMsQ0FBUCxHQUFXLEtBQUEsQ0FBTSxDQUFDLEVBQVAsRUFBVyxFQUFYLEVBQWUsTUFBTSxDQUFDLENBQXRCO0lBQ1gsTUFBTSxDQUFDLENBQVAsR0FBVyxLQUFBLENBQU0sQ0FBQyxFQUFQLEVBQVcsRUFBWCxFQUFlLE1BQU0sQ0FBQyxDQUF0QjtXQUVYLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUixHQUFvQixTQUFBLEdBQVUsS0FBVixHQUFnQixXQUFoQixHQUEyQixLQUEzQixHQUFpQyxlQUFqQyxHQUFnRCxNQUFNLENBQUMsQ0FBdkQsR0FBeUQsaUJBQXpELEdBQTBFLE1BQU0sQ0FBQyxDQUFqRixHQUFtRjtBQWIvRjs7QUFlWixVQUFBLEdBQWEsU0FBQyxLQUFEO0lBRVQsS0FBQSxHQUFRO1dBQ1IsU0FBQSxDQUFBO0FBSFM7O0FBV2IsT0FBQSxHQUFVLFNBQUMsS0FBRDtBQUVOLFFBQUE7SUFBQSxXQUFBLEdBQWMsQ0FBQSxHQUFJLEtBQUssQ0FBQyxNQUFOLEdBQWU7SUFDakMsUUFBQSxHQUFXLEtBQUEsQ0FBTSxDQUFOLEVBQVEsRUFBUixFQUFXLEtBQUEsR0FBUSxXQUFuQjtJQUNYLElBQUcsUUFBQSxLQUFZLENBQWY7UUFDSSxRQUFBLEdBQVcsTUFEZjs7SUFHQSxFQUFBLEdBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQXZCLENBQUEsQ0FBMEMsQ0FBQztJQUVoRCxFQUFBLEdBQUssSUFBQSxDQUFLLEtBQUwsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsSUFBQSxDQUFLLEVBQUUsQ0FBQyxLQUFSLEVBQWUsRUFBRSxDQUFDLE1BQWxCLENBQXlCLENBQUMsS0FBMUIsQ0FBZ0MsR0FBaEMsQ0FBbEI7SUFFTCxNQUFBLEdBQVMsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFBLENBQUssRUFBTCxDQUFRLENBQUMsS0FBVCxDQUFlLENBQUEsR0FBRSxLQUFqQixDQUFaO0lBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQSxDQUFLLEVBQUwsQ0FBUSxDQUFDLEtBQVQsQ0FBZSxDQUFBLEdBQUUsUUFBakIsQ0FBWjtJQUNULE1BQU0sQ0FBQyxHQUFQLENBQVcsTUFBTSxDQUFDLEtBQVAsQ0FBYSxNQUFiLENBQVg7SUFFQSxLQUFBLElBQVM7V0FFVCxTQUFBLENBQUE7QUFqQk07O0FBbUJWLFdBQUEsR0FBYzs7QUFDZCxXQUFBLEdBQWMsU0FBQyxLQUFEO0lBQ1YsSUFBRyxDQUFJLFdBQVA7ZUFDSSxZQUFBLENBQUEsRUFESjs7QUFEVTs7QUFJZCxRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixXQUFwQjtBQUNQLFFBQUE7SUFBQSxXQUFBLEdBQWdCLFdBQVksQ0FBQSxDQUFBLENBQVosR0FBaUIsV0FBWSxDQUFBLENBQUE7SUFDN0MsVUFBQSxHQUFnQixVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWlCLFVBQVcsQ0FBQSxDQUFBO0lBQzVDLFlBQUEsR0FBZ0IsS0FBQSxDQUFNLFVBQVcsQ0FBQSxDQUFBLENBQWpCLEVBQXFCLFVBQVcsQ0FBQSxDQUFBLENBQWhDLEVBQW9DLEtBQXBDO0lBQ2hCLGFBQUEsR0FBZ0IsQ0FBQyxZQUFBLEdBQWUsVUFBVyxDQUFBLENBQUEsQ0FBM0IsQ0FBQSxHQUFpQztXQUNqRCxXQUFZLENBQUEsQ0FBQSxDQUFaLEdBQWlCLFdBQUEsR0FBYztBQUx4Qjs7QUFPWCxXQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFXLFNBQUE7SUFDUCxTQUFBLENBQUE7V0FDQSxXQUFBLENBQUE7QUFGTzs7QUFJWCxXQUFBLEdBQWMsU0FBQTtBQUNWLFFBQUE7SUFBQSxFQUFBLEdBQUssUUFBQSxDQUFTLFdBQVQsRUFBc0IsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUF0QixFQUE2QixDQUFDLElBQUEsR0FBSyxFQUFOLEVBQVMsSUFBQSxHQUFLLEVBQWQsQ0FBN0I7V0FDTCxXQUFBLEdBQWMsVUFBQSxDQUFXLFlBQVgsRUFBeUIsRUFBekI7QUFGSjs7QUFJZCxZQUFBLEdBQWUsU0FBQTtBQUVYLFFBQUE7SUFBQSxZQUFBLENBQWEsV0FBYjtJQUNBLFdBQUEsR0FBYztJQUVkLElBQVUsUUFBVjtBQUFBLGVBQUE7O0lBRUEsUUFBQSxHQUFXLElBQUEsQ0FBSyxFQUFBLENBQUcsT0FBSCxDQUFMO0lBRVgsTUFBQSxHQUFTO0lBQ1QsTUFBQSxHQUFTO0lBRVQsRUFBQSxHQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUF2QixDQUFBLENBQTBDLENBQUM7SUFFaEQsU0FBQSxHQUFZLElBQUEsQ0FBSyxFQUFFLENBQUMsS0FBUixFQUFjLEVBQUUsQ0FBQyxNQUFqQixDQUF3QixDQUFDLEtBQXpCLENBQStCLEdBQS9CLENBQW1DLENBQUMsRUFBcEMsQ0FBdUMsUUFBdkMsQ0FBZ0QsQ0FBQyxHQUFqRCxDQUFxRCxJQUFBLENBQUssQ0FBQSxHQUFFLEVBQUUsQ0FBQyxLQUFWLEVBQWdCLENBQUEsR0FBRSxFQUFFLENBQUMsTUFBckIsQ0FBckQsQ0FBa0YsQ0FBQyxLQUFuRixDQUF5RixDQUFDLENBQTFGO0lBRVosSUFBRyxRQUFRLENBQUMsQ0FBVCxHQUFhLE1BQWhCO1FBQ0ksV0FBQSxHQUFjLENBQUMsTUFBQSxHQUFPLFFBQVEsQ0FBQyxDQUFqQixDQUFBLEdBQW9CO1FBQ2xDLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsQ0FBQyxHQUFBLEdBQUksV0FBQSxHQUFZLEVBQWpCLENBQUEsR0FBcUIsS0FBckMsQ0FBWDtRQUNBLE1BQUEsR0FBUyxLQUhiO0tBQUEsTUFJSyxJQUFHLFFBQVEsQ0FBQyxDQUFULEdBQWEsRUFBRSxDQUFDLEtBQUgsR0FBUyxNQUF6QjtRQUNELFdBQUEsR0FBYyxDQUFDLE1BQUEsR0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFILEdBQVMsUUFBUSxDQUFDLENBQW5CLENBQVIsQ0FBQSxHQUErQjtRQUM3QyxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQVMsQ0FBQyxLQUFWLENBQWdCLENBQUMsR0FBQSxHQUFJLFdBQUEsR0FBWSxFQUFqQixDQUFBLEdBQXFCLEtBQXJDLENBQVg7UUFDQSxNQUFBLEdBQVMsS0FIUjs7SUFLTCxJQUFHLFFBQVEsQ0FBQyxDQUFULEdBQWEsTUFBaEI7UUFDSSxXQUFBLEdBQWMsQ0FBQyxNQUFBLEdBQU8sUUFBUSxDQUFDLENBQWpCLENBQUEsR0FBb0I7UUFDbEMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFTLENBQUMsS0FBVixDQUFnQixDQUFDLEdBQUEsR0FBSSxXQUFBLEdBQVksRUFBakIsQ0FBQSxHQUFxQixLQUFyQyxDQUFYO1FBQ0EsTUFBQSxHQUFTLEtBSGI7S0FBQSxNQUlLLElBQUcsUUFBUSxDQUFDLENBQVQsR0FBYSxFQUFFLENBQUMsTUFBSCxHQUFVLE1BQTFCO1FBQ0QsV0FBQSxHQUFjLENBQUMsTUFBQSxHQUFPLENBQUMsRUFBRSxDQUFDLE1BQUgsR0FBVSxRQUFRLENBQUMsQ0FBcEIsQ0FBUixDQUFBLEdBQWdDO1FBQzlDLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsQ0FBQyxHQUFBLEdBQUksV0FBQSxHQUFZLEVBQWpCLENBQUEsR0FBcUIsS0FBckMsQ0FBWDtRQUNBLE1BQUEsR0FBUyxLQUhSOztJQUtMLElBQUcsTUFBSDtlQUNJLFFBQUEsQ0FBQSxFQURKOztBQWxDVzs7QUEyQ2YsV0FBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLEtBQVA7SUFFVixJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO1FBQ0ksSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjtZQUNJLElBQUEsQ0FBQSxFQURKOztBQUVBLGVBQU8sT0FIWDtLQUFBLE1BSUssSUFBRyxLQUFBLEtBQVMsQ0FBWjtRQUNELElBQUEsQ0FBQTtBQUNBLGVBQU8sT0FGTjs7V0FJTCxRQUFBLEdBQVc7QUFWRDs7QUFZZCxVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBOztBQUNiLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxLQUFQO0lBRVQsTUFBTSxDQUFDLEdBQVAsQ0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVgsQ0FBaUIsQ0FBQSxHQUFFLEtBQW5CLENBQVg7V0FDQSxTQUFBLENBQUE7QUFIUzs7QUFLYixNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsS0FBQSxFQUFNLEtBQU47SUFDQSxJQUFBLEVBQUssSUFETCIsInNvdXJjZXNDb250ZW50IjpbIiMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG4jICAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgIDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG57IGNoaWxkcCwgcG9zdCwga2FyZywgc2xhc2gsIGRyYWcsIHByZWZzLCBjbGFtcCwga3Bvcywga2xvZywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG53YyA9IHJlcXVpcmUgJy4vd2MnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG50YXNrYmFyID0gZmFsc2Vcblxuc2NyZWVuc2hvdFBhdGggPSAtPlxuICAgIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwcmVmcy5nZXQoJ3NjcmVlbmhvdEZvbGRlcicsIHNsYXNoLnJlc29sdmUgXCJ+L0Rlc2t0b3BcIiksICdzY3JlZW5zaG90LnBuZydcbiAgICBcbnNjcmVlbnNob3RGaWxlID0gLT5cbiAgICBzbGFzaC51bnNsYXNoIHNjcmVlbnNob3RQYXRoKClcbiAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5zdGFydCA9IChvcHQ9e30pIC0+XG4gICAgXG4gICAgd2MgJ3NjcmVlbnNob3QnIHNjcmVlbnNob3RGaWxlKClcbiAgICBjcmVhdGVXaW5kb3cgb3B0XG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuY3JlYXRlV2luZG93ID0gKG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICBzcyA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLnNpemVcbiAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICAgICAnIzAwMDAwMDAwJ1xuICAgICAgICB4OiAgICAgICAgICAgICAgICAgICAgICAwIFxuICAgICAgICB5OiAgICAgICAgICAgICAgICAgICAgICAwIFxuICAgICAgICB3aWR0aDogICAgICAgICAgICAgICAgICBzcy53aWR0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgICAgICBzcy5oZWlnaHRcbiAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICAgICAgc3Mud2lkdGhcbiAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICAgICAgc3MuaGVpZ2h0XG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICAgICAgICAgdHJ1ZVxuICAgICAgICBhbHdheXNPblRvcDogICAgICAgICAgICB0cnVlXG4gICAgICAgIGVuYWJsZUxhcmdlclRoYW5TY3JlZW46IHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICAgICAgdHJ1ZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICBwbmdGaWxlID0gc2xhc2guZmlsZVVybCBzY3JlZW5zaG90UGF0aCgpXG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICAgICAgMXB4O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogICAgICAgICBub25lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1nIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICN7c3Mud2lkdGh9cHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICN7c3MuaGVpZ2h0fXB4O1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICA8aW1nIGNsYXNzPVwic2NyZWVuc2hvdFwiIHRhYmluZGV4PTAgc3JjPVwiI3twbmdGaWxlfVwiLz5cbiAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIHZhciBwdGggPSBwcm9jZXNzLnJlc291cmNlc1BhdGggKyBcIi9hcHAvanMvem9vbS5qc1wiO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzXFxcXFxcXFxlbGVjdHJvblxcXFxcXFxcZGlzdFxcXFxcXFxccmVzb3VyY2VzXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy96b29tLmpzXCI7IH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHB0aCwgcHJvY2Vzcy5yZXNvdXJjZXNQYXRoKTtcbiAgICAgICAgICAgIHJlcXVpcmUocHRoKS5pbml0KCk7XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgXCJcIlwiXG5cbiAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJKGh0bWwpIFxuICAgIHdpbi5sb2FkVVJMIGRhdGEsIGJhc2VVUkxGb3JEYXRhVVJMOnNsYXNoLmZpbGVVcmwgX19kaXJuYW1lICsgJy9pbmRleC5odG1sJ1xuXG4gICAgd2luLmRlYnVnID0gb3B0LmRlYnVnXG4gICAgXG4gICAgd2luLndlYkNvbnRlbnRzLm9uICdkb20tcmVhZHknIC0+XG4gICAgICAgIGluZm8gPSB3YygnaW5mbycgJ3Rhc2tiYXInKVswXVxuICAgICAgICBpZiBpbmZvLnN0YXR1cyAhPSAnaGlkZGVuJ1xuICAgICAgICAgICAgcG9zdC50b1dpbiB3aW4uaWQsICd0YXNrYmFyJyB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9XaW4gd2luLmlkLCAndGFza2JhcicgZmFsc2VcbiAgICAgICAgXG4gICAgaWYgb3B0LmRlYnVnIHRoZW4gd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG5cbiAgICB3aW5cblxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxuZG9uZSA9IC0+IFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICB3aW4uY2xvc2UoKVxuICAgIGlmIHdpbmRvdy50YXNrYmFyXG4gICAgICAgIHdjICd0YXNrYmFyJyAnc2hvdydcbiAgICBpZiB3aW4uZGVidWcgdGhlbiBlbGVjdHJvbi5yZW1vdGUuYXBwLmV4aXQgMFxuICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgICAgIFxuaW5pdCA9IC0+XG4gICAgXG4gICAgcG9zdC5vbiAndGFza2JhcicgKHNob3cpIC0+IHdpbmRvdy50YXNrYmFyID0gc2hvd1xuICAgIFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICBcbiAgICBhID0kICcuc2NyZWVuc2hvdCdcbiAgICBcbiAgICBhLm9uZGJsY2xpY2sgICA9IG9uRGJsQ2xpY2tcbiAgICBhLm9ubW91c2Vtb3ZlICA9IG9uTW91c2VNb3ZlXG4gICAgYS5vbm1vdXNld2hlZWwgPSBvbldoZWVsXG4gICAgYS5vbmtleWRvd24gICAgPSBkb25lXG4gICAgXG4gICAgaWYgbm90IHdpbi5kZWJ1Z1xuICAgICAgICBhLm9uYmx1ciA9IGRvbmVcbiAgICAgICAgXG4gICAgbmV3IGRyYWdcbiAgICAgICAgdGFyZ2V0OiAgYVxuICAgICAgICBvblN0YXJ0OiBvbkRyYWdTdGFydFxuICAgICAgICBvbk1vdmU6ICBvbkRyYWdNb3ZlXG4gICAgICAgIG9uU3RvcDogIG9uRHJhZ1N0b3BcbiAgICAgICAgXG4gICAgYS5mb2N1cygpXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG5cbnNjYWxlICA9IDEuMFxub2Zmc2V0ID0ga3BvcyAwIDBcbmRyYWdnaW5nID0gZmFsc2VcblxudHJhbnNmb3JtID0gLT5cbiAgICBcbiAgICBzcyA9IGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS5zaXplXG4gICAgXG4gICAgYSA9JCAnLnNjcmVlbnNob3QnXG5cbiAgICBzY2FsZSA9IGNsYW1wIDEgMjAgc2NhbGVcbiAgICBcbiAgICBveCA9IHNzLndpZHRoICAqIChzY2FsZS0xKS8oMipzY2FsZSlcbiAgICBveSA9IHNzLmhlaWdodCAqIChzY2FsZS0xKS8oMipzY2FsZSlcbiAgICBvZmZzZXQueCA9IGNsYW1wIC1veCwgb3gsIG9mZnNldC54XG4gICAgb2Zmc2V0LnkgPSBjbGFtcCAtb3ksIG95LCBvZmZzZXQueVxuICAgIFxuICAgIGEuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZVgoI3tzY2FsZX0pIHNjYWxlWSgje3NjYWxlfSkgdHJhbnNsYXRlWCgje29mZnNldC54fXB4KSB0cmFuc2xhdGVZKCN7b2Zmc2V0Lnl9cHgpXCJcblxub25EYmxDbGljayA9IChldmVudCkgLT4gXG4gICAgXG4gICAgc2NhbGUgPSAxIFxuICAgIHRyYW5zZm9ybSgpXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcblxub25XaGVlbCA9IChldmVudCkgLT5cbiAgICBcbiAgICBzY2FsZUZhY3RvciA9IDEgLSBldmVudC5kZWx0YVkgLyA0MDAuMFxuICAgIG5ld1NjYWxlID0gY2xhbXAgMSAyMCBzY2FsZSAqIHNjYWxlRmFjdG9yXG4gICAgaWYgbmV3U2NhbGUgPT0gMVxuICAgICAgICBkcmFnZ2luZyA9IGZhbHNlXG4gICAgXG4gICAgc3MgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkuc2l6ZVxuICAgIFxuICAgIG1wID0ga3BvcyhldmVudCkubWludXMga3Bvcyhzcy53aWR0aCwgc3MuaGVpZ2h0KS50aW1lcyAwLjVcbiAgICBcbiAgICBvbGRQb3MgPSBvZmZzZXQucGx1cyBrcG9zKG1wKS50aW1lcyAxL3NjYWxlXG4gICAgbmV3UG9zID0gb2Zmc2V0LnBsdXMga3BvcyhtcCkudGltZXMgMS9uZXdTY2FsZVxuICAgIG9mZnNldC5hZGQgbmV3UG9zLm1pbnVzIG9sZFBvc1xuICAgIFxuICAgIHNjYWxlICo9IHNjYWxlRmFjdG9yXG4gICAgXG4gICAgdHJhbnNmb3JtKClcbiAgICBcbmJvcmRlclRpbWVyID0gbnVsbFxub25Nb3VzZU1vdmUgPSAoZXZlbnQpIC0+XG4gICAgaWYgbm90IGJvcmRlclRpbWVyXG4gICAgICAgIGJvcmRlclNjcm9sbCgpXG5cbm1hcFJhbmdlID0gKHZhbHVlLCB2YWx1ZVJhbmdlLCB0YXJnZXRSYW5nZSkgLT5cbiAgICB0YXJnZXRXaWR0aCAgID0gdGFyZ2V0UmFuZ2VbMV0gLSB0YXJnZXRSYW5nZVswXVxuICAgIHZhbHVlV2lkdGggICAgPSB2YWx1ZVJhbmdlWzFdICAtIHZhbHVlUmFuZ2VbMF1cbiAgICBjbGFtcGVkVmFsdWUgID0gY2xhbXAgdmFsdWVSYW5nZVswXSwgdmFsdWVSYW5nZVsxXSwgdmFsdWVcbiAgICByZWxhdGl2ZVZhbHVlID0gKGNsYW1wZWRWYWx1ZSAtIHZhbHVlUmFuZ2VbMF0pIC8gdmFsdWVXaWR0aFxuICAgIHRhcmdldFJhbmdlWzBdICsgdGFyZ2V0V2lkdGggKiByZWxhdGl2ZVZhbHVlXG4gICAgICAgIFxuc2Nyb2xsU3BlZWQgPSAwXG5kb1Njcm9sbCA9IC0+XG4gICAgdHJhbnNmb3JtKClcbiAgICBzdGFydFNjcm9sbCgpXG4gICAgXG5zdGFydFNjcm9sbCA9IC0+XG4gICAgbXMgPSBtYXBSYW5nZSBzY3JvbGxTcGVlZCwgWzAgMV0sIFsxMDAwLzEwIDEwMDAvMzBdXG4gICAgYm9yZGVyVGltZXIgPSBzZXRUaW1lb3V0IGJvcmRlclNjcm9sbCwgbXNcbiAgXG5ib3JkZXJTY3JvbGwgPSAtPlxuXG4gICAgY2xlYXJUaW1lb3V0IGJvcmRlclRpbWVyXG4gICAgYm9yZGVyVGltZXIgPSBudWxsXG4gICAgXG4gICAgcmV0dXJuIGlmIGRyYWdnaW5nXG4gICAgXG4gICAgbW91c2VQb3MgPSBrcG9zIHdjICdtb3VzZSdcbiAgICBcbiAgICBzY3JvbGwgPSBmYWxzZVxuICAgIGJvcmRlciA9IDIwMFxuICAgIFxuICAgIHNzID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLnNpemVcbiAgICBcbiAgICBkaXJlY3Rpb24gPSBrcG9zKHNzLndpZHRoLHNzLmhlaWdodCkudGltZXMoMC41KS50byhtb3VzZVBvcykubXVsKGtwb3MoMS9zcy53aWR0aCwxL3NzLmhlaWdodCkpLnRpbWVzKC0xKVxuICAgIFxuICAgIGlmIG1vdXNlUG9zLnggPCBib3JkZXJcbiAgICAgICAgc2Nyb2xsU3BlZWQgPSAoYm9yZGVyLW1vdXNlUG9zLngpL2JvcmRlclxuICAgICAgICBvZmZzZXQuYWRkIGRpcmVjdGlvbi50aW1lcyAoMS4wK3Njcm9sbFNwZWVkKjMwKS9zY2FsZVxuICAgICAgICBzY3JvbGwgPSB0cnVlXG4gICAgZWxzZSBpZiBtb3VzZVBvcy54ID4gc3Mud2lkdGgtYm9yZGVyXG4gICAgICAgIHNjcm9sbFNwZWVkID0gKGJvcmRlci0oc3Mud2lkdGgtbW91c2VQb3MueCkpL2JvcmRlclxuICAgICAgICBvZmZzZXQuYWRkIGRpcmVjdGlvbi50aW1lcyAoMS4wK3Njcm9sbFNwZWVkKjMwKS9zY2FsZVxuICAgICAgICBzY3JvbGwgPSB0cnVlXG4gICAgICAgIFxuICAgIGlmIG1vdXNlUG9zLnkgPCBib3JkZXJcbiAgICAgICAgc2Nyb2xsU3BlZWQgPSAoYm9yZGVyLW1vdXNlUG9zLnkpL2JvcmRlclxuICAgICAgICBvZmZzZXQuYWRkIGRpcmVjdGlvbi50aW1lcyAoMS4wK3Njcm9sbFNwZWVkKjMwKS9zY2FsZVxuICAgICAgICBzY3JvbGwgPSB0cnVlXG4gICAgZWxzZSBpZiBtb3VzZVBvcy55ID4gc3MuaGVpZ2h0LWJvcmRlclxuICAgICAgICBzY3JvbGxTcGVlZCA9IChib3JkZXItKHNzLmhlaWdodC1tb3VzZVBvcy55KSkvYm9yZGVyXG4gICAgICAgIG9mZnNldC5hZGQgZGlyZWN0aW9uLnRpbWVzICgxLjArc2Nyb2xsU3BlZWQqMzApL3NjYWxlXG4gICAgICAgIHNjcm9sbCA9IHRydWVcbiAgICAgICAgXG4gICAgaWYgc2Nyb2xsXG4gICAgICAgIGRvU2Nyb2xsKClcbiAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxub25EcmFnU3RhcnQgPSAoZHJhZywgZXZlbnQpIC0+IFxuICAgIFxuICAgIGlmIGV2ZW50LmJ1dHRvbiAhPSAwXG4gICAgICAgIGlmIGV2ZW50LmJ1dHRvbiA9PSAxXG4gICAgICAgICAgICBkb25lKClcbiAgICAgICAgcmV0dXJuICdza2lwJ1xuICAgIGVsc2UgaWYgc2NhbGUgPT0gMVxuICAgICAgICBkb25lKClcbiAgICAgICAgcmV0dXJuICdza2lwJ1xuICAgICAgICBcbiAgICBkcmFnZ2luZyA9IHRydWVcbiAgICBcbm9uRHJhZ1N0b3AgPSAoZHJhZywgZXZlbnQpIC0+ICMgZHJhZ2dpbmcgPSBmYWxzZVxub25EcmFnTW92ZSA9IChkcmFnLCBldmVudCkgLT4gXG4gICAgXG4gICAgb2Zmc2V0LmFkZCBkcmFnLmRlbHRhLnRpbWVzIDEvc2NhbGVcbiAgICB0cmFuc2Zvcm0oKVxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBcbiAgICBzdGFydDpzdGFydFxuICAgIGluaXQ6aW5pdFxuICAgIFxuICAgICJdfQ==
//# sourceURL=../coffee/zoom.coffee