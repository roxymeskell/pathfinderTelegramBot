var config = require('./config.json');
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
	'content': function ($doc) {
		var data = [];
		var sitesCanvas = $doc.find('#sites-canvas-main');

		var html = sitesCanvas.html();
		html = html.replace(/<div [^>]*>/g,'').replace(/<[^>]*div>/g, '');
		console.log(html);
		//console.log(sitesCanvas.html());
		return parseContent(sitesCanvas.find('*'));
		/*
		var headers = sitesCanvas.find(':header');
		//console.log(headers.is(headers.eq(0).next()));
		//console.log(headers);

		for (var i = 0; i < headers.length; i++) {
			data.push({header: headers.eq(i).text()});
		}

		for (var i = 0; i < data.length - 1; i++) {
			var text = headers.eq(i).nextUntil(headers.eq(i+1), ':not(:has(script))').text();
			data[i].text = text;
		}
		return data;//*/

		var currHeader, content;

		currHeader = sitesCanvas.find(':header:first-of-type');
		content = currHeader.nextUntil(currHeader.type(), ':not(:has(script))'); 

		return data;
	},
	'headers': ['#sites-canvas *:has(:header:only-child), #sites-canvas :header, #sites-canvas *:contains(Section 15)', function ($e) { return $e.text(); }]
}).done(doneFunc('Test'));
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
