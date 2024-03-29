// last build: 20131023.0221

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

if (window.nova == undefined) {
    nova = new Object();
}
if (nova.touch == undefined) {
    nova.touch = {
        eventNames: {
            touchstart: "touchstart",
            touchmove: "touchmove",
            touchend: "touchend",
            touchcancel: "touchcancel"
        }
    };
}

nova.touch.bindClick = function (selector, func) {
    if (nova.application.isTouchable == false) {
        $(selector).click(function () {
            func.call(this);
        });
        return;
    }
    var isMoving = false;
    var startTime = null;
    $(selector).bind(this.eventNames.touchstart, function (e) {
        isMoving = false;
        startTime = new Date();
        $(this).addClass("touching");
    });
    $(selector).bind(this.eventNames.touchmove, function (e) {
        isMoving = true;
    });
    $(selector).bind(this.eventNames.touchend, function (e) {
        var $me = $(this);
        $me.removeClass("touching");
        var duration = new Date() - startTime;
        if (!isMoving && duration < 1000) {
            $me.addClass("clicking");
            func.call(this);
            setTimeout(function () {
                $me.removeClass("clicking");
            }, 500);
        }

    });
};

nova.touch.getTouchPosition = function (event) {
    try {
        var touch = event.targetTouches[0];
        if (touch == undefined) {
            return null;
        }
        return {
            X: touch.pageX,
            Y: touch.pageY
        };
    }
    catch (ex) {
        alert(ex);
    }
};
if (window.nova == undefined) {
    nova = new Object();
}

nova.Scroller = function (selector) {
    this.selector = selector;
    this.showScrollBar = false;
    this.maxOverScrollHeight = 100;
    this.slowingDowSteps = 10;
    this.formFields = "input,select,textarea,a";
    this.vertical = true;
    this.horizontal = false;
    this.fixedFooter = true;
    this.isInHorizontalScroll = false;
    this.isInVerticalScroll = false;
    this.isVerticalScrolling = null;
    this.isScrollingCancelled = false;
};

nova.Scroller.prototype.init = function () {
    var obj = this;
    if (obj.horizontal) {
        alert("horizontal scroll is not supported yet.");
        return;
    }
    $(obj.selector).each(function () {
        var $scroller = $(this);
        $scroller.addClass('scroller');
        if (nova.application.isTouchable == false) {
            $scroller.css('overflow-y', 'scroll');
        }
        var $content = $scroller.children('.scroller-content');
        if ($content.length == 0) {
            $scroller.wrapInner('<div class="scroller-content"></div>');
            $content = $scroller.children();
        }

        var height = $scroller.height();

        // bind dom events
        var events = nova.touch.eventNames;
        this.addEventListener(events.touchstart, function (e) {
            e.preventDefault();
            isMoving = false;
            obj.isHorizontalScrolling = null;
            obj.isVerticalScrolling = null;
            obj.isScrollingCancelled = false;
            onTouchStart(nova.touch.getTouchPosition(e));
        });
        this.addEventListener(events.touchmove, function (e) {
            if (obj.isScrollingCancelled) {
                return;
            }
            if (obj.isInVerticalScroll && obj.vertical) {
                e.stopPropagation();
            }

            var position = nova.touch.getTouchPosition(e);
            if (obj.isVerticalScrolling == null) {
                if (lastPosition != null) {
                    obj.isVerticalScrolling = Math.abs(position.Y - lastPosition.Y) > Math.abs(position.X - lastPosition.X);
                }
            }
            if (obj.isInHorizontalScroll && obj.vertical && obj.isVerticalScrolling == false) {
                obj.isScrollingCancelled = true;
                return;
            }
            if (obj.isInHorizontalScroll && obj.vertical && obj.isVerticalScrolling) {
                e.stopPropagation();
            }
            onTouchMove(position);
            isMoving = true;
        });
        this.addEventListener(events.touchend, function (e) {
            if (isMoving && !obj.isScrollingCancelled) {
                onTouchMove(nova.touch.getTouchPosition(e));
                onTouchEnd();
            }
        });
        var $fields = $content.find(obj.formFields);
        if ($fields.length > 0) {
            $fields.bind(events.touchstart, function (e) {
                e.stopPropagation();
            });
            $fields.bind(events.touchmove, function (e) {
                e.stopPropagation();
            });
            $fields.bind(events.touchend, function (e) {
                e.stopPropagation();
            });
        }
        // end bind dom events

        var lastPosition = null;
        var lastContentPosition = null;
        var slowingDownTimer = null;
        var slowingDowCounter = 0;
        var contentWidth = 0;
        var contentHeight = 0;
        var vForce = 0;
        var hForce = 0;
        var vDistance = 0;
        var isMoving = false;
        var isCancelled = false;
        //events handlers

        function onTouchStart(xy) {
            clearTimeout(slowingDownTimer);
            lastPosition = xy;
            contentWidth = $content.outerWidth();
            contentHeight = $content.outerHeight();
            isMoving = false;
            lastContentPosition = $content.position();
        }

        function onTouchMove(xy) {
            if (xy == null) {
                return;
            }
            if (lastPosition == null) {
                lastPosition = xy;
                return;
            }
            vForce = 0;
            hForce = 0;
            if (obj.vertical) {
                vForce = xy.Y - lastPosition.Y;

            }
            if (obj.horizontal) {
                hForce = xy.X - lastPosition.X;
            }
            moveContent();
            lastPosition = xy;
        }

        function onTouchEnd() {
            if (!isMoving) {
                return;
            }
            var position = $content.position();
            var maxTop = 0;
            var minTop = height - contentHeight;
            if (Math.abs(vDistance) > 5 || position.top > maxTop || position.top < minTop) {
                slowingDowCounter = obj.slowingDowSteps;
                slowDownContent();
            }
        }

        function moveContent() {
            var position = $content.position();
            if (obj.vertical) {
                var maxTop = 0;
                var minTop = height - contentHeight;
                var top = position.top + vForce;
                if (top > maxTop) {
                    if (lastContentPosition.top > maxTop) {
                        top = lastContentPosition.top + (top - lastContentPosition.top) * 0.2;
                    } else {
                        top = maxTop + (top - maxTop) * 0.2;
                    }
                    if (top > obj.maxOverScrollHeight) {
                        top = obj.maxOverScrollHeight;
                    }
                }
                if (top < minTop) {
                    if (lastContentPosition.top < minTop) {
                        top = lastContentPosition.top + (top - lastContentPosition.top) * 0.2;
                    } else {
                        top = minTop + (top - minTop) * 0.2;
                    }

                    if (top < minTop - obj.maxOverScrollHeight) {
                        top = minTop - obj.maxOverScrollHeight;
                    }
                }
                vDistance = top - lastContentPosition.top;
                $content.css("top", top + "px");
            }
            if (obj.horizontal) {

            }
            lastContentPosition = $content.position();
        }

        function slowDownContent() {
            clearTimeout(slowingDownTimer);
            if (slowingDowCounter <= 0) {
                return;
            }
            var stopped = false;
            var position = $content.position();
            if (obj.vertical) {
                var maxTop = 0;
                var minTop = height - contentHeight;
                vDistance = vDistance * 0.8;
                var top = position.top + vDistance;
                if (top > maxTop) {
                    vDistance = (top - maxTop) * 0.2;
                    top = maxTop + vDistance;
                    if (Math.abs(vDistance) < 5) {
                        vDistance = -(top - maxTop);
                    }
                }
                if (top < minTop) {
                    vDistance = (top - minTop) * 0.2;
                    top = minTop + vDistance;
                    if (Math.abs(vDistance) < 5) {
                        vDistance = -(top - minTop);
                    }
                }
                if (lastContentPosition.top > maxTop && top <= maxTop) {
                    stopped = true;
                    $content.css("top", maxTop + "px");
                }
                else if (lastContentPosition.top < minTop && top >= minTop) {
                    stopped = true;
                    $content.css("top", minTop + "px");
                }
                else {
                    $content.css("top", top + "px");
                }
            }
            if (obj.horizontal) {

            }
            lastContentPosition = $content.position();

            if (!stopped && slowingDowCounter > 0) {
                slowingDowCounter--;
                setTimeout(function () {
                    slowDownContent();
                }, 100);
            }
        }
    });



    //end events handlers
};
if (window.nova == undefined) {
    nova = new Object();
}
 
nova.View = function(url, wrapper) {
    this.url = url;
    this.wrapper = wrapper == undefined ? "#body" : wrapper;
};

nova.View.prototype.load = function () {
    var obj = this;
    $.ajax({
        url: obj.url + "?timestamp=" + new Date().getTime(),
        dataType: "html",
        type: "get",
        success: function (html) {
            setTimeout(function () { });//this is used to fix android 4.1 querks
            $(obj.wrapper).html(html);
            var loaded = $.Event("onLoaded");
            $(obj).trigger(loaded);
        },
        error: function (err) {
            var errorEvt = $.Event("onLoadingError");
            errorEvt.data = err;
            $(obj).trigger(errorEvt);
        }
    });
};


nova.View.prototype.GetHtml = function () {
    return $(this.wrapper).html();
};

nova.View.prototype.onIntialized = function (callback) {
    $(this).bind("onIntialized", callback);
};

nova.View.prototype.onLoaded = function (callback) {
    $(this).bind("onLoaded", callback);

};

nova.View.prototype.onLoadingError = function (callback) {
    $(this).bind("onLoadingError", callback);
};
if (window.nova == undefined) {
    nova = new Object();
}

nova.Page = function (url, wrapper) {
    nova.View.call(this, url, wrapper);
    this.needAddingToHistory = true;
    this.historyUrl = null;
    this.backbuttonHandlers = [];
    this.isBackbuttonDisabled = false;
};

nova.Page.prototype = new nova.View();
nova.Page.constructor = nova.Page;

nova.Page.prototype.clone = function() {
    var page = new nova.Page(this.url, this.wrapper);
    for (p in this) {
        var value = this[p];
        if (p.indexOf("jQuery") != 0) {
            page[p] = value;
        }
    }
    page.backbuttonHandlers = [];
    return page;
};

nova.Page.prototype.backbutton = function (func) {
    this.backbuttonHandlers.push(func);
};

nova.Page.prototype.autoCancelDialog = function(dialog) {
    this.backbutton(function () {
        dialog.close();
    });
};
if (window.nova == undefined) {
    nova = new Object();
}

nova.Carousel = function (id) {
    this.id = id;
    this.vertical = false;
    this.horizontal = true;
    this.looping = true;
};

nova.Carousel.prototype.init = function () {
    var obj = this;
    var $carousel = $("#" + this.id);
    var $wrapper = $carousel.parent();
    $wrapper.addClass("carousel-container");
    $carousel.addClass("carousel");
    var height = $wrapper.innerHeight();
    var width = $wrapper.innerWidth();
    if (obj.horizontal) {
        $carousel.width($carousel.children().length * width + "px");
    }
    else if (obj.vertical) {
        $carousel.height($carousel.children().length * height + "px");
    }
    $carousel.children().each(function() {
        var $child = $(this);
        var horizontalPadding = $child.outerWidth() - $child.width();
        var verticalPadding = $child.outerHeight() - $child.height();
        $child.width(width - horizontalPadding + "px");
        $child.height(height - verticalPadding + "px");
        $child.addClass("carousel-view");
    });

    // bind dom events
    var events = nova.touch.eventNames;
    $carousel[0].addEventListener(events.touchstart, function (e) {
        e.preventDefault();
        isMoving = false;
        onTouchStart(nova.touch.getTouchPosition(e));
    });
    $carousel[0].addEventListener(events.touchmove, function (e) {
        if (obj.vertical) {
            if (e.scrollingVertical) {
                return;
            }
            else {
                e.scrollingVertical = true;
            }
        }
        if (obj.horizontal) {
            if (e.scrollingHorizontal) {
                return;
            }
            else {
                e.scrollingHorizontal = true;
            }
        }
        isMoving = true;
        onTouchMove(nova.touch.getTouchPosition(e));
    });
    $carousel[0].addEventListener(events.touchend, function (e) {
        if (isMoving) {
            onTouchMove(nova.touch.getTouchPosition(e));
            onTouchEnd();
        }
    });

    var lastPosition = null;
    var lastCarouselPosition = null;
    var slowingDownTimer = null;
    var slowingDowCounter = 0;
    var vForce = 0;
    var hForce = 0;
    var vDistance = 0;
    var isMoving = false;
    var targetLeft = 0;
    var slowdownWidth = 0;
    //events handlers

    function onTouchStart(xy) {
        clearTimeout(slowingDownTimer);
        lastPosition = xy;
        isMoving = false;
        lastCarouselPosition = $carousel.position();
    }

    function onTouchMove(xy) {
        if (xy == null) {
            return;
        }
        if (lastPosition == null) {
            lastPosition = xy;
            return;
        }
        vForce = 0;
        hForce = 0;
        if (obj.vertical) {
            vForce = xy.Y - lastPosition.Y;
        }
        if (obj.horizontal) {
            hForce = xy.X - lastPosition.X;
        }
        moveContent();
        lastPosition = xy;
    }

    function onTouchEnd() {
        if (!isMoving) {
            return;
        }
        var position = $carousel.position();

        if (obj.horizontal) {
            if (Math.abs(hForce) > 5) {
                var hForceRate = Math.abs(hForce) / hForce;
                if (Math.abs(hForce) > width / 5) {
                    hForce = width / 5 * hForceRate;
                }
                $carousel.css("left", (position.left + hForce * 2) + "px");
                position = $carousel.position();
            }
            targetLeft = Math.round(position.left / width) * width;
            if (targetLeft > 0) {
                targetLeft = 0;
            }
            if (targetLeft < -$carousel.children().length * width + width) {
                targetLeft = -$carousel.children().length * width + width;
            }
        }
        slowingDowCounter = 5;
        var minSlowWidth = Math.ceil(Math.abs(position.left - targetLeft) / slowingDowCounter);
        if (Math.abs(hForce) < minSlowWidth) {
            slowdownWidth = minSlowWidth;
        }
        else {
            slowdownWidth = Math.abs(hForce);
        }
        slowDownContent();
    }

    function moveContent() {
        var position = $carousel.position();
        if (obj.horizontal) {
            $carousel.css("left", (position.left + hForce) + "px");
        }
    }

    function slowDownContent() {
        clearTimeout(slowingDownTimer);
        if (slowingDowCounter <= 0) {
            return;
        }
        var stopped = false;
        var position = $carousel.position();
        var newLeft = 0;
        if (obj.horizontal) {
            if (position.left > targetLeft) {
                newLeft = position.left - slowdownWidth;
                if (newLeft < targetLeft) {
                    stopped = true;
                }
            } else {
                newLeft = position.left + slowdownWidth;
                if (newLeft > targetLeft) {
                    stopped = true;
                }
            }
            if (stopped || slowingDowCounter <= 0) {
                newLeft = targetLeft;
            }
            $carousel.css("left", newLeft + "px");
        }
        if (!stopped && slowingDowCounter > 0) {
            slowingDowCounter--;
            setTimeout(function () {
                slowDownContent();
            }, 50);
        }
    }
};

nova.Carousel.prototype.goto = function(indexOrSelector) {

};

nova.Carousel.prototype.onViewChanged = function (handler) {
    $(this).bind("onViewChanged", handler);
};
if (window.nova == undefined) {
    nova = new Object();
}

nova.Form = function Form(selector) {
    this.selector = selector;
};

nova.Form.prototype.init = function () {
    var obj = this;
    $(obj.selector).each(function () {
        nova.touch.bindClick($(this).find(".form-text"), function () {
            obj._initInput(this, "text");
        });

        $(this).find(".form-password").each(function () {
            var $this = $(this);
            var value = $this.html();
            $this.attr("data-value", value);
            $this.html("");
            for (var i = 0; i < value.length; i++) {
                $this.append("*");
            }
        });
        nova.touch.bindClick($(this).find(".form-password"), function () {
            obj._initInput(this, "password");
        });
        nova.touch.bindClick($(this).find(".form-checkbox"), function () {
            obj.initCheckbox(this);
        });
    });
};

nova.Form.prototype.initCheckbox = function (input) {
    var $check = $(input);
    if ($check.hasClass("checked")) {
        $check.removeClass("checked");
    }
    else {
        $check.addClass("checked");
    }
};

nova.Form.prototype._initInput = function (input, type) {
    var $text = $(input);
    var html = "<div class='form-modal'><div class='form-modal-w1'>";
    html += "<div class='form-text-w1'>";
    switch (type) {
        case "text":
            html += "<input class='pop-input' type='text' value='" + $text.html() + "' />";
            break;
        case "password":
            html += "<input class='pop-input' type='password' value='" + $text.attr("data-value") + "' />";
            break;
        case "textarea":
            html += "<textarea class='pop-input'>" + $text.html() + "</textarea>";
            break;
    }
    html += "</div>";
    html += "<div class='group'>";
    html += "<div class='btn btn-ok'><span>OK</span></div>";
    html += "<div class='btn btn-cancel'><span>Cancel</span></div>";
    html += "</div>";
    html += "</div></div>";
    var $html = $(html);
    $html.appendTo("#body");
    var $textInput = $html.find(".pop-input");
    $textInput.focus();
    nova.touch.bindClick($html.find(".btn-ok"), function () {
        var value = $html.find(".pop-input").val();
        if (type == "password") {
            $text.html("");
            for (var i = 0; i < value.length; i++) {
                $text.append("*");
            }
            $text.attr("data-value", value);
        }
        else {
            $text.html(value);
        }
        $html.remove();
    });
    nova.touch.bindClick($html.find(".btn-cancel"), function () {
        $html.remove();
    });
};
Array.prototype.each = function (func) {
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var result = func.call(item, i, item);
        if (result == false) {
            return;
        }
    }
};

Array.prototype.sum = function(propertyOrFunc) {
    var total = 0;
    var isFunc = typeof(propertyOrFunc) == "function";
    this.each(function() {
        if (isFunc) {
            total += propertyOrFunc.call(this);
        } else {
            var value = this[propertyOrFunc];
            if (value != undefined && value != null) {
                total += value * 1;
            }
        }
    });
    return total;
};

Array.prototype.where = function (predicateFunction) {
    var results = new Array();
    this.each(function() {
        if (predicateFunction.call(this)) {
            results.push(this);
        }
    });
    return results;
};

Array.prototype.orderBy = function (property, compare) {
    var items = this;
    for (var i = 0; i < items.length - 1; i++) {
        for (var j = 0; j < items.length - 1 - i; j++) {
            if (isFirstGreaterThanSecond(items[j], items[j + 1])) {
                var temp = items[j + 1];
                items[j + 1] = items[j];
                items[j] = temp;
            }
        }
    }
    function isFirstGreaterThanSecond(first, second) {
        if (compare != undefined) {
            return compare(first, second);
        }
        else if (property == undefined || property == null) {
            return first > second;
        }
        else {
            return first[property] > second[property];
        }
    }

    return items;
};

Array.prototype.orderByDescending = function (property, compare) {
    var items = this;
    for (var i = 0; i < items.length - 1; i++) {
        for (var j = 0; j < items.length - 1 - i; j++) {
            if (!isFirstGreaterThanSecond(items[j], items[j + 1])) {
                var temp = items[j + 1];
                items[j + 1] = items[j];
                items[j] = temp;
            }
        }
    }
    function isFirstGreaterThanSecond(first, second) {
        if (compare != undefined) {
            return compare(first, second);
        }
        else if (property == undefined || property == null) {
            return first > second;
        }
        else {
            return first[property] > second[property];
        }
    }
    return items;
};

Array.prototype.groupBy = function (predicate) {
    var results = [];
    var items = this;

    var keys = {}, index = 0;
    for (var i = 0; i < items.length; i++) {
        var selector;
        if (typeof predicate === "string") {
            selector = items[i][predicate];
        } else {
            selector = predicate(items[i]);
        }
        if (keys[selector] === undefined) {
            keys[selector] = index++;
            results.push({ key: selector, value: [items[i]] });
        } else {
            results[keys[selector]].value.push(items[i]);
        }
    }
    return results;
};

Array.prototype.skip = function (count) {
    var items = new Array();
    for (var i = count; i < this.length; i++) {
        items.push(this[i]);
    }
    return items;
};

Array.prototype.take = function (count) {
    var items = new Array();
    for (var i = 0; i < this.length && i < count; i++) {
        items.push(this[i]);
    }
    return items;
};

Array.prototype.firstOrDefault = function (predicateFunction) {
    if (this.length == 0) {
        return null;
    }
    if (predicateFunction == undefined || predicateFunction == null) {
        return this[0];
    }
    var item = null;
    this.each(function () {
        if (predicateFunction.call(this)) {
            item = this;
            return false;
        }
    });
    return item;
};

Array.prototype.any = function(predicateFunction) {
    if (predicateFunction == undefined || predicateFunction == null) {
        return this.length > 0;
    }
    var hasAny = false;
    this.each(function() {
        if (predicateFunction.call(this)) {
            hasAny = true;
            return false;
        }
    });
    return hasAny;
};

Array.prototype.select = function (predicateFunction) {
    if (predicateFunction == undefined || predicateFunction == null) {
        throw "parameter predicateFunction cannot be null or undefined";
    }
    var items = [];
    this.each(function () {
        items.push(predicateFunction.call(this));
    });
    return items;
};

if (window.nova == undefined) {
    window.nova = {};
}
if (nova.data == undefined) {
    nova.data = {};
}

nova.data.Entity = function () {
    this.id = 0;
};

nova.data.Entity.dataTypes = {
    integer: "integer",
    decimal: "decimal",
    string: "string",
    bool: "boolean",
    object: "object",
    date: "date"
};

nova.data.Entity.prototype.getFields = function () {
    var fields = [];
    var instance = this;
    for (property in instance) {
        var type = typeof (instance[property]);
        var field = {
            name: property
        };
        switch (type) {
            case "number":
                if (instance[field] % 1 != 0) {
                    field.type = nova.data.Entity.dataTypes.decimal;
                }
                else {
                    field.type = nova.data.Entity.dataTypes.integer;
                }
                break;
            case "string":
                field.type = nova.data.Entity.dataTypes.string;
                break;
            case "boolean":
                field.type = nova.data.Entity.dataTypes.bool;
                break;
            case "object":
                var value = instance[field.name];
                if (value instanceof Date) {
                    field.type = nova.data.Entity.dataTypes.date;
                }
                break;
            default:
                break;
        }
        if (field.type != undefined) {
            fields.push(field);
        }
    }
    return fields;
};

nova.data.Entity.getDbType = function (type) {
    switch (type) {
        case nova.data.Entity.dataTypes.integer:
        case nova.data.Entity.dataTypes.bool:
        case nova.data.Entity.dataTypes.date:
            return "INTEGER";
        case nova.data.Entity.dataTypes.decimal:
            return "NUMERIC";
        case nova.data.Entity.dataTypes.string:
            return "TEXT";
        default:
            break;
    }
    return "NULL";
};

nova.data.Entity.parseFromDbValue = function (type, value) {
    if (value == null) {
        return null;
    }
    switch (type) {
        case nova.data.Entity.dataTypes.integer:
        case nova.data.Entity.dataTypes.decimal:
        case nova.data.Entity.dataTypes.string:
            return value;
        case nova.data.Entity.dataTypes.bool:
            return value == 1 ? true : false;
        case nova.data.Entity.dataTypes.date:
            return new Date(value);
        default:
            break;
    }
    return value.toString();
};

nova.data.Entity.getDbValue = function (type, value) {
    if (value == null) {
        return "null";
    }
    switch (type) {
        case nova.data.Entity.dataTypes.integer:
        case nova.data.Entity.dataTypes.decimal:
            return value;
        case nova.data.Entity.dataTypes.string:
            var reg = new RegExp("'", "g");
            return "'" + (value + '').replace(reg, "''") + "'";
        case nova.data.Entity.dataTypes.bool:
            return value ? 1 : 0;
        case nova.data.Entity.dataTypes.date:
            if (typeof(value) == "string") {
                return eval("new " + value.replace(/\//g, '')).getTime();
            }
            return value.getTime();
        default:
            break;
    }
    return value.toString();
};
/// <reference path="ArrayExtensions.js" />
/// <reference path="nova.data.Repository.js" />
/// <reference path="nova.data.DbContext.js" />
/// <reference path="nva.data.Entity.js" />

if (window.nova == undefined) {
    window.nova = {};
}
if (nova.data == undefined) {
    nova.data = {};
}

nova.data.Queryable = function(repository, expression) {
    this.repository = repository;
    this._wheresCount = 0;
    this.sql = '';
    if (expression != undefined && expression != null) {
        this.where(expression);
    }
};

nova.data.Queryable.prototype.where = function(expression) {
    if (this.sql == '') {
        this.sql = 'select * from ' + this.repository.table + ' where ' + expression;
    } else {
        this.sql = 'select * from (' + this.sql + ') as t' + this._wheresCount.length + ' where ' + expression;
    }
    this._wheresCount++;
    return this;
};

nova.data.Queryable.prototype.orderBy = function(expression) {
    if (this.sql == '') {
        this.sql = 'select * from ' + this.repository.table + ' order by ' + expression;
    } else {
        this.sql += ' order by ' + expression;
    }
    return this;
};

nova.data.Queryable.prototype.thenBy = function(expression) {
    if (this.sql == '') {
        this.orderBy(expression);
    } else {
        this.sql += ' then by ' + expression;
    }
    return this;
};

nova.data.Queryable.prototype.firstOrDefault = function(callback, expression) {
    if (expression != undefined) {
        this.where(expression);
    }
    var sql = this.sql;
    if (sql == '') {
        sql = 'select * from ' + this.repository.table + ' limit 0,1';
    } else {
        var randomText = Math.abs(Math.round(Math.random() * 10000));
        sql = 'select * from (' + sql + ') as t' + randomText + ' limit 0,1';
    }
    this.query(sql, function(items) {
        if (items.length == 0) {
            callback(null);
        }
        callback(items[0]);
    });
};

nova.data.Queryable.prototype.toArray = function (callback) {
    var sql = this.sql;
    if (sql == '') {
        sql = 'select * from ' + this.repository.table;
    }
    this.query(sql, callback);
};

nova.data.Queryable.prototype.query = function(sql, callback) {
    var repo = this.repository;
    repo.db.query(sql, function (items) {
        var fields = repo.getFields();
        var entities = [];
        items.each(function () {
            var item = this;
            var entity = new repo.type();
            fields.each(function () {
                entity[this.name] = nova.data.Entity.parseFromDbValue(this.type, item[this.name]);
            });
            entities.push(entity);
        });
        callback(entities);
    });
};
/// <reference path="ArrayExtensions.js" />
/// <reference path="nova.data.DbContext.js" />
/// <reference path="nova.data.Queryable.js" />


if(window.nova==undefined) {
    window.nova = { };
}
if (nova.data == undefined) {
    nova.data = { };
}

nova.data.Repository = function (db, type, table) {
    this.db = db;
    this.type = type;
    this.table = table;
    this.pendingAddEntities = [];
    this.pendingDeleteEntities = [];
    this.pendingUpdateEntities = [];
};

nova.data.Repository.prototype.toArray = function (callback) {
    var query = new nova.data.Queryable(this);
    query.toArray(callback);
};

nova.data.Repository.prototype.add = function (entity) {
    this.pendingAddEntities.push(entity);
};

nova.data.Repository.prototype.remove = function (entity) {
    this.pendingDeleteEntities.push(entity);
};

nova.data.Repository.prototype.removeByWhere = function (expression, successCallback, errorCallback) {
    var where = expression == null || expression == '' ? '' : ' where ' + expression;
    this.db.executeSql('delete from ' + this.table + where, successCallback, errorCallback);
};

nova.data.Repository.prototype.removeAll = function (successCallback, errorCallback) {
    this.removeByWhere('', successCallback, errorCallback);
};

nova.data.Repository.prototype.update = function (entity) {
    this.pendingUpdateEntities.push(entity);
};

nova.data.Repository.prototype.where = function (expression) {
    return new nova.data.Queryable(this, expression);
};

nova.data.Repository.prototype.orderBy = function (expression) {
    return new nova.data.Queryable(this).orderBy(expression);
};

nova.data.Repository.prototype.firstOrDefault = function (callback, expression) {
    return new nova.data.Queryable(this).firstOrDefault(callback, expression);
};

nova.data.Repository.prototype.thenBy = function (expression) {
    return new nova.data.Queryable(this).thenBy(expression);
};

nova.data.Repository.prototype.get = function (id, callback) {
    var query = new nova.data.Queryable(this, "id=" + id);
    query.toArray(function (entities) {
        callback(entities.firstOrDefault());
    });
};

nova.data.Repository.prototype.getFields = function () {
    var instance = new this.type();
    return instance.getFields();
};
/// <reference path="01.ArrayExtensions.js" />
/// <reference path="02.nova.data.Entity.js" />
/// <reference path="03.nova.data.Queryable.js" />
/// <reference path="04.nova.data.Repository.js" />


if (window.nova == undefined) {
    window.nova = {};
}
if (nova.data == undefined) {
    nova.data = {};
}

var WebSqlOptions = {
    systemTable: "__WebKitDatabaseInfoTable__",
    DBVersionTable:"versions",
    sqliteSequenceTable:"sqlite_sequence"
};


nova.data.DbContext = function (name, version, displayName, estimatedSize) {
    this.db = null;
    this.logSqls = false;
    this.alertErrors = false;
    this.version = version;
    this.versions = new nova.data.Repository(this, nova.data.DbVersion, "versions");
    if (name != undefined) {
        if (window.openDatabase) {
            this.db = window.openDatabase(name, "1.0", displayName, estimatedSize);
        }
    }
};

nova.data.DbContext.prototype.initData = function (callback) {
    if (callback != undefined && callback != null) {
        callback();
    }
};

nova.data.DbContext.prototype.clearAllData = function(callback,excludeTables) {
    var obj = this;
    this.db.transaction(function (t) {
        t.executeSql("select name from sqlite_master where type=\"table\"", [],
            function(t, r) {
                var tables = [];
                for (var x = 0; x < r.rows.length; x++) {
                    tables.push(r.rows.item(x).name);
                }
                if (!excludeTables) {
                    excludeTables = [
                        WebSqlOptions.systemTable,
                        WebSqlOptions.DBVersionTable,
                        WebSqlOptions.sqliteSequenceTable];
                }
                
                var dropSqls = [];
                for (var di = 0; di < tables.length; di++) {
                    if (!excludeTables.any(function() {
                        return this == tables[di];
                    })) {
                        dropSqls.push("drop table " + tables[di]);
                    } ;
                }
                if (dropSqls.length == 0) {
                    callback && callback();
                    return;
                }
                obj.executeSql(dropSqls, function() {
                    callback && callback();
                }, function() {
                    console.log('drop tables failed.');
                });
            },
            function(t, e) {
                console.log(e);
            }
        );
    });
};

nova.data.DbContext.prototype.init = function (callback) {
    var obj = this;
    obj.isTableExisting("versions", function (exists) {
        if (exists) {
            obj.versions.toArray(function (entities) {
                if (entities.length == 0) {
                    obj._initVersionAndData();
                } else {
                    var lastVersion = entities[0];
                    if (lastVersion.version != obj.version) {
                        obj.reCreateTables(function () {
                            obj._initVersionAndData(callback);
                        }, null);
                    }
                    else {
                        if (callback != undefined && callback != null) {
                            callback();
                        }
                    }
                }
            });
        } else {
            obj.reCreateTables(function () {
                obj._initVersionAndData(callback);
            }, null);
        }
    });
};

nova.data.DbContext.prototype._initVersionAndData = function(callback) {
    var obj = this;
    var version = new nova.data.DbVersion();
    version.version = obj.version;

    obj.versions.add(version);
    obj.saveChanges(function() {
        obj.initData(callback);
    }, null);
};

nova.data.DbContext.prototype.getTables = function () {
    var tables = [];
    for (property in this) {
        var query = this[property];
        if (query instanceof nova.data.Repository) {
            tables.push(this[property].table);
        }
    }
    return tables;
};

nova.data.DbContext.prototype.isTableExisting = function (table, callback) {
    var obj = this;
    var sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + table + "'";
    this.query(sql, function (items) {
        callback(items.length > 0);
    }, function (err) {
        if (obj.alertErrors) {
            alert(sql + ":" + err);
        }
        return false;
    });
};

nova.data.DbContext.prototype.dropAllTables = function(callback) {
    var obj = this;
    var existingTablesQuery = "select name from sqlite_master where type='table'";
    obj.query(existingTablesQuery, function (tables) {
        var systemTables = ['__WebKitDatabaseInfoTable__', 'sqlite_sequence'];
        var dropSqls = [];
        tables.each(function () {
            var table = this;
            var excluded = systemTables.any(function () {
                return this == table.name;
            });
            if (!excluded) {
                dropSqls.push("DROP TABLE IF EXISTS " + table.name);
            }
        });
        obj.executeSql(dropSqls, function () {
            callback && callback();
        }, function () {
            console.log('drop tables failed.');
        });
    });
};

nova.data.DbContext.prototype.reCreateTables = function (successCallback, errorCallback) {
    var obj = this;
    obj.dropAllTables(function() {
        var sqls = [];
        obj.getTables().each(function () {
            var table = this;
            var columns = [];
            obj[table].getFields().each(function () {
                if (this.name == "id") {
                    columns.push("id INTEGER PRIMARY KEY AUTOINCREMENT");
                } else {
                    columns.push(this.name + " " + nova.data.Entity.getDbType(this.type));
                }
            });
            sqls.push("CREATE TABLE " + table + " (" + columns.join() + ")");
        });
        obj.executeSql(sqls, successCallback, errorCallback);
    });
};

nova.data.DbContext.prototype.saveChanges = function (successCallback, errorCallback) {
    var obj = this;
    var sqlDelegates = [];
    var tables = this.getTables();
    for (var ti = 0; ti < tables.length; ti++) {
        var table = tables[ti];
        var query = this[table];
        if (query instanceof nova.data.Repository) {
            var fields = query.getFields();
            query.pendingDeleteEntities.each(function () {
                var removeWhere = this;
                if (this instanceof query.type) {
                    removeWhere = " where id=" + this.id;
                }
                var deleteSql = "delete from " + table + removeWhere;
                sqlDelegates.push({
                    sql: deleteSql
                });
            });

            query.pendingDeleteEntities = [];
            if (query.pendingAddEntities.any()) {
                var columns = fields.select(function () {
                    return this.name;
                }).join();

                query.pendingAddEntities.each(function () {
                    var toAdd = this;
                    var values = [];
                    fields.each(function () {
                        if (this.name == "id") {
                            values.push("null");
                        } else {
                            values.push(nova.data.Entity.getDbValue(this.type, toAdd[this.name]));
                        }
                    });

                    var sqlInsert = "insert into " + table + " (" + columns + ") values (" + values.join() + ")";
                    sqlDelegates.push({
                        sql: sqlInsert,
                        entity: toAdd
                    });
                });
                query.pendingAddEntities = [];
            }

            query.pendingUpdateEntities.each(function () {
                var toUpdate = this;
                var sets = fields.where(function () {
                    return this.name != "id";
                }).select(function () {
                    return this.name + "=" + nova.data.Entity.getDbValue(this.type, toUpdate[this.name]);
                }).join();
                var sqlUpdate = "update " + table + " set " + sets + " where id = " + toUpdate.id;
                sqlDelegates.push({
                    sql: sqlUpdate
                });
            });
            query.pendingUpdateEntities = [];
        }
    }
    if (this.db != null) {
        this.db.transaction(function (dbContext) {
            for (var s = 0; s < sqlDelegates.length; s++) {
                var sqlDelegate = sqlDelegates[s];
                if (obj.logSqls) {
                    console.log(sqlDelegate.sql);
                }
                dbContext.executeSql(sqlDelegate.sql, [], function (tx, result) {
                    if (sqlDelegate.entity) {
                        sqlDelegate.entity.id = result.insertId;
                    }
                });
            }
        }, function (err) {
            if (obj.alertErrors) {
                alert(err);
            }
            if (errorCallback == undefined || errorCallback == null) {
                throw err;
            }
            errorCallback(err);
        }, function() {
            successCallback && successCallback();
        });
    }
};

nova.data.DbContext.prototype.executeSql = function (sqls, successCallback, errorCallback) {
    var obj = this;
    if (this.db != null) {
        this.db.transaction(function (dbContext) {
            if (sqls instanceof Array) {
                for (var s = 0; s < sqls.length; s++) {
                    var sql = sqls[s];
                    if (obj.logSqls) {
                        console.log(sql);
                    }
                    dbContext.executeSql(sql);
                }
            } else {
                if (obj.logSqls) {
                    console.log(sqls);
                }
                dbContext.executeSql(sqls);
            }
        }, function (err) {
            if (obj.alertErrors) {
                alert(err);
            }
            if (errorCallback == undefined || errorCallback == null) {
                throw err;
            }
        }, function () {
            if (successCallback != undefined) {
                successCallback();
            }
        });
    }
};

nova.data.DbContext.prototype.query = function (sql, successCallback, errorCallback, paras) {
    var obj = this;
    if (obj.db != null) {
        obj.db.transaction(function (dbctx) {
            if (obj.logSqls) {
                console.log(sql);
            }
            var sqlParas = paras == undefined ? [] : paras;
            dbctx.executeSql(sql, sqlParas, function (tx, result) {
                var items = [];
                for (var i = 0; i < result.rows.length; i++) {
                    items.push(result.rows.item(i));
                }
                successCallback(items);
            }, function (err) {
                if (obj.alertErrors) {
                    alert(err);
                }
                if (errorCallback == undefined || errorCallback == null) {
                    throw err;
                }
                else {
                    errorCallback(err);
                }
            });
        }, function (err) {
            if (obj.alertErrors) {
                alert(err);
            }
            if (errorCallback == undefined || errorCallback == null) {
                throw err;
            }
            else {
                errorCallback(err);
            }
        });
    }
};

nova.data.DbVersion = function() {
    nova.data.Entity.call(this);
    this.version = "";
};
nova.data.DbVersion.prototype = new nova.data.Entity();
nova.data.DbVersion.constructor = nova.data.DbVersion;

if (window.nova == undefined) {
    window.nova = new Object();
}
nova.widgets = {
    
};
nova.Widget = function(wrapper) {
    this.wrapper = wrapper;
};


nova.widgets.busy = {
    show: function(content, deplay, css) {
        content = content == undefined ? 'Loading...' : content;
        var $busy = $('.busy');
        if ($busy.length > 0) {
            $busy.remove();
        }
        css = css != undefined && css != '' && css != null ? ' ' + css : '';
        var html = '<div class="busy' + css + '">\
                        <div class="busy-content">' + content + '</div>\
                    </div>';
        $busy = $(html).appendTo('#body');
        if (deplay == undefined || deplay == null || deplay <= 0) {
            showBusy();
        } else {
            setTimeout(function() {
                showBusy();
            }, deplay);
        }
        
        function showBusy() {
            $busy.show();
            var $content = $('.busy-content');
            $content.css('top', ($busy.height() - $content.height()) / 2 + 'px');
            $content.css('left', ($busy.width() - $content.width()) / 2 + 'px');
        }
    },
    remove: function() {
        $('.busy').remove();
    }
};
if (window.nova == undefined) {
    window.nova = new Object();
}
if (window.nova.widgets == undefined) {
    window.nova.widgets = new Object();
}
nova.widgets.BusyIndicator = function() {
    nova.Widget.call(this, "#body");
    this.content = "Loading...";
    this.cancelable = false;
};
nova.widgets.BusyIndicator.prototype = new nova.Widget();
nova.widgets.BusyIndicator.constructor = nova.widgets.BusyIndicator;

nova.widgets.BusyIndicator.prototype.show = function() {
    var $busy = $(".busy");
    if($busy.length==0) {
        $busy = $("<div class='busy'></div>");
        $busy.appendTo(this.wrapper);
    }
    $busy.show();
};

nova.widgets.BusyIndicator.prototype.remove = function() {
    $(".busy").remove();
};

if (window.nova == undefined) {
    window.nova = new Object();
}
if (window.nova.widgets == undefined) {
    window.nova.widgets = new Object();
}

nova.widgets.Dialog = function (id) {
    nova.Widget.call(this, "#body");
    this.id = id == undefined ? "dialog" + new Date().getTime() : id;
    this.modal = true;
    this.title = "";
    this.content = "";
    this.buttons = null;
    this.css = "";
    this.width = 0.8;
    this.height = 0.6;
    this.canClose = true;
    this.autoRemove = true;

    this.opened = null;
    this.closed = null;
    this.closing = null;
};

nova.widgets.Dialog.prototype = new nova.Widget();
nova.widgets.Dialog.constructor = nova.widgets.Dialog;

nova.widgets.Dialog.prototype.show = function () {
    var dialog = this;

    var $dialog = $("#" + dialog.id);
    if ($dialog.length > 0) {
        $dialog.show();
        return;
    }

    $dialog = $("<div id='" + dialog.id + "' class='dialog'></div>");
    $dialog.appendTo($(dialog.wrapper));
    if (dialog.css != "") {
        $dialog.addClass(dialog.css);
    }
    if (dialog.modal) {
        $dialog.addClass("modal");
    }

    var $win = $("<div class='dialog-window'></div>");
    $win.appendTo($dialog);
    var winHeight = $(window).height();
    var winWidth = $(window).width();

    if (dialog.width <= 1) {
        $win.width(dialog.width * 100 + "%");
        $win.css("left", (1 - dialog.width) * 100 / 2 + "%");
    }
    else {
        $win.width(dialog.width + "px");
        $win.css("left", (winWidth - dialog.width) / 2 + "px");
    }
    if (dialog.height <= 1) {
        $win.height(dialog.height * 100 + "%");
        $win.css("top", (1 - 1 * dialog.height) * 100 / 2 + "%");
    }
    else {
        $win.height(dialog.height + "px");
        $win.css("top", (winHeight - dialog.height) / 2 + "px");
    }

    var $header = $("<div class='dialog-header'><div class='dialog-title'>" + dialog.title + "</div></div>");
    $header.appendTo($win);

    if (dialog.canClose) {
        var $close = $("<div class='dialog-close'><span></span></div>");
        $close.appendTo($header);
        nova.touch.bindClick($close, function () {
            setTimeout(function() {
                dialog.close();
            }, 50);
        });
    }

    var $content = $("<div class='dialog-content'><div class='dialog-content-wrap'>" + dialog.content + "</div></div>");
    $content.appendTo($win);

    var $footer = null;
    if (dialog.buttons != null) {
        $footer = $("<div class='dialog-footer'><div class='dialog-footer-w1'><div class='dialog-footer-w2'></div></div></div>");
        $footer.appendTo($win);
        var $footerWrap = $footer.find(".dialog-footer-w2");
        for (p in dialog.buttons) {
            var property = p;
            var value = dialog.buttons[property];
            if (typeof (value) == "function") {
                var $button = $("<div class='btn' data-text='" + property + "'><span>" + property + "</span></div>");
                $button.data("data", dialog);
                $button.appendTo($footerWrap);
                nova.touch.bindClick($button, function () {
                    try {
                        var text = $(this).attr("data-text");
                        dialog.buttons[text]();
                    }
                    catch (err) {
                        alert("error: " + err);
                    }
                });
            }
        }
    }

    var contentHeight = $win.height() - $header.height();
    if ($footer != null) {
        contentHeight -= $footer.height();
    }
    $content.height(contentHeight + "px");
    if (dialog.opened != null) {
        dialog.opened();
    }
};

nova.widgets.Dialog.prototype.close = function () {
    var obj = this;
    var closingCancelled = false;
    if (obj.closing != null) {
        closingCancelled = obj.closing() == false;
    }
    if (closingCancelled) {
        return;
    }
    if (obj.autoRemove) {
        obj.remove();
    }
    else {
        $("#" + obj.id).hide();
    }
    if (obj.closed != null) {
        obj.closed();
    }
};

nova.widgets.Dialog.prototype.remove = function () {
    $("#" + this.id).remove();
};
if(window.nova == undefined) {
    window.nova = { };
}
if(nova.widgets == undefined) {
    nova.widgets = { };
}

nova.widgets.Switch = function() {
    this.wrapper = "";
    this.on = true;
    this.rederToFunc = null;
};

nova.widgets.Switch.prototype.render = function() {
    var $switch = $("<div class='switch " + (this.on ? "on" : "") + "'></div>");
    if (this.rederToFunc == null) {
        $(this.wrapper).append($switch);
    }
    else {
        this.rederToFunc($switch);
    }
    nova.touch.bindClick($switch, function() {
        //todo: switch state
    });
};
if (window.nova == undefined) {
    window.nova = {};
}
if (nova.widgets == undefined) {
    nova.widgets = {};
}

nova.widgets.Toast = function (message) {
    this.message = message;
    this.showDuration = 500;
    this.displayDuration = 2000;
    this.hideDuration = 500;
    this.css = "";
};

nova.widgets.Toast.prototype = new nova.Widget();
nova.widgets.Toast.constructor = nova.widgets.Toast;

nova.widgets.Toast.prototype.show = function () {
    var obj = this;
    var $toast = $("<div class='toast'>" + this.message + "</div>");
    if (this.css != "") {
        $toast.addClass(this.css);
    }
    $toast.appendTo("#body");
    var centerX = $(window).width() / 2;
    var left = centerX - $toast.width() / 2;
    var bottom = $(window).height() / 10;
    $toast.css("bottom", 0 + "px");
    $toast.css("left", left + "px");
    $toast.animate({
        bottom: "+=" + bottom,
        opacity: 1
    }, {
        duration: obj.showDuration,
        complete: function () {
            setTimeout(function () {
                $toast.animate({
                    bottom: "-=35",
                    opacity: 0
                }, {
                    duration: obj.hideDuration,
                    complete: function () {
                        $toast.remove();
                    }
                });
            }, obj.displayDuration);
        }
    });
};