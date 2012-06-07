(function($) {

	$('.gl-popup').remove();

	var popup = $('\
		<div class="gl-popup">\
			<div class="gl-header">\
				<div id="gl_user_id"></div>\
				<div class="gl-clickable" id="gl_left"></div>\
				<div class="gl-clickable" id="gl_refresh"></div>\
				<div class="gl-clickable" id="gl_right"></div>\
				<div class="gl-clickable" id="gl_close"></div>\
				<div id="gl_at_work"></div>\
			</div>\
			<div class="gl-content">\
				<div id="gl_timesheet_range">\
					Timesheet from <input id="gl_src" type="text" /> to <input id="gl_dst" type="text" /> <div class="gl-clickable" id="gl_go"></div>\
				</div>\
				<div id="gl_table_content">\
				</div>\
			</div>\
		</div>\
	').appendTo('body').draggable({ cancel: '.gl-header, .gl-content', cursor: 'move', stop: handleDragStop }).css('position', 'fixed');

	var offset = 0;
	var content = popup.find('#gl_table_content');
	var selector = popup.find('#gl_user_id').userSelector({ callback: updateUser }).data('userSelector');
	var atWork = popup.find('#gl_at_work').hide();
	var daySrc = popup.find('#gl_src').dateinput().data('dateinput');
	var dayDst = popup.find('#gl_dst').dateinput().data('dateinput');

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

		gl.api.userInfo(user.id, date1, date2, handleSuccess, handleError);
	}

	//////////////////////////////////////////////////////////////////////
	function handleSuccess(info) {
		/*var html = '<table>';
		html += '<tr>';
		html += '<th style="width: 120px;">Дата</th>';
		html += '<th style="width: 75px;">Час</th>';
		html += '<th style="width: 75px;">Оракл</th>';
		html += '</tr>';
		for (var index = 0; index < info.length; ++index) {
			var date = new Date(info[index].date);
			date = sprintf('%02d.%02d.%04d', date.getDate(), date.getMonth() + 1, date.getFullYear());

			html += '<tr>';
			html += '<td>' + ((index != info.length - 1) ? date : '<b>Total</b>') + '</td>';
			html += '<td>' + info[index].time + '</td>';
			html += '<td>' + info[index].oracle + '</td>';
			html += '</tr>';
		}
		html += '</table>';*/

		var html = '<table cellspacing="0" cellpadding="0">';

		html += '<tr>';
		html += '<th>Date</th>';
		for (var index = 0; index < info.length; ++index) {
			var date = new Date(info[index].date);
			date = sprintf('%02d.%02d', date.getDate(), date.getMonth() + 1);
			html += '<th class="' + (info[index].isToday ? 'gl-today' : '') + '">' + ((index < info.length - 1) ? date : 'Total') + '</th>';
		}
		html += '</tr>';

		html += '<tr>';
		html += '<th>Time</th>';
		for (var index = 0; index < info.length; ++index) {
			html += '<td class="' + (info[index].isToday ? 'gl-today' : '') + '">' + info[index].time + '</td>';
		}
		html += '</tr>';

		html += '<tr>';
		html += '<th>Oracle</th>';
		for (var index = 0; index < info.length; ++index) {
			html += '<td class="' + (info[index].isToday ? 'gl-today' : '') + '">' + info[index].oracle + '</td>';
		}
		html += '</tr>';

		html += '<tr>';
		html += '<th>Diff</th>';
		for (var index = 0; index < info.length; ++index) {
			var days = (index < info.length - 1) ? 1 : (info.length - 1);

			var diff = parseInt(info[index].totalMin - days * 8 * 60);
			var time = sprintf('%02d:%02d', Math.abs(diff / 60), Math.abs(diff % 60));

			html += '<td class="' + ((diff >= 0) ? 'gl-positive' : 'gl-negative') + ' ' + (info[index].isToday ? 'gl-today' : '') + '">' + time + '</td>';
		}
		html += '</tr>';

		html += '</table>';

		content.html(html);
	}

	//////////////////////////////////////////////////////////////////////
	function handleError(error) {
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

})(jQuery);