//////////////////////////////////////////////////////////////////////
chrome.browserAction.onClicked.addListener(function(tab) {

	var css = [
		'css/jquery-ui-1.8.20.custom.css',
		'css/jquery-tools/dateinput.css',
		'css/jquery-tools/tooltip.css',
		'css/general.css',
		'css/user-selector.css',
		'css/timesheet.css',
		'css/popup.css'
	];

	var scripts = [
		'js/jquery/jquery.tools.min.js',
		'js/jquery/jquery-ui-1.8.20.custom.min.js',
		'js/core/gl.js',
		'js/core/db.js',
		'js/core/api.js',
		'js/core/user.js',
		'js/utils/base64.js',
		'js/utils/sprintf.js',
		'js/controls/user-selector.js',
		'js/controls/timesheet.js',
		'js/popup.js'
	];

	for (var index = 0; index < css.length; ++index) {
		chrome.tabs.insertCSS(tab.id, { file: css[index] });
	}

	for (var index = 0; index < scripts.length; ++index) {
		chrome.tabs.executeScript(tab.id, { file: scripts[index] });
	}

});

//////////////////////////////////////////////////////////////////////
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

	request.args.push(function() {
		var array = [];
		for (var index = 0; index < arguments.length; ++index) {
			array.push(arguments[index]);
		}
		sendResponse({ args: array });
	});

	gl[request.component].core[request.func].apply(window, request.args);

});

//////////////////////////////////////////////////////////////////////
(function() {
	if (gl.db.core.getInstallTime()) return;

	gl.db.core.setInstallTime(new Date().getTime());

    chrome.tabs.create({ url: "options.html" });
})();
