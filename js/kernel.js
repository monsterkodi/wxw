(function() {
  /*
  000   000  00000000  00000000   000   000  00000000  000      
  000  000   000       000   000  0000  000  000       000      
  0000000    0000000   0000000    000 0 000  0000000   000      
  000  000   000       000   000  000  0000  000       000      
  000   000  00000000  000   000  000   000  00000000  0000000  
  */
  var ffi, kernel;

  ffi = require('ffi');

  kernel = new ffi.Library('kernel32', {
    OpenProcess: ['pointer', ['uint32', 'int', 'uint32']],
    CloseHandle: ['int', ['pointer']],
    QueryFullProcessImageNameW: ['int', ['pointer', 'uint32', 'pointer', 'pointer']],
    GetCurrentThreadId: ['uint32', []],
    GetCurrentProcess: ['pointer', []]
  });

  module.exports = kernel;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2VybmVsLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlcyI6WyJqcy9rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsR0FBQSxFQUFBOztFQVFBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFFTixNQUFBLEdBQVMsSUFBSSxHQUFHLENBQUMsT0FBUixDQUFnQixVQUFoQixFQUVMO0lBQUEsV0FBQSxFQUE0QixDQUFDLFNBQUQsRUFBWSxDQUFDLFFBQUQsRUFBVyxLQUFYLEVBQWtCLFFBQWxCLENBQVosQ0FBNUI7SUFDQSxXQUFBLEVBQTRCLENBQUMsS0FBRCxFQUFZLENBQUMsU0FBRCxDQUFaLENBRDVCO0lBRUEsMEJBQUEsRUFBNEIsQ0FBQyxLQUFELEVBQVksQ0FBQyxTQUFELEVBQVksUUFBWixFQUFzQixTQUF0QixFQUFpQyxTQUFqQyxDQUFaLENBRjVCO0lBR0Esa0JBQUEsRUFBNEIsQ0FBQyxRQUFELEVBQVksRUFBWixDQUg1QjtJQUlBLGlCQUFBLEVBQTRCLENBQUMsU0FBRCxFQUFZLEVBQVo7RUFKNUIsQ0FGSzs7RUFRVCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWxCakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuIyMjXG5cbmZmaSA9IHJlcXVpcmUgJ2ZmaSdcblxua2VybmVsID0gbmV3IGZmaS5MaWJyYXJ5ICdrZXJuZWwzMicsXG4gICAgXG4gICAgT3BlblByb2Nlc3M6ICAgICAgICAgICAgICAgIFsncG9pbnRlcicsIFsndWludDMyJywgJ2ludCcsICd1aW50MzInXV1cbiAgICBDbG9zZUhhbmRsZTogICAgICAgICAgICAgICAgWydpbnQnLCAgICAgWydwb2ludGVyJ11dXG4gICAgUXVlcnlGdWxsUHJvY2Vzc0ltYWdlTmFtZVc6IFsnaW50JywgICAgIFsncG9pbnRlcicsICd1aW50MzInLCAncG9pbnRlcicsICdwb2ludGVyJ11dXG4gICAgR2V0Q3VycmVudFRocmVhZElkOiAgICAgICAgIFsndWludDMyJywgIFtdXVxuICAgIEdldEN1cnJlbnRQcm9jZXNzOiAgICAgICAgICBbJ3BvaW50ZXInLCBbXV1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXJuZWwiXX0=
//# sourceURL=C:/Users/kodi/s/wxw/coffee/kernel.coffee