$(document).ready(function() {

	var apply = $('#apply').button();
	var selector = $('#user_id').userSelector().data('userSelector');
//	var login = $('#login');
//	var password = $('#password');

	//////////////////////////////////////////////////////////////////////
/*	gl.db.getCredentials(function(l, p) {
		login.val(l);
		password.val(p);
	});*/

	//////////////////////////////////////////////////////////////////////
	apply.click(function() {
		var user = selector.user();

		gl.db.setUserId((user != null) ? user.id : -1);
		//gl.db.setCredentials(login.val(), password.val());

		chrome.tabs.getCurrent(function (tab) {
			chrome.tabs.remove(tab.id);
		});
	});

	//////////////////////////////////////////////////////////////////////
	gl.version.get(function(version) {
		$('#version').text(version);
	});

});
