var config = require('./config.json');
var url = require('url');
var https = require('https');
var request = require('request');
var GoogleSearch = require('./GoogleSearch.js');//require('google-search');
var googleSearch = new GoogleSearch({
  key: config.search.key,
  cx: config.search.cx
});
googleSearch.build({
  q: "Magic",
  //start: 5,
  num: 10, // Number of search results to return between 1 and 10, inclusive 
  //siteSearch: "http://kitaplar.ankara.edu.tr/" // Restricts results to URLs from a specified site 
}, function(error, response) {
 // console.log(response);
});//*/

var requestDebug = function (err, res, body) {
	console.log(err);
	console.log(res);
	//console.log(res.request.host);
	console.log(body);
	debugger;
};
var query = 'Magic';
var urlFormatted = url.format({
    protocol: config.search.protocol,
    hostname: config.search.host,
    pathname: config.search.path,
    query: {q: query, num: 10, key: config.search.key, cx: config.search.cx}
  });
var queryReq = url.parse(urlFormatted);
console.log(queryReq);
//https.get(url, function (res) {console.log(res);});
https.get(queryReq, function(res) {
	var data = [];
	res.
	on('data', function(chunk) {data.push(chunk);}).
	on('end', function() {
		var dataBuffer = data.join('').trim();
		var result;
		try {
			result = JSON.parse(dataBuffer);
		} catch(e) {
			result = {'status_code': 500, 'status_text': 'JSON parse failed'};
		}
		console.log(result);//callback(null, result);
	}).
	on('error', function(e) {
		console.log(e);//callback(e);
 	});
 });

//url.uri = url.href;
//url = url.href;
var req;
req = request({uri:queryReq}, requestDebug);
//console.log(req);
/*
req = request.post(config.search.url, {'form': {
	'q':query,
	'key':config.search.key,
	'cx':config.search.cx
	}}, requestDebug);
console.log(req);
/*
var url = config.searchURL + '&q=' + query;
console.log(url);

var req;

//req = request(url, function (err, res, body) { console.log(body); } );
req = request(url, requestDebug );
console.log(req);
debugger;

req = request.post(config.searchURL, {form:{q:query}}, function (err, res, body) { console.log(body); });
debugger;
*/
