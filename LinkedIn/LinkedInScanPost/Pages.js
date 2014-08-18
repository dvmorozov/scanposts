﻿
function openUrl(url) {
	var win = window.open(url, '_blank');
	win.focus();
	console.log('openUrl: ' + url);
}

function initMessageHandling() {

	function resizeIframe(data) {
		document.getElementById('iframe').style.height = data + 'px';
		console.log('resizeIframe: ' + data);
	}

	var messageEventHandler = function (event) {
		if (event.origin === 'http://stat.townbreath.com') {
			if (typeof event.data === "number")
				resizeIframe(event.data);
			else if (typeof event.data === "string")
				openUrl(event.data);
		}
	};

	window.addEventListener('message', messageEventHandler, false);
	console.log('init message handling');
}

function linkedInLogoutClick() {
	document.getElementById('iframe').contentWindow.postMessage('linkedInLogout', 'http://stat.townbreath.com');
}
