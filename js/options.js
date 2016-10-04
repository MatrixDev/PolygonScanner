$(document).ready(function() {

	var controls = {
		apply:		$('#apply').button(),
		selector:	$('#user_id').userSelector().data('userSelector'),
		location:	$('#location'),
		login:		$('#login'),
		password:	$('#password'),

		timewrap:	$('#time_wrap').timewrap().data('timewrap')
	};

	//////////////////////////////////////////////////////////////////////
	gl.db.getCredentials(function(login, password) {
		controls.login.val(login);
		controls.password.val(password);
	});

	//////////////////////////////////////////////////////////////////////
	$.each(window.gl.location.all, function(index, value) {
		controls.location.append($('<option></option>').attr('value', value.name).text(value.name));
	});

	//////////////////////////////////////////////////////////////////////
	gl.db.getLocation(function(location) {
		controls.location.find('[value="' + location + '"]').attr('selected', 'selected');
	});

	//////////////////////////////////////////////////////////////////////
	gl.version.get(function(version) {
		$('#version').text(version);
	});

	//////////////////////////////////////////////////////////////////////
	controls.apply.click(function() {
		var user = controls.selector.user();

		gl.db.setUser(user);
		gl.db.setLocation(controls.location.val());
		gl.db.setCredentials(controls.login.val(), controls.password.val());

		if (user != null) {
			chrome.tabs.getCurrent(function (tab) {
				chrome.tabs.remove(tab.id);
			});
		} else {
			controls.selector.root().click();
		}
	});

});
