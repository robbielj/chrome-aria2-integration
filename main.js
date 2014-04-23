var settings = new Store('settings', {
        "rpcpath" : "http://localhost:6800/jsonrpc",
        "rpctoken" : "",
        "filesizesetting" : "500M",
        "whitelisttype" : "",
        "whitelistsite" : "",
        "blacklistsite" : "",
        "captureCheckbox" : true,
        "sizecaptureCheckbox" : true
    });

chrome.storage.local.set({"rpcpath":settings.get('rpcpath')});
chrome.storage.local.set({"rpctoken":settings.get('rpctoken')});

//Binux 
//https://github.com/binux

var ARIA2 = (function () {
        "use strict";
        function get_auth(url) {
            return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
        }

        function request(jsonrpc_path, method, params) {
            var jsonrpc_version = '2.0', xhr = new XMLHttpRequest(), auth = get_auth(jsonrpc_path);
            var request_obj = {
                    jsonrpc: jsonrpc_version,
                    method: method,
                    id: (new Date()).getTime().toString()
                };
            if (params) {
                request_obj.params = params;
            }
            xhr.open("POST", jsonrpc_path + "?tm=" + (new Date()).getTime().toString(), true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            if (auth) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(auth));
            }
            xhr.send(JSON.stringify(request_obj));
        }

        return function (jsonrpc_path) {
            this.jsonrpc_path = jsonrpc_path;
            this.addUri = function (uri, options) {
                request(this.jsonrpc_path, 'aria2.addUri', ['token:' + settings.get('rpctoken'), [uri], options]);
            };
            return this;
        };
    }());


function showNotification() {
    "use strict";
    var notfopt = {
            type: "basic",
            title: "Aria2 Integration",
            iconUrl: "icons/notificationicon.png",
            message: "The download has been sent to aria2 queue"
        };
    chrome.notifications.create("senttoaria2", notfopt, function () {return; });
    window.setTimeout(function () {chrome.notifications.clear("senttoaria2", function () {return; }); }, 3000);
}

// context menu module
chrome.contextMenus.create(
    {
        title: 'Download with aria2',
        id: "linkclick",
        contexts: ['link']
    }
);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    "use strict";
    if (info.menuItemId === "linkclick") {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {range: "cookie"}, function (response) {
                var aria2 = new ARIA2(settings.get('rpcpath')),
                    params = {};
                params.referer = tab.url;
                params.header = "Cookie:" + response.pagecookie;
                aria2.addUri(info.linkUrl, params);
                showNotification();
            });
        });
    }
});

//Auto capture module
function sitelistProc(list) {
	var re_list;
    if (list === '') {
        re_list = new RegExp('^\\s$', "g");
    } else {
        list = list.replace(/\./g, "\\.");
        list = list.replace(/\,/g, "|");
        list = list.replace(/\*/g, "[^ ]*");
        re_list = new RegExp(list, "gi");
    }
    return re_list;
}

function isCapture(size, url, name) {
    "use strict";
    var bsites = settings.get('blacklistsite'), wsites = settings.get('whitelistsite');
    var re_bsites = sitelistProc(bsites), re_wsites = sitelistProc(wsites);

    var ftypes = settings.get('whitelisttype').toLowerCase();
    var Intype = ftypes.indexOf(name.split('.').pop().toLowerCase());
    
    var thsize = settings.get('filesizesetting');
    var thsizeprec = ['K', 'M', 'G', 'T'];
    var thsizebytes = thsize.match(/[\d\.]+/)[0] * Math.pow(1024, thsizeprec.indexOf(thsize.match(/[a-zA-Z]+/)[0].toUpperCase()) + 1);

    var res;
    switch (true) {
    case re_bsites.test(url):
        res = 0;
        break;
    case re_wsites.test(url):
        res = 1;
        break;
    case (Intype !== -1):
        res = 1;
        break;
    case (size >= thsizebytes && settings.get('sizecaptureCheckbox')):
        res = 1;
        break;
    default:
        res = 0;
    }

    return res;
}

function captureAdd(Item, resp) {
    "use strict";
    if (isCapture(Item.fileSize, resp.taburl, Item.filename) === 1) {
        var aria2 = new ARIA2(settings.get('rpcpath')), params = {};
        params.referer = resp.taburl;
        params.header = "Cookie:" + resp.pagecookie;
        params.out = Item.filename;
        aria2.addUri(Item.url, params);
        //console.log(Item);
        chrome.downloads.cancel(Item.id);
        showNotification();
    }
}


chrome.downloads.onDeterminingFilename.addListener(function (Item, s) {
    "use strict";
    //console.log(Item);
    if (settings.get('captureCheckbox')) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {range: "both"}, function (response) {
                if (response === undefined) {
                    chrome.tabs.sendMessage(tabs[0].openerTabId, {range: "both"}, function (response) {
                        captureAdd(Item, response);
                        chrome.tabs.remove(tabs[0].id);
                    });
                } else {
                    captureAdd(Item, response);
                }
            });
        });
    }
});
