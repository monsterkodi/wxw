(function() {
  /*
  0000000    000  000   000    
  000   000  000  0000  000    
  0000000    000  000 0 000    
  000   000  000  000  0000    
  0000000    000  000   000    
  */
  var Tray, about, action, app, electron, log, pkg, prefs, showAbout, tray, user;

  ({prefs, about, log} = require('kxk'));

  log('...');

  ({user} = require('./wxw'));

  pkg = require('../package.json');

  electron = require('electron');

  app = electron.app;

  Tray = electron.Tray;

  tray = null;

  showAbout = function() {
    log('showAbout');
    return about({
      img: `${__dirname}/../img/about.png`,
      background: "#222",
      size: 300,
      pkg: pkg
    });
  };

  app.on('window-all-closed', function(event) {
    return event.preventDefault();
  });

  //  0000000    0000000  000000000  000   0000000   000   000  
  // 000   000  000          000     000  000   000  0000  000  
  // 000000000  000          000     000  000   000  000 0 000  
  // 000   000  000          000     000  000   000  000  0000  
  // 000   000   0000000     000     000   0000000   000   000  
  action = function(dir) {
    return log(`action ${dir}`);
  };

  
  //00000000   00000000   0000000   0000000    000   000
  //000   000  000       000   000  000   000   000 000 
  //0000000    0000000   000000000  000   000    00000  
  //000   000  000       000   000  000   000     000   
  //000   000  00000000  000   000  0000000       000   
  app.on('ready', function() {
    var a, i, len, ref, ref1, results;
    log('app ready');
    tray = new Tray(`${__dirname}/../img/menu.png`);
    tray.on('click', showAbout);
    if ((ref = app.dock) != null) {
      ref.hide();
    }
    prefs.init({
      left: 'ctrl+alt+left',
      right: 'ctrl+alt+right',
      up: 'ctrl+alt+up',
      down: 'ctrl+alt+down'
    });
    ref1 = ['left', 'right', 'up', 'down'];
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      a = ref1[i];
      results.push(electron.globalShortcut.register(prefs.get(a), function() {
        return action(a);
      }));
    }
    return results;
  });

  log('...');

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJqcy9iaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxLQUFGLEVBQVMsS0FBVCxFQUFnQixHQUFoQixDQUFBLEdBQXdCLE9BQUEsQ0FBUSxLQUFSLENBQXhCOztFQUVBLEdBQUEsQ0FBSSxLQUFKOztFQUVBLENBQUEsQ0FBRSxJQUFGLENBQUEsR0FBVyxPQUFBLENBQVEsT0FBUixDQUFYOztFQUVBLEdBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUVYLEdBQUEsR0FBVyxRQUFRLENBQUM7O0VBQ3BCLElBQUEsR0FBVyxRQUFRLENBQUM7O0VBQ3BCLElBQUEsR0FBVzs7RUFFWCxTQUFBLEdBQVksUUFBQSxDQUFBLENBQUE7SUFFUixHQUFBLENBQUksV0FBSjtXQUNBLEtBQUEsQ0FDSTtNQUFBLEdBQUEsRUFBSyxDQUFBLENBQUEsQ0FBRyxTQUFILENBQWEsaUJBQWIsQ0FBTDtNQUNBLFVBQUEsRUFBWSxNQURaO01BRUEsSUFBQSxFQUFNLEdBRk47TUFHQSxHQUFBLEVBQUs7SUFITCxDQURKO0VBSFE7O0VBU1osR0FBRyxDQUFDLEVBQUosQ0FBTyxtQkFBUCxFQUE0QixRQUFBLENBQUMsS0FBRCxDQUFBO1dBQVcsS0FBSyxDQUFDLGNBQU4sQ0FBQTtFQUFYLENBQTVCLEVBOUJBOzs7Ozs7O0VBc0NBLE1BQUEsR0FBUyxRQUFBLENBQUMsR0FBRCxDQUFBO1dBRUwsR0FBQSxDQUFJLENBQUEsT0FBQSxDQUFBLENBQVUsR0FBVixDQUFBLENBQUo7RUFGSyxFQXRDVDs7Ozs7Ozs7RUFnREEsR0FBRyxDQUFDLEVBQUosQ0FBTyxPQUFQLEVBQWdCLFFBQUEsQ0FBQSxDQUFBO0FBQ1osUUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0lBQUEsR0FBQSxDQUFJLFdBQUo7SUFDQSxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQVMsQ0FBQSxDQUFBLENBQUcsU0FBSCxDQUFhLGdCQUFiLENBQVQ7SUFDUCxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBaUIsU0FBakI7O1NBQ1EsQ0FBRSxJQUFWLENBQUE7O0lBRUEsS0FBSyxDQUFDLElBQU4sQ0FDSTtNQUFBLElBQUEsRUFBTyxlQUFQO01BQ0EsS0FBQSxFQUFPLGdCQURQO01BRUEsRUFBQSxFQUFPLGFBRlA7TUFHQSxJQUFBLEVBQU87SUFIUCxDQURKO0FBTUE7QUFBQTtJQUFBLEtBQUEsc0NBQUE7O21CQUNJLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBeEIsQ0FBaUMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQWpDLEVBQStDLFFBQUEsQ0FBQSxDQUFBO2VBQUcsTUFBQSxDQUFPLENBQVA7TUFBSCxDQUEvQztJQURKLENBQUE7O0VBWlksQ0FBaEI7O0VBZUEsR0FBQSxDQUFJLEtBQUo7QUEvREEiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgXG4wMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICAgIFxuIyMjXG5cbnsgcHJlZnMsIGFib3V0LCBsb2cgfSA9IHJlcXVpcmUgJ2t4aydcblxubG9nICcuLi4nXG5cbnsgdXNlciB9ID0gcmVxdWlyZSAnLi93eHcnXG5cbnBrZyAgICAgID0gcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuYXBwICAgICAgPSBlbGVjdHJvbi5hcHBcblRyYXkgICAgID0gZWxlY3Ryb24uVHJheVxudHJheSAgICAgPSBudWxsXG5cbnNob3dBYm91dCA9IC0+XG4gICAgXG4gICAgbG9nICdzaG93QWJvdXQnXG4gICAgYWJvdXQgXG4gICAgICAgIGltZzogXCIje19fZGlybmFtZX0vLi4vaW1nL2Fib3V0LnBuZ1wiXG4gICAgICAgIGJhY2tncm91bmQ6IFwiIzIyMlwiXG4gICAgICAgIHNpemU6IDMwMFxuICAgICAgICBwa2c6IHBrZ1xuXG5hcHAub24gJ3dpbmRvdy1hbGwtY2xvc2VkJywgKGV2ZW50KSAtPiBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiMgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuYWN0aW9uID0gKGRpcikgLT5cbiAgICBcbiAgICBsb2cgXCJhY3Rpb24gI3tkaXJ9XCJcbiAgICBcbiMwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4jMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwIFxuIzAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgIDAwMDAwICBcbiMwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4jMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgIFxuXG5hcHAub24gJ3JlYWR5JywgLT4gXG4gICAgbG9nICdhcHAgcmVhZHknXG4gICAgdHJheSA9IG5ldyBUcmF5IFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy9tZW51LnBuZ1wiXG4gICAgdHJheS5vbiAnY2xpY2snLCBzaG93QWJvdXRcbiAgICBhcHAuZG9jaz8uaGlkZSgpXG4gICAgICAgICAgICBcbiAgICBwcmVmcy5pbml0IFxuICAgICAgICBsZWZ0OiAgJ2N0cmwrYWx0K2xlZnQnXG4gICAgICAgIHJpZ2h0OiAnY3RybCthbHQrcmlnaHQnXG4gICAgICAgIHVwOiAgICAnY3RybCthbHQrdXAnXG4gICAgICAgIGRvd246ICAnY3RybCthbHQrZG93bidcblxuICAgIGZvciBhIGluIFsnbGVmdCcsICdyaWdodCcsICd1cCcsICdkb3duJ11cbiAgICAgICAgZWxlY3Ryb24uZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIgcHJlZnMuZ2V0KGEpLCAtPiBhY3Rpb24gYVxuICBcbmxvZyAnLi4uJyJdfQ==
//# sourceURL=C:/Users/kodi/s/wxw/coffee/bin.coffee