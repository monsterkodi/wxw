// koffee 1.3.0

/*
000   000   0000000
000 0 000  000     
000000000  000     
000   000  000     
00     00   0000000
 */
var childp, ref, slash, wc;

ref = require('kxk'), childp = ref.childp, slash = ref.slash;

wc = function(cmd, id) {
    if (cmd == null) {
        cmd = 'help';
    }
    if (id == null) {
        id = '';
    }
    return childp.execSync(slash.join(__dirname, '..', 'bin', 'wc.exe') + (" " + cmd + " " + id), 'utf8');
};

module.exports = wc;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQW9CLE9BQUEsQ0FBUSxLQUFSLENBQXBCLEVBQUUsbUJBQUYsRUFBVTs7QUFFVixFQUFBLEdBQUssU0FBQyxHQUFELEVBQWEsRUFBYjs7UUFBQyxNQUFJOzs7UUFBUSxLQUFHOztXQUVqQixNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsUUFBakMsQ0FBQSxHQUEyQyxDQUFBLEdBQUEsR0FBSSxHQUFKLEdBQVEsR0FBUixHQUFXLEVBQVgsQ0FBM0QsRUFBNEUsTUFBNUU7QUFGQzs7QUFJTCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMFxuMDAwIDAgMDAwICAwMDAgICAgIFxuMDAwMDAwMDAwICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgIFxuMDAgICAgIDAwICAgMDAwMDAwMFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCB9ID0gcmVxdWlyZSAna3hrJ1xuXG53YyA9IChjbWQ9J2hlbHAnLCBpZD0nJykgLT5cbiAgICBcbiAgICBjaGlsZHAuZXhlY1N5bmMgc2xhc2guam9pbihfX2Rpcm5hbWUsICcuLicgJ2JpbicgJ3djLmV4ZScpK1wiICN7Y21kfSAje2lkfVwiLCAndXRmOCdcblxubW9kdWxlLmV4cG9ydHMgPSB3Y1xuIl19
//# sourceURL=../coffee/wc.coffee