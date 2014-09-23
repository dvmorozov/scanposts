
function showKeywordList() {
	if (isDefined(settings) && isDefined(settings.words)) {
		$("#keywords").empty();

		for (var i = 0; i < settings.words.length; i++) {
			$("#keywords").append(
				'<li class="list-group-item">' +
					'<div class="input-group">' +
						'<span class="input-group-btn">' +
							'<button type="button" class="btn btn-default" onclick="onDeleteClick(' + i + ');">' +
								'<span class="glyphicon glyphicon-trash"></span>' +
							'</button>' +
							'<span style="font-size: medium; vertical-align: middle; margin-left: 10px;">' + settings.words[i] + '</span>' +
						'</span>' +
					'</div>' +
				'</li>'
			);
		}
	}
	updateParentHeight();
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

function pushKeyword(keyword) {
	keyword = keyword.trim();
	
	if (isDefined(settings) && isDefined(settings.words) && keyword.length !== 0 &&
		!settings.words.some(
			function (element) {
				return (element === keyword);
			}
		))
		settings.words.push(keyword);
}

function addKeyword() {
	var keyword = $("#keyword").val().toLowerCase().trim();

	if (isDefined(keyword) && keyword.length !== 0) {

		//	Checks for a few keywords.
		var list = keyword.split(" ");
		if (list.length !== 0) {
			for (var item in list) {
				pushKeyword(list[item]);
			}
		} else pushKeyword(keyword);

		writeSettings();
		showKeywordList();
	}
}

function fillKeywords() {
	readSettings();
	showKeywordList();
}
