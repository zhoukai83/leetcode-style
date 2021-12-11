/**
 * Created by kai-zhou on 12/04/2021.
 */
// Leet code Help!
// version 0.1 BETA!
// 2021-12-04
// Copyright (c) 2021, Kai
// Released under the GPL license
//
//
// ==UserScript==
// @name          好好学习
// @namespace     https://leetcode-cn.com/
// @description   好好学习
// @include https://leetcode-cn.com/*
// @include https://leetcode.com/*
// @exclude       http://www.baidu.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @run-at      document-start
// @grant GM_log
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

let global = {
    "title": "程序化广告",
    "lastCompletMsg": new Date(),
    "toggleFullMode": false,
    "hideLeft": true
}

String.prototype.endWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    return this.substring(this.length - s.length) == s;
}

String.prototype.startWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    return this.substr(0, s.length) == s;
}

Array.prototype.contains = function (obj) {
    let i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function waitForElement(selector, checkFrequencyInMs, callback) {
    let startTimeInMs = Date.now();
    let timeoutInMs = 20000;
    (function loopSearch() {
        if (document.querySelector(selector) != null) {
            console.log("find selector:" + selector);
            callback();
            return;
        }
        else {
            setTimeout(function () {
                if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) {
                    console.log("find selector timeout:" + selector);
                    return;
                }
                loopSearch();
            }, checkFrequencyInMs);
        }
    })();
}

function hideLeft() {
    let leftContainer = document.querySelector('.css-7xpffu-LeftContainer');
    if (leftContainer) {
        leftContainer.classList.remove('css-7xpffu-LeftContainer');
        leftContainer.classList.toggle('css-ehrx1o-LeftContainer');
        leftContainer.style.flex = "0 0 0px"
    }
}

function showLeft() {
    let leftContainer = document.querySelector('.css-ehrx1o-LeftContainer');
    if (leftContainer) {
        leftContainer.classList.remove('css-ehrx1o-LeftContainer');
        leftContainer.classList.toggle('css-7xpffu-LeftContainer');
        leftContainer.style.flex = "0.77 0 0px"
    }
}

function setLeft(hide) {
    chrome.storage.local.set({ 'hideLeft': hide });
    global.hideLeft = hide;
    global.hideLeft ? hideLeft() : showLeft();
}

function toggleLeft() {
    chrome.storage.local.get(['hideLeft'])
    .then((result) => setLeft(!result.hideLeft));
}

function setFullMode(fullMode) {
    try {
        global.toggleFullMode = fullMode;
        chrome.storage.local.set({ 'toggleFullMode': fullMode }, function () {

        });
    } catch (error) {
        console.log(error);
    }
}

function setContextMenu() {
    oncontextmenu = (e) => {
        e.preventDefault()
        let menu = document.createElement("div")
        menu.id = "ctxmenu"
        menu.style = `top:${e.pageY - 10}px;left:${e.pageX - 40}px`
        menu.onmouseleave = () => ctxmenu.outerHTML = ''
        menu.innerHTML = "<p>描述</p><p>Option4</p><p onclick='alert(`Thank you!`)'>Upvote</p>"
        document.body.appendChild(menu)
    }
}

function extensionMessageHandle() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension" + " receive event:" + JSON.stringify(request));
            sendResponse({ farewell: "goodbye" });

            switch(request.msgType) {
                case "toggleLeft":
                    setLeft(request.hideLeft);
                    break;
                case "setTitle": 
                    chrome.storage.local.get(['title'], function (result) {
                        console.log(JSON.stringify(result));
                        if (result.title == null || result.title == "") {
                            return;
                        }
                        if (document.title != result.title) {
                            document.title = result.title;
                        }
                    });
                    break;
                case "complete":
                case "setUrlPostFix":
                    pretendUrl();
                    break;
                case "setFullMode":
                    setFullMode(request.fullMode);
                    break;
                default:
                    break;
            }
        }
    );
}

function extensionStorageHandle() {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (key in changes) {
            if (key == "hideLeft") {
                let storageChange = changes[key];
                console.log('存储键“%s”（位于“%s”命名空间中）已更改。' +
                    '原来的值为“%s”，新的值为“%s”。',
                    key,
                    namespace,
                    storageChange.oldValue,
                    storageChange.newValue);
            }
        }
    });
}

function test() {

}

function main() {
    try {
        console.log("helper: %s", window.location.href);

        if (window.location.href.startsWith("https://www.baidu.com/")) {
            test();
            return;
        }

        chrome.storage.local.get(['hideLeft'])
        .then((result) => {
            global.hideLeft = result.hideLeft;
            return chrome.storage.local.get(['toggleFullMode']);
        })
        .then((result) => {
            global.toggleFullMode = result.toggleFullMode;
            extensionStorageHandle();
            extensionMessageHandle();
            changeStyle();

        });

        let oldHref = document.location.href;
        window.onload = function () {
            let bodyList = document.querySelector("body")
                , observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (oldHref != document.location.href) {
                            oldHref = document.location.href;
                            console.log("checked href changed");
                            changeStyle();
                        }
                    });
                });

            let config = { childList: true, subtree: true };
            observer.observe(bodyList, config);
        };
    } catch (error) {
        console.log(error);
    }
}
    
function pretendUrl() {
    chrome.storage.local.get(['urlPostFix'], function (result) {
        console.log(JSON.stringify(result));
        if (result.urlPostFix == null || result.urlPostFix == "") {
            return;
        }

        setTimeout(() => window.history.pushState("object or string", "程序化广告" + new Date().toLocaleTimeString(), "/" + result.urlPostFix), 1000);
    });
}

function changeTitle() {
    let target = document.querySelector('title');
    let observer = new MutationObserver(function (mutations) {
        console.log(JSON.stringify(mutations));
        chrome.storage.local.get(['title'], function (result) {
            console.log(JSON.stringify(result));
            if (result.title != null && document.title != result.title) {
                document.title = result.title;
            }
        });
    });

    let config = { subtree: true, characterData: true, childList: true };
    observer.observe(target, config);
}

function isLeetCodeUrl() {
    return window.location.href.startWith("https://leetcode-cn.com/problems/") 
    || window.location.href.startWith("https://leetcode.com/problems/");
}

function changeStyle() {
    console.log("full Mode:", global.toggleFullMode);
    if(global.toggleFullMode) {
        return;
    }

    changeTitle();

    if (isLeetCodeUrl() && window.location.href.endsWith("solution/")) {
        changeCodeStyle();
    } else if (isLeetCodeUrl() && window.location.href.includes("solution")) {
        changeAnswerStyle();
    } else {
        changeCodeStyle();
    }

    window.addEventListener('load', () => {
        console.log("window.load");
    
        document.querySelectorAll("link[rel~='icon']").forEach(e => e.remove());
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = 'https://www.baidu.com/img/baidu_85beaf5496f291521eb75ba38eacbd87.svg';
        setTimeout(() => link.href = 'https://www.baidu.com/img/baidu_85beaf5496f291521eb75ba38eacbd87.svg', 10000);
    });
}

function removeElement(elementPath) {
    waitForElement("." + elementPath, 1000, function () {
        try {
            document.querySelectorAll("." + elementPath).forEach(e => e.remove())
        } catch (error) {
            console.log(new Date().toLocaleTimeString() + ":" + error.message);
        }
    });
}

function setLeftContainerStyle() {
    chrome.storage.local.get(['hideLeft'], function (result) {
        console.log('hideLeft currently is ' + result.hideLeft);
        if (result.hideLeft) {
            hideLeft();
        } else {
            showLeft();
        }
    });
}

function changeCodeStyle() {
    console.log(new Date().toLocaleTimeString() + ":change code style");

    removeElement("css-1k63xn3-HeaderCn");
    removeElement("container__39KX");
    removeElement("css-uzel9b-RootContainer");
    removeElement("css-wnupry-CoverContainer");

    // 描述
    removeElement("css-1rtcnqv-SummaryWrapper");

    // 用户小头像
    removeElement("css-17dlube-AvatarWrapper");

    //点赞
    removeElement("css-17xpmpg-FlexContainer");

    //举报反馈
    removeElement("css-rieo0h-BaseButtonComponent-OperationButton");

    //搜索排序写题解
    removeElement("css-1bymp31-OperationsWrapper");

    // //删除控制台右边的贡献
    // removeElement("contribute__2g0q");
    waitForElement(".contribute__2g0q", 200, () => {
        $(".contribute__2g0q").innerText = "con"
    });

    waitForElement(".css-1ivdcmf-MainContainer", 1000, function () {
        document.querySelectorAll(".css-1ivdcmf-MainContainer").forEach(e => e.style.minHeight = "initial");
        document.querySelectorAll(".css-h6lh3f-BasicTag-StyledTag").forEach(e => e.textContent = "看看");
        document.querySelectorAll(".css-1ivdcmf-MainContainer").forEach(e => e.children[1] && e.children[0].append(e.children[1]));
    })

    window.addEventListener('load', setLeftContainerStyle);

    waitForElement(".css-1ivdcmf-MainContainer", 200, () => {
        document.querySelectorAll(".css-1ivdcmf-MainContainer").forEach(e => e.style.minHeight = "initial");
        document.querySelectorAll(".css-1ivdcmf-MainContainer").forEach(e => e.children[1] && e.children[0].append(e.children[1]));
    });

    waitForElement(".css-h6lh3f-BasicTag-StyledTag", 200, () => {
        document.querySelectorAll(".css-h6lh3f-BasicTag-StyledTag").forEach(e => e.textContent = "看看");
    });

    waitForElement(".submit__-6u9", 200, () => {
        if (!document.querySelector(".submit__-6u9#toggle")) {
            toggleBtn = document.querySelector('.submit__-6u9').cloneNode(true)
            toggleBtn.innerText = "toggle";
            toggleBtn.id = "toggle";
            toggleBtn.className = "custom-testcase__2YgB"
            document.querySelector(".action__KaAP").appendChild(toggleBtn);
            $(".custom-testcase__2YgB#toggle").on('click', toggleLeft);
        }
    });

    waitForElement(".runcode__20UZ", 200, () => {
        document.querySelector(".runcode__20UZ").innerText = "run";
        document.querySelector(".runcode__20UZ").className = "custom-testcase__2YgB";
    });
    
    waitForElement(".submit__-6u9", 200, () => {
        document.querySelector(".submit__-6u9").innerText = "submit";
        document.querySelector(".submit__-6u9").className = "custom-testcase__2YgB";
    });     
}

function changeAnswerStyle() {
    console.log("changeAnswerStyle");

    removeElement("css-1k63xn3-HeaderCn");
    // 上一题，下一题，关闭
    removeElement("css-m2xku8-OperationsWrapper");

    window.addEventListener('load', setLeftContainerStyle);
    setLeftContainerStyle();
    
    waitForElement(".css-1ivdcmf-MainContainer", 200, () => {
        document.querySelectorAll(".css-1ivdcmf-MainContainer").forEach(e => e.style.minHeight = "initial");
        document.querySelectorAll(".css-1ivdcmf-MainContainer").forEach(e => e.children[1] && e.children[0].append(e.children[1]));
    });
    
    waitForElement(".css-h6lh3f-BasicTag-StyledTag", 200, () => {
        document.querySelectorAll(".css-h6lh3f-BasicTag-StyledTag").forEach(e => e.textContent = "看看");
    });

    waitForElement(".e1bbgjd82", 200, () => {
        if (!document.querySelector(".e1bbgjd82#toggle")) {
            toggleBtn = document.querySelector('.e1bbgjd82').cloneNode(true)
            toggleBtn.innerText = "toggle";
            toggleBtn.id = "toggle";
            document.querySelector(".css-5kgdab-Container").appendChild(toggleBtn);
            $(".e1bbgjd82#toggle").on('click', toggleLeft);
        }
    });
}

main();