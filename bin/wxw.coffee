
wxw = require '../js/wxw'

args = process.argv.slice 2

out = wxw.exec.apply null, args

switch args[0]
    when 'launch' 'raise' 'focus' 'hook'
        process.stdout.write "\n"
    else
        process.stdout.write out
