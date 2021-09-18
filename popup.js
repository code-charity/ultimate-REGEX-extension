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

function highlightItem(index, value) {
	return {
		component: 'section',
		variant: 'card',
		properties: {
			itemIndex: index
		},

		section: {
			component: 'section',

			text_field: {
				component: 'text-field',
				syntax: 'regex',
				value: value,
				on: {
					change: function () {
						var data = satus.storage.get('highlight') || {},
							index = this.parentNode.parentNode.itemIndex;

						if (satus.isset(data[index]) === false) {
							data[index] = {};
						}

						data[index].text = this.value;

						satus.storage.set('highlight', data);
					}
				}
			},
			remove: {
				component: 'button',
				variant: 'remove',
				attr: {
					'title': 'remove'
				},
				on: {
					click: function () {
						var data = satus.storage.get('highlight') || {};

						delete data[this.parentNode.parentNode.itemIndex];

						satus.storage.set('highlight', data);

						this.parentNode.parentNode.remove();
					}
				},

				svg: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24',
						'width': '22',
						'height': '22',
						'fill': 'currentColor'
					},

					path: {
						component: 'path',
						attr: {
							'd': 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
						}
					}
				}
			}
		},
		background_color: {
			component: 'color-picker',
			text: 'backgroundColor',
			value: {
				rgb: [255, 255, 0]
			},
			storage: 'highlight/' + index + '/background_color'
		},
		text_color: {
			component: 'color-picker',
			text: 'textColor',
			value: {
				rgb: [0, 0, 0]
			},
			storage: 'highlight/' + index + '/text_color'
		}
	};
}

function replaceItem(index, search, replace) {
	return {
		component: 'section',
		variant: 'card',
		properties: {
			itemIndex: index
		},

		section: {
			component: 'section',

			search: {
				component: 'text-field',
				syntax: 'regex',
				value: search,
				on: {
					change: function () {
						var data = satus.storage.get('replace') || {},
							index = this.parentNode.parentNode.itemIndex;

						if (satus.isset(data[index]) === false) {
							data[index] = {};
						}

						data[index].search = this.value;

						satus.storage.set('replace', data);
					}
				}
			},
			remove: {
				component: 'button',
				variant: 'remove',
				attr: {
					'title': 'remove'
				},
				on: {
					click: function () {
						var data = satus.storage.get('replace') || {};

						delete data[this.parentNode.parentNode.itemIndex];

						satus.storage.set('replace', data);

						this.parentNode.parentNode.remove();
					}
				},

				svg: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24',
						'width': '22',
						'height': '22',
						'fill': 'currentColor'
					},

					path: {
						component: 'path',
						attr: {
							'd': 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
						}
					}
				}
			}
		},
		section_2: {
			component: 'section',

			replace: {
				component: 'text-field',
				syntax: 'regex',
				value: replace,
				on: {
					change: function () {
						var data = satus.storage.get('replace') || {},
							index = this.parentNode.parentNode.itemIndex;

						if (satus.isset(data[index]) === false) {
							data[index] = {};
						}

						data[index].replace = this.value;

						satus.storage.set('replace', data);
					}
				}
			}
		}
	};
}

var skeleton = {
	component: 'base',

	header: {
		component: 'header',

		burger: {
			component: 'button',
			class: 'satus-button--burger',
			attr: {
				title: 'more'
			},
			pluviam: true,
			on: {
				click: function () {
					skeleton.rendered.classList.toggle('satus-base--expanded');
				}
			},

			line_1: {
				component: 'span'
			},
			line_2: {
				component: 'span'
			},
			line_3: {
				component: 'span'
			}
		},
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
		},
		close: {
			component: 'button',
			class: 'satus-button--close',
			attr: {
				title: 'close'
			},
			pluviam: true,
			on: {
				click: function () {
					close();
				}
			}
		}
	},
	main: {
		component: 'main'
	},
	aside: {
		component: 'aside',

		highlight: {
			component: 'button',
			variant: 'highlight',
			class: 'satus-button--selected',
			attr: {
				title: 'highlight'
			},
			pluviam: true,
			on: {
				render: function () {
					this.click();
				},
				click: function () {
					var main = skeleton.main.rendered,
						data = satus.storage.get('highlight') || {},
						section = {
							title: {
								component: 'h1',
								text: 'highlight'
							},
							container: {
								component: 'div'
							},
							button: {
								component: 'button',
								variant: 'add',
								text: '+',
								on: {
									click: function () {
										satus.render(highlightItem(new Date().getTime(), ''), this.previousSibling);
									}
								}
							}
						};

					if (Object.keys(data).length > 0) {
						for (var key in data) {
							section.container[key] = highlightItem(key, data[key].text);
						}
					} else {
						section.container[0] = highlightItem(new Date().getTime(), '');
					}

					satus.empty(main);
					satus.render(section, main);

					this.parentNode.querySelector('.satus-button--selected').classList.remove('satus-button--selected');
					this.classList.add('satus-button--selected');
				}
			},

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'fill': 'currentColor'
				},

				path: {
					component: 'path',
					attr: {
						'd': 'm6 14 3 3v5h6v-5l3-3V9H6v5zm5-12h2v3h-2V2zM3.5 5.88l1.41-1.41 2.12 2.12L5.62 8 3.5 5.88zm13.46.71 2.12-2.12 1.41 1.41L18.38 8l-1.42-1.41z'
					}
				}
			}
		},
		replace: {
			component: 'button',
			variant: 'replace',
			attr: {
				title: 'searchAndReplace'
			},
			pluviam: true,
			on: {
				click: function () {
					var main = skeleton.main.rendered,
						data = satus.storage.get('replace') || {},
						section = {
							title: {
								component: 'h1',
								text: 'searchAndReplace'
							},
							container: {
								component: 'div'
							},
							button: {
								component: 'button',
								variant: 'add',
								text: '+',
								on: {
									click: function () {
										satus.render(replaceItem(new Date().getTime(), '', ''), this.previousSibling);
									}
								}
							}
						};

					if (Object.keys(data).length > 0) {
						for (var key in data) {
							section.container[key] = replaceItem(key, data[key].search, data[key].replace);
						}
					} else {
						section.container[0] = replaceItem(new Date().getTime(), '', '');
					}

					satus.empty(main);
					satus.render(section, main);

					this.parentNode.querySelector('.satus-button--selected').classList.remove('satus-button--selected');
					this.classList.add('satus-button--selected');
				}
			},

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'fill': 'currentColor'
				},

				path: {
					component: 'path',
					attr: {
						'd': 'M11 6c1.38 0 2.63.56 3.54 1.46L12 10h6V4l-2.05 2.05A6.976 6.976 0 0 0 11 4c-3.53 0-6.43 2.61-6.92 6H6.1A5 5 0 0 1 11 6zm5.64 9.14A6.89 6.89 0 0 0 17.92 12H15.9a5 5 0 0 1-4.9 4c-1.38 0-2.63-.56-3.54-1.46L10 12H4v6l2.05-2.05A6.976 6.976 0 0 0 11 18c1.55 0 2.98-.51 4.14-1.36L20 21.49 21.49 20l-4.85-4.86z'
					}
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