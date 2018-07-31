


songQueue = []
hiddenQueue = []
tabID = 0;
loaded = true;
nQUsed = false;

var youtubeKey = "AIzaSyCP0UNlO9_N1Pq13E6Rl8gIwAjnF_zqNO4"


function updateQueues(){
	if(hiddenQueue.length != 0){
		songQueue[0] = hiddenQueue[0];
		hiddenQueue.shift();
	}
}

//Creates url objects used in updating tab url
function makeNextSong(){
	if(songQueue && songQueue.length == 0){
		updateQueues();
	}
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

//Gets the youtube ID of the next video in queue
function getID(url){
	id = url.substring(url.search("v=")+2);
	timeMarker = id.search("&t=");
	if(timeMarker != -1){
		id = id.substring(0,timeMarker);
	}
	console.log("ID of video to display: " + id);
	return id
}

//Creates the song title notification
function makeNoti(strMessage){
	var notification = {
		type: "basic",
		iconUrl: "menu.png",
		title: "Queued Items",
		message: strMessage
	}
	chrome.notifications.create("qNoti", notification);
}

//Gets info about next video
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
		hiddenQueue.push(info.linkUrl);
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
		hiddenQueue = [];
	}
	else if (info.menuItemId == "showItems"){
		if(hiddenQueue.length != 0){
			var queueItems = [];
			var songID;
			var videoData;
			var stringItems = "";
			var request = new HttpClient();
			for (var i = 0; i < hiddenQueue.length; i++){
				songID = getID(hiddenQueue[i]);
				request.get(("https://www.googleapis.com/youtube/v3/videos?id=" +
				songID +
				"&key=" + youtubeKey +
				"&part=snippet"),
				function(response){
					var response = JSON.parse(response);
					queueItems.push('• ' + response["items"][0]["snippet"]["title"] + '\n');
					stringItems += '• ' + response["items"][0]["snippet"]["title"] + '\n';
					if(queueItems.length == hiddenQueue.length){
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
		loaded = false;
		nQUsed = true;
		chrome.tabs.update(tabID, makeNextSong());
		songQueue.shift();
		nQUsed = false;
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
			loaded = false;
			chrome.tabs.update(tabID, makeNextSong());
			songQueue.shift();
	}// determines when the next tab has finished loading and is playing music
	else if(changeInfo.audible && tabId == tabID && !nQUsed){
			loaded = true;

			//updateQueues();
			console.log("reset 'loaded' boolean");
		}
}

//creates the context Menu objects
var addQItemMenu = chrome.contextMenus.create({"title": "Add to queue", "id": "addItem",
 	"contexts": ["link"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var downloadItemMenu = chrome.contextMenus.create({"title": "Download Video", "id": "downloadItem",
 	"contexts": [/*"link", */"video"], "documentUrlPatterns": ["*://www.youtube.com/*"]}); //"link" commented so no dropdown menu on vid right click, it's just easier this way
var clearQ = chrome.contextMenus.create({"title": "Clear Queue", "id": "clearItems",
	"contexts": ["page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var showQ = chrome.contextMenus.create({"title": "Display Queue", "id": "showItems",
	"contexts": ["page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var next = chrome.contextMenus.create({"title": "Next in queue", "id": "nxtQ",
	"contexts": ["page"], "documentUrlPatterns": ["*://www.youtube.com/*"]});

chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.tabs.onUpdated.addListener(onUpdated);
