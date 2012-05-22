(function($) {

	window.gl = window.gl || {};

	//////////////////////////////////////////////////////////////////////
	window.gl.invoke = function(component, func, args, callback) {
		chrome.extension.sendRequest({
			component: component,
			func: func,
			args: args
		}, function(response) {
			if (callback) callback.apply(this, response.args);
		});
	};

})(jQuery);
