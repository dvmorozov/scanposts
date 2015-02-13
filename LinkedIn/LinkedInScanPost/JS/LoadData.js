﻿
// ReSharper disable UseOfImplicitGlobalInFunctionScope
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
		var mandatoryKeywordsFound = 0;
		
		for (var i = 0; i < settings.words.length; i++) {
			if (text.search(new RegExp(settings.words[i], 'i')) !== -1) {
				//	The word is found.
				if (settings.words[i][0] !== '+')
					return true;
				else {
					//	Checks for other mandatory words.
					mandatoryKeywordsFound++;
					continue;
				}
			}
		}

		var mandatoryKeywords = 0;
		for (var index in settings.words)
			if (settings.words[index][0] === '+') mandatoryKeywords++;
		
		if (mandatoryKeywords !== 0 && mandatoryKeywords == mandatoryKeywordsFound)
			return true;
	}
	//	Filter is undefined or no keyword found.
	return false;
}

var lastPostTimeStamp = null;

function showErrorMessage(error) {
	if (isDefined(page) && isDefined(page.showErrorMessage)) {
		page.showErrorMessage(error);
	}
}

//	Loads list of items.
function loadItems(forChunk, completed, request, start, count, since, terminated) {

	var f = function (result) {

		if (isDefined(result)) {
			//	Makes something with the chunk.
			forChunk(result);

			if (isDefined(result._count) && isDefined(result._total) && isDefined(result._start)) {
				var newStart = result._start + result._count;
				//	The requested count must be always fixed, otherwise LinkedIn sometimes stops reply.
				var newCount = (/*result._count*/10 < result._total - newStart ? /*result._count*/10 : result._total - newStart);
				loadItems(forChunk, completed, request, newStart, newCount, since, terminated);
			}
			//	If there is only one chunk LinkedIn does not return _count.
			else
				if (isDefined(completed)) completed();
		}
	};

	console.log('since: ' + since);

	if (isDefined(count) && isDefined(start)) {
		if (count === 0) {
			if (isDefined(completed)) completed();
		} else if (!staticSettings.requestDisabled())
			IN.API.Raw(request + '?count=' + count + '&start=' + start +
				(isDefined(since) ? '&modified-since=' + since : '')).result(f).error(showErrorMessage);
		else
			if (isDefined(terminated))
				terminated();
	} else
		if (!staticSettings.requestDisabled())
			IN.API.Raw(request + (isDefined(since) ? '?modified-since=' + since : '')).result(f).error(showErrorMessage);
		else
			if (isDefined(terminated))
				terminated();
}

var groupList = {
	groups: [],

	load: function (result) {
		if (isDefined(result) && isDefined(result.values)) {
			groupList.groups = groupList.groups.concat(result.values);
		}
	},

	completed: function () {
		console.log('group found: ' + groupList.groups.length);

		var f = function (groupList) {
			var result = [];
			for (var i = 0; i < groupList.length; i++) {
				var g = groupList[i];
				result.push(g.group.id);
			}
			return result;
		};

		updateGroups(f(groupList.groups));
		loadPosts();
	}
};

function highlightKeywords() {
	for (var i in settings.words) {
		var word = settings.words[i];
		$(".summary").highlight(word);
	}
}

var postList = {
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

						var timestamp = posts.values[j].creationTimestamp;
						if (isDefined(timestamp)) {
							if (!isDefined(lastPostTimeStamp) || timestamp > lastPostTimeStamp)
								lastPostTimeStamp = timestamp;
						}

						var text = '<div class="panel panel-primary">';
						text += '<div class="panel-heading"><h3 class="panel-title">' +
							posts.values[j].title + '</h3></div>';

						text += '<div class="panel-body"><div class="summary">' + summary + '</div></div>';

						text += '<div class="panel-footer">';
						text += '<a class="url" href="#" onclick="page.openPost(\'' +
							posts.values[j].siteGroupPostUrl +
							'\');"><img src="LinkedIn.jpg" alt="LinkedIn logo" height="32" width="32" /></a>';

						text += '&nbsp;<span class="date">' + timestampToString(timestamp) + '</span>';
						text += '</div></div>';

						++postList.selected;
						document.getElementById('selected').innerHTML = 'Selected: ' + postList.selected;

						$("#posts").append(text);

						updateParentHeight();
						staticSettings.incPostNumber();
					}
				}
			}
		}
		updateParentHeight();
	},

	completed: function () {
		loadPosts();
	},

	//	Called when loading process was interrupted.
	terminated: function () {
		console.log('loading finalized');
		//	Saves lastTimeStamp.
		settings.lastTimeStamp = lastPostTimeStamp;
		writeSettings();
		//	Must be called after finish of downloading.
		highlightKeywords();
	}
};

function loadGroups() {
	loadItems(groupList.load, groupList.completed, '/people/~/group-memberships');
}

function loadPosts() {
	var group = setNextGroup();

	if (isDefined(group)) {
		//	Show progress group by group.
		document.getElementById('groups').innerHTML = 'Groups: ' + ++postList.scannedGroups;

		var groupId = group;

		if (isDefined(groupId)) {
			console.log('loading posts for ');
			console.log(group);

			console.log('lastTimeStamp: ' + settings.lastTimeStamp);

			loadItems(postList.load, postList.completed, '/groups/' + groupId + '/posts:(creation-timestamp,title,summary,site-group-post-url)', null, null, settings.lastTimeStamp, postList.terminated);
		}
	} else postList.terminated();
}

function loadData() {
	readSettings();

	//	Loads list of groups and associated posts.
	staticSettings.requestNumber = 0;
	loadGroups();
}

function authLinkedIn() {
	IN.User.authorize(function () {
		this.loadData();

		document.getElementById('panel_posts').style.visibility = 'visible';
		document.getElementById('panel_login').style.visibility = 'hidden';
	});
}

function checkAuthAndLoad() {
	if (IN.User.isAuthorized()) {
		this.loadData();
		document.getElementById('panel_posts').style.visibility = 'visible';
		document.getElementById('panel_login').style.visibility = 'hidden';
	} else {
		document.getElementById('panel_posts').style.visibility = 'hidden';
		document.getElementById('panel_login').style.visibility = 'visible';
	}
}

function updateParentHeight() {
	if (isDefined(window.parent)) {
		console.log('updateParentHeight: ' + document.body.clientHeight);
		window.parent.postMessage(document.body.clientHeight, "http://townbreath.com");
	}
}
// ReSharper restore UseOfImplicitGlobalInFunctionScope
