
var settings = null;

function createDefaultConfig() {
	settings = {
		words: [],
		maxRequestNum: 10, 		//	Maximum limit of request number.
		lastTimeStamp: null
	};
}

function readSettings() {
	var text = $.cookie('settings');
	if (isDefined(text)) {
		settings = $.parseJSON(text);
		if (!isDefined(settings))
			createDefaultConfig();
		else
		//	Sets default values.
			if (!isDefined(settings.maxRequestNum)) {
				settings.maxRequestNum = 10;
			}
	}
	//	Sets up default configuration.
	else {
		createDefaultConfig();
	}

	var el = document.getElementById('last_visited_time');
	if (isDefined(el))
		el.innerHTML = (isDefined(settings.lastTimeStamp) ? 'Last scanned at ' + timestampToString(settings.lastTimeStamp) : 'Not scanned yet');
}

function writeSettings() {
	$.cookie('settings', JSON.stringify(settings));
}
