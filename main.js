var settings = new Store('settings', {
	"rpcpath":"http://localhost:6800/jsonrpc",
	"rpctoken" : "",
	"filesizesetting": "500M",
	"whitelisttype": "",
	"whitelistsite":"",
	"blacklistsite":""
});

//Binux 
//https://github.com/binux
	
var ARIA2 = (function() {
  var jsonrpc_version = '2.0';

  function get_auth(url) {
    return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
  };

  function request(jsonrpc_path, method, params) {
    var request_obj = {
      jsonrpc: jsonrpc_version,
      method: method, 
      id: (new Date()).getTime().toString(),
    };
    if (params) request_obj['params'] = params;

    var xhr = new XMLHttpRequest();
    var auth = get_auth(jsonrpc_path);
    xhr.open("POST", jsonrpc_path+"?tm="+(new Date()).getTime().toString(), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    if (auth) xhr.setRequestHeader("Authorization", "Basic "+btoa(auth));
    xhr.send(JSON.stringify(request_obj));
  };

  return function(jsonrpc_path) {
    this.jsonrpc_path = jsonrpc_path;
    this.addUri = function (uri, options) {
      request(this.jsonrpc_path, 'aria2.addUri', ['token:' + settings.get('rpctoken'), [uri, ], options]);
    };
    return this;
  }
})();


// context menu module
chrome.contextMenus.create(
	{
		title: 'Download with aria2',
		id: "linkclick",
		contexts: ['link'],
	}
); 

chrome.contextMenus.onClicked.addListener(function(info, tab){
	if (info.menuItemId == "linkclick") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {range:"cookie"}, function(response) {
				var aria2 = new ARIA2(settings.get('rpcpath'));
				var params = {};
				params.referer = tab.url;
				params.header = "Cookie:" + response.pagecookie;
				aria2.addUri(info.linkUrl, params);
			});
		})
	}
});

//Auto capture module
function IsCapture(size, url, name){
	var bsites = settings.get('blacklistsite');
	if (bsites == '') {
		var re_bsites = new RegExp('^\\s$',"g");
	} else {
		var bsitesrep = bsites.replace(/\./g,"\\\.");
		bsitesrep = bsitesrep.replace(/\,/g,"|");
		bsitesrep = bsitesrep.replace(/\*/g,"[^ ]*");
		var re_bsites = new RegExp(bsitesrep,"gi");
	}

	var wsites = settings.get('whitelistsite');
	if (wsites == '') {
		var re_wsites = new RegExp('^\\s$',"gi");
	} else {
		var wsitesrep = wsites.replace(/\./g,"\\\.");
		wsitesrep = wsitesrep.replace(/\,/g,"|");
		wsitesrep = wsitesrep.replace(/\*/g,"[^ ]*");
		var re_wsites = new RegExp(wsitesrep,"gi");
	}

	var ftypes = settings.get('whitelisttype').toLowerCase();
	var Intype = ftypes.indexOf(name.split('.').pop().toLowerCase());

	var thsize = settings.get('filesizesetting');
	var thsizeprec = ['K', 'M', 'G', 'T'];
	var thsizebytes = thsize.match(/[\d\.]+/)[0] * Math.pow(1024,thsizeprec.indexOf(thsize.match(/[a-zA-Z]+/)[0].toUpperCase())+1);
	var res = 0;
	Condition:{
		if (url.match(re_bsites)) {
			res = 0;
			break Condition;
		}
		if (url.match(re_wsites)) {
			res = 1;
			break Condition;
		}
		if (Intype != -1) {
			res = 1;
			break Condition;
		}
		if (size>=thsizebytes) res = 1;
	}
	return res;
}

chrome.downloads.onDeterminingFilename.addListener(function(Item, s){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {range:"both"}, function(response) {
			if (IsCapture(Item.fileSize, response.taburl, Item.filename) == 1){
				var aria2 = new ARIA2(settings.get('rpcpath'));
				var params = {};
				params.referer = response.taburl;
				params.header = "Cookie:" + response.pagecookie;
				params.out = Item.filename;
				aria2.addUri(Item.url, params);
				chrome.downloads.cancel(Item.id);
				var notfopt = {
					type: "basic",
					title: "Aria2 Integration",
					iconUrl: "icons/icon64.png",
					message: "The download has been sent to aria2 queue"
  				};
				chrome.notifications.create("senttoaria2", notfopt, function(){});
				senttoaria2.show();
				setTimeout(function(){senttoaria2.cancel();},3000);}
		});
	});
});
