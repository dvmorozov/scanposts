// ReSharper disable UseOfImplicitGlobalInFunctionScope
var settings = null;

var staticSettings = {
	maxRequestNum: 10, 		//	Maximum limit of request number.
	useMaxRequestNum: true,
	requestNumber: 0,

	maxPostNum: 50, 		//	Maximum limit of output post number (the real number of posts can exceed this by the rest of chunk).
	postNumber: 0,

	requestDisabled: function() {
		if (staticSettings.useMaxRequestNum) {
			if (staticSettings.requestNumber < staticSettings.maxRequestNum) {
				staticSettings.requestNumber++;
				return false;
			} else return true;
		} else {
			if (staticSettings.postNumber < staticSettings.maxPostNum)
				return false;
			else return true;
		}
	},

	incPostNumber: function () {
		staticSettings.postNumber++;
	}
};

function createDefaultConfig() {
	settings = {
		words: [],
		lastTimeStamp: null
	};

	initScanQueues();
}

function initScanQueues() {
	console.log('initializes scan queues');

	if (isDefined(settings))
		settings.prevScanQueues = {
			scannedGroups: [],
			notScannedGroups: [],
			startGroup: null	//	Used to detect a cycle.
		};
}

function contains(array, item) {
	for (var i = 0; i < array.length; i++) {
		//	Items must be of simple type!
		if (array[i] === item) return true;
	}
	return false;
}

function deleteNoExisting(from, elements) {
	var i = 0;
	while (i < from.length) {
		var item = from[i];
		if (!contains(elements, item)) {
			//console.log('deletes not existing item: ');
			//console.log(item);

			from.splice(i, 1);
		} else i++;
	}
	return from;
}

function deleteExisting(from, elements) {
	var i = 0;
	while (i < from.length) {
		var item = from[i];
		if (contains(elements, item)) {
			//console.log('deletes existing item: ');
			//console.log(item);
			
			from.splice(i, 1);
		} else i++;
	}
	return from;
}

function updateGroups(currentGroupList) {
	if (isDefined(settings)) {
		if (!isDefined(settings.prevScanQueues))
			initScanQueues();

		console.log('update groups: ');
		console.log(settings);
		
		//	Removes nonexistent groups.
		console.log('removes nonexistent groups');
		console.log('before not scanned count: ' + settings.prevScanQueues.notScannedGroups.length);
		console.log('before scanned count: ' + settings.prevScanQueues.scannedGroups.length);
		
		settings.prevScanQueues.notScannedGroups = deleteNoExisting(settings.prevScanQueues.notScannedGroups, currentGroupList);
		settings.prevScanQueues.scannedGroups = deleteNoExisting(settings.prevScanQueues.scannedGroups, currentGroupList);

		console.log('after not scanned count: ' + settings.prevScanQueues.notScannedGroups.length);
		console.log('after scanned count: ' + settings.prevScanQueues.scannedGroups.length);

		//	Adds new groups at the top of not scanned list.
		console.log('adds new groups at the top of not scanned list');
		console.log('before not scanned count: ' + settings.prevScanQueues.notScannedGroups.length);
		console.log('before scanned count: ' + settings.prevScanQueues.scannedGroups.length);

		currentGroupList = deleteExisting(currentGroupList, settings.prevScanQueues.notScannedGroups);
		currentGroupList = deleteExisting(currentGroupList, settings.prevScanQueues.scannedGroups);

		console.log('after not scanned count: ' + settings.prevScanQueues.notScannedGroups.length);
		console.log('after scanned count: ' + settings.prevScanQueues.scannedGroups.length);

		//	Now currentGroupList contains only new items.
		console.log('remaining groups count: ' + currentGroupList.length);
		settings.prevScanQueues.notScannedGroups = currentGroupList.concat(settings.prevScanQueues.notScannedGroups);
		console.log('not scanned groups count: ' + settings.prevScanQueues.notScannedGroups.length);

		console.log(settings);

		//	Resets cycle.
		settings.prevScanQueues.startGroup = null;

		writeSettings();
	}
}

function setNextGroup() {
	//	Get the next item.
	if (settings.prevScanQueues.notScannedGroups.length === 0) {
		settings.prevScanQueues.notScannedGroups = settings.prevScanQueues.scannedGroups;
		settings.prevScanQueues.scannedGroups = [];
		console.log('group scanning starts from the beginning...');
	}

	if (settings.prevScanQueues.notScannedGroups.length === 0) {
		//	Lists are empty.
		console.log('group list is empty');
		return null;
	}

	var group = settings.prevScanQueues.notScannedGroups.shift();
	settings.prevScanQueues.scannedGroups.push(group);

	console.log('not scanned groups: ' + settings.prevScanQueues.notScannedGroups.length);
	console.log('scanned groups: ' + settings.prevScanQueues.scannedGroups.length);
	console.log('current group id: ' + group);

	if (settings.prevScanQueues.startGroup === null) {
		settings.prevScanQueues.startGroup = group;
	} else if (settings.prevScanQueues.startGroup === group) {
		//	Stops the cycle.
		console.log('group scanning cycle finished...');
		return null;
	}

	writeSettings();
	
	return group;
}

function readSettings() {
	var text = $.cookie('settings');
	if (isDefined(text)) {
		settings = $.parseJSON(text);
		if (!isDefined(settings))
			createDefaultConfig();
	}
	//	Sets up default configuration.
	else {
		createDefaultConfig();
	}

	console.log('reads settings: ');
	console.log(settings);

	var el = document.getElementById('last_visited_time');
	if (isDefined(el))
		el.innerHTML = (isDefined(settings.lastTimeStamp) ? 'Last post at ' + timestampToString(settings.lastTimeStamp) : 'Not scanned yet');
}

function writeSettings() {
	var text = JSON.stringify(settings);
	$.cookie('settings', text);
}
// ReSharper restore UseOfImplicitGlobalInFunctionScope
