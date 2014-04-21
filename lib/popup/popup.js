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
	if (isNaN(sec_num) || sec_num === null) {
		time = '-';
		return time;
	} else {
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    time = hours+'h'+minutes+'m'+seconds+'s';
		time = time.replace(/00[\w]{1}/g, '');
		if (isNaN(hours) && isNaN(minutes) && isNaN(seconds)){
			time = '∞';
		}
    return time;
	}
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

chrome.storage.local.get(null, function(obj){
	$.jsonRPC.setup({
	  endPoint: obj.rpcpath,
	  namespace: 'aria2'
	});
})
	
function aria2CMD(c,i) {
	chrome.storage.local.get(null, function(obj){
		var rpct = 'token:' + obj.rpctoken;
		$.jsonRPC.request(c, {
			params: [rpct, i]
		})
	});
}

function writeUI() {
	chrome.storage.local.get(null, function(obj){
		var rpct = 'token:' + obj.rpctoken;
		$.jsonRPC.request('getGlobalStat', {
			params: [rpct],
			success: function(result) {
				// headline part
				var res = result.result, headInfotpl = $('#headInfo').html(), tplpart = new Object();
				Mustache.parse(headInfotpl); 
				tplpart.globspeed = bytesToSize(res.downloadSpeed, 2);
				var headInfohtml = Mustache.render(headInfotpl, res, tplpart);
				$('#globalstat').html(headInfohtml);
				
				var rquestParams = ["status","gid","completedLength","totalLength","files","connections","dir","downloadSpeed"];
				$.jsonRPC.batchRequest([
				{
			      method: 'tellActive',
			      params: [rpct, rquestParams]
			    },
			    {
			      method: 'tellWaiting',
			      params: [rpct,0,parseInt(res.numWaiting),rquestParams]
			    },
			    {
			      method: 'tellStopped',
			      params: [rpct,0,parseInt(res.numStopped),rquestParams]
			    }
			], {
			    success: function(result) {
					var activeRes = result[0].result, waitRes = result[1].result, stopRes = result[2].result;
		            if (activeRes.length + waitRes.length + stopRes.length === 0 && !$(document).find('.tasktitle').length) {
		            	$("#activetpl").html('Empty task list');
		            } else {
						printTask(result);
		        	}
		    	}
		  	});
		}})
	})
}

function printTask(res) {
	var tplID = ["#activetpl","#waitingtpl","#stoppedtpl"];
	for (var i = 0; i < res.length; i++) {
		var r = res[i].result, taskInfotpl = $('#taskInfo').html(), taskInfohtml = '', files, taskid, tplpart = new Object(), dataProp, bartheme;
		Mustache.parse(taskInfotpl); 
		for (var j = 0; j < r.length; j++) {
			files = r[j].files; 
			taskid = r[j].gid;
			tplpart.displayName = files[0].path.split("/").pop();  /*display name */
			tplpart.dlspeedPrec = bytesToSize(r[j].downloadSpeed, 2);
			tplpart.tlengthPrec = bytesToSize(r[j].totalLength, 2);
			tplpart.clengthPrec = bytesToSize(r[j].completedLength, 2);
			tplpart.completeRatio = parseFloat(r[j].completedLength/r[j].totalLength*100,2).toFixed(2).toString();
			var etasec = (r[j].totalLength - r[j].completedLength)/r[j].downloadSpeed;
			tplpart.eta = etasec.toHHMMSS();
			tplpart.statusUpper = capitaliseFirstLetter(r[j].status);
			taskInfohtml += Mustache.render(taskInfotpl, r[j], tplpart);
		}
		//console.log(taskInfohtml);
		$(tplID[i]).html(taskInfohtml); // write to html
		
	    // progressbar
		for (var j = 0; j < r.length; j++) {
			switch(r[j].status)
			{
				case 'active':
				case 'paused':
				case 'waiting':
					barbg = '#ACF';
					break;
				case 'error':
					barbg = '#EA6A6A';
					break;
				case 'complete':
					barbg = '#8AE62E';
					break;
				case 'removed':
					barbg = '#ECECEC';
					break;
			}
			var baroption = {bg: barbg, target: document.getElementById('taskBar_' + r[j].gid)};
			var nanobar = new Nanobar( baroption );
			if (isNaN(r[j].completedLength) || r[j].completedLength == 0) {
				nanobar.go(0);
			} else { 
				nanobar.go(r[j].completedLength/r[j].totalLength*100);
			}
		}
	}
    //progress bar event binding
    $('#WEBUI').ready(function(){
    	$('#purgebtn').click(function(){
			aria2CMD('purgeDownloadResult','');
		});
    	$('button[id*=removebtn]').click(function(){
    		var taskStatus = $(this).attr('class'), taskId = $(this).attr('id').split('_').pop(), meth;
    		switch(taskStatus)
			{
				case 'active':
				case 'waiting':
				case 'paused':
					meth = 'forceRemove';
					break;
				case 'error':
				case 'complete':
				case 'removed':
					meth = 'removeDownloadResult';
					break;
			}
			aria2CMD(meth, taskId);
		});
		$('div[id*=taskBar]').click(function(){
			var taskStatus = $(this).attr('class'), taskId = $(this).attr('id').split('_').pop(), meth;
			switch(taskStatus)
			{
				case 'active':
				case 'waiting':
					meth = 'pause';
					break;
				case 'error':
				case 'complete':
				case 'removed':
					meth = 'removeDownloadResult';
					break;
				case 'paused':
					meth = 'unpause';
					break;
			}
			aria2CMD(meth, taskId);
		});
	});
}

writeUI();
var uirefrsh = setInterval(writeUI, 1000);