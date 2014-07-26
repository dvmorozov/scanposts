
var settings = null;

function isDefined(obj) {
	if (obj !== undefined && obj !== null) return true;
	else return false;
}

function hasWord(text) {
	if (!isDefined(text)) return false;
	if (isDefined(settings) && isDefined(settings.words)) {
		for (var i = 0; i < settings.words.length; i++) {
			if (text.search(new RegExp(settings.words[i], 'i')) !== -1)
				return true;
		}
		return false;
	}
	//	Filter is undefined.
	return true;
}

function readSettings() {
	var text = $.cookie('settings');
	if (isDefined(text))
		settings = $.parseJSON(text);
	//	Sets up default configuration.
	else settings = {
		words: [],
		lastTimeStamp: null
	}; ;
}

function writeSettings() {
	$.cookie('settings', JSON.stringify(settings));
}

//	Loads list of groups.
function loadItems(forChunk, completed, request, start, count) {

	var f = function (result) {
		if (isDefined(result)) {
			//	Makes something with the chunk.
			forChunk(result);

			if (isDefined(result._count) && isDefined(result._total) && isDefined(result._start)) {
				var newStart = result._start + result._count;
				//	The requested count must be always fixed, otherwise LinkedIn sometimes stops reply.
				var newCount = (/*result._count*/10 < result._total - newStart ? /*result._count*/10 : result._total - newStart);
				loadItems(forChunk, completed, request, newStart, newCount);
			}
			//	If there is only one chunk LinkedIn does not return _count.
			else
				if (isDefined(completed)) completed();
		}
	};

	if (isDefined(count) && isDefined(start)) {
		if (count === 0) {
			if (isDefined(completed)) completed();
		} else
			IN.API.Raw(request + '?count=' + count + '&start=' + start).result(f);
	} else
		IN.API.Raw(request).result(f);
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
				var newDate = new Date();

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
							newDate.setTime(timestamp);

							if (!isDefined(settings.lastTimeStamp) || timestamp > settings.lastTimeStamp)
								settings.lastTimeStamp = timestamp;
						}

						text = '<div class="panel panel-primary">';
						text += '<div class="panel-heading"><h3 class="panel-title">' +
							posts.values[j].title + '</h3></div>';

						text += '<div class="panel-body">' + summary + '</div>';

						text += '<div class="panel-footer">';
						text += '<a class="url" style="" href="' +
							posts.values[j].siteGroupPostUrl +
							'"><img src="LinkedIn.jpg" alt="LinkedIn logo" height="32" width="32" /></a>';

						text += '&nbsp;<span class="date">' + newDate.toUTCString() + '</span>';
						text += '</div></div>';

						++postList.selected;
						document.getElementById('selected').innerHTML = 'Selected: ' + postList.selected;
						$("#search").append(text);
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
			loadItems(postList.load, postList.completed, '/groups/' + groupId + '/posts:(creation-timestamp,title,summary,site-group-post-url)');
	}
}

function loadData() {
	readSettings();

	//	Loads list of groups and associated posts.
	loadGroups();

	writeSettings();
}