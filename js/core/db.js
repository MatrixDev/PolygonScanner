(function($) {

	window.gl = window.gl || {};

	//////////////////////////////////////////////////////////////////////
	// Interface
	//////////////////////////////////////////////////////////////////////	
	window.gl.db = {

		//////////////////////////////////////////////////////////////////////
		getUser: function(callback) {
			gl.invoke('db', 'getUser', [], callback);
		},

		//////////////////////////////////////////////////////////////////////
		setUser: function(id) {
			gl.invoke('db', 'setUser', [id]);
		},

		//////////////////////////////////////////////////////////////////////
		getCredentials: function(callback) {
			gl.invoke('db', 'getCredentials', [], callback);
		},

		//////////////////////////////////////////////////////////////////////
		setCredentials: function(login, password) {
			gl.invoke('db', 'setCredentials', [login, password]);
		},

		//////////////////////////////////////////////////////////////////////
		getLocation: function(callback) {
			gl.invoke('db', 'getLocation', [], callback);
		},

		//////////////////////////////////////////////////////////////////////
		setLocation: function(location) {
			gl.invoke('db', 'setLocation', [location]);
		},

		//////////////////////////////////////////////////////////////////////
		getTimeMultiplier: function(callback) {
			gl.invoke('db', 'getTimeMultiplier', [], callback);
		},

		//////////////////////////////////////////////////////////////////////
		setTimeMultiplier: function(location) {
			gl.invoke('db', 'setTimeMultiplier', [location]);
		},

		//////////////////////////////////////////////////////////////////////
		getTimeWraps: function(callback) {
			gl.invoke('db', 'getTimeWraps', [], callback);
		},

		//////////////////////////////////////////////////////////////////////
		setTimeWraps: function(wraps) {
			gl.invoke('db', 'setTimeWraps', [wraps]);
		}

	};
	
	//////////////////////////////////////////////////////////////////////	
	// Core
	//////////////////////////////////////////////////////////////////////
	window.gl.db.core = {

		//////////////////////////////////////////////////////////////////////
		getUser: function(callback) {
			var user;
			try {
				user = JSON.parse(localStorage.user);
			} catch (e) {
			}
			if (user == null || typeof user != 'object') {
				user = undefined;
			}
			callback(user);
		},

		//////////////////////////////////////////////////////////////////////
		setUser: function(user) {
			localStorage.user = JSON.stringify(user);
		},

		//////////////////////////////////////////////////////////////////////
		getCredentials: function(callback) {
			var login = localStorage.login;
			var password = localStorage.password;
			
			if (isNonEmptyString(login) && isNonEmptyString(password)) {
				callback(login, password);
			} else {
				callback('', '');
			}
		},

		//////////////////////////////////////////////////////////////////////
		setCredentials: function(login, password) {
			if (login != null && password != null) {
				localStorage.login = login;
				localStorage.password = password;
			}
		},

		//////////////////////////////////////////////////////////////////////
		getLocation: function(callback) {
			var location = localStorage.location;

			if (isNonEmptyString(location)) {
				callback(location);
			} else {
				callback(window.gl.location.all[0].name);
			}
		},

		//////////////////////////////////////////////////////////////////////
		setLocation: function(location) {
			if (isNonEmptyString(location)) {
				localStorage.location = location;
			}
		},

		//////////////////////////////////////////////////////////////////////
		getTimeMultiplier: function(callback) {
			var timeMultiplier = parseFloat(localStorage.timeMultiplier);

			if (isNaN(timeMultiplier)) {
				callback(1.0)
			} else {
				callback(timeMultiplier);
			}
		},

		//////////////////////////////////////////////////////////////////////
		setTimeMultiplier: function(timeMultiplier) {
			var value = parseFloat(timeMultiplier);
			if (!isNaN(value)) {
				localStorage.timeMultiplier = value;
			}
		},

		//////////////////////////////////////////////////////////////////////
		getInstallTime: function() {
			return localStorage.installTime;
		},

		//////////////////////////////////////////////////////////////////////
		setInstallTime: function(time) {
			localStorage.installTime = time;
		},

		//////////////////////////////////////////////////////////////////////
		getTimeWraps: function(callback) {
			var wraps = JSON.parse(localStorage.timeWraps || '{}');
			if (!(wraps instanceof Array) || !(wraps[0] instanceof Array)) {
				wraps = [[1, 1, 1, 1, 1, 1, 1]];
			}
			callback(wraps);
		},

		//////////////////////////////////////////////////////////////////////
		setTimeWraps: function(wraps) {
			localStorage.timeWraps = JSON.stringify(wraps);
		}

	};

	//////////////////////////////////////////////////////////////////////
	// Helpers
	//////////////////////////////////////////////////////////////////////
	function isNonEmptyString(value) {
		return (typeof value == 'string') && value.length > 0;
	}

})(jQuery)
