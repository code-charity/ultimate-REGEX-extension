var current_regex,
    selected_index = 0,
    search_threads = 0;

function sendCount() {
    chrome.runtime.sendMessage({
        name: 4,
        value: selected_index + '/' + document.querySelectorAll('regex-search-highlight').length
    });
}

function clear() {
    var elements = document.querySelectorAll('regex-search-highlight');

    for (var i = 0, l = elements.length; i < l; i++) {
        elements[i].outerHTML = elements[i].innerHTML;
    }
}

function highlight(node) {
    var match = node.data.match(current_regex);

    if (match && match[0]) {
        var element = document.createElement('regex-search-highlight'),
            text_node = node.splitText(node.data.search(current_regex));

        text_node.splitText(match[0].length);

        element.appendChild(text_node.cloneNode(true));
        text_node.parentNode.replaceChild(element, text_node);
    }
}

function search(node, callback) {
    search_threads++;

    if (node && node.nodeType === 1 && node.childNodes) {
        if (window.getComputedStyle(node).getPropertyValue('display') !== 'none') {
            for (var i = 0, l = node.childNodes.length; i < l; i++) {
                search(node.childNodes[i], callback);
            }
        }
    } else if (node && node.nodeType === 3) {
        highlight(node);
    }

    search_threads--;

    if (search_threads === 0) {
        callback();
    }
}

function select() {
    if (!document.querySelector('regex-search-highlight')) {
        return false;
    }

    var element = document.querySelectorAll('regex-search-highlight')[selected_index];

    if (document.querySelector('regex-search-highlight.selected')) {
        document.querySelector('regex-search-highlight.selected').classList.remove('selected');
    }

    element.classList.add('selected');

    sendCount();

    window.scrollTo(0, window.pageYOffset + element.getBoundingClientRect().top - (window.innerHeight / 2));
}

window.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) {
        clear();
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.name === 1) {
        current_regex = new RegExp(request.value, 'g');
        selected_index = 0;

        console.log(request.value);

        clear();
        search(document.body, sendCount);
        select();
    } else if (request.name === 2) {
        selected_index--;

        if (selected_index < 0) {
            selected_index = document.querySelectorAll('regex-search-highlight').length - 1;
        }

        select();
    } else if (request.name === 3) {
        selected_index++;

        if (selected_index === document.querySelectorAll('regex-search-highlight').length) {
            selected_index = 0;
        }

        select();
    }
});