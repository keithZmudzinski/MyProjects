songQueue = []
tabID = 0;
loaded = true;


function addToQueue(info, tab){
	songQueue.push(info.linkUrl);
	tabID = tab.id;
	console.log("added song tabid = " + tab.id);
	console.log(songQueue[songQueue.length-1] + " added to queue");

}
function updateURL(){
	var url = {
		url: songQueue[0]
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
			chrome.tabs.update(tabID, updateURL());
			songQueue.shift();
			loaded = false;
	}// determines when the next tab has finished loading and is playing music
	else if(changeInfo.audible
		&& tabId == tabID){
			loaded = true;
			console.log("reset 'loaded' boolean")
		}
}

var menuItem = chrome.contextMenus.create({"title": "Add to queue", "contexts": ["link"],
	"documentUrlPatterns": ["*://www.youtube.com/*"]});

chrome.contextMenus.onClicked.addListener(addToQueue);
chrome.tabs.onUpdated.addListener(onUpdated);
