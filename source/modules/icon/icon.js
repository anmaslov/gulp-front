// icon
// (function(document){
// 	function ready(fn) {
// 		if (document.readyState !== 'loading'){
// 			fn();
// 		}
// 		else if (document.addEventListener) {
// 			document.addEventListener('DOMContentLoaded', fn);
// 		}
// 		else {
// 			document.attachEvent('onreadystatechange', function() {
// 				if (document.readyState !== 'loading') {
// 					fn();
// 				}
// 			});
// 		}
// 	}

// 	function request(url, success, error) {
// 		var request = new XMLHttpRequest();
// 		request.open('GET', url, true);

// 		request.onreadystatechange = function() {
// 			if (this.readyState === 4) {
// 				if (this.status >= 200 && this.status < 400) {
// 					// Success!
// 					success(this.responseText);
// 				}
// 				else {
// 					// Error :(
// 					error(this.responseText);
// 				}
// 			}
// 		};

// 		request.send();
// 		request = null;
// 	}



// 	ready(function(){
// 		var element = document.querySelector('meta[name="icons-sprite:url"]');
// 		var url = element && element.getAttribute("content");

// 		request(url, spriteSuccessHandler, spriteErrorHandler);

// 		function spriteSuccessHandler (res) {
// 			console.log(res);
// 		}

// 		function spriteErrorHandler (res) {
// 			console.log(res)
// 		}
// 	});

// })(document);





(function(doc, opt_nodes, domReady, opt_attributes) {
	/**
	 * @param {Element} svg
	 * @param {Element} e
	 * @return {undefined}
	 */
	function draw(svg, e) {
		if (e) {
			var styles = e.getAttribute("viewBox");
			/** @type {DocumentFragment} */
			var s = doc.createDocumentFragment();
			var endNode = e.cloneNode(true);
			if (styles) {
				svg.setAttribute("viewBox", styles);
			}
			for (;endNode.childNodes.length;) {
				s.appendChild(endNode.childNodes[0]);
			}
			svg.appendChild(s);
		}
	}
	/**
	 * @return {undefined}
	 */
	function ready() {
		var o = this;
		/** @type {Element} */
		var node = doc.createElement("x");
		var s = o.s;
		node.innerHTML = o.responseText;
		/**
		 * @return {undefined}
		 */
		o.onload = function() {
			s.splice(0).map(function(attrList) {
				draw(attrList[0], node.querySelector("#" + attrList[1].replace(/(\W)/g, "\\$1")));
			});
		};
		o.onload();
	}
	/**
	 * @return {undefined}
	 */
	function load() {
		console.log('load')
		var node;
		for (;node = opt_nodes[0];) {
			var p = node.parentNode;
			var file = node.getAttribute("xlink:href").split("#")[1];
			/** @type {string} */
			var element = document.querySelector('meta[name="icons-sprite:url"]');
			var url = element && element.getAttribute("content");
			p.removeChild(node);
			var self = opt_attributes[url] = opt_attributes[url] || new XMLHttpRequest;
			if (!self.s) {
				/** @type {Array} */
				self.s = [];
				self.open("GET", url);
				/** @type {function (): undefined} */
				self.onload = ready;
				self.send();
			}
			self.s.push([p, file]);
			if (self.readyState === 4) {
				self.onload();
			}
		}
		domReady(load);
	}
	load();
})(document, document.getElementsByTagName("use"), window.requestAnimationFrame || window.setTimeout, {});
