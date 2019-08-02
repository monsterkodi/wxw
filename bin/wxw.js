// koffee 1.3.0
var args, out, wc;

wc = require('../js/wc');

args = process.argv.slice(2);

out = wc.exec.apply(null, args);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3h3LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFVBQVI7O0FBRUwsSUFBQSxHQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFtQixDQUFuQjs7QUFFUCxHQUFBLEdBQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFvQixJQUFwQjs7QUFFTixRQUFPLElBQUssQ0FBQSxDQUFBLENBQVo7QUFBQSxTQUNTLFFBRFQ7QUFBQSxTQUNrQixPQURsQjtBQUFBLFNBQzBCLE9BRDFCO0FBQUEsU0FDa0MsTUFEbEM7UUFFUSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBckI7QUFEMEI7QUFEbEM7UUFJUSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsR0FBckI7QUFKUiIsInNvdXJjZXNDb250ZW50IjpbIlxud2MgPSByZXF1aXJlICcuLi9qcy93YydcblxuYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSAyXG5cbm91dCA9IHdjLmV4ZWMuYXBwbHkgbnVsbCwgYXJnc1xuXG5zd2l0Y2ggYXJnc1swXVxuICAgIHdoZW4gJ2xhdW5jaCcgJ3JhaXNlJyAnZm9jdXMnICdob29rJ1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSBcIlxcblwiXG4gICAgZWxzZVxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSBvdXRcbiJdfQ==
//# sourceURL=wxw.coffee