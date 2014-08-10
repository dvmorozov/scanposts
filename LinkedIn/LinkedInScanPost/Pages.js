
function initMessageHandling() {

	function resizeIframe(data) {
		document.getElementById('iframe').style.height = data + 'px';
		console.log('resizeIframe: ' + data);
	}

	var messageEventHandler = function (event) {
		if (event.origin === 'http://stat.townbreath.com') {
			resizeIframe(event.data);
		}
	};

	window.addEventListener('message', messageEventHandler, false);
	console.log('init message handling');
}

function linkedInLogoutClick() {
	document.getElementById('iframe').contentWindow.postMessage('linkedInLogout', 'http://stat.townbreath.com');
}
