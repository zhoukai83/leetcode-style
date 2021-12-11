var global = {
    "url": "baidu.com",
    "title": "程序化广告",
    "lastCompletMsgTime": new Date()
}

function sendUrlChangeInfo(url) {
    console.log("change url:" + url, global.url);
    global.url = url;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes("leetcode")) {
            chrome.tabs.sendMessage(tabs[0].id, { msgType: "urlChange" }, function (response) {
                console.log("send url change:" + response);
            });
        }
    });
}

function sendCompleteMsg() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes("leetcode")) {
            chrome.tabs.sendMessage(tabs[0].id, { msgType: "complete" }, function (response) {
                console.log("send complete:" + response);
            });
        }
    });
}

chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
        if (!(tab.url.includes("leetcode") || tab.url.includes("baidu"))) {
            return;
        }
        
        console.log("change url:" + JSON.stringify(changeInfo), JSON.stringify(tab));
        if (changeInfo.url) {
            sendUrlChangeInfo(changeInfo.url);
        }

        if (changeInfo.status && changeInfo.status == "complete") {
            sendCompleteMsg();
        }
    }
);