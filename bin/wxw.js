// koffee 1.4.0
var args, out, wxw;

wxw = require('../js/wxw');

args = process.argv.slice(2);

out = wxw.exec.apply(null, args);

switch (args[0]) {
    case 'launch':
    case 'raise':
    case 'focus':
    case 'hook':
        process.stdout.write("\n");
        break;
    default:
        process.stdout.write(out);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFdBQVI7O0FBRU4sSUFBQSxHQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFtQixDQUFuQjs7QUFFUCxHQUFBLEdBQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFULENBQWUsSUFBZixFQUFxQixJQUFyQjs7QUFFTixRQUFPLElBQUssQ0FBQSxDQUFBLENBQVo7QUFBQSxTQUNTLFFBRFQ7QUFBQSxTQUNrQixPQURsQjtBQUFBLFNBQzBCLE9BRDFCO0FBQUEsU0FDa0MsTUFEbEM7UUFFUSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBckI7QUFEMEI7QUFEbEM7UUFJUSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsR0FBckI7QUFKUiIsInNvdXJjZXNDb250ZW50IjpbIlxud3h3ID0gcmVxdWlyZSAnLi4vanMvd3h3J1xuXG5hcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlIDJcblxub3V0ID0gd3h3LmV4ZWMuYXBwbHkgbnVsbCwgYXJnc1xuXG5zd2l0Y2ggYXJnc1swXVxuICAgIHdoZW4gJ2xhdW5jaCcgJ3JhaXNlJyAnZm9jdXMnICdob29rJ1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSBcIlxcblwiXG4gICAgZWxzZVxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSBvdXRcbiJdfQ==
//# sourceURL=wxw.coffee