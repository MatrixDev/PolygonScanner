(function($) {

	$('.gl-popup').remove();

	if ($('.gl-popup').size() > 0) return;

	var popup = $('\
		<div class="gl-popup">\
			<div id="gl_user_id"></div>\
			<div id="gl_content"></div>\
		</div>\
	').appendTo('body').draggable();

	var content = popup.find('#gl_content');
	var selector = popup.find('#gl_user_id').userSelector({ callback: handleUserChange }).data('userSelector');

	//////////////////////////////////////////////////////////////////////
	function handleUserChange(user) {
		gl.db.getDaysCount(function(count) {
			var msInDay = 24 * 60 * 60 * 1000;

			var date2 = new Date().getTime();
			var date1 = date2 - count * msInDay;

			gl.api.userInfo(user.id, date1, date2, handleSuccess, handleError);
		});
	}

	//////////////////////////////////////////////////////////////////////
	function handleSuccess(info) {
		var html = '<table>';
		html += '<tr>';
		html += '<th style="width: 200px;">Дата</th>';
		html += '<th style="width: 75px;">Час</th>';
		html += '<th style="width: 75px;">Оракл</th>';
		html += '</tr>';
		for (var index = 0; index < info.length; ++index) {
			html += '<tr>';
			html += '<td>' + ((index != info.length - 1) ? info[index].date : '<b>Total</b>') + '</td>';
			html += '<td>' + info[index].time + '</td>';
			html += '<td>' + info[index].oracle + '</td>';
			html += '</tr>';
		}
		html += '</table>';

		content.html(html);
	}

	//////////////////////////////////////////////////////////////////////
	function handleError(error) {
		content.html(error);
	}

})(jQuery);