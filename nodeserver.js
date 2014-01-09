
var express = require('express');
var app = express()
, http = require('http')
, server = http.createServer(app)

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.use(express.static(__dirname + '/server/assets'));
app.use(express.static(__dirname));

app.listen(3000);
console.log('Listening on port 3000');