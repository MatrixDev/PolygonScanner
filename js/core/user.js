(function($) {

	window.gl = window.gl || {};

	//////////////////////////////////////////////////////////////////////
	// User
	//////////////////////////////////////////////////////////////////////
	window.gl.user = function(id, name) {
		return { id: id, name: name };
	};

	//////////////////////////////////////////////////////////////////////
	window.gl.user.all = function(success, error) {
		gl.api.users(success, error);
	};

	//////////////////////////////////////////////////////////////////////
	window.gl.user.get = function(id, success, error) {
		gl.api.users(function(users) {
			for (var index = 0; index < users.length; ++index) {
				if (id == users[index].id) {
					return success(users[index]);
				}
			}
			error('user not found');
		}, error);
	};

	//////////////////////////////////////////////////////////////////////
	window.gl.user.isAtWork = function(id, success, error) {
		var today = new Date().getTime();

		window.gl.api.userIsAtWork(id, success, error);
	};

})(jQuery);