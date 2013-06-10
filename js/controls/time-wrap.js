(function($) {

	var plugin = 'timewrap';

	$.custom = $.custom || { version: '1.0' };
	$.custom[plugin] = {
		conf: {
			count: 4,
			days: ['Sun', 'Mon', 'Tue', 'Web', 'Thu', 'Fri', 'Sat'],
			wrapsMin: 1,
			wrapsMax: 30
		}
	};

	//////////////////////////////////////////////////////////////////////
	function Instance(root, conf) {
		var self = this;

		//////////////////////////////////////////////////////////////////////
		// Private
		//////////////////////////////////////////////////////////////////////
		function render() {
			var table = $('<table cellspacing="0" cellpadding="5"></table>').addClass('gl-timewrap').appendTo(root.empty());

			var tr = $('<tr/>').appendTo(table);
			$('<th/>').text('#').appendTo(tr);
			$.each(conf.days, function(index, value) {
				$('<th/>').text(value).appendTo(tr);
			});
			newButton('gl-add-line').click(addLine).appendTo($('<th/>').appendTo(tr));

			for (var taskIndex = 0; taskIndex < conf.wraps.length; ++taskIndex) {
				var wrap = conf.wraps[taskIndex];

				var tr = $('<tr/>').appendTo(table);
				$('<td/>').text(taskIndex + 1).appendTo(tr);
				for (var dayIndex = 0; dayIndex < wrap.length; ++dayIndex) {
					var input = $('<input type="number" />').val(wrap[dayIndex]);
					input.appendTo($('<td/>').appendTo(tr));
					addChangeHandler(input, taskIndex, dayIndex);
				}
				newButton('gl-rem-line').click(removeLine(taskIndex)).appendTo($('<th/>').appendTo(tr));
			}
		}

		//////////////////////////////////////////////////////////////////////
		function newButton(cls) {
			return $('<div/>').addClass('gl-button').addClass('gl-clickable').addClass(cls);
		}

		//////////////////////////////////////////////////////////////////////
		function removeLine(task) {
			return function() {
				if (conf.wraps.length <= conf.wrapsMin) return;

				conf.wraps.splice(task, 1);

				save();

				render();
			}
		}

		//////////////////////////////////////////////////////////////////////
		function addLine() {
			if (conf.wraps.length >= conf.wrapsMax) return;

			conf.wraps.push(new Array(conf.days.length));

			save();

			render();
		}

		//////////////////////////////////////////////////////////////////////
		function addChangeHandler(input, task, day) {
			return input.change(function() {
				var val = parseInt(input.val(), 10);
				conf.wraps[task][day] = isNaN(val) ? null : val;
				save();
			});
		}

		//////////////////////////////////////////////////////////////////////
		function save() {
			gl.db.setTimeWraps(conf.wraps);
		}

		//////////////////////////////////////////////////////////////////////
		gl.db.getTimeWraps(function(wraps) {
			conf.wraps = wraps;

			render();
		});
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