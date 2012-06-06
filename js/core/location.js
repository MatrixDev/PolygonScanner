(function($) {

	window.gl = window.gl || {};

	//////////////////////////////////////////////////////////////////////
	// Location
	//////////////////////////////////////////////////////////////////////
	window.gl.location = {

		all: [
			{ name: 'Lviv', url: 'http://portal-ua.globallogic.com/polygon-lviv/' },
			{ name: 'Kyiv', url: 'http://portal-ua.globallogic.com/polygon/' },
			{ name: 'Kharkiv', url: 'https://portal-ua.globallogic.com/polygon-kharkiv/' }
		],

		//////////////////////////////////////////////////////////////////////
		get: function(key) {
			key = key.toLowerCase();
			for (var index = 0; index < this.all.length; ++index) {
				if (key == this.all[index].name.toLowerCase()) {
					return this.all[index];
				}
			}
			return this.all[0];
		}

	}

	//////////////////////////////////////////////////////////////////////
	// Core
	//////////////////////////////////////////////////////////////////////
	window.gl.location.core = {

		//////////////////////////////////////////////////////////////////////
		current: function() {
			var key = '';

			window.gl.db.core.getLocation(function(location) { key = location; });

			return window.gl.location.get(key);
		}

	}

})(jQuery);