var express = require('express')
  , path = require('path')
  , chaincoinapi = require('chaincoin-node-api')
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , settings = require('./lib/settings')
  , routes = require('./routes/index')
  , lib = require('./lib/explorer')
  , addrindex = require('./lib/addressindex')
  , db = require('./lib/database')
  , locale = require('./lib/locale')
  , request = require('request')
  , fs = require('fs')
  , forceSsl = require('express-force-ssl');
//  , RpcClient = require('node-json-rpc2').Client;


//var privateKey = fs.readFileSync('/etc/letsencrypt/live/www.pure.prenges.rocks/privkey.pem').toString();
//var certificate = fs.readFileSync('/etc/letsencrypt/live/www.pure.prenges.rocks/cert.pem').toString();

var app = express();



// chaincoinapi
//var client = new RpcClient(settings.wallet);
chaincoinapi.setWalletDetails(settings.wallet);
if (settings.heavy != true) {
  chaincoinapi.setAccess('only', ['getinfo', 'getnetworkhashps', 'getmininginfo','getdifficulty', 'getconnectioncount',
  'getmasternodecount', 'getmasternodecountonline', 'getmasternodelist', 'getvotelist', 'getmasternode', 'getblockcount',
  'getblockhash', 'getblock', 'getrawtransaction', 'getpeerinfo', 'gettxoutsetinfo', /*'getstakinginfo',*/
  'masternodelist', 'getmasternodeaddr', 'getmasternodes', 'getmasternodestatus']);
} else {
  // enable additional heavy api calls
  /*
    getvote - Returns the current block reward vote setting.
    getmaxvote - Returns the maximum allowed vote for the current phase of voting.
    getphase - Returns the current voting phase ('Mint', 'Limit' or 'Sustain').
    getreward - Returns the current block reward, which has been decided democratically in the previous round of block reward voting.
    getnextrewardestimate - Returns an estimate for the next block reward based on the current state of decentralized voting.
    getnextrewardwhenstr - Returns string describing how long until the votes are tallied and the next block reward is computed.
    getnextrewardwhensec - Same as above, but returns integer seconds.
    getsupply - Returns the current money supply.
    getmaxmoney - Returns the maximum possible money supply.
  */
  chaincoinapi.setAccess('only', ['getinfo', 'getstakinginfo', 'getnetworkhashps', 'getdifficulty', 'getconnectioncount',
    'getmasternodecount', 'getmasternodecountonline', 'getblockcount', 'getblockhash', 'getblock', 'getrawtransaction', 
    'getmaxmoney', 'getvote', 'getmaxvote', 'getphase', 'getreward', 'getnextrewardestimate', 'getnextrewardwhenstr',
    'getnextrewardwhensec', 'getsupply', 'gettxoutsetinfo', 'getstakinginfo', 'masternodelist', 'getmasternodeaddr', 'getmasternodestatus']);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(forceSsl);
app.use(favicon(path.join(__dirname, settings.favicon)));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Maintenance
/*
app.all('*', function (req, res) {
    res.status(200).sendFile(path.join(__dirname, './views/maintenance.html'))
});
*/
// routes
app.use('/api', chaincoinapi.app);
app.use('/', routes);
app.use('/ext/getmoneysupply', function(req,res){
  lib.get_supply(function(supply){
    res.send(' '+supply);
  });
});


app.use('/ext/getaddress/:hash', function(req,res){
  db.get_address(req.body.hash, function(address){
    if (address) {
      var a_ext = {
        address: address.a_id,
        sent: (address.sent / 100000000),
        received: (address.received / 100000000),
        balance: (address.balance / 100000000).toString().replace(/(^-+)/mg, ''),
        last_txs: address.txs,
      };
      res.send(a_ext);
    } else {
      res.send({ error: 'address not found.', hash: req.params.hash});
    }
  });
});

app.use('/ext/getaddressbalance/:hash', function(req,res){
  if (settings.addressindex) {
    addrindex.get_addressbalance(req.params.hash, function(balances){
      if (balances) {
        res.send(balances);
      } else {
        res.send({ error: 'address not found.', hash: req.params.hash});
      }
    });
  } else {
    res.send({ error: 'feature disabled.', hash: req.params.hash});
  }
});

app.use('/ext/getbalance/:hash', function(req,res){
  if (0)
    res.send({ error: 'feature disabled.' });
  else
  db.get_address(req.params.hash, function(address){
    if (address) {
      res.send((address.balance / 100000000).toString().replace(/(^-+)/mg, ''));
    } else {
      res.send({ error: 'address not found.', hash: req.params.hash})
    }
  });
});

app.use('/ext/getdistribution', function(req,res){
  db.get_richlist(settings.coin, function(richlist){
    db.get_stats(settings.coin, function(stats){
      db.get_distribution(richlist, stats, function(dist){
        res.send(dist);
      });
    });
  });
});

app.use('/ext/getlasttxs/:min', function(req,res){
  db.get_last_txs(settings.index.last_txs, (req.params.min * 100000000), function(txs){
    res.send({data: txs});
  });
});

app.use('/ext/getlastblocks', function(req,res){
  db.get_last_blocks((req.query.limit * 1.0), function(blocks){
    res.send({data: blocks});
  });
});

app.use('/ext/connections', function(req,res){
  db.get_peers(function(peers){
    res.send({data: peers});
  });
});

// locals
app.set('title', settings.title);
app.set('symbol', settings.symbol);
app.set('coin', settings.coin);
app.set('locale', locale);
app.set('display', settings.display);
app.set('markets', settings.markets);
app.set('twitter', settings.twitter);
app.set('facebook', settings.facebook);
app.set('googleplus', settings.googleplus);
app.set('bitcointalk', settings.bitcointalk);
app.set('slack', settings.slack);
app.set('github', settings.github);
app.set('website', settings.website);
app.set('genesis_block', settings.genesis_block);
app.set('index', settings.index);
app.set('heavy', settings.heavy);
app.set('txcount', settings.txcount);
app.set('nethash', settings.nethash);
app.set('nethash_units', settings.nethash_units);
app.set('show_sent_received', settings.show_sent_received);
app.set('show_staked_balance', settings.show_staked_balance);
app.set('logo', settings.logo);
app.set('theme', settings.theme);
app.set('labels', settings.labels);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;