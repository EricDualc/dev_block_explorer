#! /bin/bash

BLOCKID=`/home/explorer/dev-cli getblockcount`
NETSPEED=`/home/explorer/dev-cli getnetworkhashps 100 $BLOCKID`

echo -n "var hashData = ["
for x in $(seq 100 100 $BLOCKID); do 
  SPEED=`/home/explorer/dev-cli getnetworkhashps 100 $x`
  echo -n "[$x,$SPEED],"
done
echo "[$BLOCKID,$NETSPEED]]"
