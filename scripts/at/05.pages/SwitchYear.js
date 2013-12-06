at.pages.SwitchYear = function () {
    nova.Page.call(this, 'pages/switchYear.html');
};

at.pages.SwitchYear.prototype = new nova.Page();
at.pages.SwitchYear.constructor = at.pages.SwitchYear;

at.pages.SwitchYear.prototype.onLoaded = function () {
    var me = this;
    nova.touch.bindClick("#btnBack", function () {
        at.goBack();
    });
    var service = new at.services.TargetService();
    service.getAllTargetYears(function (targets) {
        me._renderTargets(targets, function() {
            nova.touch.bindClick("#years li", function () {
                at.globals.currentYear = $(this).attr("data-year") * 1;
                at.gotoPage(new at.pages.Home());
            });
        });
    });
};

at.pages.SwitchYear.prototype._renderTargets = function(targets, callback) {
    if (targets.length == 0) {
        var year = new Date().getFullYear();
        targets.push({ key: year });
    }
    var html = "";
    targets.each(function() {
        html +=
            '<li id="' + this.key + '" data-year="' + this.key + '">\
                <div class="target-year">' + this.key + '</div>\
            </li>';
    });
    $("#years").html(html);
    callback && callback();
};