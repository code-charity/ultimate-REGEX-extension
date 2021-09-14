/*--------------------------------------------------------------
>>> CONTENT SCRIPT:
----------------------------------------------------------------
# Global variables
# Nodes
	# Is visible
	# Filter
		# Regular expression
		# String
			# Case sensitive
			# Case insensitive
	# Search
	# Modify
	# Restore
	# Focus
# Message listener
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var items = [],
	index = 0,
	query;


/*--------------------------------------------------------------
# NODES
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# IS VISIBLE
--------------------------------------------------------------*/

function isNodeVisible(node) {
	var style = getComputedStyle(node.parentNode);

	if (style.visibility === 'hidden') {
		return false;
	} else if (style.display === 'none') {
		return false;
	} else if (node.parentNode.offsetWidth === 0 || node.parentNode.offsetHeight === 0) {
		return false;
	} else {
		return true;
	}
}


/*--------------------------------------------------------------
# FILTER
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# REGULAR EXPRESSION
--------------------------------------------------------------*/

function filterNodeRegExp(node) {
	var match = node.nodeValue.match(query);

	if (match && isNodeVisible(node)) {
		items.push({
			nodes: {
				original: node,
				modified: []
			},
			match
		});

		return NodeFilter.FILTER_ACCEPT;
	}
}


/*--------------------------------------------------------------
# STRING
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CASE SENSITIVE
--------------------------------------------------------------*/

function filterNodeCaseSensitive(node) {
	var match = node.nodeValue.indexOf(query);

	if (match !== -1 && isNodeVisible(node)) {
		items.push({
			nodes: {
				original: node,
				modified: []
			},
			match: {
				index: match,
				0: {
					length: query.length
				}
			}
		});

		return NodeFilter.FILTER_ACCEPT;
	}
}


/*--------------------------------------------------------------
# CASE INSENSITIVE
--------------------------------------------------------------*/

function filterNodeCaseInsensitive(node) {
	var match = node.nodeValue.toLowerCase().indexOf(query);

	if (match !== -1 && isNodeVisible(node)) {
		items.push({
			nodes: {
				original: node,
				modified: []
			},
			match: {
				index: match,
				0: {
					length: query.length
				}
			}
		});

		return NodeFilter.FILTER_ACCEPT;
	}
}


/*--------------------------------------------------------------
# SEARCH
--------------------------------------------------------------*/

function searchNodes(options) {
	var tree_walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
		acceptNode: options.regexp === true ? filterNodeRegExp : options.case_sensitive === true ? filterNodeCaseSensitive : filterNodeCaseInsensitive
	}, false);

	while (tree_walker.nextNode());

	return items;
}


/*--------------------------------------------------------------
# MODIFY
--------------------------------------------------------------*/

function modifyNodes(items) {
	for (var i = 0, l = items.length; i < l; i++) {
		var item = items[i],
			nodes = item.nodes,
			parent = nodes.original.parentNode,
			wrapper = document.createElement('span');

		wrapper.style.color = '#000';
		wrapper.style.backgroundColor = '#ff0';

		nodes.modified.push(nodes.original.cloneNode(true));

		parent.insertBefore(nodes.modified[0], nodes.original);

		nodes.modified.push(nodes.modified[0].splitText(item.match.index));
		nodes.modified.push(nodes.modified[1].splitText(item.match[0].length));

		wrapper.appendChild(nodes.modified[1]);

		parent.insertBefore(wrapper, nodes.modified[2]);

		nodes.original.remove();

		nodes.wrapper = wrapper;
	}
}


/*--------------------------------------------------------------
# RESTORE
--------------------------------------------------------------*/

function restoreNodes(items) {
	for (var i = 0, l = items.length; i < l; i++) {
		var item = items[i],
			nodes = item.nodes;

		nodes.modified[0].parentNode.insertBefore(nodes.original, nodes.modified[0]);

		nodes.modified[0].remove();
		nodes.modified[1].remove();
		nodes.modified[2].remove();

		nodes.wrapper.remove();
	}
}


/*--------------------------------------------------------------
# FOCUS
--------------------------------------------------------------*/

function focusNode(current, previous) {
	if (previous) {
		previous.nodes.wrapper.style.backgroundColor = '#ff0';
	}

	if (current) {
		current.nodes.wrapper.style.backgroundColor = '#f90';

		current.nodes.wrapper.scrollIntoView(true);

		if (current.nodes.wrapper.getBoundingClientRect().top < window.innerHeight / 2) {
			window.scrollBy(0, -128);
		}
	}
}


/*--------------------------------------------------------------
# MESSAGE LISTENER
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.type === 'input') {
		restoreNodes(items);

		index = -1;

		items = [];

		if (message.regexp === true) {
			query = new RegExp(message.value, message.case_sensitive === false ? 'i' : '');
		} else {
			if (message.case_sensitive === false) {
				query = message.value.toLowerCase();
			} else {
				query = message.value;
			}
		}

		items = searchNodes(message);

		sendResponse({
			index: index + 1,
			length: items.length
		});

		modifyNodes(items);
	} else if (message.type === 'previous') {
		var previous = items[index];

		index--;

		if (index < 0) {
			index = items.length - 1;
		}

		focusNode(items[index], previous);

		sendResponse({
			index: index + 1,
			length: items.length
		});
	} else if (message.type === 'next') {
		var previous = items[index];

		index++;

		if (index === items.length) {
			index = 0;
		}

		focusNode(items[index], previous);

		sendResponse({
			index: index + 1,
			length: items.length
		});
	} else if (message.type === 'reset') {
		restoreNodes(items);

		items = [];

		sendResponse({
			index: 0,
			length: 0
		});
	} else if (message.type === 'init') {
		sendResponse(getSelection().toString());
	}
});

chrome.runtime.sendMessage({
	type: 'background'
});