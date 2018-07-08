(function() {
  //  0000000   0000000  00000000   00000000  00000000  000   000  0000000   0000000    0000000   00     00  
  // 000       000       000   000  000       000       0000  000     000   000   000  000   000  000   000  
  // 0000000   000       0000000    0000000   0000000   000 0 000    000    000   000  000   000  000000000  
  //      000  000       000   000  000       000       000  0000   000     000   000  000   000  000 0 000  
  // 0000000    0000000  000   000  00000000  00000000  000   000  0000000   0000000    0000000   000   000  
  var $, borderScroll, borderTimer, childp, clamp, createWindow, doScroll, done, drag, electron, error, init, karg, log, mapRange, offset, onDblClick, onDragMove, onDragStart, onDragStop, onMouseMove, onWheel, pos, post, prefs, rect, robot, robotPos, scale, screenshotFile, scrollSpeed, slash, start, transform, vh, vw, zoomWin;

  ({childp, post, karg, slash, drag, prefs, clamp, pos, error, log, $} = require('kxk'));

  rect = require('./rect');

  electron = require('electron');

  robot = require('robotjs');

  zoomWin = null;

  vw = electron.screen.getPrimaryDisplay().workAreaSize.width;

  vh = electron.screen.getPrimaryDisplay().workAreaSize.height;

  screenshotFile = function() {
    return slash.unslash(slash.join(prefs.get('screenhotFolder', slash.resolve("~/Desktop")), 'screenshot.png'));
  };

  //  0000000  000000000   0000000   00000000   000000000  
  // 000          000     000   000  000   000     000     
  // 0000000      000     000000000  0000000       000     
  //      000     000     000   000  000   000     000     
  // 0000000      000     000   000  000   000     000     
  start = function(opt = {}) {
    var pngFile, screenshotexe;
    screenshotexe = slash.unslash(slash.resolve(slash.join(__dirname, '..', 'bin', 'screenshot.exe')));
    if (!slash.isFile(screenshotexe)) {
      screenshotexe = slash.swapExt(screenshotexe, 'bat');
    }
    return pngFile = childp.exec(`"${screenshotexe}" ${screenshotFile()}`, function(err) {
      if (err) {
        return error(err);
      }
      return createWindow(opt);
    });
  };

  // 000   000  000  000   000  0000000     0000000   000   000  
  // 000 0 000  000  0000  000  000   000  000   000  000 0 000  
  // 000000000  000  000 0 000  000   000  000   000  000000000  
  // 000   000  000  000  0000  000   000  000   000  000   000  
  // 00     00  000  000   000  0000000     0000000   00     00  
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
        webSecurity: false
      }
    });
    zoomWin = win;
    pngFile = screenshotFile();
    html = `<head>\n<style type="text/css">\n    body {\n        overflow:       hidden;\n        margin:         0;\n        border:         none;\n    }\n    #image {\n        position:       absolute;\n        left:           0;\n        top:            0;\n        width:          ${vw}px;\n        height:         ${vh}px;\n    }\n</style>\n</head>\n<body>\n<img id='image' tabindex=0 src="${pngFile}"/>\n<script>\n    var pth = process.resourcesPath + "/app/js/screenzoom.js";\n    if (process.resourcesPath.indexOf("node_modules\\\\electron\\\\dist\\\\resources")>=0) { pth = process.cwd() + "/js/screenzoom.js"; }\n    console.log(pth, process.resourcesPath);\n    require(pth).init();\n</script>\n</body>`;
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

  
  // 000  000   000  000  000000000    
  // 000  0000  000  000     000       
  // 000  000 0 000  000     000       
  // 000  000  0000  000     000       
  // 000  000   000  000     000     
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

  // 000000000  00000000    0000000   000   000   0000000  00000000   0000000   00000000   00     00  
  //    000     000   000  000   000  0000  000  000       000       000   000  000   000  000   000  
  //    000     0000000    000000000  000 0 000  0000000   000000    000   000  0000000    000000000  
  //    000     000   000  000   000  000  0000       000  000       000   000  000   000  000 0 000  
  //    000     000   000  000   000  000   000  0000000   000        0000000   000   000  000   000  
  scale = 1.0;

  offset = pos(0, 0);

  transform = function() {
    var a, ox, oy;
    a = $('image');
    scale = clamp(1, 20, scale);
    ox = vw * (scale - 1) / (2 * scale);
    oy = vh * (scale - 1) / (2 * scale);
    offset.x = clamp(-ox, ox, offset.x);
    offset.y = clamp(-oy, oy, offset.y);
    return a.style.transform = `scaleX(${scale}) scaleY(${scale}) translateX(${offset.x}px) translateY(${offset.y}px)`;
  };

  onDblClick = function(event) {
    scale = 1;
    return transform();
  };

  
  // 000   000  000   000  00000000  00000000  000      
  // 000 0 000  000   000  000       000       000      
  // 000000000  000000000  0000000   0000000   000      
  // 000   000  000   000  000       000       000      
  // 00     00  000   000  00000000  00000000  0000000  
  onWheel = function(event) {
    var mp, newPos, newScale, oldPos, scaleFactor;
    scaleFactor = 1 - event.deltaY / 400.0;
    newScale = clamp(1, 20, scale * scaleFactor);
    mp = pos(event).minus(pos(vw, vh).times(0.5));
    oldPos = offset.plus(pos(mp).times(1 / scale));
    newPos = offset.plus(pos(mp).times(1 / newScale));
    offset.add(newPos.minus(oldPos));
    scale *= scaleFactor;
    return transform();
  };

  robotPos = function() {
    return pos(robot.getMousePos()).div(pos(robot.getScreenSize().width, robot.getScreenSize().height)).mul(pos(vw, vh));
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
    direction = pos(vw, vh).times(0.5).to(mousePos).mul(pos(1 / vw, 1 / vh)).times(-1);
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

  
  // 0000000    00000000    0000000    0000000   
  // 000   000  000   000  000   000  000        
  // 000   000  0000000    000000000  000  0000  
  // 000   000  000   000  000   000  000   000  
  // 0000000    000   000  000   000   0000000   
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyZWVuem9vbS5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXMiOlsiY29mZmVlL3NjcmVlbnpvb20uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7O0FBQUEsTUFBQSxDQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsS0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQTs7RUFNQSxDQUFBLENBQUUsTUFBRixFQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFBc0IsS0FBdEIsRUFBNkIsSUFBN0IsRUFBbUMsS0FBbkMsRUFBMEMsS0FBMUMsRUFBaUQsR0FBakQsRUFBc0QsS0FBdEQsRUFBNkQsR0FBN0QsRUFBa0UsQ0FBbEUsQ0FBQSxHQUF3RSxPQUFBLENBQVEsS0FBUixDQUF4RTs7RUFFQSxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNYLEtBQUEsR0FBVyxPQUFBLENBQVEsU0FBUjs7RUFFWCxPQUFBLEdBQVc7O0VBRVgsRUFBQSxHQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQyxZQUFZLENBQUM7O0VBQ3RELEVBQUEsR0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFoQixDQUFBLENB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TUFDRCxJQUFBLENBQUE7QUFDQSxhQUFPLE9BRk47O0VBTks7O0VBVWQsVUFBQSxHQUFjLFFBQUEsQ0FBQyxJQUFELEVBQU8sS0FBUCxDQUFBLEVBQUE7O0VBQ2QsVUFBQSxHQUFjLFFBQUEsQ0FBQyxJQUFELEVBQU8sS0FBUCxDQUFBO0lBRVYsTUFBTSxDQUFDLEdBQVAsQ0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVgsQ0FBaUIsQ0FBQSxHQUFFLEtBQW5CLENBQVg7V0FDQSxTQUFBLENBQUE7RUFIVTs7RUFLZCxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsS0FBQSxFQUFNLEtBQU47SUFDQSxJQUFBLEVBQUs7RUFETDtBQXJRSiIsInNvdXJjZXNDb250ZW50IjpbIiMgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAgIDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxueyBjaGlsZHAsIHBvc3QsIGthcmcsIHNsYXNoLCBkcmFnLCBwcmVmcywgY2xhbXAsIHBvcywgZXJyb3IsIGxvZywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5yZWN0ICAgICA9IHJlcXVpcmUgJy4vcmVjdCdcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5yb2JvdCAgICA9IHJlcXVpcmUgJ3JvYm90anMnIFxuXG56b29tV2luICA9IG51bGxcblxudncgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemUud2lkdGhcbnZoID0gZWxlY3Ryb24uc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplLmhlaWdodFxuXG5zY3JlZW5zaG90RmlsZSA9IC0+XG4gICAgc2xhc2gudW5zbGFzaCBzbGFzaC5qb2luIHByZWZzLmdldCgnc2NyZWVuaG90Rm9sZGVyJywgc2xhc2gucmVzb2x2ZSBcIn4vRGVza3RvcFwiKSwgJ3NjcmVlbnNob3QucG5nJ1xuXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuc3RhcnQgPSAob3B0PXt9KSAtPlxuICAgIFxuICAgIHNjcmVlbnNob3RleGUgPSBzbGFzaC51bnNsYXNoIHNsYXNoLnJlc29sdmUgc2xhc2guam9pbihfX2Rpcm5hbWUsJy4uJywnYmluJywnc2NyZWVuc2hvdC5leGUnKVxuICAgIFxuICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgc2NyZWVuc2hvdGV4ZVxuICAgICAgICBzY3JlZW5zaG90ZXhlID0gc2xhc2guc3dhcEV4dCBzY3JlZW5zaG90ZXhlLCAnYmF0J1xuICAgICAgICBcbiAgICBwbmdGaWxlID0gXG4gICAgICAgIFxuICAgIGNoaWxkcC5leGVjIFwiXFxcIiN7c2NyZWVuc2hvdGV4ZX1cXFwiICN7c2NyZWVuc2hvdEZpbGUoKX1cIiwgKGVycikgLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZXJyb3IgZXJyIGlmIGVyclxuICAgICAgICBjcmVhdGVXaW5kb3cgb3B0XG5cbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuXG5jcmVhdGVXaW5kb3cgPSAob3B0KSAtPlxuICAgICAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMDAwMDAwMDAnXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgdHJ1ZVxuICAgICAgICBwcmVsb2FkV2luZG93OiAgIHRydWVcbiAgICAgICAgeDogICAgICAgICAgICAgICAwIFxuICAgICAgICB5OiAgICAgICAgICAgICAgIDAgXG4gICAgICAgIHdpZHRoOiAgICAgICAgICAgdndcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICB2aFxuICAgICAgICBoYXNTaGFkb3c6ICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgZnJhbWU6ICAgICAgICAgICBmYWxzZVxuICAgICAgICB0aGlja0ZyYW1lOiAgICAgIGZhbHNlXG4gICAgICAgIHNob3c6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBmdWxsc2NyZWVuOiAgICAgIG5vdCBvcHQuZGVidWdcbiAgICAgICAgd2ViUHJlZmVyZW5jZXM6XG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogZmFsc2VcbiAgICAgICAgICAgIFxuICAgIHpvb21XaW4gPSB3aW5cbiAgICBcbiAgICBwbmdGaWxlID0gc2NyZWVuc2hvdEZpbGUoKVxuICAgICAgICAgICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICAgICAgMDtcbiAgICAgICAgICAgICAgICBib3JkZXI6ICAgICAgICAgbm9uZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNpbWFnZSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICAgICAgIGFic29sdXRlO1xuICAgICAgICAgICAgICAgIGxlZnQ6ICAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgIHRvcDogICAgICAgICAgICAwO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAje3Z3fXB4O1xuICAgICAgICAgICAgICAgIGhlaWdodDogICAgICAgICAje3ZofXB4O1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICA8aW1nIGlkPSdpbWFnZScgdGFiaW5kZXg9MCBzcmM9XCIje3BuZ0ZpbGV9XCIvPlxuICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgdmFyIHB0aCA9IHByb2Nlc3MucmVzb3VyY2VzUGF0aCArIFwiL2FwcC9qcy9zY3JlZW56b29tLmpzXCI7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLmluZGV4T2YoXCJub2RlX21vZHVsZXNcXFxcXFxcXGVsZWN0cm9uXFxcXFxcXFxkaXN0XFxcXFxcXFxyZXNvdXJjZXNcIik+PTApIHsgcHRoID0gcHJvY2Vzcy5jd2QoKSArIFwiL2pzL3NjcmVlbnpvb20uanNcIjsgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cocHRoLCBwcm9jZXNzLnJlc291cmNlc1BhdGgpO1xuICAgICAgICAgICAgcmVxdWlyZShwdGgpLmluaXQoKTtcbiAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICBcIlwiXCJcblxuICAgIHdpbi5sb2FkVVJMIFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSShodG1sKSBcbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICB3aW4ub24gJ3JlYWR5LXRvLXNob3cnLCAtPlxuICAgIGlmIG9wdC5kZWJ1Z1xuICAgICAgICB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcbiAgICBlbHNlXG4gICAgICAgIHdpbi5tYXhpbWl6ZSgpXG4gICAgd2luXG4gICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG5cbmRvbmUgPSAtPiBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgd2luLmNsb3NlKClcbiAgICBpZiB3aW4uZGVidWcgdGhlbiBlbGVjdHJvbi5yZW1vdGUuYXBwLmV4aXQgMFxuICAgICAgICBcbmluaXQgPSAtPlxuICAgIFxuICAgIHBvc3Qub24gJ3Nsb2cnLCAodGV4dCkgLT5cbiAgICBcbiAgICAgICAgY29uc29sZS5sb2cgJ3Nsb2cnLCB0ZXh0XG4gICAgICAgIHBvc3QudG9NYWluICd3aW5sb2cnLCB0ZXh0XG4gICAgXG4gICAgd2luID0gZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIFxuICAgIGEgPSQgJ2ltYWdlJ1xuICAgIGEub25kYmxjbGljayAgID0gb25EYmxDbGlja1xuICAgIGEub25tb3VzZW1vdmUgID0gb25Nb3VzZU1vdmVcbiAgICBhLm9ubW91c2V3aGVlbCA9IG9uV2hlZWxcbiAgICBhLm9ua2V5ZG93biAgICA9IGRvbmVcbiAgICBpZiBub3Qgd2luLmRlYnVnXG4gICAgICAgIGEub25ibHVyID0gZG9uZVxuICAgIG5ldyBkcmFnXG4gICAgICAgIHRhcmdldDogIGFcbiAgICAgICAgb25TdGFydDogb25EcmFnU3RhcnRcbiAgICAgICAgb25Nb3ZlOiAgb25EcmFnTW92ZVxuICAgICAgICBvblN0b3A6ICBvbkRyYWdTdG9wXG4gICAgYS5mb2N1cygpXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG5cbnNjYWxlICA9IDEuMFxub2Zmc2V0ID0gcG9zKDAsMClcblxudHJhbnNmb3JtID0gLT5cbiAgICBhID0kICdpbWFnZSdcblxuICAgIHNjYWxlID0gY2xhbXAgMSwgMjAsIHNjYWxlXG4gICAgXG4gICAgb3ggPSB2dyAqIChzY2FsZS0xKS8oMipzY2FsZSlcbiAgICBveSA9IHZoICogKHNjYWxlLTEpLygyKnNjYWxlKVxuICAgIG9mZnNldC54ID0gY2xhbXAgLW94LCBveCwgb2Zmc2V0LnhcbiAgICBvZmZzZXQueSA9IGNsYW1wIC1veSwgb3ksIG9mZnNldC55XG4gICAgXG4gICAgYS5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlWCgje3NjYWxlfSkgc2NhbGVZKCN7c2NhbGV9KSB0cmFuc2xhdGVYKCN7b2Zmc2V0Lnh9cHgpIHRyYW5zbGF0ZVkoI3tvZmZzZXQueX1weClcIlxuXG5vbkRibENsaWNrID0gKGV2ZW50KSAtPiBcbiAgICBzY2FsZSA9IDEgXG4gICAgdHJhbnNmb3JtKClcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuXG5vbldoZWVsID0gKGV2ZW50KSAtPlxuICAgIFxuICAgIHNjYWxlRmFjdG9yID0oMSAtIGV2ZW50LmRlbHRhWSAvIDQwMC4wKVxuICAgIG5ld1NjYWxlID0gY2xhbXAgMSwgMjAsIHNjYWxlICogc2NhbGVGYWN0b3JcbiAgICBcbiAgICBtcCA9IHBvcyhldmVudCkubWludXMgcG9zKHZ3LCB2aCkudGltZXMgMC41XG4gICAgXG4gICAgb2xkUG9zID0gb2Zmc2V0LnBsdXMgcG9zKG1wKS50aW1lcyAxL3NjYWxlXG4gICAgbmV3UG9zID0gb2Zmc2V0LnBsdXMgcG9zKG1wKS50aW1lcyAxL25ld1NjYWxlXG4gICAgb2Zmc2V0LmFkZCBuZXdQb3MubWludXMgb2xkUG9zXG4gICAgXG4gICAgc2NhbGUgKj0gc2NhbGVGYWN0b3JcbiAgICB0cmFuc2Zvcm0oKVxuICAgIFxucm9ib3RQb3MgPSAtPiBwb3Mocm9ib3QuZ2V0TW91c2VQb3MoKSkuZGl2KHBvcyhyb2JvdC5nZXRTY3JlZW5TaXplKCkud2lkdGgscm9ib3QuZ2V0U2NyZWVuU2l6ZSgpLmhlaWdodCkpLm11bCBwb3ModncsdmgpXG5cbmJvcmRlclRpbWVyID0gbnVsbFxub25Nb3VzZU1vdmUgPSAoZXZlbnQpIC0+XG4gICAgaWYgbm90IGJvcmRlclRpbWVyXG4gICAgICAgIGJvcmRlclNjcm9sbCgpXG5cbm1hcFJhbmdlID0gKHZhbHVlLCB2YWx1ZVJhbmdlLCB0YXJnZXRSYW5nZSkgLT5cbiAgICB0YXJnZXRXaWR0aCAgID0gdGFyZ2V0UmFuZ2VbMV0gLSB0YXJnZXRSYW5nZVswXVxuICAgIHZhbHVlV2lkdGggICAgPSB2YWx1ZVJhbmdlWzFdICAtIHZhbHVlUmFuZ2VbMF1cbiAgICBjbGFtcGVkVmFsdWUgID0gY2xhbXAgdmFsdWVSYW5nZVswXSwgdmFsdWVSYW5nZVsxXSwgdmFsdWVcbiAgICByZWxhdGl2ZVZhbHVlID0gKGNsYW1wZWRWYWx1ZSAtIHZhbHVlUmFuZ2VbMF0pIC8gdmFsdWVXaWR0aFxuICAgIHRhcmdldFJhbmdlWzBdICsgdGFyZ2V0V2lkdGggKiByZWxhdGl2ZVZhbHVlXG4gICAgICAgIFxuc2Nyb2xsU3BlZWQgPSAwXG5kb1Njcm9sbCA9IC0+XG4gICAgdHJhbnNmb3JtKClcbiAgICBtcyA9IG1hcFJhbmdlIHNjcm9sbFNwZWVkLCBbMCwxXSwgWzEwMDAvMTAsIDEwMDAvMzBdXG4gICAgYm9yZGVyVGltZXIgPSBzZXRUaW1lb3V0IGJvcmRlclNjcm9sbCwgbXNcbiAgICBcbmJvcmRlclNjcm9sbCA9IC0+XG5cbiAgICBjbGVhclRpbWVvdXQgYm9yZGVyVGltZXJcbiAgICBib3JkZXJUaW1lciA9IG51bGxcbiAgICBcbiAgICBtb3VzZVBvcyA9IHJvYm90UG9zKClcbiAgICBcbiAgICBzY3JvbGwgPSBmYWxzZVxuICAgIGJvcmRlciA9IDIwMFxuICAgIFxuICAgIGRpcmVjdGlvbiA9IHBvcyh2dyx2aCkudGltZXMoMC41KS50byhtb3VzZVBvcykubXVsKHBvcygxL3Z3LDEvdmgpKS50aW1lcygtMSlcbiAgICBcbiAgICBpZiBtb3VzZVBvcy54IDwgYm9yZGVyXG4gICAgICAgIHNjcm9sbFNwZWVkID0gKGJvcmRlci1tb3VzZVBvcy54KS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgIGVsc2UgaWYgbW91c2VQb3MueCA+IHZ3LWJvcmRlclxuICAgICAgICBzY3JvbGxTcGVlZCA9IChib3JkZXItKHZ3LW1vdXNlUG9zLngpKS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBtb3VzZVBvcy55IDwgYm9yZGVyXG4gICAgICAgIHNjcm9sbFNwZWVkID0gKGJvcmRlci1tb3VzZVBvcy55KS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgIGVsc2UgaWYgbW91c2VQb3MueSA+IHZoLWJvcmRlclxuICAgICAgICBzY3JvbGxTcGVlZCA9IChib3JkZXItKHZoLW1vdXNlUG9zLnkpKS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBzY3JvbGxcbiAgICAgICAgZG9TY3JvbGwoKVxuICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5vbkRyYWdTdGFydCA9IChkcmFnLCBldmVudCkgLT4gXG4gICAgXG4gICAgaWYgZXZlbnQuYnV0dG9uICE9IDBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9uID09IDFcbiAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gJ3NraXAnXG4gICAgZWxzZSBpZiBzY2FsZSA9PSAxXG4gICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gJ3NraXAnXG4gICAgXG5vbkRyYWdTdG9wICA9IChkcmFnLCBldmVudCkgLT4gXG5vbkRyYWdNb3ZlICA9IChkcmFnLCBldmVudCkgLT4gXG4gICAgXG4gICAgb2Zmc2V0LmFkZCBkcmFnLmRlbHRhLnRpbWVzIDEvc2NhbGVcbiAgICB0cmFuc2Zvcm0oKVxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBcbiAgICBzdGFydDpzdGFydFxuICAgIGluaXQ6aW5pdFxuICAgICJdfQ==
//# sourceURL=C:/Users/kodi/s/wxw/coffee/screenzoom.coffee