/* THIS SHIT CODE WAS GENERATED: Shiny Server Dashboard */

(function() {
	// If window.HTMLWidgets is already defined, then use it; otherwise create a
	// new object. This allows preceding code to set options that affect the
	// initialization process (though none currently exist).
	window.HTMLWidgets = window.HTMLWidgets || {};

	// We can't count on jQuery being available, so we implement our own
	// version if necessary.
	function querySelectorAll(scope, selector) {
		if (typeof(jQuery) !== "undefined" && scope instanceof jQuery) {
			return scope.find(selector);
		}
		if (scope.querySelectorAll) {
			return scope.querySelectorAll(selector);
		}
	}

	// Implement jQuery's extend
	function extend(target /*, ... */ ) {
		if (arguments.length == 1) {
			return target;
		}
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var prop in source) {
				if (source.hasOwnProperty(prop)) {
					target[prop] = source[prop];
				}
			}
		}
		return target;
	}

	// IE8 doesn't support Array.forEach.
	function forEach(values, callback, thisArg) {
		if (values.forEach) {
			values.forEach(callback, thisArg);
		} else {
			for (var i = 0; i < values.length; i++) {
				callback.call(thisArg, values[i], i, values);
			}
		}
	}

	// Replaces the specified method with the return value of funcSource.
	//
	// Note that funcSource should not BE the new method, it should be a function
	// that RETURNS the new method. funcSource receives a single argument that is
	// the overridden method, it can be called from the new method. The overridden
	// method can be called like a regular function, it has the target permanently
	// bound to it so "this" will work correctly.
	function overrideMethod(target, methodName, funcSource) {
		var superFunc = target[methodName] || function() {};
		var superFuncBound = function() {
			return superFunc.apply(target, arguments);
		};
		target[methodName] = funcSource(superFuncBound);
	}

	// Implement a vague facsimilie of jQuery's data method
	function elementData(el, name, value) {
		if (arguments.length == 2) {
			return el["htmlwidget_data_" + name];
		} else if (arguments.length == 3) {
			el["htmlwidget_data_" + name] = value;
			return el;
		} else {
			throw new Error("Wrong number of arguments for elementData: " +
				arguments.length);
		}
	}

	// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	function hasClass(el, className) {
		var re = new RegExp("\\b" + escapeRegExp(className) + "\\b");
		return re.test(el.className);
	}

	// elements - array (or array-like object) of HTML elements
	// className - class name to test for
	// include - if true, only return elements with given className;
	//   if false, only return elements *without* given className
	function filterByClass(elements, className, include) {
		var results = [];
		for (var i = 0; i < elements.length; i++) {
			if (hasClass(elements[i], className) == include)
				results.push(elements[i]);
		}
		return results;
	}

	function on(obj, eventName, func) {
		if (obj.addEventListener) {
			obj.addEventListener(eventName, func, false);
		} else if (obj.attachEvent) {
			obj.attachEvent(eventName, func);
		}
	}

	// Translate array of values to top/right/bottom/left, as usual with
	// the "padding" CSS property
	// https://developer.mozilla.org/en-US/docs/Web/CSS/padding
	function unpackPadding(value) {
		if (typeof(value) === "number")
			value = [value];
		if (value.length === 1) {
			return {
				top: value[0],
				right: value[0],
				bottom: value[0],
				left: value[0]
			};
		}
		if (value.length === 2) {
			return {
				top: value[0],
				right: value[1],
				bottom: value[0],
				left: value[1]
			};
		}
		if (value.length === 3) {
			return {
				top: value[0],
				right: value[1],
				bottom: value[2],
				left: value[1]
			};
		}
		if (value.length === 4) {
			return {
				top: value[0],
				right: value[1],
				bottom: value[2],
				left: value[3]
			};
		}
	}

	// Makes a number suitable for CSS
	function px(x) {
		if (typeof(x) === "number")
			return x + "px";
		else
			return x;
	}

	function initSizing(el) {
		var sizing = {
			width: "100%",
			height: 400,
			padding: 40,
			fill: true
		};

		var cel = document.getElementById("htmlwidget_container");

		cel.style.position = "absolute";
		var pad = unpackPadding(sizing.padding);
		cel.style.top = pad.top + "px";
		cel.style.right = pad.right + "px";
		cel.style.bottom = pad.bottom + "px";
		cel.style.left = pad.left + "px";
		el.style.width = "100%";
		el.style.height = "100%";

		return {
			getWidth: function() {
				return cel.offsetWidth;
			},
			getHeight: function() {
				return cel.offsetHeight;
			}
		};

	}

	// Default implementations for methods
	var defaults = {
		find: function(scope) {
			return querySelectorAll(scope, "." + this.name);
		},
		sizing: {}
	};

	// Called by widget bindings to register a new type of widget. The definition
	// object can contain the following properties:
	// - name (required) - A string indicating the binding name, which will be
	//   used by default as the CSS classname to look for.
	// - initialize (optional) - A function(el) that will be called once per
	//   widget element; if a value is returned, it will be passed as the third
	//   value to renderValue.
	// - renderValue (required) - A function(el, data, initValue) that will be
	//   called with data. Static contexts will cause this to be called once per
	//   element; Shiny apps will cause this to be called multiple times per
	//   element, as the data changes.
	window.HTMLWidgets.widget = function(definition) {

		// For static rendering (non-Shiny), use a simple widget registration
		// scheme. We also use this scheme for Shiny apps/documents that also
		// contain static widgets.
		window.HTMLWidgets.widgets = window.HTMLWidgets.widgets || [];
		// Merge defaults into the definition; don't mutate the original definition.
		var staticBinding = extend({}, defaults, definition);
		overrideMethod(staticBinding, "find", function(superfunc) {
			return function(scope) {
				var results = superfunc(scope);
				// Filter out Shiny outputs, we only want the static kind
				return filterByClass(results, "html-widget-output", false);
			};
		});
		window.HTMLWidgets.widgets.push(staticBinding);

	};

	// Render static widgets after the document finishes loading
	// Statically render all elements that are of this widget's class
	window.HTMLWidgets.staticRender = function() {

		fetch('analytics/structure.json')
			.then(response => {
				return response.json();
			})
			.then(scriptData => {

				var bindings = window.HTMLWidgets.widgets || [];
				forEach(bindings, function(binding) {
					var matches = binding.find(document.documentElement);
					forEach(matches, function(el) {
						var sizeObj = initSizing(el, binding);

						if (hasClass(el, "html-widget-static-bound"))
							return;
						el.className = el.className + " html-widget-static-bound";

						var initResult;
						if (binding.initialize) {
							initResult = binding.initialize(el,
								sizeObj ? sizeObj.getWidth() : el.offsetWidth,
								sizeObj ? sizeObj.getHeight() : el.offsetHeight
							);
							elementData(el, "init_result", initResult);
						}

						if (binding.resize) {
							var lastSize = {};
							var resizeHandler = function(e) {
								var size = {
									w: sizeObj ? sizeObj.getWidth() : el.offsetWidth,
									h: sizeObj ? sizeObj.getHeight() : el.offsetHeight
								};
								if (size.w === 0 && size.h === 0)
									return;
								if (size.w === lastSize.w && size.h === lastSize.h)
									return;
								lastSize = size;
								binding.resize(el, size.w, size.h, initResult);
							};

							on(window, "resize", resizeHandler);

							// This is needed for the specific case of ioslides, which
							// flips slides between display:none and display:block.
							// Ideally we would not have to have ioslide-specific code
							// here, but rather have ioslides raise a generic event,
							// but the rmarkdown package just went to CRAN so the
							// window to getting that fixed may be long.
							if (window.addEventListener) {
								// It's OK to limit this to window.addEventListener
								// browsers because ioslides itself only supports
								// such browsers.
								on(document, "slideenter", resizeHandler);
								on(document, "slideleave", resizeHandler);
							}
						}

						//var scriptData = document.querySelector("script[data-for='" + el.id + "'][type='application/json']");
						if (scriptData[el.id]) {
							var data = scriptData[el.id];
							fetch(data.x.data)
								.then(response => {
									return response.json();
								})
								.then(dataSet => {
									data.x.data = dataSet;
									binding.renderValue(el, data.x, initResult);
								});
						}
					});
				});

			})

	}

})();



HTMLWidgets.widget({
	name: "plotly",
	type: "output",

	initialize: function(el, width, height) {
		// when upgrading plotly.js,
		// uncomment this console.log(), then do `load_all(); plot_ly()` 
		// open in chrome, right-click on console output: "save-as" -> "schema.json"
		// Schema <- jsonlite::fromJSON("~/Downloads/schema.json")
		// devtools::use_data(Schema, overwrite = T, internal = T)
		// console.log(JSON.stringify(Plotly.PlotSchema.get()));

		return {};
	},

	resize: function(el, width, height, instance) {
		if (instance.autosize) {
			var width = instance.width || width;
			var height = instance.height || height;
			Plotly.relayout(el.id, {
				width: width,
				height: height
			});
		}
	},

	renderValue: function(el, x, instance) {

		if (typeof(window) !== "undefined") {
			// make sure plots don't get created outside the network (for on-prem)
			window.PLOTLYENV = window.PLOTLYENV || {};
			window.PLOTLYENV.BASE_URL = x.base_url;
		}

		var graphDiv = document.getElementById(el.id);

		x.config.modeBarButtonsToRemove = x.config.modeBarButtonsToRemove || [];
		x.config.modeBarButtonsToRemove.push("sendDataToCloud");

		var plot = Plotly.plot(graphDiv, x);
		instance.plotly = true;
		instance.autosize = x.layout.autosize || true;
		instance.width = x.layout.width;
		instance.height = x.layout.height;

	} // end of renderValue
}); // end of widget definition