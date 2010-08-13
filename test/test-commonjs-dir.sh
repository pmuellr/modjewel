#!/bin/sh

echo
echo -----------------------------------------------------------
echo testing $1
echo -----------------------------------------------------------
python ../module2transportd.py $1 > /dev/null
                                   
cat ../modjewel-require.js                       > $1/launcher.js
find $1 | grep transportd\.js$ | xargs -L 1 cat >> $1/launcher.js
echo "require(\"program\")"                     >> $1/launcher.js

cp launcher.html $1

rhino $1/launcher.js
open  $1/launcher.html