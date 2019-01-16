#! /bin/bash

TOTBLOCKS=`/home/explorer/dev-cli getblockcount`
CBLOCKH=`/home/explorer/dev-cli getblockhash $TOTBLOCKS`
CBLOCKD=`/home/explorer/dev-cli getblock $CBLOCKH | grep time | awk '{print $2}' | tr -d ','`

GENESIS="1507656633"

echo -n "var timeData = ["
for x in $(seq 500 500 $TOTBLOCKS); do 
  BLOCKH=`/home/explorer/dev-cli getblockhash $x`
  BLOCKD=`/home/explorer/dev-cli getblock $BLOCKH | grep time | awk '{print $2}' | tr -d ','`

  BLOCKDIFF=$(( $BLOCKD - $GENESIS ))
  GENESIS=$BLOCKD
  
  echo -n "[$x,$BLOCKDIFF],"
done

BLOCKDIFF=$(( $CBLOCKD - $GENESIS ))
echo "[$TOTBLOCKS,0]]"
