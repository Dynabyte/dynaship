
/*
 * GET users listing.
 */

exports.post = function(req, res) {

  var querystring = require('querystring');  
  var http = require('http');  
  
  var post_data = querystring.stringify({board: req.body.data });
  console.log(post_data);

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
      'Content-Type': 'application/x-www-form-urlencoded',  
      'Content-Length': post_data.length  
    }  
  };  

  console.log(post_data);
  
  try {
    var post_req = http.request(post_options, function(result) {  
      result.setEncoding('utf8');  
      result.on('data', function (chunk) {  
        res.send(chunk);
      });  
    });  

    post_req.setTimeout(500);
    post_req.on('timeout', function() {
      res.send('Timeout');
    });
    post_req.on('error', function() {
      res.send('Fail');
    });
    post_req.write(post_data);  
    post_req.end();
  } catch (e) {
    res.send('Fail');
  }
};