var config = require('./config.json');
var TelegramBot = require('node-telegram-bot-api');
var HtmlParser = require('html-parser');
var HtmlToJson = require('html-to-json');
var request = require('request');

var bot = new TelegramBot(config.botToken, config.botOptions);

var testHTML = null;
var testText = null;
var testJson = null;
var jsonToObj = function (element) {
	//console.log(element);
	var data = {};
	data.children = [];
	if (element.type === 'text') {
		data.name = 'text';
		var text = element.data.trim();
		if (text.length > 0) {
			return text;
			//data.text = text;
			data.children.push(text);
		} else {
			return null;
		}
		//data.text = element.data;
		//console.log(data);
		//return data;
	} else {
		data.name = element.name;
		data.id = element.attribs.id ? element.attribs.id : null;
		data.class = element.attribs.class ? element.attribs.class : null;
		data.href = element.attribs.href ? element.attribs.href : null;
		element.children.forEach(function (c) {
			var cData = jsonToObj(c);
			if (cData) {
				debugger;
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
			/*if (cData.children.length > 0) {
				if (cData.children.length === 1 &&
				typeof(data.children[0]) !== 'string') {
					cData = cData.children[0];
				}
				//if (cData.name === 'text') {
				//	cData = cData.children[0];
				//}
				data.children.push(cData);
			}*/
		});
		/*for (var i=0; i < data.children.length; i++) {
			if (data.children[i].name === 'text') {
				data.children[i] = data.children[i].children[0];
			}
		}*/
	}
	//console.log(data);
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
	writeToFile('jsonToHtml.txt',html);
	debugger;
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
			debugger;
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
/*console.log(testHTML);
testHTML = '<div id="foo">foo</div>';
htmlJson = HtmlToJson.parse(testHTML, {
	'id': function ($doc, $) {
		return $doc.find('div').text();
	}
}).done(function (items) {
	console.log(items);
}, function (err) {
});*/
//console.log(htmlJson);

bot.onText(/\/showTest/, function (msg) {
	chatId = msg.chat.id;
	bot.sendMessage(chatId, testText);
	//bot.sendMessage(chatId, testHTML, {parse_mode: 'HTML'});
});


