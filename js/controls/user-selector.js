(function($) {

	var plugin = 'userSelector';

	$.custom = $.custom || { version: '1.0' };
	$.custom[plugin] = {
		conf: {
			callback: null
		}
	};

	//////////////////////////////////////////////////////////////////////
	function Instance(root, conf) {
		var self = this;
		var currentUser = null;
		var actionHandler = null;
		var text = $('<input type="text" />').appendTo(root);

		//////////////////////////////////////////////////////////////////////
		// Public
		//////////////////////////////////////////////////////////////////////
		self.user = function() {
			return currentUser;
		};

		//////////////////////////////////////////////////////////////////////
		// Private
		//////////////////////////////////////////////////////////////////////
		function CTOR() {
			gl.db.getUserId(function(id) {
				if (id >= 0) {
					loadUser(id);
				} else {
					loadUsers();
				}
			});
		}

		//////////////////////////////////////////////////////////////////////
		function loadUser(id) {
			update(null, 'gl-loading', 'Searching...', null);

			gl.user.get(id, showUser, showError);
		}

		//////////////////////////////////////////////////////////////////////
		function loadUsers() {
			update(null, 'gl-loading', 'Loading...', null);

			gl.user.all(function(users) {

				var source = [];
				for (var index = 0; index < users.length; ++index) {
					source.push({ label: users[index].name, data: users[index] });
				}

				text.autocomplete({
					source: source,
					select: function(event, ui) {
						showUser(ui.item.data);
					}
				});

				update(null, 'gl-search', null, null);

			}, showError);
		}

		//////////////////////////////////////////////////////////////////////
		function showError(error) {
			update(null, 'gl-reload', error, loadUsers);
		}

		//////////////////////////////////////////////////////////////////////
		function showUser(user) {
			update(user, 'gl-edit', user.name, loadUsers);
		}

		//////////////////////////////////////////////////////////////////////
		function update(user, cls, message, handler) {
			currentUser = user;
			if (conf.callback && currentUser != null) {
				conf.callback(currentUser);
			}

			actionHandler = handler;

			var finalClass = 'gl-user-selector gl-clickable';
			if (cls != null && cls.length > 0) {
				finalClass += ' ' + cls;
			}

			root.attr('class', finalClass).css('cursor', (actionHandler != null) ? 'pointer' : 'default');

			text.val((message != null) ? message : '');
			
			if (cls == 'gl-search') {
				text.removeAttr('disabled');
			} else {
				text.attr('disabled', 'disabled');
			}
		}

		//////////////////////////////////////////////////////////////////////
		// Events
		//////////////////////////////////////////////////////////////////////
		root.click(function() {
			if (actionHandler != null) {
				actionHandler();
			}
		});

		CTOR();
	}

	//////////////////////////////////////////////////////////////////////
	$.fn[plugin] = function(conf) {
		
		this.each(function() {
			var element = $(this);
			if (element.data(plugin)) {
				return;
			}
			
			elementConf = $.extend({}, $.custom[plugin].conf, conf);
			element.data(plugin, new Instance(element, elementConf));
		});
		
		return this; 
	};

})(jQuery);