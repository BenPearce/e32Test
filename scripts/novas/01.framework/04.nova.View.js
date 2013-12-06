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