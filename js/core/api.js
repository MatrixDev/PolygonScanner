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
		userInfo: function(user, dateSrc, dateDst, success, error) {
			dateSrc = new Date(dateSrc).getTime();
			dateDst = new Date(dateDst).getTime();

			gl.invoke('api', 'userInfo', [user, dateSrc, dateDst], function(result, data) {
				if (result) {
					if (success) success(data);
				} else {
					if (error) error(data);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////
		userIsAtWork: function(user, success, error) {
			gl.invoke('api', 'userIsAtWork', [user], function(result, data) {
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
			get('employees.php', {}, function(success, data) {
				if (!success) {
					if (callback != null) callback(false, data);
					return;
				}

				data = JSON.parse(data);
				
				var users = [];
				for (var index = 0; index < data.length; ++index) {
					var user = data[index];
					var id = user.uid;
					var zone = user.zone;
					var name = user.first_name + ' ' + user.last_name;
					users.push(gl.user(id, name, zone));
				}
				
				if (callback != null) callback(true, users);
			});
		},

		//////////////////////////////////////////////////////////////////////
		userInfo: function(user, dateSrc, dateDst, callback) {
			dateSrc = new Date(dateSrc);
			dateDst = new Date(dateDst);

			data = {
				zone: user.zone,
				employeeId: user.id,
				from: dateSrc.getTime(),
				till: dateDst.getTime()
			}

			console.log(user);

			get('events.php', data, function(success, data) {
				if (!success) {
					if (callback) callback(false, data);
					return;
				}

				var dayInfo;
				var dayInfos = [];
				var lastDate = 0;
				var lastInTime = 0;
				var array = JSON.parse(data);

				// Parsing json
				for (var index = 0; index < array.length; ++index) {
					var json = array[index];
					var entered = json.direction == 'in';
					var datetime = new Date(json.timestamp);
					var datetimeTS = datetime.getTime();
					var date = new Date(datetime.toDateString());
					var dateTS = date.getTime();

					// Skip non-working trackers
					if (!json.working) {
						continue;
					}

					// New changed
					if (lastDate != dateTS) {
						if (lastInTime != 0) {
							dayInfo.events.push('still in office');
							// TODO add time
						}
						lastInTime = 0;
						lastDate = dateTS;

						dayInfos.push(dayInfo = {
							events: [],
							totalMin: 0,
							date: date.toDateString(),
							isToday: new Date().toDateString() == date.toDateString(),
							isWeekend: (date.getDay() == 0) || (date.getDay() == 6)
						});
					}

					// Calculating time
					if (entered) {
						if (lastInTime != 0) {
							dayInfo.events.push('Entered office without exiting');
						}
						lastInTime = datetimeTS;
					} else {
						if (lastInTime == 0) {
							dayInfo.events.push('Left office without entering');
						} else {
							dayInfo.totalMin += (datetimeTS - lastInTime) / (60 * 1000);
							lastInTime = 0;
						}
					}
				}

				// Generating total time
				if (dayInfos.length > 0) {
					dayInfos.push(dayInfo = { events: [], totalMin: 0 });
					for (var index = 0; index < dayInfos.length - 1; ++index) {
						dayInfo.totalMin += dayInfos[index].totalMin;
					}
				}

				// Generating time/oracle strings
				for (var index = 0; index < dayInfos.length; ++index) {
					dayInfo = dayInfos[index];

					var hours = parseInt(dayInfo.totalMin / 60, 10);
					var minutes = parseInt(dayInfo.totalMin % 60, 10);
					var oracle = parseInt(minutes * 100 / 60, 10);

					dayInfo.time = sprintf('%02d:%02d', hours, minutes);
					dayInfo.oracle = sprintf('%02d.%02d', hours, oracle);
				}

				callback(true, dayInfos);
			});
		},

		//////////////////////////////////////////////////////////////////////
		userIsAtWork: function(user, callback) {
			data = {
				zone: user.zone,
				employeeId: user.id
			}

			get('last_seen.php', data, function(success, data) {
				if (!success) {
					if (callback) callback(false, data);
					return;
				}

				var json = JSON.parse(data);

				var date = new Date(json.timestamp);
				date = new Date(date.toDateString());
				date = date.getTime();

				var today = new Date();
				today = new Date(today.toDateString());
				today = today.getTime();

				callback(true, today == date && json.direction == 'in');
			});
		}
	};

	//////////////////////////////////////////////////////////////////////
	// Helpers
	//////////////////////////////////////////////////////////////////////
	function get(url, data, callback) {
		send('GET', url, data, callback);
	}

	//////////////////////////////////////////////////////////////////////
	function post(url, data, callback) {
		send('POST', url, data, callback);
	}

	//////////////////////////////////////////////////////////////////////
	function send(method, url, data, callback) {
		var credentials = null;
		window.gl.db.core.getCredentials(function(login, password) {
			if (login.length > 0 && password.length > 0) {
				credentials = { login: login, password: password };
			}
		});

		$.ajax({
			url: 'https://portal-ua.globallogic.com/officetime/json/' + url,
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

})(jQuery);
