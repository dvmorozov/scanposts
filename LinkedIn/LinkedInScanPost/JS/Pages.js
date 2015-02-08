// ReSharper disable UseOfImplicitGlobalInFunctionScope
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
		if (event.origin === 'http://mobile.townbreath.com') {
			if (typeof event.data === "number")
				resizeIframe(event.data);
			else if (typeof event.data === "string") {
				openUrl(event.data);
			}
		}
	};

	window.addEventListener('message', messageEventHandler, false);
	console.log('init message handling');
}

function linkedInLogoutClick() {
	document.getElementById('iframe').contentWindow.postMessage('linkedInLogout', 'http://mobile.townbreath.com');
}

function linkedInFindMoreClick() {
	document.getElementById('iframe').contentWindow.postMessage('linkedInFindMore', 'http://mobile.townbreath.com');	
}
// ReSharper restore UseOfImplicitGlobalInFunctionScope
