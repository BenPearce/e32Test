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