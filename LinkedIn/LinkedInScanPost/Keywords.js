
function showKeywordList() {
	if (isDefined(settings) && isDefined(settings.words)) {
		$("#keywords").empty();

		for (var i = 0; i < settings.words.length; i++) {
			$("#keywords").append( '<li class="list-group-item">' + settings.words[i] + '</li>');
		}
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