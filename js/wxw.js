// koffee 1.3.0

/*
000   000  000   000  000   000  
000 0 000   000 000   000 0 000  
000000000    00000    000000000  
000   000   000 000   000   000  
00     00  000   000  00     00
 */
var ref, wc;

if ((((ref = module.parent) != null ? ref.filename : void 0) == null) || module.parent.filename.endsWith('default_app.asar\\main.js')) {
    require('./app');
} else {
    wc = require('./wc');
    module.exports = {
        user: require('./user'),
        advapi: require('./advapi'),
        kernel: require('./kernel'),
        shell: require('./shell'),
        rect: require('./rect'),
        struct: require('./struct'),
        zorder: require('./zorder'),
        winlist: require('./winlist'),
        wininfo: require('./wininfo'),
        foreground: require('./foreground'),
        active: require('./user').GetForegroundWindow,
        frontinfo: function() {
            return require('./wininfo')(require('./user').GetForegroundWindow());
        },
        mouse: function() {
            return wc('mouse');
        },
        info: function(id) {
            return wc('info', id);
        },
        raise: function(id) {
            return wc('raise', id);
        },
        focus: function(id) {
            return wc('focus', id);
        },
        trash: function(id) {
            return wc('trash', id);
        },
        folder: function(id) {
            return wc('folder', id);
        },
        screen: function(id) {
            return wc('screen', id);
        },
        screenshot: function(fp) {
            return wc('screenshot', fp);
        },
        bounds: function(id, x, y, w, h) {
            return wc('bounds', id, x, y, w, h);
        }
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxJQUFPLGlFQUFKLElBQWdDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQXZCLENBQWdDLDJCQUFoQyxDQUFuQztJQUVJLE9BQUEsQ0FBUSxPQUFSLEVBRko7Q0FBQSxNQUFBO0lBTUksRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSO0lBRUwsTUFBTSxDQUFDLE9BQVAsR0FFSTtRQUFBLElBQUEsRUFBWSxPQUFBLENBQVEsUUFBUixDQUFaO1FBQ0EsTUFBQSxFQUFZLE9BQUEsQ0FBUSxVQUFSLENBRFo7UUFFQSxNQUFBLEVBQVksT0FBQSxDQUFRLFVBQVIsQ0FGWjtRQUdBLEtBQUEsRUFBWSxPQUFBLENBQVEsU0FBUixDQUhaO1FBSUEsSUFBQSxFQUFZLE9BQUEsQ0FBUSxRQUFSLENBSlo7UUFLQSxNQUFBLEVBQVksT0FBQSxDQUFRLFVBQVIsQ0FMWjtRQU1BLE1BQUEsRUFBWSxPQUFBLENBQVEsVUFBUixDQU5aO1FBT0EsT0FBQSxFQUFZLE9BQUEsQ0FBUSxXQUFSLENBUFo7UUFRQSxPQUFBLEVBQVksT0FBQSxDQUFRLFdBQVIsQ0FSWjtRQVNBLFVBQUEsRUFBWSxPQUFBLENBQVEsY0FBUixDQVRaO1FBVUEsTUFBQSxFQUFZLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsbUJBVjlCO1FBV0EsU0FBQSxFQUFZLFNBQUE7bUJBQUcsT0FBQSxDQUFRLFdBQVIsQ0FBQSxDQUFxQixPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLG1CQUFsQixDQUFBLENBQXJCO1FBQUgsQ0FYWjtRQWFBLEtBQUEsRUFBaUIsU0FBQTttQkFBRyxFQUFBLENBQUcsT0FBSDtRQUFILENBYmpCO1FBY0EsSUFBQSxFQUFZLFNBQUMsRUFBRDttQkFBUSxFQUFBLENBQUcsTUFBSCxFQUFZLEVBQVo7UUFBUixDQWRaO1FBZUEsS0FBQSxFQUFZLFNBQUMsRUFBRDttQkFBUSxFQUFBLENBQUcsT0FBSCxFQUFZLEVBQVo7UUFBUixDQWZaO1FBZ0JBLEtBQUEsRUFBWSxTQUFDLEVBQUQ7bUJBQVEsRUFBQSxDQUFHLE9BQUgsRUFBWSxFQUFaO1FBQVIsQ0FoQlo7UUFpQkEsS0FBQSxFQUFZLFNBQUMsRUFBRDttQkFBUSxFQUFBLENBQUcsT0FBSCxFQUFZLEVBQVo7UUFBUixDQWpCWjtRQWtCQSxNQUFBLEVBQVksU0FBQyxFQUFEO21CQUFRLEVBQUEsQ0FBRyxRQUFILEVBQVksRUFBWjtRQUFSLENBbEJaO1FBbUJBLE1BQUEsRUFBWSxTQUFDLEVBQUQ7bUJBQVEsRUFBQSxDQUFHLFFBQUgsRUFBWSxFQUFaO1FBQVIsQ0FuQlo7UUFvQkEsVUFBQSxFQUFZLFNBQUMsRUFBRDttQkFBUSxFQUFBLENBQUcsWUFBSCxFQUFnQixFQUFoQjtRQUFSLENBcEJaO1FBcUJBLE1BQUEsRUFBWSxTQUFDLEVBQUQsRUFBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxDQUFkO21CQUFvQixFQUFBLENBQUcsUUFBSCxFQUFZLEVBQVosRUFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsQ0FBekI7UUFBcEIsQ0FyQlo7TUFWUiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgMCAwMDAgICAwMDAgMDAwICAgMDAwIDAgMDAwICBcbjAwMDAwMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4wMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICBcbiMjI1xuXG5pZiBub3QgbW9kdWxlLnBhcmVudD8uZmlsZW5hbWU/IG9yIG1vZHVsZS5wYXJlbnQuZmlsZW5hbWUuZW5kc1dpdGggJ2RlZmF1bHRfYXBwLmFzYXJcXFxcbWFpbi5qcydcbiAgICBcbiAgICByZXF1aXJlICcuL2FwcCdcblxuZWxzZVxuICAgIFxuICAgIHdjID0gcmVxdWlyZSAnLi93YydcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9XG4gICAgICAgIFxuICAgICAgICB1c2VyOiAgICAgICByZXF1aXJlICcuL3VzZXInXG4gICAgICAgIGFkdmFwaTogICAgIHJlcXVpcmUgJy4vYWR2YXBpJ1xuICAgICAgICBrZXJuZWw6ICAgICByZXF1aXJlICcuL2tlcm5lbCdcbiAgICAgICAgc2hlbGw6ICAgICAgcmVxdWlyZSAnLi9zaGVsbCdcbiAgICAgICAgcmVjdDogICAgICAgcmVxdWlyZSAnLi9yZWN0J1xuICAgICAgICBzdHJ1Y3Q6ICAgICByZXF1aXJlICcuL3N0cnVjdCdcbiAgICAgICAgem9yZGVyOiAgICAgcmVxdWlyZSAnLi96b3JkZXInXG4gICAgICAgIHdpbmxpc3Q6ICAgIHJlcXVpcmUgJy4vd2lubGlzdCdcbiAgICAgICAgd2luaW5mbzogICAgcmVxdWlyZSAnLi93aW5pbmZvJ1xuICAgICAgICBmb3JlZ3JvdW5kOiByZXF1aXJlICcuL2ZvcmVncm91bmQnXG4gICAgICAgIGFjdGl2ZTogICAgIHJlcXVpcmUoJy4vdXNlcicpLkdldEZvcmVncm91bmRXaW5kb3dcbiAgICAgICAgZnJvbnRpbmZvOiAgLT4gcmVxdWlyZSgnLi93aW5pbmZvJykocmVxdWlyZSgnLi91c2VyJykuR2V0Rm9yZWdyb3VuZFdpbmRvdygpKVxuICAgICAgICBcbiAgICAgICAgbW91c2U6ICAgICAgICAgICAtPiB3YyAnbW91c2UnXG4gICAgICAgIGluZm86ICAgICAgIChpZCkgLT4gd2MgJ2luZm8nICAgaWRcbiAgICAgICAgcmFpc2U6ICAgICAgKGlkKSAtPiB3YyAncmFpc2UnICBpZFxuICAgICAgICBmb2N1czogICAgICAoaWQpIC0+IHdjICdmb2N1cycgIGlkXG4gICAgICAgIHRyYXNoOiAgICAgIChpZCkgLT4gd2MgJ3RyYXNoJyAgaWRcbiAgICAgICAgZm9sZGVyOiAgICAgKGlkKSAtPiB3YyAnZm9sZGVyJyBpZFxuICAgICAgICBzY3JlZW46ICAgICAoaWQpIC0+IHdjICdzY3JlZW4nIGlkXG4gICAgICAgIHNjcmVlbnNob3Q6IChmcCkgLT4gd2MgJ3NjcmVlbnNob3QnIGZwXG4gICAgICAgIGJvdW5kczogICAgIChpZCwgeCwgeSwgdywgaCkgLT4gd2MgJ2JvdW5kcycgaWQsIHgsIHksIHcsIGgiXX0=
//# sourceURL=../coffee/wxw.coffee