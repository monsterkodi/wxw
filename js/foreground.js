(function() {
  /*
  00000000   0000000   00000000   00000000   0000000   00000000    0000000   000   000  000   000  0000000    
  000       000   000  000   000  000       000        000   000  000   000  000   000  0000  000  000   000  
  000000    000   000  0000000    0000000   000  0000  0000000    000   000  000   000  000 0 000  000   000  
  000       000   000  000   000  000       000   000  000   000  000   000  000   000  000  0000  000   000  
  000        0000000   000   000  00000000   0000000   000   000   0000000    0000000   000   000  0000000    
  */
  var foreground, log, slash, user, winlist;

  ({slash, log} = require('kxk'));

  user = require('./user');

  winlist = require('./winlist');

  foreground = function(exePath, opt = {}) {
    var KEYDOWN, KEYUP, VK_MENU, appWins, i, len, visWins, win, winMatches;
    if (opt.strict == null) {
      opt.strict = false;
    }
    if (opt.electron == null) {
      opt.electron = true;
    }
    winMatches = function(win) {
      var split;
      if (opt.strict && win.path === exePath) {
        return true;
      }
      if (slash.file(win.path) === slash.file(exePath)) {
        return true;
      }
      if (opt.electron) {
        if (slash.file(win.path) === 'electron.exe') {
          split = slash.split(win.path);
          if (split.length > 5 && split[split.length - 5] === slash.base(exePath)) {
            return true;
          }
        }
      }
      return false;
    };
    exePath = slash.resolve(exePath);
    appWins = winlist().filter(winMatches);
    visWins = appWins.filter(function(win) {
      return !win.minimized;
    });
    if (visWins.length === 0) {
      visWins = appWins;
    }
    for (i = 0, len = visWins.length; i < len; i++) {
      win = visWins[i];
      VK_MENU = 0x12; // ALT key
      KEYDOWN = 1;
      KEYUP = 3;
      if (win.minimized) {
        user.RestoreWindow(win.hwnd);
      }
      user.keybd_event(VK_MENU, 0, KEYDOWN, null); // fake ALT press to enable foreground switch
      user.SetForegroundWindow(win.hwnd); // ... no wonder windows is so bad
      user.keybd_event(VK_MENU, 0, KEYUP, null);
    }
    return visWins;
  };

  module.exports = foreground;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yZWdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXMiOlsiY29mZmVlL2ZvcmVncm91bmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7Ozs7Ozs7QUFBQSxNQUFBLFVBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTs7RUFRQSxDQUFBLENBQUUsS0FBRixFQUFTLEdBQVQsQ0FBQSxHQUFpQixPQUFBLENBQVEsS0FBUixDQUFqQjs7RUFFQSxJQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0VBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUVWLFVBQUEsR0FBYSxRQUFBLENBQUMsT0FBRCxFQUFVLE1BQUksQ0FBQSxDQUFkLENBQUE7QUFFVCxRQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUE7O01BQUEsR0FBRyxDQUFDLFNBQVU7OztNQUNkLEdBQUcsQ0FBQyxXQUFZOztJQUVoQixVQUFBLEdBQWEsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNULFVBQUE7TUFBQSxJQUFlLEdBQUcsQ0FBQyxNQUFKLElBQWUsR0FBRyxDQUFDLElBQUosS0FBWSxPQUExQztBQUFBLGVBQU8sS0FBUDs7TUFDQSxJQUFlLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBQSxLQUF3QixLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBdkM7QUFBQSxlQUFPLEtBQVA7O01BQ0EsSUFBRyxHQUFHLENBQUMsUUFBUDtRQUNJLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFBLEtBQXdCLGNBQTNCO1VBQ0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBRyxDQUFDLElBQWhCO1VBQ1IsSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWYsSUFBcUIsS0FBTSxDQUFBLEtBQUssQ0FBQyxNQUFOLEdBQWEsQ0FBYixDQUFOLEtBQXlCLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFqRDtBQUNJLG1CQUFPLEtBRFg7V0FGSjtTQURKOzthQUtBO0lBUlM7SUFVYixPQUFBLEdBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkO0lBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBQSxDQUFTLENBQUMsTUFBVixDQUFpQixVQUFqQjtJQUVWLE9BQUEsR0FBVSxPQUFPLENBQUMsTUFBUixDQUFlLFFBQUEsQ0FBQyxHQUFELENBQUE7YUFBUyxDQUFJLEdBQUcsQ0FBQztJQUFqQixDQUFmO0lBRVYsSUFBRyxPQUFPLENBQUMsTUFBUixLQUFrQixDQUFyQjtNQUNJLE9BQUEsR0FBVSxRQURkOztJQUdBLEtBQUEseUNBQUE7O01BRUksT0FBQSxHQUFjLEtBQWQ7TUFDQSxPQUFBLEdBQWM7TUFDZCxLQUFBLEdBQWM7TUFFZCxJQUFHLEdBQUcsQ0FBQyxTQUFQO1FBQ0ksSUFBSSxDQUFDLGFBQUwsQ0FBbUIsR0FBRyxDQUFDLElBQXZCLEVBREo7O01BR0EsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsT0FBakIsRUFBMEIsQ0FBMUIsRUFBNkIsT0FBN0IsRUFBc0MsSUFBdEMsRUFQQTtNQVFBLElBQUksQ0FBQyxtQkFBTCxDQUF5QixHQUFHLENBQUMsSUFBN0IsRUFSQTtNQVNBLElBQUksQ0FBQyxXQUFMLENBQWlCLE9BQWpCLEVBQTBCLENBQTFCLEVBQTZCLEtBQTdCLEVBQW9DLElBQXBDO0lBWEo7V0FhQTtFQXBDUzs7RUFzQ2IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFuRGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgc2xhc2gsIGxvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51c2VyICAgID0gcmVxdWlyZSAnLi91c2VyJ1xud2lubGlzdCA9IHJlcXVpcmUgJy4vd2lubGlzdCdcbiAgICBcbmZvcmVncm91bmQgPSAoZXhlUGF0aCwgb3B0PXt9KSAtPlxuICAgIFxuICAgIG9wdC5zdHJpY3QgPz0gZmFsc2VcbiAgICBvcHQuZWxlY3Ryb24gPz0gdHJ1ZVxuICAgIFxuICAgIHdpbk1hdGNoZXMgPSAod2luKSAtPlxuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBvcHQuc3RyaWN0IGFuZCB3aW4ucGF0aCA9PSBleGVQYXRoXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHNsYXNoLmZpbGUod2luLnBhdGgpID09IHNsYXNoLmZpbGUgZXhlUGF0aFxuICAgICAgICBpZiBvcHQuZWxlY3Ryb24gXG4gICAgICAgICAgICBpZiBzbGFzaC5maWxlKHdpbi5wYXRoKSA9PSAnZWxlY3Ryb24uZXhlJyBcbiAgICAgICAgICAgICAgICBzcGxpdCA9IHNsYXNoLnNwbGl0IHdpbi5wYXRoXG4gICAgICAgICAgICAgICAgaWYgc3BsaXQubGVuZ3RoID4gNSBhbmQgc3BsaXRbc3BsaXQubGVuZ3RoLTVdID09IHNsYXNoLmJhc2UgZXhlUGF0aFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBmYWxzZVxuICAgIFxuICAgIGV4ZVBhdGggPSBzbGFzaC5yZXNvbHZlIGV4ZVBhdGhcbiAgICBhcHBXaW5zID0gd2lubGlzdCgpLmZpbHRlciB3aW5NYXRjaGVzXG4gICAgICAgIFxuICAgIHZpc1dpbnMgPSBhcHBXaW5zLmZpbHRlciAod2luKSAtPiBub3Qgd2luLm1pbmltaXplZFxuICAgIFxuICAgIGlmIHZpc1dpbnMubGVuZ3RoID09IDBcbiAgICAgICAgdmlzV2lucyA9IGFwcFdpbnNcblxuICAgIGZvciB3aW4gaW4gdmlzV2luc1xuICAgICAgICBcbiAgICAgICAgVktfTUVOVSAgICAgPSAweDEyICMgQUxUIGtleVxuICAgICAgICBLRVlET1dOICAgICA9IDFcbiAgICAgICAgS0VZVVAgICAgICAgPSAzXG4gICAgICAgIFxuICAgICAgICBpZiB3aW4ubWluaW1pemVkXG4gICAgICAgICAgICB1c2VyLlJlc3RvcmVXaW5kb3cgd2luLmh3bmRcbiAgICAgICAgXG4gICAgICAgIHVzZXIua2V5YmRfZXZlbnQgVktfTUVOVSwgMCwgS0VZRE9XTiwgbnVsbCAjIGZha2UgQUxUIHByZXNzIHRvIGVuYWJsZSBmb3JlZ3JvdW5kIHN3aXRjaFxuICAgICAgICB1c2VyLlNldEZvcmVncm91bmRXaW5kb3cgd2luLmh3bmQgICAgICAgICAgIyAuLi4gbm8gd29uZGVyIHdpbmRvd3MgaXMgc28gYmFkXG4gICAgICAgIHVzZXIua2V5YmRfZXZlbnQgVktfTUVOVSwgMCwgS0VZVVAsIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICB2aXNXaW5zXG5cbm1vZHVsZS5leHBvcnRzID0gZm9yZWdyb3VuZFxuIl19
//# sourceURL=C:/Users/kodi/s/wxw/coffee/foreground.coffee