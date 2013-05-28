(function($) {

	var plugin = 'timesheet';

	$.custom = $.custom || { version: '1.0' };
	$.custom[plugin] = {
		conf: {
		}
	};

	//////////////////////////////////////////////////////////////////////
	function Instance(root, conf) {
		var self = this;
		var infos = [];

		//////////////////////////////////////////////////////////////////////
		// Public
		//////////////////////////////////////////////////////////////////////
		self.updateInfos = function(val) {
			infos = val;

			render();
		};

		//////////////////////////////////////////////////////////////////////
		// Private
		//////////////////////////////////////////////////////////////////////
		function render() {
			var table = $('<table cellspacing="0" cellpadding="0"></table>').addClass('gl-timesheet').appendTo(root.empty());

			var tr = {
				date:	$('<tr><th>Date</th></tr>').appendTo(table),
				time:	$('<tr><th>Time</th></tr>').appendTo(table),
				oracle:	$('<tr><th>Oracle</th></tr>').appendTo(table),
				diff:	$('<tr><th>Diff</th></tr>').appendTo(table)
			};

			for (var index = 0; index < infos.length; ++index) {
				var info = infos[index];

				newCell(tr.time, info, info.time);
				newCell(tr.oracle, info, info.oracle);

				//////////////////////////////////////////////////////////////////////
				// DATE
				//////////////////////////////////////////////////////////////////////
				var date;
				if (index < infos.length - 1) {
					date = new Date(info.date);
					date = sprintf('%02d.%02d', date.getDate(), date.getMonth() + 1);
					if (info.events.length > 0) {
						date += '*';
					}
				} else {
					date = 'Total';
				}

				var cell = $('<th></th>').addClass('gl-date').text(date).appendTo(tr.date);
				if (info.events.length > 0) {
					cell.attr('title', info.events.join('\n'));
				}
				enableExclude(cell, info);

				//////////////////////////////////////////////////////////////////////
				// DIFF
				//////////////////////////////////////////////////////////////////////
				var diff;
				if (index < infos.length - 1) {
					diff = parseInt(info.totalMin - 8 * 60, 10);
				} else {
					diff = parseInt(info.totalMin);
					for (var i = 0; i < infos.length - 1; ++i) {
						if (!infos[i].isExcluded) diff -= 8 * 60;
					}
				}
				var time = sprintf('%02d:%02d', Math.abs(diff / 60), Math.abs(diff % 60));
				var diffCls = (diff >= 0) ? 'gl-positive' : 'gl-negative';

				newCell(tr.diff, info, time).addClass(diffCls);
			}
		}

		//////////////////////////////////////////////////////////////////////
		function enableExclude(cell, info) {
			cell.click(function() {
				info.isExcluded = !info.isExcluded;
				render();
			});
		}

		//////////////////////////////////////////////////////////////////////
		function newCell(parent, info, text) {
			cell = $('<td></td>').text(text).appendTo(parent);
			if (info.isToday) {
				cell.addClass('gl-today');
			} else if (info.isExcluded) {
				cell.addClass('gl-excluded');
			} else if (info.isWeekend) {
				cell.addClass('gl-weekend');
			}
			return cell;
		}
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