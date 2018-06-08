(function() {
  /*
  00000000   00000000   0000000  000000000    
  000   000  000       000          000       
  0000000    0000000   000          000       
  000   000  000       000          000       
  000   000  00000000   0000000     000       
  */
  var convert, struct, user;

  user = require('./user');

  struct = require('./struct');

  convert = function(rect) {
    return {
      x: rect.left,
      y: rect.top,
      w: rect.right - rect.left,
      h: rect.bottom - rect.top
    };
  };

  module.exports = {
    workarea: function() {
      var SPI_GETWORKAREA, rect;
      rect = new struct.Rect;
      SPI_GETWORKAREA = 0x30;
      user.SystemParametersInfoW(SPI_GETWORKAREA, 0, rect.ref(), 0);
      return convert(rect);
    },
    window: function(hWnd) {
      var rect;
      rect = new struct.Rect;
      user.GetWindowRect(hWnd, rect.ref());
      return convert(rect);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjdC5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXMiOlsianMvcmVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBOzs7Ozs7O0FBQUEsTUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBOztFQVFBLElBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsT0FBQSxHQUFVLFFBQUEsQ0FBQyxJQUFELENBQUE7V0FFTjtNQUFBLENBQUEsRUFBRSxJQUFJLENBQUMsSUFBUDtNQUNBLENBQUEsRUFBRSxJQUFJLENBQUMsR0FEUDtNQUVBLENBQUEsRUFBRSxJQUFJLENBQUMsS0FBTCxHQUFXLElBQUksQ0FBQyxJQUZsQjtNQUdBLENBQUEsRUFBRSxJQUFJLENBQUMsTUFBTCxHQUFZLElBQUksQ0FBQztJQUhuQjtFQUZNOztFQU9WLE1BQU0sQ0FBQyxPQUFQLEdBRUk7SUFBQSxRQUFBLEVBQVUsUUFBQSxDQUFBLENBQUE7QUFFTixVQUFBLGVBQUEsRUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJLE1BQU0sQ0FBQztNQUNsQixlQUFBLEdBQWtCO01BQ2xCLElBQUksQ0FBQyxxQkFBTCxDQUEyQixlQUEzQixFQUE0QyxDQUE1QyxFQUErQyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQS9DLEVBQTJELENBQTNEO2FBQ0EsT0FBQSxDQUFRLElBQVI7SUFMTSxDQUFWO0lBT0EsTUFBQSxFQUFRLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFFSixVQUFBO01BQUEsSUFBQSxHQUFPLElBQUksTUFBTSxDQUFDO01BQ2xCLElBQUksQ0FBQyxhQUFMLENBQW1CLElBQW5CLEVBQXlCLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBekI7YUFDQSxPQUFBLENBQVEsSUFBUjtJQUpJO0VBUFI7QUFwQkoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAgIFxuIyMjXG5cbnVzZXIgICA9IHJlcXVpcmUgJy4vdXNlcidcbnN0cnVjdCA9IHJlcXVpcmUgJy4vc3RydWN0J1xuXG5jb252ZXJ0ID0gKHJlY3QpIC0+XG5cbiAgICB4OnJlY3QubGVmdFxuICAgIHk6cmVjdC50b3BcbiAgICB3OnJlY3QucmlnaHQtcmVjdC5sZWZ0XG4gICAgaDpyZWN0LmJvdHRvbS1yZWN0LnRvcFxuXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIFxuICAgIHdvcmthcmVhOiAtPlxuICAgICAgICBcbiAgICAgICAgcmVjdCA9IG5ldyBzdHJ1Y3QuUmVjdFxuICAgICAgICBTUElfR0VUV09SS0FSRUEgPSAweDMwXHJcbiAgICAgICAgdXNlci5TeXN0ZW1QYXJhbWV0ZXJzSW5mb1cgU1BJX0dFVFdPUktBUkVBLCAwLCByZWN0LnJlZigpLCAwXG4gICAgICAgIGNvbnZlcnQgcmVjdFxuICAgICAgICBcbiAgICB3aW5kb3c6IChoV25kKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJlY3QgPSBuZXcgc3RydWN0LlJlY3RcbiAgICAgICAgdXNlci5HZXRXaW5kb3dSZWN0IGhXbmQsIHJlY3QucmVmKClcbiAgICAgICAgY29udmVydCByZWN0Il19
//# sourceURL=C:/Users/kodi/s/wxw/coffee/rect.coffee