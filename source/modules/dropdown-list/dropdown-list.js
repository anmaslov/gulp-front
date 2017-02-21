// dropdown-list
(function($) {

	var $dropdownLists = $('.dropdown-list');

	if ($dropdownLists.isset()) {
		$dropdownLists.each(function() {
			var $dropdownList = $(this);
			var $item = $dropdownList.find('.dropdown-list__item');
			var $dropdown = $dropdownList.parents('.dropdown');
			var $dropdownTrigger = $dropdown.find('.dropdown__trigger');

			$item.on('click', function(event) {
				event.preventDefault();
				var $thisItem = $(this);
				var itemText = $thisItem.text();

				console.log(itemText);

				$dropdown.data('plugin_dropdown').close();
			});
		});
	}

})(jQuery);
