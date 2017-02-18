// // icon
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
// 		var url = element && element.getAttribute('content');
// 		var useNodes = document.getElementsByTagName('use');

// 		var sprite = '';

// 		request(url, spriteSuccessHandler, spriteErrorHandler);

// 		function spriteSuccessHandler (res) {
// 			// console.log(res);

// 			sprite = res;
//
// 		}

// 		function spriteErrorHandler (res) {
// 			console.error(res)
// 		}

// 	});

// })(document);


(function(document, useNodes, timer, spritesArr) {

	function replaceIcon(svgElement, iconContent) {
		if (iconContent) {
			var viewBox = iconContent.getAttribute("viewBox");
			var fragment = document.createDocumentFragment();
			var symbolElement = iconContent.cloneNode(true);

			if (viewBox) {
				svgElement.setAttribute("viewBox", viewBox);
			}

			for (;symbolElement.childNodes.length;) {
				fragment.appendChild(symbolElement.childNodes[0]);
			}

			svgElement.appendChild(fragment);
		}
	}

	function ready() {
		var that = this;
		var spriteContainer = document.createElement("x");
		var iconsArr = that.iconsArr;
		spriteContainer.innerHTML = that.responseText;

		that.onload = function() {
			iconsArr.splice(0).map(function(item) {

				var svgElement = item[0];
				var iconId = item[1];
				var iconContent = spriteContainer.querySelector("#" + iconId.replace(/(\W)/g, "\\$1"));

				replaceIcon(svgElement, iconContent);
			});
		};

		that.onload();
	}


	function load() {
		var node;

		for (;node = useNodes[0];) {
			var svgIconElement = node.parentNode;
			var iconId = node.getAttribute("xlink:href").split("#")[1];

			var element = document.querySelector('meta[name="icons-sprite:url"]');
			var url = element && element.getAttribute("content");

			svgIconElement.removeChild(node);
			var request = spritesArr[url] = spritesArr[url] || new XMLHttpRequest;

			if (!request.iconsArr) {

				request.iconsArr = [];
				request.open("GET", url);

				request.onload = ready;
				request.send();
			}

			request.iconsArr.push([svgIconElement, iconId]);

			if (request.readyState === 4) {
				request.onload();
			}
		}

		timer(load);
	}

	load();

})(document, document.getElementsByTagName("use"), window.requestAnimationFrame || window.setTimeout, {});
