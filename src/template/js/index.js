function send(name, value) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                name: name,
                value: value
            });
        }
    });
}

Satus.render({
    section: {
        type: 'section',

        text_field: {
            type: 'text-field',
            onrender: function() {
                var self = this;

                setTimeout(function() {
                    self.focus();
                });
            },
            onkeypress: function(event) {
                var self = this;

                setTimeout(function() {
                    if (event.keyCode === 13) {
                        send(3);
                    } else {
                        send(1, self.value);
                    }
                });
            }
        },
        index: {
            type: 'text',
            class: 'satus-text--count',
            innerText: '0/0'
        },
        button_previous: {
            type: 'button',
            before: '<svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"></svg>',
            onclick: function() {
                send(2);
            }
        },
        button_next: {
            type: 'button',
            before: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></svg>',
            onclick: function() {
                send(3);
            }
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.name === 4) {
        document.querySelector('.satus-text--count').innerText = request.value;
    }
});