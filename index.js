var express = require('express');
var path = require('path');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  // response.render('pages/index');
  response.sendStatus(200)
});

app.get('/test', function(request,response){
  response.sendFile(path.join(__dirname,'pages','/test.html'));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
