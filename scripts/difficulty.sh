#! /bin/bash

TOTBLOCKS=`/home/explorer/dev-cli getblockcount`
CBLOCKH=`/home/explorer/dev-cli getblockhash $TOTBLOCKS`
CBLOCKD=`/home/explorer/dev-cli getblock $CBLOCKH | grep diff | awk '{print $2}' | tr -d ','`

echo -n "var diffData = ["
for x in $(seq 100 100 $TOTBLOCKS); do 
  BLOCKH=`/home/explorer/dev-cli getblockhash $x`
  BLOCKD=`/home/explorer/dev-cli getblock $BLOCKH | grep diff | awk '{print $2}' | tr -d ','`
  echo -n "[$x,$BLOCKD],"
done

echo "[$TOTBLOCKS,$CBLOCKD]]"
