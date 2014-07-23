
function showKeywordList() {
	if (isDefined(settings) && isDefined(settings.words)) {
		$("#keywords").empty();

		for (var i = 0; i < settings.words.length; i++) {
			$("#keywords").append('<li class="list-group-item">' + settings.words[i] + 
				'<a href="#" onclick="onDeleteClick(' + i + ');" class="delete_keyword_link"><span class="glyphicon glyphicon-trash" style="text-align:right;"></span></a></li>');
		}
	}
}

function onDeleteClick(index) {
	deleteKeyword(index);
	return false;
}

function deleteKeyword(index) {
	if (isDefined(index)) {
		if (isDefined(settings) && isDefined(settings.words))
			delete settings.words.splice(index, 1);

		writeSettings();
		showKeywordList();
	}
}

function addKeyword() {
	var keyword = $("#keyword").val().toLowerCase();
	
	if (isDefined(keyword) && keyword.length !== 0) {
		if (isDefined(settings) && isDefined(settings.words) &&
			!settings.words.some(
				function (element) {
					return (element === keyword);
				}
			))
			settings.words.push(keyword);

		writeSettings();
		showKeywordList();
	}
}

function fillKeywords() {
	readSettings();
	showKeywordList();
}