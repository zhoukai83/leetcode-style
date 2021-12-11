function toggleLeft() {
    let hideLeft = document.getElementById("buttonLeftPanelToggle").checked ;
    chrome.storage.local.set({ 'hideLeft': hideLeft})
    .then(() => chrome.tabs.query({ active: true, currentWindow: true })
    ).then((tabs) => {
        console.log("tabs:", tabs);
        return chrome.tabs.sendMessage(tabs[0].id, { msgType: "toggleLeft", hideLeft: hideLeft})
    }).then((response) => console.log(response));
}

function setFullMode() {
    let fullMode = document.getElementById("buttonFullModeToggle").checked;
    chrome.storage.local.set({ 'toggleFullMode': fullMode }, function () { });
    document.getElementById("buttonLeftPanelToggle").disabled = fullMode;
    
    chrome.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => chrome.tabs.sendMessage(tabs[0].id, { msgType: "setFullMode", fullMode: fullMode}))
    .then(() =>  alert("plase refresh the url manually"));
}

function setTitle() {
    console.log(document.getElementById("title").value);
    chrome.storage.local.set({ title: document.getElementById("title").value })
    .then(()  => chrome.tabs.query({ active: true, currentWindow: true }))
    .then((tabs) => chrome.tabs.sendMessage(tabs[0].id, { msgType: "setTitle", value: document.getElementById("title").value }))
    .then((response) => console.log(response));
}

function setUrlPostFix() {
    console.log(document.getElementById("urlPostFix").value);
    chrome.storage.local.set({ urlPostFix: document.getElementById("urlPostFix").value })
    .then(() => chrome.tabs.query({ active: true, currentWindow: true }))
    .then((tabs) => chrome.tabs.sendMessage(tabs[0].id, { msgType: "setUrlPostFix", value: document.getElementById("urlPostFix").value}))
    .then((response) => console.log(response));
}

function initLeftPanelButton() {
    chrome.storage.local.get(['hideLeft'], function (result) {
        console.log('Value currently is ' + JSON.stringify(result));
        document.getElementById("buttonLeftPanelToggle").checked = result.hideLeft;
    });
}

function initFullModeButton() {
    chrome.storage.local.get(['toggleFullMode'])
    .then((result) => {
        console.log('Value currently is ' + JSON.stringify(result));
        document.getElementById("buttonFullModeToggle").checked = result.toggleFullMode;
        document.getElementById("buttonLeftPanelToggle").disabled = result.toggleFullMode;
    });
}

function main() {
    console.log("load popup.js", new Date())
    document.getElementById("buttonLeftPanelToggle").onclick = toggleLeft;
    document.getElementById("buttonFullModeToggle").onclick = setFullMode;

    initLeftPanelButton();
    initFullModeButton();

    document.getElementById("title").onchange = setTitle;
    chrome.storage.local.get(['title'], function (result) {
        console.log('Value currently is ' + JSON.stringify(result));

        if (result && result.title) {
            document.getElementById("title").value = result.title;
        }
    });
    
    document.getElementById("urlPostFix").onchange = setUrlPostFix;
    chrome.storage.local.get(['urlPostFix'], function (result) {
        console.log('Value currently is ' + JSON.stringify(result));

        if (result && result.urlPostFix) {
            document.getElementById("urlPostFix").value = result.urlPostFix;
        }
    });
}

window.onload = function () {
    main();
}

window.onbeforeunload = function() {
    console.log("onbeforeunload");
    setTitle();
    setUrlPostFix();
}

