
var settings = {
	//  Can be initialized by regular expressions.
	words : [/job/i, /SCADA/i]
};

function isDefined(obj) {
	if (obj !== undefined && obj !== null) return true;
	else return false;
}

function hasWord(text) {
	if (!isDefined(text)) return false;
	if (isDefined(settings) && isDefined(settings.words)) {
		for (var i = 0; i < settings.words.length; i++) {
			if (text.search(settings.words[i]) !== -1)
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
	else settings = null;
}

function writeSettings() {
	$.cookie('settings', settings.toJSON());
}

function loadData() {
	readSettings();
	IN.API.Raw("/people/~/group-memberships").result(function (result) {
		//console.log(result);

		for (var i = 0; i < result._total; i++) {
			var groupId = result.values[i].group.id;
			//var groupName = result.values[i].group.name;

			var f = function (posts) {
				//var _groupName = groupName;
				//console.log('=======================' + _groupName + '=========================');
				//console.log(posts);

				var text = '';

				for (var j = 0; j < posts._count; j++) {
					if (hasWord(posts.values[j].title) || hasWord(posts.values[j].summary)) {
						var newDate = new Date();
						newDate.setTime(posts.values[j].creationTimestamp);

						text += '<div class="panel panel-primary">';
						text += '<div class="panel-heading"><h3 class="panel-title">' + posts.values[j].title + '</h3></div>';

						text += '<div class="panel-body">' + posts.values[j].summary + '</div>';

						text += '<div class="panel-footer">';
						text += '<a class="url" style="" href="' + posts.values[j].siteGroupPostUrl + '"><img src="LinkedIn.jpg" alt="LinkedIn logo" height="32" width="32" /></a>';
						text += '&nbsp;<span class="date">' + newDate.toUTCString() + '</span>';
						text += '</div></div>';
					}
				}

				var el = document.getElementById('search');
				el.innerHTML = text;
			};

			var fCount = function (posts) {
				var count = posts._total;
				IN.API.Raw('/groups/' + groupId + '/posts:(creation-timestamp,title,summary,site-group-post-url)?count=' + count + '&start=0').result(f);
			};
			IN.API.Raw('/groups/' + groupId + '/posts:(creation-timestamp,title,summary,site-group-post-url)?count=0&start=0').result(fCount);
		}
	});
}