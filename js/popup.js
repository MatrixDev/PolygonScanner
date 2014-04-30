// debugger;

(function($) {

	$('.gl-popup').remove();

	var hints = [
		'\'*\' contains some extraordinary event(s). Hover to see more information',
		'headers with date can be clicked to exclude day from total work time needed',
		'light-green background indicates a weekend, light-red background indicates excluded days',
		'<font color="#f00">NEW!</font> time distributions between different tasks can be set in the settings'
	];

	var popup = $('\
		<div class="gl-popup">\
			<div class="gl-header">\
				<div id="gl_user_id"></div>\
				<div class="gl-clickable" id="gl_left" title="Previous period"></div>\
				<div class="gl-clickable" id="gl_refresh" title="Reset to today"></div>\
				<div class="gl-clickable" id="gl_right" title="Next period"></div>\
				<div class="gl-clickable" id="gl_close"></div>\
				<div id="gl_at_work" title="At Work"></div>\
			</div>\
			<div class="gl-content">\
				<div id="gl_timesheet_range">\
					Timesheet from <input id="gl_src" type="text" /> to <input id="gl_dst" type="text" />\
					<div class="gl-clickable" id="gl_go" title="Show timesheet"></div>\
					<div class="gl-clickable" id="gl_fill" title="Auto-fill oracle timesheet"></div>\
				</div>\
				<div id="gl_table_content">\
				</div>\
				<div class="gl-footer">Hint: ' + hints[parseInt(Math.random() * 100, 10) % hints.length] + '</div>\
			</div>\
		</div>\
	').appendTo('body').draggable({ cancel: '.gl-header, .gl-content', cursor: 'move', stop: handleDragStop }).css('position', 'fixed');
	
	var offset = 0;
	var content = popup.find('#gl_table_content');
	var selector = popup.find('#gl_user_id').userSelector({ callback: updateUser }).data('userSelector');
	var atWork = popup.find('#gl_at_work').hide();
	var autoFill = popup.find('#gl_fill');
	var daySrc = popup.find('#gl_src').dateinput().data('dateinput');
	var dayDst = popup.find('#gl_dst').dateinput().data('dateinput');
	var timesheet = popup.find('#gl_table_content').timesheet().data('timesheet');

	enableTooltip(popup);

	if ($('#N57').size() == 0) {
		autoFill.hide();
	}

	//////////////////////////////////////////////////////////////////////
	function updateUser() {
		window.gl.user.isAtWork(selector.user().id, function(is) {
			atWork[is ? 'fadeIn' : 'fadeOut']();
		}, function() {
			atWork.fadeOut();
		});

		updateRange();
	}

	//////////////////////////////////////////////////////////////////////
	function updateRange() {
		var msInDay = 24 * 60 * 60 * 1000;
		var day1, day2;

		var today = new Date(new Date().getTime() + 15 * offset * msInDay);
		if (today.getDate() <= 15) {
			day1 = 1;
			day2 = 15;
		} else {
			day1 = 16;
			day2 = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
		}

		daySrc.setValue(new Date(today.getFullYear(), today.getMonth(), day1));
		dayDst.setValue(new Date(today.getFullYear(), today.getMonth(), day2));

		updateTimesheet();
	}

	//////////////////////////////////////////////////////////////////////
	function updateTimesheet() {
		content.empty();

		var user = selector.user();
		var date1 = daySrc.getValue();
		var date2 = dayDst.getValue();

		gl.api.userInfo(user.id, date1, date2, handleTimesheetSuccess, handleTimesheetError);
	}

	//////////////////////////////////////////////////////////////////////
	function handleTimesheetSuccess(infos) {
		timesheet.updateInfos(infos);
	}

	//////////////////////////////////////////////////////////////////////
	function handleTimesheetError(error) {
		content.html(error);
	}

	//////////////////////////////////////////////////////////////////////
	function handleDragStop(event, ui) {
		var eTop = ui.helper.offset().top;
	    var wTop = $(window).scrollTop();
	    var top = eTop - wTop;

        ui.helper.css('position', 'fixed');
        ui.helper.css('top', top + "px");
	}

	//////////////////////////////////////////////////////////////////////
	function enableTooltip(root) {
		root.find('[title]').tooltip({ tipClass: 'gl-tooltip', position: 'bottom center', effect: 'fade', offset: [10, 0], predelay: 500 });
	}

	//////////////////////////////////////////////////////////////////////
	popup.find('#gl_close').click(function() {
		popup.remove();
	});

	//////////////////////////////////////////////////////////////////////
	popup.find('#gl_left').click(function() {
		offset--;
		updateRange();
	});

	//////////////////////////////////////////////////////////////////////
	popup.find('#gl_right').click(function() {
		offset++;
		updateRange();
	});

	//////////////////////////////////////////////////////////////////////
	popup.find('#gl_refresh').click(function() {
		offset = 0;
		updateRange();
	});

	//////////////////////////////////////////////////////////////////////
	popup.find('#gl_go').click(function() {
		updateTimesheet();
	});

	//////////////////////////////////////////////////////////////////////
	autoFill.click(function() {
		var timeSelect = $('#N57');
		if (timeSelect.size() == 0) {
			return;
		}

		var timeRange = timeSelect.val();
		var src = new Date(
			parseInt(timeRange.substr(0, 4), 10),
			parseInt(timeRange.substr(5, 2), 10) - 1,
			parseInt(timeRange.substr(8, 2), 10)
		);
		var dst = new Date(
			parseInt(timeRange.substr(11, 4), 10),
			parseInt(timeRange.substr(16, 2), 10) - 1,
			parseInt(timeRange.substr(19, 2), 10)
		);

		gl.api.userInfo(selector.user().id, src, dst, function(infos) {
			gl.db.getTimeWraps(function(wraps) {

				var baseId = '#B22_';

				// clear
				for (var dayIndex = 0; dayIndex < 30; ++dayIndex) {
					for (var taskIndex = 0; taskIndex < 30; ++taskIndex) {
						$(baseId + taskIndex + '_' + dayIndex).val('');
					}
				}

				for (var infoIndex = 0; infoIndex < infos.length; ++infoIndex) {
					var info = infos[infoIndex];
					if (!info.date) {
						continue;
					}

					var dayIndex = new Date(info.date).getDay();
					var offset = Math.round((info.date - src.getTime()) / (24 * 60 * 60 * 1000));

					// Calculating total weight

					var weightTotal = 0;
					for (var taskIndex = 0; taskIndex < wraps.length; ++taskIndex) {
						var weight = parseInt(wraps[taskIndex][dayIndex], 10);
						if (!isNaN(weight)) {
							weightTotal += weight;
						}
					}

					// Calculating time per task

					var timeLeft = info.oracle;
					var timePerTask = new Array(wraps.length);

					for (var taskIndex = 0; taskIndex < wraps.length; ++taskIndex) {
						var weight = parseInt(wraps[taskIndex][dayIndex], 10);
						if (isNaN(weight)) {
							continue;
						}

						var time = Math.floor(info.oracle * weight / weightTotal * 100) / 100;
						timeLeft -= time;
						timePerTask[taskIndex] = time;
					}

					// Adding left time for more precision

					for (var taskIndex = timePerTask.length - 1; taskIndex >= 0; --taskIndex) {
						if (!isNaN(timePerTask[taskIndex])) {
							timePerTask[taskIndex] += timeLeft;
							break;
						}
					}

					// Filling the form

					for (var taskIndex = 0; taskIndex < timePerTask.length; ++taskIndex) {
						if (!isNaN(timePerTask[taskIndex])) {
							$(baseId + (taskIndex + 1) + '_' + offset).val(timePerTask[taskIndex].toFixed(2));
						}
					}
				}

			});
		}, function(error) {
			alert('failed to fetch data from polygon: ' + error);
		});
	});

})(jQuery);