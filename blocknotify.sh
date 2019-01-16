#!/bin/sh

#echo "new block hash $1"

cd /home/explorer/exp && /usr/bin/nodejs --stack-size=8000 scripts/sync.js index update > /home/explorer/update.log 2>&1

exit 0
