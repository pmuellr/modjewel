#!/bin/sh

cd `dirname $0`

rm -rf tmp
mkdir  tmp
cp -R tests/ tmp

./test-commonjs-dir.sh tmp/commonjs/modules/1.0/absolute
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/cyclic
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/determinism
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/exactExports
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/hasOwnProperty
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/method
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/missing
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/monkeys
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/nested
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/relative
./test-commonjs-dir.sh tmp/commonjs/modules/1.0/transitive

./test-commonjs-dir.sh tmp/set-exports/basic
./test-commonjs-dir.sh tmp/set-exports/calledAfter

./test-commonjs-dir-unit-testing.sh tmp/commonjs/unit-testing/1.0

