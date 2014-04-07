var settings = new Store('settings', {"rpcpath":"http://localhost:6800/jsonrpc","rpctoken" : ""});

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


chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
 		window.pagecookie = message.cookie;
});

chrome.contextMenus.create(
	{
		title: 'Download with aria2',
		id: "linkclick",
		contexts: ['link'],
	}
); 

chrome.contextMenus.onClicked.addListener(function(info, tab){
	if (tab.id = "linkclick") {
		var aria2 = new ARIA2(settings.get('rpcpath'));
		var params = RULE(info,tab);
		aria2.addUri(info.linkUrl, params);
	}
});