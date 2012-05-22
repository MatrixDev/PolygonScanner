$(document).ready(function() {

	var apply = $('#apply').button();
	var selector = $('#user_id').userSelector().data('userSelector');
	var login = $('#login');
	var password = $('#password');
	var daysCount = $('#days_count');

	//////////////////////////////////////////////////////////////////////
	gl.db.getCredentials(function(l, p) {
		login.val(l);
		password.val(p);
	});

	//////////////////////////////////////////////////////////////////////
	gl.db.getDaysCount(function(count) {
		daysCount.val(count);
	});

	//////////////////////////////////////////////////////////////////////
	apply.click(function() {
		var user = selector.user();

		gl.db.setUserId((user != null) ? user.id : -1);
		gl.db.setCredentials(login.val(), password.val());
		gl.db.setDaysCount(daysCount.val());

		chrome.tabs.getCurrent(function (tab) {
			chrome.tabs.remove(tab.id);
		});
	});

});
