(function($) {

	window.gl = window.gl || {};

	//////////////////////////////////////////////////////////////////////
	// Interface
	//////////////////////////////////////////////////////////////////////
	window.gl.api = {

		//////////////////////////////////////////////////////////////////////
		users: function(success, error) {
			gl.invoke('api', 'users', [], function(result, data) {
				if (result) {
					if (success) success(data);
				} else {
					if (error) error(data);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////
		userInfo: function(id, dateFrom, dateTo, success, error) {
			gl.invoke('api', 'userInfo', [id, dateFrom, dateTo], function(result, data) {
				if (result) {
					if (success) success(data);
				} else {
					if (error) error(data);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////
		userIsAtWork: function(id, success, error) {
			gl.invoke('api', 'userIsAtWork', [id], function(result, data) {
				if (result) {
					if (success) success(data);
				} else {
					if (error) error(data);
				}
			});
		}

	};

	//////////////////////////////////////////////////////////////////////
	// Core
	//////////////////////////////////////////////////////////////////////
	window.gl.api.core = {

		//////////////////////////////////////////////////////////////////////
		users: function(callback) {
			get(null, function(success, data) {
				if (!success) {
					if (callback != null) callback(false, data);
					return;
				}

				var children = $(data).find('select[name="sid"]').children();
				
				var users = [];
				for (var index = 0; index < children.length; ++index) {
					var elem = $(children[index]);
					
					users.push(gl.user(elem.val(), elem.text()));
				}
				
				if (callback != null) callback(true, users);
			});
		},

		//////////////////////////////////////////////////////////////////////
		userInfo: function(id, dateSrc, dateDst, callback) {
			dateSrc = new Date(dateSrc);
			dateDst = new Date(dateDst);

			var postString = sprintf('sid=%d&from_y=%d&from_m=%d&from_d=%d&to_y=%d&to_m=%d&to_d=%d&action=showtime',
				id,
				dateSrc.getFullYear(),
				dateSrc.getMonth() + 1,
				dateSrc.getDate(),
				dateDst.getFullYear(),
				dateDst.getMonth() + 1,
				dateDst.getDate());
			
			post(postString, function(success, data) {
				if (!success) {
					if (callback) callback(false, data);
					return;
				}

				var info = [];
				var events = [];

				$(data).find('tr').parent().children().each(function(index, element) {
					if (index <= 0) return;

					var contents = $(element).contents().filter('th');
					if (contents.size() > 0) {
						var object = {
							events: events
						};
						parseDate(object, $(contents[5]).text());
						parseTime(object, $(contents[3]).text());
						info.push(object);

						events = [];
					} else {
						contents = $(element).contents().filter('td');
						var e = $(contents[5]).text();
						if (e && (e = e.replace(/^\s+|\s+$/g, '')).length > 0) {
							events.push(e);
						}
					}
				});
				
				callback(true, info);
			});
		},

		//////////////////////////////////////////////////////////////////////
		userIsAtWork: function(id, callback) {
			var today = new Date();

			var postString = sprintf('sid=%d&from_y=%d&from_m=%d&from_d=%d&to_y=%d&to_m=%d&to_d=%d&action=showtime',
				id,
				today.getFullYear(),
				today.getMonth() + 1,
				today.getDate(),
				today.getFullYear(),
				today.getMonth() + 1,
				today.getDate());
			
			post(postString, function(success, data) {
				if (!success) {
					if (callback) callback(false, data);
					return;
				}

				callback(true, data.indexOf('not exited, possibly still in office') >= 0);
			});
		}

	};

	//////////////////////////////////////////////////////////////////////
	// Helpers
	//////////////////////////////////////////////////////////////////////
	function get(data, callback) {
		send('GET', data, callback);
	}

	//////////////////////////////////////////////////////////////////////
	function post(data, callback) {
		send('POST', data, callback);
	}

	//////////////////////////////////////////////////////////////////////
	function send(method, data, callback) {
		var credentials = null;
		window.gl.db.core.getCredentials(function(login, password) {
			if (login.length > 0 && password.length > 0) {
				credentials = { login: login, password: password };
			}
		});

		$.ajax({
			url: window.gl.location.core.current().url,
			method: method,
			data: data,
			dataType: 'html',
			beforeSend: function(xhr) {
				if (credentials != null) {
					xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode(credentials.login + ':' + credentials.password));
				}
			},
			success: function(data) {
				callback(true, data);
			},
			error: function(xhr, textStatus, errorThrown) {
				callback(false, xhr.statusText + ' (' + textStatus + ')');
			}
		});
	}

	//////////////////////////////////////////////////////////////////////
	function parseDate(result, date) {
		result.date = Date.parse(date.substr('Total time on '.length));
		result.isToday = (new Date().toDateString() == new Date(result.date).toDateString());
	}

	//////////////////////////////////////////////////////////////////////
	function parseTime(result, time) {
		var parts = time.split(':');

		var total_min = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
		if (total_min < 0) {
			total_min = 0;
		}
		
		var hours = parseInt(total_min / 60, 10);
		var minutes = parseInt(total_min % 60, 10);
		var oracle = parseInt(minutes * 100 / 60, 10);

		result.totalMin = total_min;
		result.time = sprintf('%02d:%02d', hours, minutes);
		result.oracle = sprintf('%02d.%02d', hours, oracle);
	}

})(jQuery);
