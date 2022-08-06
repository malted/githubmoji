(() => {
	// node_modules/.pnpm/selector-set@1.1.5/node_modules/selector-set/selector-set.next.js
	function SelectorSet() {
		if (!(this instanceof SelectorSet)) {
			return new SelectorSet();
		}
		this.size = 0;
		this.uid = 0;
		this.selectors = [];
		this.selectorObjects = {};
		this.indexes = Object.create(this.indexes);
		this.activeIndexes = [];
	}
	var docElem = window.document.documentElement;
	var matches =
		docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector;
	SelectorSet.prototype.matchesSelector = function (el2, selector) {
		return matches.call(el2, selector);
	};
	SelectorSet.prototype.querySelectorAll = function (selectors, context) {
		return context.querySelectorAll(selectors);
	};
	SelectorSet.prototype.indexes = [];
	var idRe = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
	SelectorSet.prototype.indexes.push({
		name: "ID",
		selector: function matchIdSelector(sel) {
			var m;
			if ((m = sel.match(idRe))) {
				return m[0].slice(1);
			}
		},
		element: function getElementId(el2) {
			if (el2.id) {
				return [el2.id];
			}
		},
	});
	var classRe = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
	SelectorSet.prototype.indexes.push({
		name: "CLASS",
		selector: function matchClassSelector(sel) {
			var m;
			if ((m = sel.match(classRe))) {
				return m[0].slice(1);
			}
		},
		element: function getElementClassNames(el2) {
			var className = el2.className;
			if (className) {
				if (typeof className === "string") {
					return className.split(/\s/);
				} else if (
					typeof className === "object" &&
					"baseVal" in className
				) {
					return className.baseVal.split(/\s/);
				}
			}
		},
	});
	var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
	SelectorSet.prototype.indexes.push({
		name: "TAG",
		selector: function matchTagSelector(sel) {
			var m;
			if ((m = sel.match(tagRe))) {
				return m[0].toUpperCase();
			}
		},
		element: function getElementTagName(el2) {
			return [el2.nodeName.toUpperCase()];
		},
	});
	SelectorSet.prototype.indexes["default"] = {
		name: "UNIVERSAL",
		selector: function () {
			return true;
		},
		element: function () {
			return [true];
		},
	};
	var Map;
	if (typeof window.Map === "function") {
		Map = window.Map;
	} else {
		Map = (function () {
			function Map2() {
				this.map = {};
			}
			Map2.prototype.get = function (key) {
				return this.map[key + " "];
			};
			Map2.prototype.set = function (key, value) {
				this.map[key + " "] = value;
			};
			return Map2;
		})();
	}
	var chunker =
		/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
	function parseSelectorIndexes(allIndexes, selector) {
		allIndexes = allIndexes.slice(0).concat(allIndexes["default"]);
		var allIndexesLen = allIndexes.length,
			i,
			j,
			m,
			dup,
			rest = selector,
			key,
			index,
			indexes = [];
		do {
			chunker.exec("");
			if ((m = chunker.exec(rest))) {
				rest = m[3];
				if (m[2] || !rest) {
					for (i = 0; i < allIndexesLen; i++) {
						index = allIndexes[i];
						if ((key = index.selector(m[1]))) {
							j = indexes.length;
							dup = false;
							while (j--) {
								if (
									indexes[j].index === index &&
									indexes[j].key === key
								) {
									dup = true;
									break;
								}
							}
							if (!dup) {
								indexes.push({ index, key });
							}
							break;
						}
					}
				}
			}
		} while (m);
		return indexes;
	}
	function findByPrototype(ary, proto) {
		var i, len, item;
		for (i = 0, len = ary.length; i < len; i++) {
			item = ary[i];
			if (proto.isPrototypeOf(item)) {
				return item;
			}
		}
	}
	SelectorSet.prototype.logDefaultIndexUsed = function () {};
	SelectorSet.prototype.add = function (selector, data) {
		var obj,
			i,
			indexProto,
			key,
			index,
			objs,
			selectorIndexes,
			selectorIndex,
			indexes = this.activeIndexes,
			selectors = this.selectors,
			selectorObjects = this.selectorObjects;
		if (typeof selector !== "string") {
			return;
		}
		obj = {
			id: this.uid++,
			selector,
			data,
		};
		selectorObjects[obj.id] = obj;
		selectorIndexes = parseSelectorIndexes(this.indexes, selector);
		for (i = 0; i < selectorIndexes.length; i++) {
			selectorIndex = selectorIndexes[i];
			key = selectorIndex.key;
			indexProto = selectorIndex.index;
			index = findByPrototype(indexes, indexProto);
			if (!index) {
				index = Object.create(indexProto);
				index.map = new Map();
				indexes.push(index);
			}
			if (indexProto === this.indexes["default"]) {
				this.logDefaultIndexUsed(obj);
			}
			objs = index.map.get(key);
			if (!objs) {
				objs = [];
				index.map.set(key, objs);
			}
			objs.push(obj);
		}
		this.size++;
		selectors.push(selector);
	};
	SelectorSet.prototype.remove = function (selector, data) {
		if (typeof selector !== "string") {
			return;
		}
		var selectorIndexes,
			selectorIndex,
			i,
			j,
			k,
			selIndex,
			objs,
			obj,
			indexes = this.activeIndexes,
			selectors = (this.selectors = []),
			selectorObjects = this.selectorObjects,
			removedIds = {},
			removeAll = arguments.length === 1;
		selectorIndexes = parseSelectorIndexes(this.indexes, selector);
		for (i = 0; i < selectorIndexes.length; i++) {
			selectorIndex = selectorIndexes[i];
			j = indexes.length;
			while (j--) {
				selIndex = indexes[j];
				if (selectorIndex.index.isPrototypeOf(selIndex)) {
					objs = selIndex.map.get(selectorIndex.key);
					if (objs) {
						k = objs.length;
						while (k--) {
							obj = objs[k];
							if (
								obj.selector === selector &&
								(removeAll || obj.data === data)
							) {
								objs.splice(k, 1);
								removedIds[obj.id] = true;
							}
						}
					}
					break;
				}
			}
		}
		for (i in removedIds) {
			delete selectorObjects[i];
			this.size--;
		}
		for (i in selectorObjects) {
			selectors.push(selectorObjects[i].selector);
		}
	};
	function sortById(a, b) {
		return a.id - b.id;
	}
	SelectorSet.prototype.queryAll = function (context) {
		if (!this.selectors.length) {
			return [];
		}
		var matches2 = {},
			results = [];
		var els = this.querySelectorAll(this.selectors.join(", "), context);
		var i, j, len, len2, el2, m, match, obj;
		for (i = 0, len = els.length; i < len; i++) {
			el2 = els[i];
			m = this.matches(el2);
			for (j = 0, len2 = m.length; j < len2; j++) {
				obj = m[j];
				if (!matches2[obj.id]) {
					match = {
						id: obj.id,
						selector: obj.selector,
						data: obj.data,
						elements: [],
					};
					matches2[obj.id] = match;
					results.push(match);
				} else {
					match = matches2[obj.id];
				}
				match.elements.push(el2);
			}
		}
		return results.sort(sortById);
	};
	SelectorSet.prototype.matches = function (el2) {
		if (!el2) {
			return [];
		}
		var i, j, k, len, len2, len3, index, keys, objs, obj, id;
		var indexes = this.activeIndexes,
			matchedIds = {},
			matches2 = [];
		for (i = 0, len = indexes.length; i < len; i++) {
			index = indexes[i];
			keys = index.element(el2);
			if (keys) {
				for (j = 0, len2 = keys.length; j < len2; j++) {
					if ((objs = index.map.get(keys[j]))) {
						for (k = 0, len3 = objs.length; k < len3; k++) {
							obj = objs[k];
							id = obj.id;
							if (
								!matchedIds[id] &&
								this.matchesSelector(el2, obj.selector)
							) {
								matchedIds[id] = true;
								matches2.push(obj);
							}
						}
					}
				}
			}
		}
		return matches2.sort(sortById);
	};

	// node_modules/.pnpm/selector-observer@2.1.6/node_modules/selector-observer/dist/index.esm.js
	var el = null;
	var observer = null;
	var queue = [];
	function scheduleBatch(document2, callback) {
		var calls = [];
		function processBatchQueue() {
			var callsCopy = calls;
			calls = [];
			callback(callsCopy);
		}
		function scheduleBatchQueue() {
			for (
				var _len = arguments.length, args = Array(_len), _key = 0;
				_key < _len;
				_key++
			) {
				args[_key] = arguments[_key];
			}
			calls.push(args);
			if (calls.length === 1)
				scheduleMacroTask(document2, processBatchQueue);
		}
		return scheduleBatchQueue;
	}
	function scheduleMacroTask(document2, callback) {
		if (!observer) {
			observer = new MutationObserver(handleMutations);
		}
		if (!el) {
			el = document2.createElement("div");
			observer.observe(el, { attributes: true });
		}
		queue.push(callback);
		el.setAttribute("data-twiddle", "" + Date.now());
	}
	function handleMutations() {
		var callbacks = queue;
		queue = [];
		for (var i = 0; i < callbacks.length; i++) {
			try {
				callbacks[i]();
			} catch (error) {
				setTimeout(function () {
					throw error;
				}, 0);
			}
		}
	}
	var initMap = /* @__PURE__ */ new WeakMap();
	var initializerMap = /* @__PURE__ */ new WeakMap();
	var subscriptionMap = /* @__PURE__ */ new WeakMap();
	var addMap = /* @__PURE__ */ new WeakMap();
	function applyChanges(selectorObserver, changes) {
		for (var i = 0; i < changes.length; i++) {
			var change = changes[i];
			var type = change[0];
			var el2 = change[1];
			var observer2 = change[2];
			if (type === ADD) {
				runInit(observer2, el2);
				runAdd(observer2, el2);
			} else if (type === REMOVE) {
				runRemove(observer2, el2);
			} else if (type === REMOVE_ALL) {
				runRemoveAll(selectorObserver.observers, el2);
			}
		}
	}
	function runInit(observer2, el2) {
		if (!(el2 instanceof observer2.elementConstructor)) {
			return;
		}
		var initIds = initMap.get(el2);
		if (!initIds) {
			initIds = [];
			initMap.set(el2, initIds);
		}
		if (initIds.indexOf(observer2.id) === -1) {
			var initializer = void 0;
			if (observer2.initialize) {
				initializer = observer2.initialize.call(void 0, el2);
			}
			if (initializer) {
				var initializers = initializerMap.get(el2);
				if (!initializers) {
					initializers = {};
					initializerMap.set(el2, initializers);
				}
				initializers["" + observer2.id] = initializer;
			}
			initIds.push(observer2.id);
		}
	}
	function runAdd(observer2, el2) {
		if (!(el2 instanceof observer2.elementConstructor)) {
			return;
		}
		var addIds = addMap.get(el2);
		if (!addIds) {
			addIds = [];
			addMap.set(el2, addIds);
		}
		if (addIds.indexOf(observer2.id) === -1) {
			observer2.elements.push(el2);
			var initializers = initializerMap.get(el2);
			var initializer = initializers
				? initializers["" + observer2.id]
				: null;
			if (initializer && initializer.add) {
				initializer.add.call(void 0, el2);
			}
			if (observer2.subscribe) {
				var subscription = observer2.subscribe.call(void 0, el2);
				if (subscription) {
					var subscriptions = subscriptionMap.get(el2);
					if (!subscriptions) {
						subscriptions = {};
						subscriptionMap.set(el2, subscriptions);
					}
					subscriptions["" + observer2.id] = subscription;
				}
			}
			if (observer2.add) {
				observer2.add.call(void 0, el2);
			}
			addIds.push(observer2.id);
		}
	}
	function runRemove(observer2, el2) {
		if (!(el2 instanceof observer2.elementConstructor)) {
			return;
		}
		var addIds = addMap.get(el2);
		if (!addIds) {
			return;
		}
		var index = observer2.elements.indexOf(el2);
		if (index !== -1) {
			observer2.elements.splice(index, 1);
		}
		index = addIds.indexOf(observer2.id);
		if (index !== -1) {
			var initializers = initializerMap.get(el2);
			var initializer = initializers
				? initializers["" + observer2.id]
				: null;
			if (initializer) {
				if (initializer.remove) {
					initializer.remove.call(void 0, el2);
				}
			}
			if (observer2.subscribe) {
				var subscriptions = subscriptionMap.get(el2);
				var subscription = subscriptions
					? subscriptions["" + observer2.id]
					: null;
				if (subscription && subscription.unsubscribe) {
					subscription.unsubscribe();
				}
			}
			if (observer2.remove) {
				observer2.remove.call(void 0, el2);
			}
			addIds.splice(index, 1);
		}
		if (addIds.length === 0) {
			addMap.delete(el2);
		}
	}
	function runRemoveAll(observers, el2) {
		var addIds = addMap.get(el2);
		if (!addIds) {
			return;
		}
		var ids = addIds.slice(0);
		for (var i = 0; i < ids.length; i++) {
			var observer2 = observers[ids[i]];
			if (!observer2) {
				continue;
			}
			var index = observer2.elements.indexOf(el2);
			if (index !== -1) {
				observer2.elements.splice(index, 1);
			}
			var initializers = initializerMap.get(el2);
			var initializer = initializers
				? initializers["" + observer2.id]
				: null;
			if (initializer && initializer.remove) {
				initializer.remove.call(void 0, el2);
			}
			var subscriptions = subscriptionMap.get(el2);
			var subscription = subscriptions
				? subscriptions["" + observer2.id]
				: null;
			if (subscription && subscription.unsubscribe) {
				subscription.unsubscribe();
			}
			if (observer2.remove) {
				observer2.remove.call(void 0, el2);
			}
		}
		addMap.delete(el2);
	}
	var innerHTMLReplacementIsBuggy = null;
	function detectInnerHTMLReplacementBuggy(document2) {
		if (innerHTMLReplacementIsBuggy === null) {
			var a = document2.createElement("div");
			var b = document2.createElement("div");
			var c = document2.createElement("div");
			a.appendChild(b);
			b.appendChild(c);
			a.innerHTML = "";
			innerHTMLReplacementIsBuggy = c.parentNode !== b;
		}
		return innerHTMLReplacementIsBuggy;
	}
	function supportsSelectorMatching(node) {
		return (
			"matches" in node ||
			"webkitMatchesSelector" in node ||
			"mozMatchesSelector" in node ||
			"oMatchesSelector" in node ||
			"msMatchesSelector" in node
		);
	}
	var ADD = 1;
	var REMOVE = 2;
	var REMOVE_ALL = 3;
	function handleMutations$1(selectorObserver, changes, mutations) {
		for (var i = 0; i < mutations.length; i++) {
			var mutation = mutations[i];
			if (mutation.type === "childList") {
				addNodes(selectorObserver, changes, mutation.addedNodes);
				removeNodes(selectorObserver, changes, mutation.removedNodes);
			} else if (mutation.type === "attributes") {
				revalidateObservers(selectorObserver, changes, mutation.target);
			}
		}
		if (detectInnerHTMLReplacementBuggy(selectorObserver.ownerDocument)) {
			revalidateOrphanedElements(selectorObserver, changes);
		}
	}
	function addNodes(selectorObserver, changes, nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (supportsSelectorMatching(node)) {
				var matches2 = selectorObserver.selectorSet.matches(node);
				for (var j = 0; j < matches2.length; j++) {
					var data = matches2[j].data;
					changes.push([ADD, node, data]);
				}
			}
			if ("querySelectorAll" in node) {
				var matches22 = selectorObserver.selectorSet.queryAll(node);
				for (var _j = 0; _j < matches22.length; _j++) {
					var _matches2$_j = matches22[_j],
						_data = _matches2$_j.data,
						elements = _matches2$_j.elements;
					for (var k = 0; k < elements.length; k++) {
						changes.push([ADD, elements[k], _data]);
					}
				}
			}
		}
	}
	function removeNodes(selectorObserver, changes, nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if ("querySelectorAll" in node) {
				changes.push([REMOVE_ALL, node]);
				var descendants = node.querySelectorAll("*");
				for (var j = 0; j < descendants.length; j++) {
					changes.push([REMOVE_ALL, descendants[j]]);
				}
			}
		}
	}
	function revalidateObservers(selectorObserver, changes, node) {
		if (supportsSelectorMatching(node)) {
			var matches2 = selectorObserver.selectorSet.matches(node);
			for (var i = 0; i < matches2.length; i++) {
				var data = matches2[i].data;
				changes.push([ADD, node, data]);
			}
		}
		if ("querySelectorAll" in node) {
			var ids = addMap.get(node);
			if (ids) {
				for (var _i = 0; _i < ids.length; _i++) {
					var observer2 = selectorObserver.observers[ids[_i]];
					if (observer2) {
						if (
							!selectorObserver.selectorSet.matchesSelector(
								node,
								observer2.selector,
							)
						) {
							changes.push([REMOVE, node, observer2]);
						}
					}
				}
			}
		}
	}
	function revalidateDescendantObservers(selectorObserver, changes, node) {
		if ("querySelectorAll" in node) {
			revalidateObservers(selectorObserver, changes, node);
			var descendants = node.querySelectorAll("*");
			for (var i = 0; i < descendants.length; i++) {
				revalidateObservers(selectorObserver, changes, descendants[i]);
			}
		}
	}
	function revalidateInputObservers(selectorObserver, changes, inputs) {
		for (var i = 0; i < inputs.length; i++) {
			var input = inputs[i];
			var els = input.form
				? input.form.elements
				: selectorObserver.rootNode.querySelectorAll("input");
			for (var j = 0; j < els.length; j++) {
				revalidateObservers(selectorObserver, changes, els[j]);
			}
		}
	}
	function revalidateOrphanedElements(selectorObserver, changes) {
		for (var i = 0; i < selectorObserver.observers.length; i++) {
			var observer2 = selectorObserver.observers[i];
			if (observer2) {
				var elements = observer2.elements;
				for (var j = 0; j < elements.length; j++) {
					var el2 = elements[j];
					if (!el2.parentNode) {
						changes.push([REMOVE_ALL, el2]);
					}
				}
			}
		}
	}
	function whenReady(document2, callback) {
		var readyState = document2.readyState;
		if (readyState === "interactive" || readyState === "complete") {
			scheduleMacroTask(document2, callback);
		} else {
			document2.addEventListener(
				"DOMContentLoaded",
				scheduleMacroTask(document2, callback),
			);
		}
	}
	var _typeof =
		typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
			? function (obj) {
					return typeof obj;
			  }
			: function (obj) {
					return obj &&
						typeof Symbol === "function" &&
						obj.constructor === Symbol &&
						obj !== Symbol.prototype
						? "symbol"
						: typeof obj;
			  };
	var uid = 0;
	function SelectorObserver(rootNode) {
		this.rootNode =
			rootNode.nodeType === 9 ? rootNode.documentElement : rootNode;
		this.ownerDocument =
			rootNode.nodeType === 9 ? rootNode : rootNode.ownerDocument;
		this.observers = [];
		this.selectorSet = new SelectorSet();
		this.mutationObserver = new MutationObserver(
			handleRootMutations.bind(this, this),
		);
		this._scheduleAddRootNodes = scheduleBatch(
			this.ownerDocument,
			addRootNodes.bind(this, this),
		);
		this._handleThrottledChangedTargets = scheduleBatch(
			this.ownerDocument,
			handleChangedTargets.bind(this, this),
		);
		this.rootNode.addEventListener(
			"change",
			handleChangeEvents.bind(this, this),
			false,
		);
		whenReady(this.ownerDocument, onReady.bind(this, this));
	}
	SelectorObserver.prototype.disconnect = function () {
		this.mutationObserver.disconnect();
	};
	SelectorObserver.prototype.observe = function (a, b) {
		var handlers = void 0;
		if (typeof b === "function") {
			handlers = {
				selector: a,
				initialize: b,
			};
		} else if (
			(typeof b === "undefined" ? "undefined" : _typeof(b)) === "object"
		) {
			handlers = b;
			handlers.selector = a;
		} else {
			handlers = a;
		}
		var self = this;
		var observer2 = {
			id: uid++,
			selector: handlers.selector,
			initialize: handlers.initialize,
			add: handlers.add,
			remove: handlers.remove,
			subscribe: handlers.subscribe,
			elements: [],
			elementConstructor: handlers.hasOwnProperty("constructor")
				? handlers.constructor
				: this.ownerDocument.defaultView.Element,
			abort: function abort() {
				self._abortObserving(observer2);
			},
		};
		this.selectorSet.add(observer2.selector, observer2);
		this.observers[observer2.id] = observer2;
		this._scheduleAddRootNodes();
		return observer2;
	};
	SelectorObserver.prototype._abortObserving = function (observer2) {
		var elements = observer2.elements;
		for (var i = 0; i < elements.length; i++) {
			runRemove(observer2, elements[i]);
		}
		this.selectorSet.remove(observer2.selector, observer2);
		delete this.observers[observer2.id];
	};
	SelectorObserver.prototype.triggerObservers = function (container) {
		var changes = [];
		revalidateDescendantObservers(this, changes, container);
		applyChanges(this, changes);
	};
	function onReady(selectorObserver) {
		selectorObserver.mutationObserver.observe(selectorObserver.rootNode, {
			childList: true,
			attributes: true,
			subtree: true,
		});
		selectorObserver._scheduleAddRootNodes();
	}
	function addRootNodes(selectorObserver) {
		var changes = [];
		addNodes(selectorObserver, changes, [selectorObserver.rootNode]);
		applyChanges(selectorObserver, changes);
	}
	function handleRootMutations(selectorObserver, mutations) {
		var changes = [];
		handleMutations$1(selectorObserver, changes, mutations);
		applyChanges(selectorObserver, changes);
	}
	function handleChangeEvents(selectorObserver, event) {
		selectorObserver._handleThrottledChangedTargets(event.target);
	}
	function handleChangedTargets(selectorObserver, inputs) {
		var changes = [];
		revalidateInputObservers(selectorObserver, changes, inputs);
		applyChanges(selectorObserver, changes);
	}
	var documentObserver = void 0;
	function getDocumentObserver() {
		if (!documentObserver) {
			documentObserver = new SelectorObserver(window.document);
		}
		return documentObserver;
	}
	function observe() {
		var _getDocumentObserver;
		return (_getDocumentObserver = getDocumentObserver()).observe.apply(
			_getDocumentObserver,
			arguments,
		);
	}

	// src/gitmojis.js
	var gitmojis_default = (gitmojis = [
		{
			emoji: "\u{1F3A8}",
			entity: "&#x1f3a8;",
			code: ":art:",
			description: "Improve structure / format of the code.",
			name: "art",
			semver: null,
		},
		{
			emoji: "\u26A1\uFE0F",
			entity: "&#x26a1;",
			code: ":zap:",
			description: "Improve performance.",
			name: "zap",
			semver: "patch",
		},
		{
			emoji: "\u{1F525}",
			entity: "&#x1f525;",
			code: ":fire:",
			description: "Remove code or files.",
			name: "fire",
			semver: null,
		},
		{
			emoji: "\u{1F41B}",
			entity: "&#x1f41b;",
			code: ":bug:",
			description: "Fix a bug.",
			name: "bug",
			semver: "patch",
		},
		{
			emoji: "\u{1F691}\uFE0F",
			entity: "&#128657;",
			code: ":ambulance:",
			description: "Critical hotfix.",
			name: "ambulance",
			semver: "patch",
		},
		{
			emoji: "\u2728",
			entity: "&#x2728;",
			code: ":sparkles:",
			description: "Introduce new features.",
			name: "sparkles",
			semver: "minor",
		},
		{
			emoji: "\u{1F4DD}",
			entity: "&#x1f4dd;",
			code: ":memo:",
			description: "Add or update documentation.",
			name: "memo",
			semver: null,
		},
		{
			emoji: "\u{1F680}",
			entity: "&#x1f680;",
			code: ":rocket:",
			description: "Deploy stuff.",
			name: "rocket",
			semver: null,
		},
		{
			emoji: "\u{1F484}",
			entity: "&#ff99cc;",
			code: ":lipstick:",
			description: "Add or update the UI and style files.",
			name: "lipstick",
			semver: "patch",
		},
		{
			emoji: "\u{1F389}",
			entity: "&#127881;",
			code: ":tada:",
			description: "Begin a project.",
			name: "tada",
			semver: null,
		},
		{
			emoji: "\u2705",
			entity: "&#x2705;",
			code: ":white_check_mark:",
			description: "Add, update, or pass tests.",
			name: "white-check-mark",
			semver: null,
		},
		{
			emoji: "\u{1F512}\uFE0F",
			entity: "&#x1f512;",
			code: ":lock:",
			description: "Fix security issues.",
			name: "lock",
			semver: "patch",
		},
		{
			emoji: "\u{1F510}",
			entity: "&#x1f510;",
			code: ":closed_lock_with_key:",
			description: "Add or update secrets.",
			name: "closed-lock-with-key",
			semver: null,
		},
		{
			emoji: "\u{1F516}",
			entity: "&#x1f516;",
			code: ":bookmark:",
			description: "Release / Version tags.",
			name: "bookmark",
			semver: null,
		},
		{
			emoji: "\u{1F6A8}",
			entity: "&#x1f6a8;",
			code: ":rotating_light:",
			description: "Fix compiler / linter warnings.",
			name: "rotating-light",
			semver: null,
		},
		{
			emoji: "\u{1F6A7}",
			entity: "&#x1f6a7;",
			code: ":construction:",
			description: "Work in progress.",
			name: "construction",
			semver: null,
		},
		{
			emoji: "\u{1F49A}",
			entity: "&#x1f49a;",
			code: ":green_heart:",
			description: "Fix CI Build.",
			name: "green-heart",
			semver: null,
		},
		{
			emoji: "\u2B07\uFE0F",
			entity: "\u2B07\uFE0F",
			code: ":arrow_down:",
			description: "Downgrade dependencies.",
			name: "arrow-down",
			semver: "patch",
		},
		{
			emoji: "\u2B06\uFE0F",
			entity: "\u2B06\uFE0F",
			code: ":arrow_up:",
			description: "Upgrade dependencies.",
			name: "arrow-up",
			semver: "patch",
		},
		{
			emoji: "\u{1F4CC}",
			entity: "&#x1F4CC;",
			code: ":pushpin:",
			description: "Pin dependencies to specific versions.",
			name: "pushpin",
			semver: "patch",
		},
		{
			emoji: "\u{1F477}",
			entity: "&#x1f477;",
			code: ":construction_worker:",
			description: "Add or update CI build system.",
			name: "construction-worker",
			semver: null,
		},
		{
			emoji: "\u{1F4C8}",
			entity: "&#x1F4C8;",
			code: ":chart_with_upwards_trend:",
			description: "Add or update analytics or track code.",
			name: "chart-with-upwards-trend",
			semver: "patch",
		},
		{
			emoji: "\u267B\uFE0F",
			entity: "&#x267b;",
			code: ":recycle:",
			description: "Refactor code.",
			name: "recycle",
			semver: null,
		},
		{
			emoji: "\u2795",
			entity: "&#10133;",
			code: ":heavy_plus_sign:",
			description: "Add a dependency.",
			name: "heavy-plus-sign",
			semver: "patch",
		},
		{
			emoji: "\u2796",
			entity: "&#10134;",
			code: ":heavy_minus_sign:",
			description: "Remove a dependency.",
			name: "heavy-minus-sign",
			semver: "patch",
		},
		{
			emoji: "\u{1F527}",
			entity: "&#x1f527;",
			code: ":wrench:",
			description: "Add or update configuration files.",
			name: "wrench",
			semver: "patch",
		},
		{
			emoji: "\u{1F528}",
			entity: "&#128296;",
			code: ":hammer:",
			description: "Add or update development scripts.",
			name: "hammer",
			semver: null,
		},
		{
			emoji: "\u{1F310}",
			entity: "&#127760;",
			code: ":globe_with_meridians:",
			description: "Internationalization and localization.",
			name: "globe-with-meridians",
			semver: "patch",
		},
		{
			emoji: "\u270F\uFE0F",
			entity: "&#59161;",
			code: ":pencil2:",
			description: "Fix typos.",
			name: "pencil2",
			semver: "patch",
		},
		{
			emoji: "\u{1F4A9}",
			entity: "&#58613;",
			code: ":poop:",
			description: "Write bad code that needs to be improved.",
			name: "poop",
			semver: null,
		},
		{
			emoji: "\u23EA\uFE0F",
			entity: "&#9194;",
			code: ":rewind:",
			description: "Revert changes.",
			name: "rewind",
			semver: "patch",
		},
		{
			emoji: "\u{1F500}",
			entity: "&#128256;",
			code: ":twisted_rightwards_arrows:",
			description: "Merge branches.",
			name: "twisted-rightwards-arrows",
			semver: null,
		},
		{
			emoji: "\u{1F4E6}\uFE0F",
			entity: "&#1F4E6;",
			code: ":package:",
			description: "Add or update compiled files or packages.",
			name: "package",
			semver: "patch",
		},
		{
			emoji: "\u{1F47D}\uFE0F",
			entity: "&#1F47D;",
			code: ":alien:",
			description: "Update code due to external API changes.",
			name: "alien",
			semver: "patch",
		},
		{
			emoji: "\u{1F69A}",
			entity: "&#1F69A;",
			code: ":truck:",
			description:
				"Move or rename resources (e.g. files, paths, routes).",
			name: "truck",
			semver: null,
		},
		{
			emoji: "\u{1F4C4}",
			entity: "&#1F4C4;",
			code: ":page_facing_up:",
			description: "Add or update license.",
			name: "page-facing-up",
			semver: null,
		},
		{
			emoji: "\u{1F4A5}",
			entity: "&#x1f4a5;",
			code: ":boom:",
			description: "Introduce breaking changes.",
			name: "boom",
			semver: "major",
		},
		{
			emoji: "\u{1F371}",
			entity: "&#1F371",
			code: ":bento:",
			description: "Add or update assets.",
			name: "bento",
			semver: "patch",
		},
		{
			emoji: "\u267F\uFE0F",
			entity: "&#9855;",
			code: ":wheelchair:",
			description: "Improve accessibility.",
			name: "wheelchair",
			semver: "patch",
		},
		{
			emoji: "\u{1F4A1}",
			entity: "&#128161;",
			code: ":bulb:",
			description: "Add or update comments in source code.",
			name: "bulb",
			semver: null,
		},
		{
			emoji: "\u{1F37B}",
			entity: "&#x1f37b;",
			code: ":beers:",
			description: "Write code drunkenly.",
			name: "beers",
			semver: null,
		},
		{
			emoji: "\u{1F4AC}",
			entity: "&#128172;",
			code: ":speech_balloon:",
			description: "Add or update text and literals.",
			name: "speech-balloon",
			semver: "patch",
		},
		{
			emoji: "\u{1F5C3}\uFE0F",
			entity: "&#128451;",
			code: ":card_file_box:",
			description: "Perform database related changes.",
			name: "card-file-box",
			semver: "patch",
		},
		{
			emoji: "\u{1F50A}",
			entity: "&#128266;",
			code: ":loud_sound:",
			description: "Add or update logs.",
			name: "loud-sound",
			semver: null,
		},
		{
			emoji: "\u{1F507}",
			entity: "&#128263;",
			code: ":mute:",
			description: "Remove logs.",
			name: "mute",
			semver: null,
		},
		{
			emoji: "\u{1F465}",
			entity: "&#128101;",
			code: ":busts_in_silhouette:",
			description: "Add or update contributor(s).",
			name: "busts-in-silhouette",
			semver: null,
		},
		{
			emoji: "\u{1F6B8}",
			entity: "&#128696;",
			code: ":children_crossing:",
			description: "Improve user experience / usability.",
			name: "children-crossing",
			semver: "patch",
		},
		{
			emoji: "\u{1F3D7}\uFE0F",
			entity: "&#1f3d7;",
			code: ":building_construction:",
			description: "Make architectural changes.",
			name: "building-construction",
			semver: null,
		},
		{
			emoji: "\u{1F4F1}",
			entity: "&#128241;",
			code: ":iphone:",
			description: "Work on responsive design.",
			name: "iphone",
			semver: "patch",
		},
		{
			emoji: "\u{1F921}",
			entity: "&#129313;",
			code: ":clown_face:",
			description: "Mock things.",
			name: "clown-face",
			semver: null,
		},
		{
			emoji: "\u{1F95A}",
			entity: "&#129370;",
			code: ":egg:",
			description: "Add or update an easter egg.",
			name: "egg",
			semver: "patch",
		},
		{
			emoji: "\u{1F648}",
			entity: "&#8bdfe7;",
			code: ":see_no_evil:",
			description: "Add or update a .gitignore file.",
			name: "see-no-evil",
			semver: null,
		},
		{
			emoji: "\u{1F4F8}",
			entity: "&#128248;",
			code: ":camera_flash:",
			description: "Add or update snapshots.",
			name: "camera-flash",
			semver: null,
		},
		{
			emoji: "\u2697\uFE0F",
			entity: "&#128248;",
			code: ":alembic:",
			description: "Perform experiments.",
			name: "alembic",
			semver: "patch",
		},
		{
			emoji: "\u{1F50D}\uFE0F",
			entity: "&#128269;",
			code: ":mag:",
			description: "Improve SEO.",
			name: "mag",
			semver: "patch",
		},
		{
			emoji: "\u{1F3F7}\uFE0F",
			entity: "&#127991;",
			code: ":label:",
			description: "Add or update types.",
			name: "label",
			semver: "patch",
		},
		{
			emoji: "\u{1F331}",
			entity: "&#127793;",
			code: ":seedling:",
			description: "Add or update seed files.",
			name: "seedling",
			semver: null,
		},
		{
			emoji: "\u{1F6A9}",
			entity: "&#x1F6A9;",
			code: ":triangular_flag_on_post:",
			description: "Add, update, or remove feature flags.",
			name: "triangular-flag-on-post",
			semver: "patch",
		},
		{
			emoji: "\u{1F945}",
			entity: "&#x1F945;",
			code: ":goal_net:",
			description: "Catch errors.",
			name: "goal-net",
			semver: "patch",
		},
		{
			emoji: "\u{1F4AB}",
			entity: "&#x1f4ab;",
			code: ":dizzy:",
			description: "Add or update animations and transitions.",
			name: "animation",
			semver: "patch",
		},
		{
			emoji: "\u{1F5D1}\uFE0F",
			entity: "&#x1F5D1;",
			code: ":wastebasket:",
			description: "Deprecate code that needs to be cleaned up.",
			name: "wastebasket",
			semver: "patch",
		},
		{
			emoji: "\u{1F6C2}",
			entity: "&#x1F6C2;",
			code: ":passport_control:",
			description:
				"Work on code related to authorization, roles and permissions.",
			name: "passport-control",
			semver: "patch",
		},
		{
			emoji: "\u{1FA79}",
			entity: "&#x1FA79;",
			code: ":adhesive_bandage:",
			description: "Simple fix for a non-critical issue.",
			name: "adhesive-bandage",
			semver: "patch",
		},
		{
			emoji: "\u{1F9D0}",
			entity: "&#x1F9D0;",
			code: ":monocle_face:",
			description: "Data exploration/inspection.",
			name: "monocle-face",
			semver: null,
		},
		{
			emoji: "\u26B0\uFE0F",
			entity: "&#x26B0;",
			code: ":coffin:",
			description: "Remove dead code.",
			name: "coffin",
			semver: null,
		},
		{
			emoji: "\u{1F9EA}",
			entity: "&#x1F9EA;",
			code: ":test_tube:",
			description: "Add a failing test.",
			name: "test-tube",
			semver: null,
		},
		{
			emoji: "\u{1F454}",
			entity: "&#128084;",
			code: ":necktie:",
			description: "Add or update business logic",
			name: "necktie",
			semver: "patch",
		},
		{
			emoji: "\u{1FA7A}",
			entity: "&#x1FA7A;",
			code: ":stethoscope:",
			description: "Add or update healthcheck.",
			name: "stethoscope",
			semver: null,
		},
		{
			emoji: "\u{1F9F1}",
			entity: "&#x1f9f1;",
			code: ":bricks:",
			description: "Infrastructure related changes.",
			name: "bricks",
			semver: null,
		},
		{
			emoji: "\u{1F9D1}\u200D\u{1F4BB}",
			entity: "&#129489;&#8205;&#128187;",
			code: ":technologist:",
			description: "Improve developer experience",
			name: "technologist",
			semver: null,
		},
		{
			emoji: "\u{1F4B8}",
			entity: "&#x1F4B8;",
			code: ":money_with_wings:",
			description: "Add sponsorships or money related infrastructure.",
			name: "money-with-wings",
			semver: null,
		},
		{
			emoji: "\u{1F9F5}",
			entity: "&#x1F9F5;",
			code: ":thread:",
			description:
				"Add or update code related to multithreading or concurrency.",
			name: "thread",
			semver: null,
		},
	]);

	// src/utils.js
	function createButtonGroup() {
		const buttonGroup = document.createElement("div");
		buttonGroup.classList.add("BtnGroup");
		buttonGroup.style.display = "flex";
		document
			.getElementById("commit-summary-input")
			.insertAdjacentElement("beforebegin", buttonGroup);
		return buttonGroup;
	}
	function replaceCodes(commitSummaryInput) {
		const replacement = gitmojis_default.find(el2 =>
			commitSummaryInput.value.includes(el2.code),
		);
		if (replacement) {
			commitSummaryInput.value = commitSummaryInput.value.replace(
				replacement.code,
				replacement.emoji + " ",
			);
		}
	}
	function createButtons(commitSummaryInput, buttonGroup) {
		const commitMsg = commitSummaryInput.value.trim();
		let predictiveCount = 0;
		gitmojis_default.every(el2 => {
			if (!commitMsg || commitMsg == "" || commitMsg == " ") return false;
			if (predictiveCount > 5) return false;
			if (
				el2.description.toLowerCase().includes(commitMsg.toLowerCase())
			) {
				const predictive = document.createElement("button");
				predictive.classList.add(
					"btn-sm",
					"btn",
					"BtnGroup-item",
					"ghmoji-predictive",
				);
				predictive.style.marginTop = "0.5rem";
				predictive.innerHTML = el2.emoji;
				predictive.onclick = event => {
					event.preventDefault();
					commitSummaryInput.value = el2.emoji + " ";
					commitSummaryInput.focus();
					removeAllPredictions();
				};
				buttonGroup.insertAdjacentElement("beforeend", predictive);
				predictiveCount++;
			}
			return true;
		});
	}

	// src/index.js
	observe("#commit-summary-input", {
		add(commitSummaryInput) {
			const buttonGroup = createButtonGroup();
			commitSummaryInput.oninput = () => {
				buttonGroup.textContent = "";
				createButtons(commitSummaryInput, buttonGroup);
				replaceCodes(commitSummaryInput);
			};
		},
	});
})();
