// koffee 1.4.0

/*
000   000  0000000    00000000   
000   000  000   000  000   000  
000   000  000   000  00000000   
000   000  000   000  000        
 0000000   0000000    000
 */
var dgram, udp,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

dgram = require('dgram');

udp = (function() {
    function udp(arg) {
        var err, ref, ref1;
        this.pnum = (ref = arg.pnum) != null ? ref : 54321, this.onMsg = (ref1 = arg.onMsg) != null ? ref1 : null;
        this.close = bind(this.close, this);
        this.sendCB = bind(this.sendCB, this);
        this.send = bind(this.send, this);
        try {
            this.port = dgram.createSocket('udp4');
            if (this.onMsg) {
                this.port.on('listening', (function(_this) {
                    return function() {
                        var err;
                        try {
                            return _this.port.setBroadcast(true);
                        } catch (error) {
                            err = error;
                            return console.error("[ERROR] can't listen:", err);
                        }
                    };
                })(this));
                this.port.on('message', (function(_this) {
                    return function(message, rinfo) {
                        var err, messageString, msg;
                        messageString = message.toString();
                        try {
                            msg = JSON.parse(messageString);
                        } catch (error) {
                            err = error;
                            console.error('conversion error', messageString, err);
                            return;
                        }
                        return _this.onMsg(msg);
                    };
                })(this));
                this.port.on('error', (function(_this) {
                    return function(err) {
                        return console.error('[ERROR] port error', err);
                    };
                })(this));
                this.port.bind(this.addr);
            } else {
                this.port.bind((function(_this) {
                    return function() {
                        var ref2;
                        return (ref2 = _this.port) != null ? ref2.setBroadcast(true) : void 0;
                    };
                })(this));
            }
        } catch (error) {
            err = error;
            this.port = null;
            console.error("[ERROR] can't create udp port:", err);
        }
    }

    udp.prototype.send = function() {
        var args, buf, msg;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (!this.port) {
            return;
        }
        if (args.length > 1) {
            msg = JSON.stringify(args);
        } else {
            msg = JSON.stringify(args[0]);
        }
        buf = Buffer.from(msg, 'utf8');
        return this.port.send(buf, 0, buf.length, this.pnum, '127.0.0.1', function() {});
    };

    udp.prototype.sendCB = function() {
        var args, buf, cb, msg;
        cb = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if (!this.port) {
            return;
        }
        msg = JSON.stringify(args.length > 1 && args || args[0]);
        buf = Buffer.from(msg, 'utf8');
        return this.port.send(buf, 0, buf.length, this.pnum, '127.0.0.1', function() {
            return cb(buf);
        });
    };

    udp.prototype.close = function() {
        var ref;
        if ((ref = this.port) != null) {
            ref.close();
        }
        return this.port = null;
    };

    return udp;

})();

module.exports = udp;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWRwLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxVQUFBO0lBQUE7OztBQVFBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7QUFFRjtJQUVDLGFBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQyxJQUFDLENBQUEsd0NBQUssT0FBTyxJQUFDLENBQUEsNENBQU07Ozs7QUFFckI7WUFDSSxJQUFDLENBQUEsSUFBRCxHQUFRLEtBQUssQ0FBQyxZQUFOLENBQW1CLE1BQW5CO1lBRVIsSUFBRyxJQUFDLENBQUEsS0FBSjtnQkFFSSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBOzJCQUFBLFNBQUE7QUFDbEIsNEJBQUE7QUFBQTttQ0FDSSxLQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBbkIsRUFESjt5QkFBQSxhQUFBOzRCQUVNO21DQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sdUJBQVAsRUFBZ0MsR0FBaEMsRUFISDs7b0JBRGtCO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7Z0JBTUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLE9BQUQsRUFBVSxLQUFWO0FBRWhCLDRCQUFBO3dCQUFBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLFFBQVIsQ0FBQTtBQUNoQjs0QkFDSSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYLEVBRFY7eUJBQUEsYUFBQTs0QkFFTTs0QkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLGtCQUFQLEVBQTJCLGFBQTNCLEVBQTBDLEdBQTFDO0FBQ0MsbUNBSko7OytCQUtBLEtBQUMsQ0FBQSxLQUFELENBQU8sR0FBUDtvQkFSZ0I7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtnQkFVQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxPQUFULEVBQWtCLENBQUEsU0FBQSxLQUFBOzJCQUFBLFNBQUMsR0FBRDsrQkFDZixPQUFBLENBQUMsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLEdBQTdCO29CQURlO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEI7Z0JBR0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLElBQVosRUFyQko7YUFBQSxNQUFBO2dCQXdCSSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFBO0FBQUcsNEJBQUE7aUVBQUssQ0FBRSxZQUFQLENBQW9CLElBQXBCO29CQUFIO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQXhCSjthQUhKO1NBQUEsYUFBQTtZQTZCTTtZQUNGLElBQUMsQ0FBQSxJQUFELEdBQVE7WUFBSSxPQUFBLENBQ1osS0FEWSxDQUNOLGdDQURNLEVBQzRCLEdBRDVCLEVBOUJoQjs7SUFGRDs7a0JBbUNILElBQUEsR0FBTSxTQUFBO0FBRUYsWUFBQTtRQUZHO1FBRUgsSUFBVSxDQUFJLElBQUMsQ0FBQSxJQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1lBQ0ksR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQURWO1NBQUEsTUFBQTtZQUdJLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUssQ0FBQSxDQUFBLENBQXBCLEVBSFY7O1FBS0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUFpQixNQUFqQjtlQUVOLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsQ0FBaEIsRUFBbUIsR0FBRyxDQUFDLE1BQXZCLEVBQStCLElBQUMsQ0FBQSxJQUFoQyxFQUFzQyxXQUF0QyxFQUFtRCxTQUFBLEdBQUEsQ0FBbkQ7SUFYRTs7a0JBYU4sTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBRkssbUJBQUk7UUFFVCxJQUFVLENBQUksSUFBQyxDQUFBLElBQWY7QUFBQSxtQkFBQTs7UUFFQSxHQUFBLEdBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWQsSUFBb0IsSUFBcEIsSUFBNEIsSUFBSyxDQUFBLENBQUEsQ0FBaEQ7UUFDTixHQUFBLEdBQU0sTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLE1BQWpCO2VBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUFnQixDQUFoQixFQUFtQixHQUFHLENBQUMsTUFBdkIsRUFBK0IsSUFBQyxDQUFBLElBQWhDLEVBQXNDLFdBQXRDLEVBQW1ELFNBQUE7bUJBQUcsRUFBQSxDQUFHLEdBQUg7UUFBSCxDQUFuRDtJQU5JOztrQkFRUixLQUFBLEdBQU8sU0FBQTtBQUVILFlBQUE7O2VBQUssQ0FBRSxLQUFQLENBQUE7O2VBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUhMOzs7Ozs7QUFLWCxNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgICAgICBcbiMjI1xuXG5kZ3JhbSA9IHJlcXVpcmUgJ2RncmFtJ1xuXG5jbGFzcyB1ZHBcblxuICAgIEA6ICh7QHBudW06NTQzMjEsIEBvbk1zZzpudWxsfSkgLT5cbiAgICAgICAgICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIEBwb3J0ID0gZGdyYW0uY3JlYXRlU29ja2V0ICd1ZHA0J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAb25Nc2dcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5vbiAnbGlzdGVuaW5nJywgPT4gXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgQHBvcnQuc2V0QnJvYWRjYXN0IHRydWVcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBcIltFUlJPUl0gY2FuJ3QgbGlzdGVuOlwiLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwb3J0Lm9uICdtZXNzYWdlJywgKG1lc3NhZ2UsIHJpbmZvKSA9PlxuXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VTdHJpbmcgPSBtZXNzYWdlLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBKU09OLnBhcnNlIG1lc3NhZ2VTdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnY29udmVyc2lvbiBlcnJvcicsIG1lc3NhZ2VTdHJpbmcsIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIEBvbk1zZyBtc2dcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHBvcnQub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ1tFUlJPUl0gcG9ydCBlcnJvcicsIGVyclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcG9ydC5iaW5kIEBhZGRyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHBvcnQuYmluZCA9PiBAcG9ydD8uc2V0QnJvYWRjYXN0IHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBAcG9ydCA9IG51bGxcbiAgICAgICAgICAgIGVycm9yIFwiW0VSUk9SXSBjYW4ndCBjcmVhdGUgdWRwIHBvcnQ6XCIsIGVyclxuICAgICAgICAgICAgICAgIFxuICAgIHNlbmQ6IChhcmdzLi4uKSA9PlxuXG4gICAgICAgIHJldHVybiBpZiBub3QgQHBvcnRcbiAgICAgICAgXG4gICAgICAgIGlmIGFyZ3MubGVuZ3RoID4gMVxuICAgICAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJnc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtc2cgPSBKU09OLnN0cmluZ2lmeSBhcmdzWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgYnVmID0gQnVmZmVyLmZyb20gbXNnLCAndXRmOCdcblxuICAgICAgICBAcG9ydC5zZW5kIGJ1ZiwgMCwgYnVmLmxlbmd0aCwgQHBudW0sICcxMjcuMC4wLjEnLCAtPlxuXG4gICAgc2VuZENCOiAoY2IsIGFyZ3MuLi4pID0+XG5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAcG9ydFxuICAgICAgICBcbiAgICAgICAgbXNnID0gSlNPTi5zdHJpbmdpZnkgYXJncy5sZW5ndGggPiAxIGFuZCBhcmdzIG9yIGFyZ3NbMF1cbiAgICAgICAgYnVmID0gQnVmZmVyLmZyb20gbXNnLCAndXRmOCdcbiAgICAgICAgQHBvcnQuc2VuZCBidWYsIDAsIGJ1Zi5sZW5ndGgsIEBwbnVtLCAnMTI3LjAuMC4xJywgLT4gY2IgYnVmXG4gICAgICAgIFxuICAgIGNsb3NlOiA9PlxuICAgICAgICBcbiAgICAgICAgQHBvcnQ/LmNsb3NlKClcbiAgICAgICAgQHBvcnQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gdWRwXG4gICAgIl19
//# sourceURL=../coffee/udp.coffee