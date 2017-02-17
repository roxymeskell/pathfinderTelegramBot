var config = require('./config.json');
var TelegramBot = require('node-telegram-bot-api');
var search = require('./searchWiki.js');
var parser = require('./parser.js');
console.log(parser);

var bot = new TelegramBot(config.botToken, config.botOptions);

bot.on('inline_query', function (q) {
	var q_id = q.id;
	var query = q.query;

	search.searchWiki(query, function (res) {
		var results = [];
		for (var i = 0; i < res.length; i++) {
			results.push({
				type: 'article',
				id: ''+i,
				title: res[i].title,
				input_message_content: {
					message_text: '['+res[i].title+']('+res[i].url+')',
					//message_text: '*'+res[i].title + '*\n' + res[i].url,
					parse_mode: 'Markdown'
				},
			});
		}
		/*res.forEach(function (r) {
			var iRes = {type: 'article', };
			results.push(r);
		});*/
		bot.answerInlineQuery(q_id, results);
	});

	//var results = [];

	//bot.answerInlineQuery(id, results);
});

bot.on('edited_message', function (msg) {
	bot.emit('message', msg);
});


bot.onText(/\/testMarkdown (.*)/, function (msg, match) {
	chatId = msg.chat.id;
	html = match[1];
	bot.sendMessage(chatId, html, {parse_mode: 'Markdown'});
});

bot.onText(/\/parseUrl (.*)/, function (msg, match) {
	chatId = msg.chat.id;
	url = match[1];
	parser.parseUrl(url).done(function (res) {
		var html = parser.jsonToHtml(res.sitesCanvas);
		console.log(html);
		bot.sendMessage(chatId, html, {parse_mode: 'HTML'});
	});
});

bot.onText(/\/showTest/, function (msg) {
	chatId = msg.chat.id;
	bot.sendMessage(chatId, testText);
	//bot.sendMessage(chatId, testHTML, {parse_mode: 'HTML'});
});


