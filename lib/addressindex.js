/**
 * -addressindex addon - tpruvot 2018
 */
var mongoose = require('mongoose')
  async = require('async'),
  request = require('request'),
  settings = require('./settings'),
  lib = require('./explorer'),
  BigNumber = require('bignumber.js');

module.exports.get_addressbalance = function(address, cb) {

  var time = Date.now();

  request({
    method: 'POST',
    uri: 'http://'+settings.wallet.user+':'+settings.wallet.pass+'@'+settings.wallet.host+':'+settings.wallet.port+'/',
    json: true,
    body: { "jsonrpc": "1.0", "id": (0+time), "method": "getaddressbalance", "params": [ address ] }
  }, function (err, response, body) {
    return cb(body.result);
  });

};

