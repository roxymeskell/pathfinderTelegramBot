var config = require('./config.json');
var HtmlParser = require('html-parser');
var HtmlToJson = require('html-to-json');
var request = require('request');

var testHTML = null;
var testText = null;
var testJson = null;
var jsonToObj = function (element) {
	var data = {};
	data.children = [];
	if (element.type === 'text') {
		data.name = 'text';
		var text = element.data.trim();
		if (text.length > 0) {
			return text;
		} else {
			return null;
		}
	} else {
		data.name = element.name;
		data.id = element.attribs.id ? element.attribs.id : null;
		data.class = element.attribs.class ? element.attribs.class : null;
		data.href = element.attribs.href ? element.attribs.href : null;
		element.children.forEach(function (c) {
			var cData = jsonToObj(c);
			if (cData) {
				//debugger;
				if (typeof(cData) === 'string') {
					data.children.push(cData);
				} else {
					if (cData.children &&
					cData.children.length > 0) {
						if (cData.children.length === 1 &&
						cData.children[0].name) {
							cData = cData.children[0];
						}
						data.children.push(cData);
					}
				}
			}
		});
	}
	return data;
};
var jsonToHtmlHelper = function (dp, json) {
	var html = '';
	var i;
	for (i=0; i<dp; i++) { html+='\t'; }
	if (typeof(json) === 'string') {
		return html+json;
	}
	html+='<'+json.name;
	if (json.id) { html+=' id="'+json.id+'"'; }
	if (json.class) {html+=' class="'+json.class+'"'; }
	if (json.href) {html+=' href="'+json.href+'"'; }
	html+='>';

	for (i=0; i<json.children.length; i++) {
		html+='\n';
		html+=jsonToHtmlHelper(dp+1, json.children[i]);
	}
	
	html += '\n';
	for (i=0; i<dp; i++) { html+='\t'; }
	html+='</'+json.name+'>';
	return html;
};
var jsonToHtml = function (json) {
	var html = jsonToHtmlHelper(0, json);
	//console.log(html);
	//writeToFile('jsonToHtml.txt',html);
	//debugger;
	return html;
};
var writeToFile = function (fn, obj) {
	var fs = require('fs');
	fs.writeFile(fn, obj, function(err) { if (err) { console.log(err); } });
	console.log(obj);
};
request(config.testURL, function (err, res, body) {
	//console.log(err);
	//console.log(res);
	testHTML = body;
	testText = '';
	testHTML = HtmlParser.sanitize(testHTML,{
		elements: ['script', 'head', 'img'],
		attributes: function (name, value) {//['onclick']
				return name !== 'id' &&
					name !== 'class' &&
					name !== 'href';
			}
	});
	testHTML = testHTML.replace(/\n/g, '');
	testJson = HtmlToJson.parse(testHTML, {
			'sitesCanvas': function ($doc, $) {
				//console.log($doc.find('#sites-canvas'));
				//return $doc.find('#sites-canvas');//.text();
				var $element = $doc.find('#sites-canvas').get('0');
				return jsonToObj($element);
				//console.log($element);
				var $data = {};
				$data.name = $element.name;
				$data.id = $element.attribs.id;
				return $data;
			}
		}).done(function (items) {
			//debugger;
			jsonToHtml(items.sitesCanvas);
			console.log(items);
		}, function (err) {
		});

	//console.log(body);
	//console.log(testHTML);
	//console.log(testJson);
	/*testText = '';
	HtmlParser.parse(testHTML, {
		text: function(value){
			console.log(value);
			testText += value;
		}
	});*/
});

HtmlToJson.request(config.testURL, {
	'sitesCanvas': function ($doc, $) {
		var $element = $doc.find('#sites-canvas').get('0');
		return jsonToObj($element);
	}
}).done(function (items) {
	debugger;
	jsonToHtml(items.sitesCanvas);
	console.log(items);
}, function (err) {
});

/*
 * Requests url, parses body, and returns a promise.
 */
var parseUrl = function(url) {
	return HtmlToJson.request(url, {
		'sitesCanvas': function ($doc, $) {
			var $element = $doc.find('#sites-canvas').get('0');
			return jsonToObj($element);
		}
	});
};

module.exports.jsonToHtml = jsonToHtml;
module.exports.parseUrl = parseUrl;

/*
bot.onText(/\/showTest/, function (msg) {
	chatId = msg.chat.id;
	bot.sendMessage(chatId, testText);
	//bot.sendMessage(chatId, testHTML, {parse_mode: 'HTML'});
});
*/

