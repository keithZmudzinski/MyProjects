songQueue = []
tabID = 0;
loaded = true;


function onClickHandler(info, tab){
	tabID = tab.id;
	if(info.menuItemId == "addItem"){
		songQueue.push(info.linkUrl);
		console.log("added song tabid = " + tab.id);
		console.log(songQueue[songQueue.length-1] + " added to queue");
	}
	else if (info.menuItemId == "downloadItem"){
		if(info.mediaType == "video"){
			dwnURL = "https://www.youtubeinmp3.com/fetch/?video="+info.pageUrl;
		}
		else{
			dwnURL = "https://www.youtubeinmp3.com/fetch/?video="+info.linkUrl;
		}
		chrome.tabs.update(tabID, downloadVideo(dwnURL));
	}

}
function nextSong(){
	var url = {
		url: songQueue[0]
	}
	return url;
}
function downloadVideo(toDownloadURL){
	var url = {
		url: toDownloadURL
	}
	return url;
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
			chrome.tabs.update(tabID, nextSong());
			songQueue.shift();
			loaded = false;
	}// determines when the next tab has finished loading and is playing music
	else if(changeInfo.audible
		&& tabId == tabID){
			loaded = true;
			console.log("reset 'loaded' boolean")
		}
}

var addQItemMenu = chrome.contextMenus.create({"title": "Add to queue", "id": "addItem",
 	"contexts": ["link"], "documentUrlPatterns": ["*://www.youtube.com/*"]});
var downloadItemMenue = chrome.contextMenus.create({"title": "Download Video", "id": "downloadItem",
 	"contexts": ["link", "video"], "documentUrlPatterns": ["*://www.youtube.com/*"]});

chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.tabs.onUpdated.addListener(onUpdated);
