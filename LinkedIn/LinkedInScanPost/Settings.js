
var settings = null;

function createDefaultConfig() {
	settings = {
		words: [],
		maxRequestNum: 10, 		//	Maximum limit of request number.
		lastTimeStamp: null
	};

	initScanQueues();
}

function initScanQueues() {
	if (isDefined(settings))
		settings.prevScanQueues = {
			scannedGroups: [],
			notScannedGroups: []
		};
}

function contains(array, item) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === item) return true;
	}
	return false;
}

function deleteNoExisting(src, elements) {
	var i = 0;
	while (i < src.length) {
		var srcEl = src[i];
		if (!contains(elements, srcEl)) src.splice(i, 1);
		else i++;
	}
	return src;
}

function deleteExisting(src, elements) {
	var i = 0;
	while (i < src.length) {
		var srcEl = src[i];
		if (contains(elements, srcEl)) src.splice(i, 1);
		else i++;
	}
	return src;
}

function updateGroups(currentGroupList) {
	if (isDefined(settings)) {
		if (!isDefined(settings.prevScanQueues))
			initScanQueues();

		//	Removes nonexistent groups.
		settings.prevScanQueues.notScannedGroups = deleteNoExisting(settings.prevScanQueues.notScannedGroups, currentGroupList);
		settings.prevScanQueues.scannedGroups = deleteNoExisting(settings.prevScanQueues.scannedGroups, currentGroupList);

		//	Adds new groups at the top of not scanned list.
		currentGroupList = deleteExisting(currentGroupList, settings.prevScanQueues.notScannedGroups);
		currentGroupList = deleteExisting(currentGroupList, settings.prevScanQueues.scannedGroups);

		//	Now currentGroupList contains only new items.
		settings.prevScanQueues.notScannedGroups = currentGroupList.concat(settings.prevScanQueues.notScannedGroups);
	}
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
