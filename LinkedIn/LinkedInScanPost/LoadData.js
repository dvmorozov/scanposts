
var settings = null;

function isDefined(obj) {
	if (obj !== undefined && obj !== null) return true;
	else return false;
}

function timestampToString(timestamp) {
	var newDate = new Date();
	if (isDefined(timestamp))
		newDate.setTime(timestamp);
	return newDate.toUTCString();
}

function hasWord(text) {
	if (!isDefined(text)) return false;
	if (isDefined(settings) && isDefined(settings.words) && (settings.words.length !== 0)) {
		for (var i = 0; i < settings.words.length; i++) {
			if (text.search(new RegExp(settings.words[i], 'i')) !== -1)
				return true;
		}
		return false;
	}
	//	Filter is undefined.
	return true;
}

function createDefaultConfig() {
	settings = {
		words: [],
		maxRequestNum: 10, 		//	Maximum limit of request number.
		lastTimeStamp: null
	};
}

var lastPostTimeStamp = null;

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
		el.innerHTML = 'Last scanned ' + (isDefined(settings.lastTimeStamp) ? timestampToString(settings.lastTimeStamp) : 'never');
}

function writeSettings() {
	$.cookie('settings', JSON.stringify(settings));
}

var requestNumber = 0;

function showErrorMessage(error) {
	if (isDefined(page) && isDefined(page.showErrorMessage)) {
		page.showErrorMessage(error);
	}
}

//	Loads list of groups.
function loadItems(forChunk, completed, request, start, count, since) {

	var finalizeLoading = function() {
		//	Saves lastTimeStamp.
		settings.lastTimeStamp = lastPostTimeStamp;
		writeSettings();
	};

	var f = function (result) {

		if (isDefined(result)) {
			//	Makes something with the chunk.
			forChunk(result);

			if (isDefined(result._count) && isDefined(result._total) && isDefined(result._start)) {
				var newStart = result._start + result._count;
				//	The requested count must be always fixed, otherwise LinkedIn sometimes stops reply.
				var newCount = (/*result._count*/10 < result._total - newStart ? /*result._count*/10 : result._total - newStart);
				loadItems(forChunk, completed, request, newStart, newCount, since);
			}
			//	If there is only one chunk LinkedIn does not return _count.
			else
				if (isDefined(completed)) completed();
		}
	};

	if (isDefined(count) && isDefined(start)) {
		if (count === 0) {
			finalizeLoading();
			if (isDefined(completed)) completed();
		} else if (requestNumber++ < settings.maxRequestNum)
			IN.API.Raw(request + '?count=' + count + '&start=' + start +
			(isDefined(since) ? '&modified-since=' + since : '')).result(f).error(showErrorMessage);
		else finalizeLoading();
	} else
		if (requestNumber++ < settings.maxRequestNum)
			IN.API.Raw(request + (isDefined(since) ? '?modified-since=' + since : '')).result(f).error(showErrorMessage);
}

var groupList = {
	groups: [],

	load: function (result) {
		if (isDefined(result) && isDefined(result.values)) {
			groupList.groups = groupList.groups.concat(result.values);
		}
	},

	completed: function () {
		loadPosts();
	}
};

var postList = {
	groupIndex: 0,
	received: 0,
	selected: 0,
	scannedGroups: 0,

	load: function (posts) {
		if (isDefined(posts) && isDefined(posts._count) && isDefined(posts.values)) {
			postList.received += posts._count;
			document.getElementById('new').innerHTML = 'New: ' + postList.received;

			for (var j = 0; j < posts._count; j++) {
				var summary = posts.values[j].summary;

				if (isDefined(summary)) {
					var hasWordInSummary = hasWord(summary);

					if ((isDefined(posts.values[j].title) && hasWord(posts.values[j].title)) ||
						hasWordInSummary) {
						if (hasWordInSummary) {
							//	Marks out the keywords.
							for (var k = 0; k < settings.words.length; k++) {
								var keyword = settings.words[k];

								summary = summary.replace(keyword,
									'<span class="keyword">' + keyword + '</span>');
							}
						}

						var timestamp = posts.values[j].creationTimestamp;
						if (isDefined(timestamp)) {
							if (!isDefined(lastPostTimeStamp) || timestamp > lastPostTimeStamp)
								lastPostTimeStamp = timestamp;
						}

						text = '<div class="panel panel-primary">';
						text += '<div class="panel-heading"><h3 class="panel-title">' +
							posts.values[j].title + '</h3></div>';

						text += '<div class="panel-body">' + summary + '</div>';

						text += '<div class="panel-footer">';
						text += '<a class="url" style="" href="' +
							posts.values[j].siteGroupPostUrl +
							'"><img src="LinkedIn.jpg" alt="LinkedIn logo" height="32" width="32" /></a>';

						text += '&nbsp;<span class="date">' + timestampToString(timestamp) + '</span>';
						text += '</div></div>';

						++postList.selected;
						document.getElementById('selected').innerHTML = 'Selected: ' + postList.selected;

						$("#posts").append(text);

						updateParentHeight();
					}
				}
			}
		}
	},

	completed: function () {
		//	Show progress group by group.
		document.getElementById('groups').innerHTML = 'Groups: ' + ++postList.scannedGroups;
		loadPosts();
	}
};

function loadGroups() {
	loadItems(groupList.load, groupList.completed, '/people/~/group-memberships');
}

function loadPosts() {
	if (postList.groupIndex < groupList.groups.length) {
		var groupId = groupList.groups[postList.groupIndex++].group.id;

		if (isDefined(groupId))
			loadItems(postList.load, postList.completed, '/groups/' + groupId + '/posts:(creation-timestamp,title,summary,site-group-post-url)', null, null, settings.lastTimeStamp);
	}
}

function loadData() {
	readSettings();

	//	Loads list of groups and associated posts.
	requestNumber = 0;
	loadGroups();
}

function authLinkedIn() {
	IN.User.authorize(function () { this.loadData(); });
}

function updateParentHeight() {
	if(isDefined(window.parent))
		window.parent.postMessage(document.body.scrollHeight, "http://scanposts.azurewebsites.net");
}
