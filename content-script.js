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

var search_nodes = [],
    highlight_nodes = {},
    replace_nodes = {},
    index = 0,
    query,
    current_nodes_container;


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
        current_nodes_container.push({
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
        current_nodes_container.push({
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
        current_nodes_container.push({
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

function searchNodes(container, options) {
    current_nodes_container = container;

    var tree_walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: options.regexp === true ? filterNodeRegExp : options.case_sensitive === true ? filterNodeCaseSensitive : filterNodeCaseInsensitive
    }, false);

    while (tree_walker.nextNode());
}


/*--------------------------------------------------------------
# MODIFY
--------------------------------------------------------------*/

function modifyNodes(items, options = {}) {
    for (var i = 0, l = items.length; i < l; i++) {
        var item = items[i],
            nodes = item.nodes,
            parent = nodes.original.parentNode,
            wrapper = document.createElement('span');

        if (options.hasOwnProperty('search')) {
            wrapper.textContent = nodes.original.textContent.replace(options.search, options.replace);

            nodes.modified.push(wrapper);

            parent.insertBefore(wrapper, nodes.original);
        } else {
            wrapper.style.color = options.text_color || '#000';
            wrapper.style.backgroundColor = options.background_color || '#ff0';

            nodes.modified.push(nodes.original.cloneNode(true));

            parent.insertBefore(nodes.modified[0], nodes.original);

            nodes.modified.push(nodes.modified[0].splitText(item.match.index));
            nodes.modified.push(nodes.modified[1].splitText(item.match[0].length));

            wrapper.appendChild(nodes.modified[1]);

            parent.insertBefore(wrapper, nodes.modified[2]);
        }

        nodes.original.remove();

        nodes.wrapper = wrapper;
    }
}


/*--------------------------------------------------------------
# RESTORE
--------------------------------------------------------------*/

function restoreNodes(items, options) {
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

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(function (items) {
        if (items.highlight) {
            for (var key in items.highlight) {
                var item = items.highlight[key];
                
                if (item.text && item.text.length > 0) {
                    var old_query = query;

                    try {
                        query = new RegExp(item.text);
                    } catch (err) {
                        query = item.text;
                    }

                    if (typeof highlight_nodes[key] !== 'object') {
                        highlight_nodes[key] = [];
                    }

                    searchNodes(highlight_nodes[key], {
                        regexp: typeof query !== 'string'
                    });

                    modifyNodes(highlight_nodes[key], {
                        text_color: item.text_color ? 'rgb(' + item.text_color.rgb.join(',') + ')' : undefined,
                        background_color: item.background_color ? 'rgb(' + item.background_color.rgb.join(',') + ')' : undefined
                    });

                    query = old_query;
                }
            }
        }

        if (items.replace) {
            for (var key in items.replace) {
                var item = items.replace[key];
                
                if (item.search && item.search.length > 0) {
                    var old_query = query;

                    try {
                        query = new RegExp(item.search);
                    } catch (err) {
                        query = item.search;
                    }

                    if (typeof replace_nodes[key] !== 'object') {
                        replace_nodes[key] = [];
                    }

                    searchNodes(replace_nodes[key], {
                        regexp: typeof query !== 'string'
                    });

                    console.log(replace_nodes);

                    modifyNodes(replace_nodes[key], {
                        search: query,
                        replace: item.replace
                    });

                    query = old_query;
                }
            }
        }
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'input') {
        restoreNodes(search_nodes);

        index = -1;

        search_nodes = [];

        if (message.regexp === true) {
            query = new RegExp(message.value, message.case_sensitive === false ? 'i' : '');
        } else {
            if (message.case_sensitive === false) {
                query = message.value.toLowerCase();
            } else {
                query = message.value;
            }
        }

        searchNodes(search_nodes, message);

        sendResponse({
            index: index + 1,
            length: search_nodes.length
        });

        modifyNodes(search_nodes);
    } else if (message.type === 'previous') {
        var previous = search_nodes[index];

        index--;

        if (index < 0) {
            index = search_nodes.length - 1;
        }

        focusNode(search_nodes[index], previous);

        sendResponse({
            index: index + 1,
            length: search_nodes.length
        });
    } else if (message.type === 'next') {
        var previous = search_nodes[index];

        index++;

        if (index === search_nodes.length) {
            index = 0;
        }

        focusNode(search_nodes[index], previous);

        sendResponse({
            index: index + 1,
            length: search_nodes.length
        });
    } else if (message.type === 'reset') {
        restoreNodes(search_nodes);

        search_nodes = [];

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