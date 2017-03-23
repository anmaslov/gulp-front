// Avoid `console` errors in browsers that lack a console.
require('./helpers/console.polyfill.js');


// Jquery
var $ = require('jquery');


// FastclickJS
// Remove delay between a physical tap and the firing of a click event on mobile browsers.
var FastClick = require('fastclick');
$(function() {
	FastClick.attach(document.body);
});

// FastclickJS
// Remove delay between a physical tap and the firing of a click event on mobile browsers.
//= require fastclick/lib/fastclick.js


// SVG4Everybody
var svg4everybody = require('svg4everybody');
svg4everybody();


// Helpers
require('./plugins/helpers/jquery.isset.js');


// Basic table
// Responsive tables
require('./plugins/basictable/jquery.basictable.js');

$(function() {
	$('.table').basictable({ baseClass: 'table' });
});


// Remodal
var remodal = require('remodal');


// jquery-throttle-debounce
require('./plugins/jquery-throttle-debounce/jquery.ba-throttle-debounce.js');
