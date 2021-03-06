(function($) {

	var currentVersion = '';
	var isLatestVestion = true;

	window.gl = window.gl || {};

	//////////////////////////////////////////////////////////////////////
	// Interface
	//////////////////////////////////////////////////////////////////////
	window.gl.version = {

		//////////////////////////////////////////////////////////////////////
		get: function(callback) {
			gl.invoke('version', 'get', [], callback);
		}
	};

	//////////////////////////////////////////////////////////////////////
	// Core
	//////////////////////////////////////////////////////////////////////
	window.gl.version.core = {

		//////////////////////////////////////////////////////////////////////
		get: function(callback) {
			$.ajax({
				type: 'GET',
				url: 'manifest.json',
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					console.debug(data);
					callback(data.version);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.debug(textStatus + ' ' + errorThrown);
					callback('unknown');
				}
			});
		}
	};

})(jQuery);