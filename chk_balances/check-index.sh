#!/bin/bash

# csv storage folder
FOLDER=/home/explorer/exp/chk_balances

curl -s 'https://chainz.cryptoid.info/explorer/richlist.dws?n=1000&coin=dev' > $FOLDER/chainz_balances.tsv

CSV=$FOLDER/chainz_balances.csv
awk -F "\t" '{print $1 " " $2}' $FOLDER/chainz_balances.tsv | tail -n +4 > $CSV

cat $CSV | while read line; do
  echo $line | while read address balance; do
    db_balance=`curl -s "https://explorer.devcore.io/ext/getbalance/$address"`
    if [ "$db_balance" != "$balance" ]; then
      if [ "$db_balance.0" != "$balance" ]; then
        diff=`echo "$db_balance - $balance" | bc`
        echo "$address differs $db_balance vs $balance (chainz) ($diff)"
      fi
    fi
  done
done

