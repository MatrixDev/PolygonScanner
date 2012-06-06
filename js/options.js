$(document).ready(function() {

	var controls = {
		apply:		$('#apply').button(),
		selector:	$('#user_id').userSelector().data('userSelector'),
		location:	$('#location')
	};

//	var login = $('#login');
//	var password = $('#password');

	//////////////////////////////////////////////////////////////////////
/*	gl.db.getCredentials(function(l, p) {
		login.val(l);
		password.val(p);
	});*/

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

		gl.db.setUserId((user != null) ? user.id : -1);
		gl.db.setLocation(controls.location.val());
		//gl.db.setCredentials(login.val(), password.val());

		chrome.tabs.getCurrent(function (tab) {
			chrome.tabs.remove(tab.id);
		});
	});

});
