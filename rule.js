/* This file adds extra processing rules for certain websites, like specifying file name*/  

var RULE = (function() {
	function rulematch(url,tab) {
		var params = {};
		switch (true) {
			case /http\:\/\/[www.]*howfile\.com\/file/.test(tab.url):
				var regmatch = tab.title.match(/(.+) \- howfile/);
				params.out = regmatch[1];
			default:
				params.referer = tab.url;
				params.header = "Cookie:" + window.pagecookie;
				break;
			}
		return params;
	}
	
	return function(info,tab) {
		this.info = info;
		this.tab = tab;
		this.params = rulematch(this.url, this.tab);
		return this.params;
	}
})()
