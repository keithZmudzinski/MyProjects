songQueue = []
tabID = 0;
loaded = true;
// iconSwitch = true;
// downloadIconID = 0;
var youtubeKey = "AIzaSyCP0UNlO9_N1Pq13E6Rl8gIwAjnF_zqNO4"

//Creates url objects used in updating tab url
function makeNextSong(){
	var url = {
		url: songQueue[0]
	}
	return url;
}
//Creates download url object
function makeDwnObj(url, saveOption, name = ""){
	console.log("name" + name);
	if(name == ""){
		var obj = {
			url: url,
			saveAs: true,
			method: "GET"
		}
	}
	else{
		var obj = {
			url: url,
			filename:name,
			conflictAction: 'overwrite',
			saveAs: false,
			method: "GET"
		}
	}
	return obj;
}
var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

function parseURL(json){
	url = json['link'];
	chrome.tabs.update(tabID, makeDwnObj(url, true));
}
function getID(url){
	id = url.substring(url.search("v=")+2);
	timeMarker = id.search("&t=");
	if(timeMarker != -1){
		id = id.substring(0,timeMarker);
	}
	console.log("ID of video to display: " + id);
	return id
}
function makeNoti(strMessage){
	var notification = {
		type: "basic",
		iconUrl: "menu.png",//"C:\\Users\\Keith\\Music\\Downloads\\icon.png",
		title: "Queued Items",
		message: strMessage
	}
	// if(icon){
	// 	notification.iconUrl = "C:\\Users\\Keith\\Music\\Downloads\\icon.png"
	// }
	// else{
	// 	notification.iconUrl = "C:\\Users\\Keith\\Music\\Downloads\\icon1.png"
	// }
	// if(strMessage == "• No items queued"){
	// 	notification.iconUrl = "menu.png";
	// }
	chrome.notifications.create("qNoti", notification);
}
function checkIcon(downloadDelta){
	if(downloadDelta.id == downloadIconID){
		if(downloadDelta.state.current == 'complete'){
			options = {
				iconUrl: "C:\\Users\\Keith\\Music\\Downloads\\icon.png"
			}
			console.log("updated notification successfully");
			chrome.notifications.update("qNoti", options)
		}
	}
}
function updateIcon(){
	iconSwitch = !iconSwitch;
	if(iconSwitch){
		var name = "icon.png";
	}
	else{
		var name = "icon1.png";
	}
	console.log("Update Icon called");
	iconUrl = "";
	var video = getVideoObj(getID(songQueue[0]),
	function(response){
		response = JSON.parse(response);
		iconUrl = response["items"][0]["snippet"]["thumbnails"]["default"]["url"]
		chrome.downloads.download(makeDwnObj(iconUrl, false, name),
		function(id){
			downloadIconID = id;
		})
			// var toErase = {
			// 	id: id
			// }
			// chrome.downloads.erase(toErase)
	});
}
function getVideoObj(id,callback){
	var request = new HttpClient();
	request.get(("https://www.googleapis.com/youtube/v3/videos?id=" +
	id +
	"&key=" + youtubeKey +
	"&part=snippet"), function(response){
		callback(response);
	})
}
//determines which context Menu clicked, acts accordingly
function onClickHandler(info, tab){
	tabID = tab.id;
	if(info.menuItemId == "addItem"){
		songQueue.push(info.linkUrl);
		//calls updateIcon if songQueue goes from empty to having an item
		// if(songQueue.length == 1){
		// 	updateIcon();
		// }
	}
	else if (info.menuItemId == "downloadItem"){
		//allows for downloading suggested videos or current video
		if(info.mediaType == "video"){
			dwnURL = info.pageUrl;
		}
		else{
			dwnURL = info.linkUrl;
		}

		var client = new HttpClient();
		client.get(("http://www.youtubeinmp3.com/fetch/?format=JSON&video=" + dwnURL),
		function(response){
			console.log("Response: " + response);
			var response = JSON.parse(response);
			link = response['link'];
			chrome.downloads.download(makeDwnObj(link, true));
		});
	}
	else if (info.menuItemId == "clearItems"){
		songQueue = [];
	}
	else if (info.menuItemId == "showItems"){
		if(songQueue.length != 0){
			var queueItems = [];
			var songID;
			var videoData;
			var stringItems = "";
			var request = new HttpClient();
			for (var i = 0; i < songQueue.length; i++){
				songID = getID(songQueue[i]);
				request.get(("https://www.googleapis.com/youtube/v3/videos?id=" +
				songID +
				"&key=" + youtubeKey +
				"&part=snippet"),
				function(response){
					var response = JSON.parse(response);
					queueItems.push('• ' + response["items"][0]["snippet"]["title"] + '\n');
					stringItems += '• ' + response["items"][0]["snippet"]["title"] + '\n';
					if(queueItems.length == songQueue.length){
						makeNoti(stringItems);					//.get() is asynch, can't figure out
					}											// callbacks to make notification after for loop completes
				})
			}
		}
		else{
			makeNoti("• No items queued")
		}
	}
	else if (info.menuItemId == "nxtQ"){
		chrome.tabs.update(tabID, makeNextSong());
	}
}

//Checks if the tab that signals update is
//	the tab user has queued a video in
function onUpdated(tabId, changeInfo, tab){
	console.log("updated tab id  = " + tabId);
	// Determines if tab should go to next song in queue
	if(!(changeInfo.audible)
	 	&& tabId == tabID
	 	&& changeInfo.status == "complete"
		&& loaded){
			console.log("Song has ended");
			chrome.tabs.update(tabID, makeNextSong());
			songQueue.shift();
			loaded = false;
	}// determines when the next tab has finished loading and is playing music
	else if(changeInfo.audible && tabId == tabID){
			loaded = true;
			console.log("reset 'loaded' boolean");
			// if(songQueue.length > 0){
			// 	updateIcon();
			// }
		}
}

//creates the context Menu objects
var addQItemMenu = chrome.contextMenus.create({"title": "Add to queue", "id": "addItem",
 	"contexts": ["link"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var downloadItemMenu = chrome.contextMenus.create({"title": "Download Video", "id": "downloadItem",
 	"contexts": ["link", "video"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var clearQ = chrome.contextMenus.create({"title": "Clear Queue", "id": "clearItems",
	"contexts": ["page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var showQ = chrome.contextMenus.create({"title": "Display Queue", "id": "showItems",
	"contexts": ["page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var next = chrome.contextMenus.create({"title": "Next in queue", "id": "nxtQ",
	"contexts": ["page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});

chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.tabs.onUpdated.addListener(onUpdated);
// chrome.downloads.onChanged.addListener(checkIcon);
