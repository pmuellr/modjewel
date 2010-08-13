#!/bin/sh

echo
echo -----------------------------------------------------------
echo testing $1
echo -----------------------------------------------------------

cp ../lib/*.js $1

python ../module2transportd.py $1 > /dev/null
                                   
cat ../modjewel-require.js                       > $1/launcher.js
find $1 | grep transportd\.js$ | xargs -L 1 cat >> $1/launcher.js
echo "require(\"program\")"                     >> $1/launcher.js

cp launcher.html $1

# test with Rhino
rhino $1/launcher.js

# test with browser
open $1/launcher.html