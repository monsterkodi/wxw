
wc = require '../js/wc'

args = process.argv.slice 2

out = wc.exec.apply null, args

switch args[0]
    when 'launch' 'raise' 'focus' 'hook'
        process.stdout.write "\n"
    else
        process.stdout.write out
