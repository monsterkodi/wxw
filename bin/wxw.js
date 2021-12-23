// monsterkodi/kode 0.200.0

var _k_

var args, out, wxw

wxw = require('../js/wxw')
args = process.argv.slice(2)
out = wxw.exec.apply(null,args)
switch (args[0])
{
    case 'launch':
    case 'raise':
    case 'focus':
    case 'hook':
        process.stdout.write("\n")
        break
    default:
        process.stdout.write(out)
}
