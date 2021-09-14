/*--------------------------------------------------------------
>>> POPUP:
----------------------------------------------------------------
# Global variables
# Skeleton
# Update counter
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var tab = -1;


/*--------------------------------------------------------------
# SKELETON
--------------------------------------------------------------*/

var skeleton = {
	component: 'base',

	header: {
		component: 'header',

		text_field: {
			component: 'text-field',
			syntax: 'regex',
			value: function () {
				return satus.storage.get('last-query') || '';
			},
			on: {
				change: function () {
					satus.storage.set('last-query', this.value);

					if (this.value.length > 0) {
						chrome.tabs.sendMessage(tab, {
							type: 'input',
							value: this.value,
							regexp: satus.storage.get('regular-expression') !== false,
							case_sensitive: satus.storage.get('case-sensitive') === true
						}, function (response) {
							if (response) {
								updateCounter(response.index, response.length);
							}
						});
					} else {
						chrome.tabs.sendMessage(tab, {
							type: 'reset'
						}, function (response) {
							if (response) {
								updateCounter(response.index, response.length);
							}
						});
					}
				}
			},

			counter: {
				component: 'span',
				class: 'satus-span--counter'
			}
		},
		previous: {
			component: 'button',
			class: 'satus-button--previous',
			attr: {
				disabled: 'true',
				title: 'previous'
			},
			pluviam: true,
			on: {
				click: function () {
					chrome.tabs.sendMessage(tab, {
						type: 'previous'
					}, function (response) {
						if (response) {
							updateCounter(response.index, response.length);
						}
					});
				}
			},

			line_1: {
				component: 'span'
			},
			line_2: {
				component: 'span'
			}
		},
		next: {
			component: 'button',
			class: 'satus-button--next',
			attr: {
				disabled: 'true',
				title: 'next'
			},
			pluviam: true,
			on: {
				click: function () {
					chrome.tabs.sendMessage(tab, {
						type: 'next'
					}, function (response) {
						if (response) {
							updateCounter(response.index, response.length);
						}
					});
				}
			},

			line_1: {
				component: 'span'
			},
			line_2: {
				component: 'span'
			}
		},
		regexp: {
			component: 'button',
			class: 'satus-button--regexp',
			attr: {
				title: 'regularExpression',
				selected: true
			},
			text: '.*',
			pluviam: true,
			on: {
				click: function () {
					var option = this.toggleAttribute('selected'),
						text_field = skeleton.header.text_field.rendered;

					if (option) {
						skeleton.header.text_field.rendered.syntax = 'regex';
					} else {
						skeleton.header.text_field.rendered.syntax = false;
					}

					if (text_field.value.length > 0) {
						chrome.tabs.sendMessage(tab, {
							type: 'input',
							value: text_field.value,
							regexp: option,
							case_sensitive: satus.storage.get('case-sensitive') === true
						}, function (response) {
							if (response) {
								updateCounter(response.index, response.length);
							}
						});
					}

					satus.storage.set('regular-expression', option);
				}
			}
		},
		case_sensitive: {
			component: 'button',
			class: 'satus-button--case-sensitive',
			attr: {
				title: 'caseSensitive'
			},
			text: 'Aa',
			pluviam: true,
			on: {
				click: function () {
					var option = this.toggleAttribute('selected'),
						text_field = skeleton.header.text_field.rendered;

					if (text_field.value.length > 0) {
						chrome.tabs.sendMessage(tab, {
							type: 'input',
							value: text_field.value,
							regexp: satus.storage.get('regular-expression') !== false,
							case_sensitive: option
						}, function (response) {
							if (response) {
								updateCounter(response.index, response.length);
							}
						});
					}

					satus.storage.set('case-sensitive', option);
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# UPDATE COUNTER
--------------------------------------------------------------*/

function updateCounter(index, count) {
	if (count > 0) {
		skeleton.header.text_field.counter.rendered.textContent = index + ' of ' + count;
		skeleton.header.previous.rendered.disabled = false;
		skeleton.header.next.rendered.disabled = false;
	} else {
		skeleton.header.text_field.counter.rendered.textContent = '';
		skeleton.header.previous.rendered.disabled = true;
		skeleton.header.next.rendered.disabled = true;
	}
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.storage.import(function (items) {
	satus.fetch('_locales/' + (items.language || 'en') + '/messages.json', function (object) {
		var background = chrome.runtime.connect({
			name: 'popup'
		});

        for (var key in object) {
            satus.locale.strings[key] = object[key].message;
        }

        if (items['regular-expression'] === false) {
        	skeleton.header.text_field.syntax = false;
        	delete skeleton.header.regexp.attr.selected;
        }

        if (items['case-sensitive'] === true) {
        	skeleton.header.case_sensitive.attr.selected = true;
        }

		satus.render(skeleton);

		background.onMessage.addListener(function (message) {
			if (message && message.value === true) {
				chrome.tabs.sendMessage(tab, {
					type: 'init'
				}, function (response) {
					var text_field = skeleton.header.text_field.rendered;

					if (response && response.length > 0) {
						text_field.value = response;

						satus.storage.set('last-query', response);
					}

					if (text_field.value.length > 0) {
						chrome.tabs.sendMessage(tab, {
							type: 'input',
							value: text_field.value,
							regexp: satus.storage.get('regular-expression') !== false,
							case_sensitive: satus.storage.get('case-sensitive') === true
						}, function (response) {
							if (response) {
								console.log(response);
								updateCounter(response.index, response.length);
							}
						});
					}
				});
			}
		});

		chrome.tabs.query({
			currentWindow: true,
			active: true
		}, function (tabs) {
			tab = tabs[0].id;

			background.postMessage({
				type: 'tab',
				id: tab
			});
		});
	});
});