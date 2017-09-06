songQueue = []
tabID = 0;
loaded = true;
var youtubeKey = "AIzaSyCP0UNlO9_N1Pq13E6Rl8gIwAjnF_zqNO4"

//Creates url objects used in updating tab url
function makeNextSong(){
	var url = {
		url: songQueue[0]
	}
	return url;
}
//Creates download url object
function makeDwnObj(url){
	var obj = {
		url: url,
		saveAs: true,
		method: "GET"
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
		// anHttpRequest.setRequestHeader("Referer", "http://www.youtubeinmp3.com/download/");
        anHttpRequest.send( null );
    }
}

function parseURL(json){
	url = json['link'];
	chrome.tabs.update(tabID, makeDwnObj(url));
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
//determines which context Menu clicked, acts accordingly
function onClickHandler(info, tab){
	tabID = tab.id;
	if(info.menuItemId == "addItem"){
		songQueue.push(info.linkUrl);
		console.log("added song tabid = " + tab.id);
		console.log(songQueue[songQueue.length-1] + " added to queue");
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
		client.get(("http://www.youtubeinmp3.com/fetch/?format=JSON&video=" + dwnURL), function(response){
			console.log("Response: " + response);
			var response = JSON.parse(response);
			link = response.link;
			chrome.downloads.download(makeDwnObj(link));
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
				getID(songQueue[i]) +
				"&key=" + youtubeKey +
				"&part=snippet"), function(response){
					var response = JSON.parse(response);
					queueItems.push('• ' + response["items"][0]["snippet"]["title"] + '\n');
					stringItems += '• ' + response["items"][0]["snippet"]["title"] + '\n';
				if(queueItems.length == songQueue.length){
					var notification = {
						type: "basic",
						iconUrl: "menu.png", //response["items"][0]["snippet"]["thumbnails"]["default"]["url"],
						title: "Queued Items",
						message: stringItems
					}
					chrome.notifications.create("qNoti", notification);
				}
				})
			}
		}
		else{
			var notification = {
				type: "basic",
				iconUrl: "menu.png",
				title: "Queued Items",
				message: "• No items queued"
			}
			chrome.notifications.create("qNoti", notification);
		}
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
	else if(changeInfo.audible
		&& tabId == tabID){
			loaded = true;
			console.log("reset 'loaded' boolean")
		}
}

//creates the context Menu objects
var addQItemMenu = chrome.contextMenus.create({"title": "Add to queue", "id": "addItem",
 	"contexts": ["link"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var downloadItemMenu = chrome.contextMenus.create({"title": "Download Video", "id": "downloadItem",
 	"contexts": ["link", "video"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var clearQ = chrome.contextMenus.create({"title": "Clear Queue", "id": "clearItems",
	"contexts": ["link", "video", "page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var showQ = chrome.contextMenus.create({"title": "Display Queue", "id": "showItems",
	"contexts": ["link", "video", "page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});

chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.tabs.onUpdated.addListener(onUpdated);
