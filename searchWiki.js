var config = require('./config.json');
var url = require('url');
var HtmlParser = require('html-parser');
var HtmlToJson = require('html-to-json');
var request = require('request');

var requestDebug = function (err, res, body) {
	//console.log(res);
	console.log(body);
	//debugger;
};

var searchWiki = function(query, callback) {

	//var query = 'Magic';
	var urlFormatted = url.format({
    		protocol: config.search.protocol,
    		hostname: config.search.host,
    		pathname: config.search.path,
    		query: {q: query,
			num: 10,
			siteSearch: 'http://www.d20pfsrd.com',
			key: config.search.key,
			cx: config.search.cx}
  	});
	var queryReq = url.parse(urlFormatted);
	var promise = request.get({uri: queryReq}, function (err, res, body) {
		var data = JSON.parse(body);
		data = data.results;
		for (var i = 0; i < data.length; i++) {
			data[i] = {id: ''+i, title: data[i].titleNoFormatting, url: data[i].url};
		}
		callback(data);
	});
};
searchWiki('Magic', function (res) { console.log(res); });

module.exports.searchWiki = searchWiki;
