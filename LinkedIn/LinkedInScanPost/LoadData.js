
//  Can be initialized by regular expressions.
var words = [/job/i, /SCADA/i];

function hasWord(text) {
	if (text !== undefined && text !== null) {
		for (var i = 0; i < words.length; i++) {
			if (text.search(words[i]))
				return true;
		}
	}
	return false;
}

function loadData() {
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
						newDate.setTime(posts.values[j].creationTimestamp * 1000);

						text += '<div class="post">';
						text += '<div class="title">title: ' + posts.values[j].title + '</div>';
						text += '<div class="summary">summary: ' + posts.values[j].summary + '</div>';
						text += '<div class="date">date: ' + newDate.toUTCString() + '</div>';
						text += '<div class="url">url: ' + posts.values[j].siteGroupPostUrl + '</div>';
						text += '</div>';
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