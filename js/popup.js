(function($) {

	$('.gl-popup').remove();

	var popup = $('\
		<div class="gl-popup">\
			<div class="gl-header">\
				<div id="gl_left"></div>\
				<div id="gl_right"></div>\
				<div id="gl_close"></div>\
				<div id="gl_user_id"></div>\
			</div>\
			<div id="gl_content"></div>\
		</div>\
	').appendTo('body').draggable();

	var offset = 0;
	var content = popup.find('#gl_content');
	var selector = popup.find('#gl_user_id').userSelector({ callback: update }).data('userSelector');

	//////////////////////////////////////////////////////////////////////
	function update() {
		content.empty();

		var user = selector.user();
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

		var date1 = new Date(today.getFullYear(), today.getMonth(), day1).getTime();
		var date2 = new Date(today.getFullYear(), today.getMonth(), day2).getTime();

		gl.api.userInfo(user.id, date1, date2, handleSuccess, handleError);

		/*gl.db.getDaysCount(function(count) {
			var msInDay = 24 * 60 * 60 * 1000;

			var date2 = new Date().getTime();
			var date1 = date2 - count * msInDay;

			gl.api.userInfo(user.id, date1, date2, handleSuccess, handleError);
		});*/
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
	popup.find('#gl_close').click(function() {
		popup.remove();
	});

	//////////////////////////////////////////////////////////////////////
	popup.find('#gl_left').click(function() {
		offset--;
		update();
	});

	//////////////////////////////////////////////////////////////////////
	popup.find('#gl_right').click(function() {
		offset++;
		update();
	});

})(jQuery);