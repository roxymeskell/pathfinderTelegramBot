var config = require('./config.json');
var request = require('request');
var htmlParser = require('html-parser');
var htmlToJson = require('html-to-json');
var testURL = config.testURL;

var objToStrHlp = function (dp, name, obj) {
	var str = '';
	var value = null;
	var i;
	for ( i = 0; i < dp; i++ ) { str += '\t'; }
	str += name + ': ';

	if ( typeof(obj) !== 'object' ) {
		if ( typeof(obj) === 'string' ) {
			var objStr = obj;
			objStr = objStr.replace(/\s{2,}/g,'').replace(/\n/g, '\\n');
			if ( objStr.length > 80 ) { objStr = objStr.substr(0,77) + '...'; }
			str += '\'' + objStr + '\'';
			/*if ( obj.length > 80 ) {
				str = '\'' + obj.substr(0,77) + '...\'';
			} else {
				str += '\'' + obj + '\'';
			}*/
		} else {
			str += obj;
		}
		return str;
	}

	str += '{';

	for ( var key in obj ) {
		value = obj[key];
		if ( str[str.length - 1] !== '{' ) { str += ','; }
		str += '\n';
		str += objToStrHlp(dp + 1, key, value);
	}

	str += '\n';
	for ( i = 0; i < dp; i++ ) { str += '\t'; }
	str += '}';
	return str;
};
var objToStr = function (name, obj) {
	return objToStrHlp(0, name, obj);
};
var logObj = function (name, obj) {
	console.log(objToStr(name, obj));
};

//logObj('config', config);

var doneFunc = function (testName) {
	return function (res) {
		console.log('\n----------\n' + testName + '\n----------');
		logObj('results', res);
		console.log('----------');
	};
}

/*request(testURL, function (err, res, body) {
	var testHTML = htmlParser.sanitize(body, {
		elements: ['script', 'head', 'img']
});*/

/*htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'headers': ['#sites-canvas p~h1, #sites-canvas p~h2, #sites-canvas p~h3, #sites-canvas p~h4', {
		'text': function ($e) { return $e.text(); }
	}],
	'content': ['#sites-canvas h1+p, #sites-canvas h2+p, #sites-canvas h3+p, #sites-canvas h4+p', {
		'text': function ($e) { return $e.text(); }
	}]
}).done(doneFunc('Getting Content 2'));

htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'content': ['#sites-canvas p', function ($e) { return $e.text(); }]
}).done(doneFunc('Getting Content'));//*/

/*htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'headers': ['#sites-canvas :header', function ($e) { return $e.text(); }]
}).done(doneFunc('JQuery 1'));//*/
/*htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'headers': ['#sites-canvas h3:has(span)', function ($e) { return $e.text(); }]
}).done(doneFunc('JQuery 2'));//*/

var parseContent = function (content) {
	//var content = oContent;//.filter(':header')
	//var mainContent = content.first().nextUntil(':header', ':not(:has(script))').text();
	if (content.filter(':header').length < 1) {
		return content.not(':has(script)').text();
	}
	var data = [];
	//console.log(content.find(':header:first-of-type'));
	var headerType = content.filter(':header')[0].name;//;':header, :has(:header)')[0].name;
	//console.log(headerType);
	var headers = content.filter(headerType);
	var currHeader, currContent, currData;
	var mainContent = headers.eq(0).prevUntil(content.prev(), ':not(:has(script))').text();
	
	for (var i = 0; i < headers.length - 1; i++) {
		currHeader = headers.eq(i);
		currData = {};
		currData.header = currHeader.text();
		currContent = currHeader.nextUntil(headers.eq(i+1), ':not(:has(script)');
		currData.content = parseContent(currContent);
		data.push(currData);
	}
	currHeader = headers.eq(headers.length - 1);
	currData = {};
	currData.header = currHeader.text();
	currContent = currHeader.nextUntil(content.last().next(), ':not(:has(script)');
	currData.content = parseContent(currContent);
	data.push(currData);
	
	return {content: mainContent, data: data};
}

htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'html': function ($doc) {
		var data = [];
		var sitesCanvas = $doc.find('#sites-canvas-main');

		var html = sitesCanvas.html();
		html = html.replace(sitesCanvas.find('.sites-sidebar-nav').html(), '');
		
		html = html.replace(/(?:<[^>]*>)?(Section 15[^<]*)(?:<\/[^>]*>)?/g, '<h2>$1</h2>');

		html = html.replace(/<(\w+)[^>]*((?:\s(?:(?:name)|(?:colspan)|(?:rowspan))="[^"]*")*)[^>]*>/g, '<$1$2>');
		html = html.replace(/<div[^>]*>/g,'').replace(/<[^>]*div>/g, '');
		html = html.replace(/<span[^>]*>/g,'').replace(/<[^>]*span>/g, '');
		html = html.replace(/<sup[^>]*>/g,'').replace(/<[^>]*sup>/g, '');
		html = html.replace(/<br>/g, ' ');
		html = html.replace(/<img[^>]*>/g, '');
		html = html.replace(/<a>([^<>]*)<\/a>/g, '$1');
		html = html.replace(/<b>([^<>]*)<\/b>/g, '*$1*');
		html = html.replace(/<i>([^<>]*)<\/i>/g, '_$1_');

		//html = html.replace(/[\n\f\r\t\0]/g,'');
		//html = html.replace(/<script>.*<\/script>/,'');
		//html = html.replace(/<iframe>.*<\/iframe>/,'');
		//html = html.replace(/<font>.*<\/font>/,'');
		//console.log(html.substr(0,500));
		//console.log(html.match(/<table>(?:<\/?tr>|<\/?td[^<>]*>|<\/?thead>|<\/?tbody>|<\/?caption>|<\/?th[^<>]*>|[\s\w\:\-\&\*\/\\\;\.\(\)\?\'\"_\+\=]*)*/g));
		//console.log(html.match(/<table>(?:<\/?tr>|<\/?td[^<>]*>|<\/?thead>|<\/?tbody>|<\/?caption>|<\/?th[^<>]*>|[^<>]*)*/g));
		//console.log(html.match(/(?:<table>)(?:.*<table>)*/g));
		//console.log(html.match(/(?:<\/table>.*)*(?:<\/table>)/mg));
		//*/
		//console.log(json.match(/(?:<\/table>)(?:[.\n\f\r\w\W\t\s]*(?!(?:<table>))[.\n\f\r\w\W\t\s]*<\/table>)*/mg));
		//console.log(json.match(/(?:<\/table>)(?:[.\n\f\r\0\w\W\v\t\s]*<\/table>)*/mg));

		html = html.split('<script>');
		for (var i = 1; i < html.length; i++) { html[i] = html[i].split('</script>')[1]; }
		html = html.join('');
		html = html.split('<font>');
		for (var i = 1; i < html.length; i++) { html[i] = html[i].split('</font>')[1]; }
		html = html.join('');
		html = html.split('<iframe>');
		for (var i = 1; i < html.length; i++) { html[i] = html[i].split('</iframe>')[1]; }
		html = html.join('');
		//html = html.replace(/<(\w+)[^>]*((?:\s(?:(?:name)|(?:colspan)|(?:rowspan))="[^"]*")*)[^>]*>/g, '<$1$2>');
		html = html.replace(/((?:^|>)\s*)[^<>]+(\s*<[^\/])/g, '$1$2');
		html = html.replace(/(\s{2})\s+/,'$1');
		//html = html.replace(/[^>]?[^<>]+[^<]?/g, '');
		//console.log(html.substr(html.indexOf('table')-4,100));
		html = html.replace(/(?:<table>)(?:.*<table>)*/g, '<table>');//.replace(/(?:<\/table>.*)*(?:<\/table>)/g,</table>');
		//console.log(html.substr(html.indexOf('table')-4,100));
		html = html.split('<table>');
		for (var i = 1; i < html.length; i++) { 
			var split = html[i].split('</table>');
			html[i] = split[0] + '</table>' + split[split.length-1];
		}
		html = html.join('<table>');//*/
		/*html = htmlParser.sanitize(html, {
			elements: ['script', 'img', 'br', 'font', 'iframe'],
			//attributes: function (name, value) {return name !== 'colspan' && name !== 'rowspan';}
		});*/


		//console.log(html.substr(0,160));
		//html = html.replace(/<a>([^<>]*)<\/a>/g, '$1');
		//html = html.replace(/<b>([^<>]*)<\/b>/g, '*$1*');
		//html = html.replace(/<i>([^<>]*)<\/i>/g, '_$1_');
		//html = html.replace(/<thead [^>]*>/g,'').replace(/<[^>]*thead>/g, '');
		//html = html.replace(/<tbody [^>]*>/g,'').replace(/<[^>]*tbody>/g, '');
		//html = html.replace(/\n/g, '');
		
		var json = html;//html.replace(/\n/g, '');
		//json.replace(/<thead>(?:(?:<tr.*>)*(?:<th.*>)*(?:<\/tr>)*(?:<\/th>)*(?:\s*)*(?:.*)*)*<\thead>/g, function (match) { console.log(match); return match; });
		
		//console.log(json.match(/(?:<table>)[^(?:<table>)(?:</table>)]*(?:<\/table>)/mg));
		//console.log(json.replace(/\w/g,'').match(/(?:<table>).*(<\/table>)/g));
		//console.log(json.match(/(?:<table>)(?:.*<table>)*/g));
		//console.log(json.match(/(?:<\/table>.*)*(?:<\/table>)/mg));
		//console.log(json.match(/(?:<\/table>)(?:[.\n\f\r\w\W\t\s]*(?!(?:<table>))[.\n\f\r\w\W\t\s]*<\/table>)*/mg));
		//console.log(json.match(/(?:<\/table>)(?:[.\n\f\r\0\w\W\v\t\s]*<\/table>)*/mg));
/*
		var jsonSplit = json.split('<table>');
		var tables = [];
		//console.log(jsonSplit[1]);
		for (var i = 1; i < jsonSplit.length; i++) {
			tables.push(jsonSplit[i].split('</table>')[0]);
			jsonSplit[i] = jsonSplit[i].split('</table>')[1];
		}
		for (var i in tables) {
			console.log(i + ': ' + tables[i].replace(/\n/g,''));
		}
		/*json.replace(/<table>((?:\s*.*\s*)*)<\/table>/g, function(match) {
			console.log(match);
			return match;
		});
		/*json.replace(/(<table>)([^(?:<\/table>)]*)table>/g, function(match, p1) {
			console.log(match);
		});*/
		//json = json.replace(/<tr>\s*<td>/g, '[').replace(/<\/td>\s*<\/tr>/g, ']').replace(/<\/td>\s*<td>/g,', ');//.replace(/<td>/,', ');;

	
		html = '<div>' + html + '</div>';
		//console.log(html);
		//console.log(json);
		return html;
	}
}).done(function (res) {
	htmlToJson.parse(res.html, {
		'content': function ($doc) {
			return parseContent($doc.find('*'));
		}
	}).done(doneFunc(res.title));
});
/*
htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'headers': ['#sites-canvas *:has(:header:only-child), #sites-canvas :header, #sites-canvas *:contains(Section 15)', function ($e) { return $e.text(); }]
}).done(doneFunc('JQuery 3'));
htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'content': ['#sites-canvas p, #sites-canvas :not(:has(:header):not(:contains(Section 15))):has(p)', function ($e) { return $e.text(); }]
}).done(doneFunc('JQuery 5'));

htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'content': ['#sites-canvas :not(.sites-sidebar-nav) :header', {
		header: function ($e) { return $e.text(); },
		text: function ($e) { return $e.nextUntil(':header',':not(:has(script))').text()}
	}]
}).done(doneFunc('nextUntil'));

var headerSelectors = [
	'#sites-canvas p~:header',
	'#sites-canvas p~*:has(:header)',
	'#sites-canvas p~*:contains(Section 15)',
	'#sites-canvas *:not(:has(:header)):not(:contains(Section 15)):has(p)~:header',
	'#sites-canvas *:not(:has(:header)):not(:contains(Section 15)):has(p)~*:has(:header)',
	'#sites-canvas *:not(:has(:header):not(:contains(Section 15))):has(p)~*:contains(Section 15)'
];
var contentSelectors = [
	'#sites-canvas :header+p',
	'#sites-canvas *:has(:header)+p',
	'#sites-canvas *:contains(Section 15)+p',
	'#sites-canvas :header+*:not(:has(:header)):not(:contains(Section 15)):has(p)',
	'#sites-canvas *:has(:header)+*:not(:has(:header)):not(:contains(Section 15)):has(p)',
	'#sites-canvas *:contains(Section 15)+*:not(:has(:header)):not(:contains(Section 15)):has(p)'
];
var parseOpt = {'title': function ($doc) {return $doc.find('#sites-page-title').text(); }};
for (var i in headerSelectors) {
	//parseOpt['headers'+i] = [headerSelectors[i], function ($e) {return $e.text(); }];
	parseOpt[headerSelectors[i]] = [headerSelectors[i], function ($e) {return $e.prev().text(); }];
}
for (var i in contentSelectors) {
	//parseOpt['content'+i] = [contentSelectors[i], function ($e) {return $e.text(); }];
	parseOpt[contentSelectors[i]] = [contentSelectors[i], function ($e) {return $e.text(); }];
}
htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'content': [contentSelectors.join(', '),{
		'header': function ($e) { return $e.prev().text(); },
		'text': function ($e) { return $e.text(); }
	}]
}).done(doneFunc('JQuery 4'));

//htmlToJson.request(testURL, parseOpt).done(doneFunc('JQuery 6'));
/*
htmlToJson.request(testURL, {
	'title': function ($doc) {return $doc.find('#sites-page-title').text(); },
	'content': ['#sites-canvas p, #sites-canvas :not(:has(:header, :contains(Section 15))):has(p)', function ($e) { return $e.text(); }]
}).done(doneFunc('JQuery 5'));
/*
htmlToJson.request(testURL, {
	'text': function ($doc) {
		return $doc.find('#sites-canvas div').text();
	}}).done(doneFunc('Finding div'));

htmlToJson.request(testURL, {
	'SitesCanvas': ['#sites-canvas', {
		'id': function ($e) { return $e.attr('id'); },
		'div': ['div', {
			'text': function ($e) { return $e.text(); }
			}
	]}]}).done(doneFunc('Map function'));

htmlToJson.request(testURL, ['#sites-canvas', {
	'text': function ($div) {
		return $div.text();
	}
}]).done(doneFunc('Array of elements'));

htmlToJson.request(testURL, ['#sites-canvas>div', {
	'class': function ($div) { return $div.attr('class'); },
	'id': function ($div) { return $div.attr('id'); },
	'text': function ($div) {
		return $div.text();
	}
}]).done(doneFunc('Array of \'#sites-canvas>div\''));

/*
htmlToJson.request(testURL, ['#sites-canvas', ['div', {
	'text': function ($div) {
		return $div.text();
	}
}]]).done(doneFunc('Array of array of elements'));
//*/
