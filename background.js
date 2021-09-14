/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
# Global variables
# Runtime
    # On connect
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var tabs = {};


/*--------------------------------------------------------------
# RUNTIME
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ON CONNECT
--------------------------------------------------------------*/

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === 'popup') {
        port.onDisconnect.addListener(function() {
           chrome.tabs.query({}, function (tabs) {
                for (var i = 0, l =	tabs.length; i < l; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        type: 'reset'
                    });
                }
            });
        });

        port.onMessage.addListener(function (message, port) {
            if (message && message.type === 'tab') {
                port.postMessage({
                    type: 'tab',
                    value: tabs[message.id]
                });
            }
        });
    }
});


/*--------------------------------------------------------------
# ON MESSAGE
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (message, sender) {
    if (message && message.type === 'background') {
        tabs[sender.tab.id] = true;
    }
});