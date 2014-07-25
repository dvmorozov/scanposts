
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
function loadGroups(forChunk, start, count) {

	var f = function (result) {
		if (isDefined(result) && isDefined(result._count) && isDefined(result._total) && isDefined(result._start)) {
			//	Makes something with the chunk of group list.
			forChunk(result);

			var newStart = result._start + result._count;
			var newCount = (result._count < result._total - newStart ? result._count : result._total - newStart);
			loadGroups(forChunk, newStart, newCount);
		}
	};

	if (isDefined(count) && isDefined(start)) {
		if (count === 0) return;
		else
			IN.API.Raw('/people/~/group-memberships?count=' + count + '&start=' + start).result(f);
	} else
		IN.API.Raw("/people/~/group-memberships").result(f);
}

function loadData() {
	readSettings();

	var groups = 0;
	var selected = 0;
	var received = 0;
	var text = '';

	//	Loads list of groups.
	loadGroups(function (result) {
		if (isDefined(result) && isDefined(result.values) && isDefined(result._count)) {
			groups += result._count;

			for (var i = 0; i < result._count; i++) {
				var groupId = result.values[i].group.id;

				var f = function (posts) {

					if (isDefined(posts) && isDefined(posts._count) && isDefined(posts.values)) {
						received += posts._count;

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
								}

								text += '<div class="panel panel-primary">';
								text += '<div class="panel-heading"><h3 class="panel-title">' +
									posts.values[j].title + '</h3></div>';

								text += '<div class="panel-body">' + summary + '</div>';

								text += '<div class="panel-footer">';
								text += '<a class="url" style="" href="' +
									posts.values[j].siteGroupPostUrl +
									'"><img src="LinkedIn.jpg" alt="LinkedIn logo" height="32" width="32" /></a>';

								text += '&nbsp;<span class="date">' + newDate.toUTCString() + '</span>';
								text += '</div></div>';

								++selected;
								document.getElementById('search').innerHTML = text;
								document.getElementById('selected').innerHTML = 'Selected: ' + selected;
								document.getElementById('new').innerHTML = 'New: ' + received;
								document.getElementById('groups').innerHTML = 'Groups: ' + groups;
							}
						}
					}
				};

				var fCount = function (posts) {
					var count = posts._total;
					IN.API.Raw('/groups/' + groupId + '/posts:(creation-timestamp,title,summary,site-group-post-url)?count=' + count + '&start=0').result(f);
				};

				IN.API.Raw('/groups/' + groupId + '/posts:(creation-timestamp,title,summary,site-group-post-url)?count=0&start=0').result(fCount);
			}
		}
	});

	writeSettings();
}