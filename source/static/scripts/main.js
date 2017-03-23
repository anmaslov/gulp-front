'use strict';

var $ = require('jquery');

// Helpers
// require('./plugins/helpers/jquery.isset.js');

// Modules
var cache = {};

function importAll (r) {
	r.keys().forEach(key => cache[key] = r(key));
}

importAll(require.context('../../modules/', true, /^[^\_]*\.js/));



