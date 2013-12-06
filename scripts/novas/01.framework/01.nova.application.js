/// <reference path="../../jquery/jquery-1.7.2.min.js" />

if (window.nova == undefined) {
    nova = new Object();
}
nova.application = {
    histories: new Array(),
    currentPage: null,
    settings: {
        
    },
    isTouchable: false
};

nova.application.start = function (url) {
    var app = this;
    app.events.backButton(function (e) {
        if (app.currentPage.isBackbuttonDisabled) {
            return;
        }
        if (app.currentPage.backbuttonHandlers.length == 0) {
            if (app.histories.length > 0) {
                app.goBack();
            } else {
                navigator.notification.confirm("Are you sure you want to exit the app?", function (btnNumber) {
                    if (btnNumber == 1) {
                        nova.application.exit();
                    }
                }, 'Confirm', 'Exit,Cancel');
                return;
            }
        } else {
            var handler = app.currentPage.backbuttonHandlers.pop();
            handler();
        }
    });
    console.log("app started from: " + url);
    $("#body").height($(window).height() + "px");
    var touchDevices = ['android', 'iphone', 'ipad', 'phone', 'blackbery'];
    var appVersion = navigator.appVersion.toLowerCase();
    for (var i = 0; i < touchDevices.length; i++) {
        if (appVersion.indexOf(touchDevices[i]) > -1) {
            app.isTouchable = true;
            break;
        }
    }
    app.gotoPage(url);
};

nova.application.gotoPage = function (pageOrUrl) {
    var app = this;
    var page = null;

    if (pageOrUrl instanceof nova.Page) {
        page = pageOrUrl;
    }
    else {
        page = new nova.Page(pageOrUrl);
    }

    if (app.currentPage != null && app.currentPage.needAddingToHistory) {
        app.histories.push(app.currentPage.clone());
    }
    page.load();
    app.currentPage = page;
};

nova.application.goBack = function(urlUntil) {
    if (this.histories.length == 0) {
        navigator.notification.confirm("Are you sure you want to exit the app?", function(btnNumber) {
            if (btnNumber == 1) {
                nova.application.exit();
            }
        }, 'Confirm', 'Exit,Cancel');
        return;
    }
    var page = this.histories.pop();
    if (urlUntil != undefined && urlUntil != null) {
        var url = urlUntil instanceof nova.Page ? urlUntil.url : urlUntil;
        while (page.url != url && this.histories.length > 0) {
            page = this.histories.pop();
        }
    }
    this.currentPage = page;
    this.currentPage.load();
};

nova.application.exit = function() {
    navigator.app.exitApp();
};

nova.application.changeThemes = function(themes) {
    var $themes = $("#themes");
    $themes.empty();
    for (var i = 0; i < themes.length; i++) {
        $themes.append('<link href="' + themes[i] + '" rel="stylesheet" />');
    }
};

nova.application.events = {
    deviceReady: function (callback) {
        document.addEventListener("deviceready", callback, false);
    },
    backButton: function (callback) {
        document.addEventListener("backbutton", callback, false);
    },
    menuButton: function (callback) {
        document.addEventListener("menubutton", callback, false);
    },
    pause: function (callback) {
        document.addEventListener("pause", callback, false);
    },
    resume: function (callback) {
        document.addEventListener("resume", callback, false);
    },
    searchButton: function (callback) {
        document.addEventListener("searchbutton", callback, false);
    },
    online: function (callback) {
        document.addEventListener("online", callback, false);
    },
    offline: function (callback) {
        document.addEventListener("offline", callback, false);
    },
    batteryCritical: function (callback) {
        document.addEventListener("batterycritical", callback, false);
    },
    batteryLow: function (callback) {
        document.addEventListener("batterylow", callback, false);
    },
    batteryStatus: function (callback) {
        document.addEventListener("batterystatus", callback, false);
    },
    startCallButton: function (callback) {
        document.addEventListener("startcallbutton", callback, false);
    },
    endCallButton: function (callback) {
        document.addEventListener("endcallbutton", callback, false);
    },
    volumeDownButton: function (callback) {
        document.addEventListener("volumedownbutton", callback, false);
    },
    volumeUpButton: function (callback) {
        document.addEventListener("volumeupbutton", callback, false);
    }
};


nova.application.serialize = function(obj) {
    var msg = "";
    for (p in obj) {
        msg += p + ": " + obj[p] + "\r\n";
    }
    return msg;
};