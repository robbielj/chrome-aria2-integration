chrome.storage.local.get(null, function(obj){
	var rpcpath = obj.rpcpath, rpctoken = obj.rpctoken;
});


function bytesToSize(bytes, precision)
{  
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;
   
    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' B';
 
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KB';
 
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MB';
 
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GB';
 
    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB';
 
    } else {
        return bytes + ' B';
    }
}

Number.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+'h'+minutes+'m'+seconds+'s';
	time = time.replace(/00[\w]{1}/g, '');
    return time;
}

chrome.storage.local.get(null, function(obj){
	$.jsonRPC.setup({
	  endPoint: obj.rpcpath,
	  namespace: 'aria2'
	});
})


function writeUI() {
	chrome.storage.local.get(null, function(obj){
		var rpct = 'token:' + obj.rpctoken;
		$.jsonRPC.request('getGlobalStat', {
			params: [rpct],
			success: function(result) {
				var res = result.result;
				$('#globalstat').html('<div style="float:right">' + bytesToSize(res.downloadSpeed, 2) + '/s</div><br /><hr>')
				$.jsonRPC.batchRequest([
				{
			      method: 'tellActive',
			      params: [rpct, ["gid","completedLength","totalLength","files","connections","dir","downloadSpeed"]]
			    },
			    {
			      method: 'tellWaiting',
			      params: [rpct,0,parseInt(res.numWaiting),["completedLength","totalLength","files","dir","status"]]
			    },
			    {
			      method: 'tellStopped',
			      params: [rpct,0,parseInt(res.numStopped),["gid","completedLength","totalLength","files","status","dir"]]
			    }
			], {
			    success: function(result) {
					var activeRes = result[0].result, waitRes = result[1].result, stopRes = result[2].result;
					for (var i = stopRes.length - 1; i >= 0; i--) {
						if(stopRes[i].status === 'complete') {
							$("div[id*=" + stopRes[i].gid + "]").remove();
		            		stopRes.splice(i,1);
		            	}
		            }
		            if (activeRes.length + waitRes.length + stopRes.length === 0) {
		            	$("#activetpl").html('No ongoing, error or pause task');
		            } else {
						printActive(activeRes);
						printQueue(waitRes);
		            	printError(stopRes);
		        	}
		    	}
		  	});
		}})
	})
}

function printActive(r) {
	var infohtml;
	//$('#activetpl').empty();
	for (var i = 0; i < r.length; i++) {
		var files = r[i].files;
		r[i].displayName = files[0].path.split("/").pop();  /*display name */
		r[i].dlspeedPrec = bytesToSize(r[i].downloadSpeed, 2);
		r[i].tlengthPrec = bytesToSize(r[i].totalLength, 2);
		r[i].clengthPrec = bytesToSize(r[i].completedLength, 2);
		var etasec = (r[i].totalLength - r[i].completedLength)/r[i].downloadSpeed;
		r[i].eta = etasec.toHHMMSS();
		
		var tplID = "activetpl_" + r[i].gid;
		var tplbarID = "activetplbar_" + r[i].gid;
		
		if ($("#" + tplID).html()==null){
			$("#activetpl").append("<div id=" + tplID + "></div>");
		}
		var infotpl = "<div class='tasktitle'>[{{displayName}}]</div>{{clengthPrec}}/{{tlengthPrec}}, {{connections}} conns, {{dlspeedPrec}}/s, ETA: {{eta}}";
		infohtml = Mustache.to_html(infotpl, r[i]);
		$('#' + tplID).html(infohtml);
		if ($("#" + tplbarID).html()==null){
			$("#" + tplID).after("<div id=" + tplbarID + "></div>");
			$("#" + tplbarID).css("width","20%");
			progressJs("#" + tplbarID).setOptions({overlayMode: true, theme: 'blueOverlayRadiusWithPercentBar'}).start();
			progressJs("#" + tplbarID).set(Math.ceil(r[i].completedLength/r[i].totalLength*100));
			$("#" + tplbarID).after("<br /><br />");
		} 
		var n = $("#" + tplbarID).attr('data-progressjs');
		var prog = parseInt($("div[data-progressjs='" + n + "']").text());
		var incrment = r[i].completedLength/r[i].totalLength*100-prog;
		progressJs("#" + tplbarID).increase(incrment);
	}
}

function printQueue(r) {
	var infohtml;
	for (var i = 0; i < r.length; i++) {
		var files = r[i].files;
		r[i].displayName = files[0].path.split("/").pop();  /*display name */
		r[i].tlengthPrec = bytesToSize(r[i].totalLength, 2);
		
		var tplID = "queuetpl_" + r[i].gid;
		var tplbarID = "queuetplbar_" + r[i].gid;
		
		if ($("#" + tplID).html()==null){
			$("#queuetpl").append("<div id=" + tplID + "></div>");
		}
		var infotpl = "<div class='tasktitle'>[{{displayName}}]</div>{{tlengthPrec}}, {{status}}";
		infohtml = Mustache.to_html(infotpl, r[i]);
		$('#' + tplID).html(infohtml);
		if ($("#" + tplbarID).html()==null){
			$("#" + tplID).after("<div id=" + tplbarID + "></div>");
			$("#" + tplbarID).css("width","20%");
			progressJs("#" + tplbarID).setOptions({overlayMode: true, theme: 'blueOverlayRadiusWithPercentBar'}).start();
			progressJs("#" + tplbarID).set(r[i].completedLength/r[i].totalLength*100);
			$("#" + tplbarID).after("<br /><br />");
		} 
	}
}		

function printError(r) {
	var infohtml;
	for (var i = 0; i < r.length; i++) {
		var files = r[i].files;
		r[i].displayName = files[0].path.split("/").pop();  /*display name */
		r[i].tlengthPrec = bytesToSize(r[i].totalLength, 2);
		r[i].clengthPrec = bytesToSize(r[i].completedLength, 2);
		
		var tplID = "errortpl_" + r[i].gid;
		var tplbarID = "errortplbar_" + r[i].gid;
		
		if ($("#" + tplID).html()==null){
			$("#errortpl").append("<div id=" + tplID + "></div>");
		}
		var infotpl = "<div class='tasktitle'>[{{displayName}}]</div>{{clengthPrec}}/{{tlengthPrec}}, {{status}}";
		infohtml = Mustache.to_html(infotpl, r[i]);
		$('#' + tplID).html(infohtml);
		
		if ($("#" + tplbarID).html()==null){
			$("#" + tplID).after("<div id=" + tplbarID + "></div>");
			$("#" + tplbarID).css("width","20%");
			progressJs("#" + tplbarID).setOptions({overlayMode: true, theme: 'blueOverlayRadiusWithPercentBar'}).start();
			progressJs("#" + tplbarID).set(r[i].completedLength/r[i].totalLength*100);
			$("#" + tplbarID).after("<br /><br />");
		} 
		var n = $("#" + tplbarID).attr('data-progressjs');
	}
}

writeUI();
setTimeout(setInterval(writeUI, 1000),1000);