chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    'use strict';
    if (request.range === "cookie") {
        sendResponse({pagecookie: document.cookie});
    }
    if (request.range === "both") {
        sendResponse({pagecookie: document.cookie, taburl: document.URL});
    }
});