
/*
 * GET home page.
 */
var fs = require('fs');
exports.index = function (request, response) {
  var filePath = 'public' + request.url;
  if (request.url == '/') filePath = filePath += 'index.html'
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          response.writeHead(500);
          response.end();
				} else {
					var contentType = 'text/plain';
					if (filePath.length >= 6 && filePath.substr(-5) == '.html') contentType = 'text/html';
					else if (filePath.length >= 4 && filePath.substr(-3) == '.js') contentType = 'application/javascript';
					else if (filePath.length >= 5 && filePath.substr(-4) == '.css') contentType = 'text/css';

					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
    } else {
    	response.writeHead(404);
    	response.end();
    }
  });
};