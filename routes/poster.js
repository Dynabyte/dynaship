
/*
 * GET users listing.
 */

exports.post = function(req, res) {

  var querystring = require('querystring');  
  var http = require('http');  

  var url = req.body.player.replace(/http[s]?:\/\//, '');
  var path = '/';
  var index = url.indexOf('/');
  var port = 80;
  if (0 <= index) {
    path = url.substr(index, url.length - 1);
    url = url.substr(0, index);
  }
  if (0 <= url.indexOf(':')) {
    port = url.split(':')[1]
    url = url.split(':')[0]
  }
    
  var post_options = {  
    host: url,  
    port: port,  
    path: path,  
    method: 'POST',  
    headers: {  
      'Content-Type': 'application/json',  
      'Content-Length': JSON.stringify(req.body.data).length  
    }  
  };  
  //console.log(req.body.data);
  //console.log(post_options);
  

  try {
    var post_req = http.request(post_options, function(result) {  
      result.setEncoding('utf8');  
      result.on('data', function (chunk) {  
        res.send(chunk);
      });  
    });  

    post_req.setTimeout(1500);
    post_req.on('timeout', function() {
      res.send('Timeout');
    });
    post_req.on('error', function() {
      res.send('Fail');
    });
    post_req.write(JSON.stringify(req.body.data));  
    post_req.end();
  } catch (e) {
    res.send('Fail');
  }
};
