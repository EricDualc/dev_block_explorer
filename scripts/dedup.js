var mongoose = require('mongoose')
  , settings = require('../lib/settings')
  , fs = require('fs')
  , lib = require('../lib/explorer')
  , db = require('../lib/database')
  , Tx = require('../models/tx')
  , Address = require('../models/address')
  , BigNumber = require('../node_modules/bignumber.js')
  , request = require('request');

// Remove useless txs in an Address record (Was limited to 1000)

function exit() {
  mongoose.disconnect();
  process.exit(0);
}

BigNumber.config({ ERRORS: false });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBalance(addr, cb) {
  var baseUrl = 'http://chainz.cryptoid.info/dev/api.dws?';
  var fullUrl = baseUrl + 'q=getbalance&a=' + addr;
  request.get(fullUrl).on('data', function(data) {
    cb(data);
  });
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

// usage: nodejs scripts/dedup.js LfzG19h37hMENsxk1wpLtSitw1BMW5u5cN 1000 dedup 500

mongoose.connect(dbString, function(err) {
  if (err) {
    console.log('Unable to connect to database: %s', dbString);
    console.log('Aborting');
    exit();
  }

  if (process.argv[2] == undefined) {
    addrPrm = "LRo1mYQ47gYsLPKr4KVMHANDDrCMrQQgbg";
  } else {
    addrPrm = process.argv[2];
  }

  if (process.argv[5] == undefined) {
    var onlineBalance;
    getBalance(addrPrm, function(balance) {
      onlineBalance = BigNumber(100000000) * BigNumber(balance);
      onlineBalance = BigNumber(onlineBalance).round();
      console.log("cryptoid balance: "+onlineBalance);
    });
  } else {
    onlineBalance = 100000000 * process.argv[5]
  }

  //Tx.deleteMany({txid: "1676c93f90db045a75724485d90849b7d3ef6a60cad0faf30ff49a778b9c6d5c"}).exec();

  //console.log("get_txs test");
  db.get_address(addrPrm, function(address) {
    if (address) {
      var txs = [];
      var dups = [];
      var hashes = address.txs.reverse();
      var proper = address.txs.reverse();
      var deleted = 0, useless = 0;
      lib.syncLoop(hashes.length, function (loop) {
        var i = loop.iteration() - deleted;
        db.get_tx(hashes[i].addresses, function(tx) {
          if (tx) {
            if (dups[tx.txid + hashes[i].type] == undefined) {
              dups[tx.txid + hashes[i].type] = tx.timestamp;
              txs.push(tx);
            } else {
              if (proper[i].addresses == hashes[i].addresses) {
                console.log(hashes[i].addresses);
                useless++;
                if (process.argv[4] == "dedup") {
                  proper.splice(i,1);
                  deleted++;
                }
              }
            }
          } else if (proper[i].addresses == hashes[i].addresses) {
            // not in db ?
            proper.splice(i,1);
            deleted++;
          }
          loop.next();
        });
      }, function() {

        if (deleted || 1) {

          //onlineBalance = 0;
          if (process.argv[3] != undefined) {
            address.sent = BigNumber(100000000 * process.argv[3]).round();
            address.received = address.balance + address.sent;
          }

          if (onlineBalance != undefined && address.balance != onlineBalance) {
            //address.sent = 84325517975070;
            address.balance = onlineBalance;
            address.received = address.balance + address.sent;
            //address.received = 3332080867768;
            //address.sent = address.received - address.balance;
          }

          Address.update({a_id: address.a_id},{
            txs: proper,
            received: address.received,
            sent: address.sent,
            balance: address.received - address.sent
          }, function(err) {
            if(err) console.log(err);
            //console.log(hashes);
          });

          console.log(address.received);
          console.log(address.sent);
          console.log(address.balance);
        }

        // TODO: order txs by timestamp
        var last_ts = 0;
        lib.syncLoop(proper.length, function(loop2) {
          var i = loop2.iteration();
          db.get_tx(proper[i].addresses, function(tx) {
            if (tx) {
              if (last_ts > tx.timestamp) {
                console.log("bad order " + tx.txid + " " + tx.blockindex);
               //  console.log(tx.timestamp - last_ts);
              }
              last_ts = tx.timestamp;
            } else {
              console.log("missing tx " + proper[i].addresses);
            }
          });
          loop2.next();
        }, function(){
          console.log("deleted "+deleted+" txs, "+proper.length+" txs, "+useless+" useless");
          exit()
        });
      });
    }
  });
/*
  console.log("querying...");
  db.get_last_block_missing(350000, function(h) {
    console.log(h);
  });

  Tx.find({blockindex: 350065}).limit(50).exec(function(err,tx){
    console.log(tx);
    exit();
  });
*/
});
