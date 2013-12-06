at.pages.Home = function() {
    nova.Page.call(this, 'pages/home.html');
    
};

at.pages.Home.prototype = new nova.Page();
at.pages.Home.constructor = at.pages.Home;

at.pages.Home.prototype.onLoaded = function() {
    var me = this;
    var selectedYear = at.globals.currentYear;
    $("#lblYear").html(selectedYear);
    var service = new at.services.TargetService();
    service.getYearTargets(selectedYear, function (targets) {
        me._renderTargets(targets);
        me._bindDomEvents();
    });
};

at.pages.Home.prototype._bindDomEvents = function() {
    nova.touch.bindClick("#btnSettings", function () {
        at.gotoPage(new at.pages.Menu());
    });
    nova.touch.bindClick("#targets li", function () {
        var service = new at.services.TargetService();
        service.getTarget(this.id, function (target) {
            var page = new at.pages.Details();
            page.target = target;
            at.gotoPage(page);
        });
    });
    $("#content").height($(window).height() - 50 + "px");
    var scroller = new nova.Scroller(".content-scroll");
    scroller.init();
};

at.pages.Home.prototype._renderTargets = function(targets) {
    if (targets.length == 0) {
        $(".content-w1").html("<p class='target-empty'>No target was found. Click M(enu) to add some.</p>");
    } else {
        var html = "";
        targets.each(function() {
            html +=
                '<li id="' + this.id + '">\
                        <div class="target-title">' + this.title + ':</div>\
                        <div class="target">\
                            <div class="progress" style="width:' + Number.getPercentage(this.getProgressPercent()) + '"></div>\
                            <div class="progress-today" style="width:' + Number.getPercentage(this.getTodayProgressPercent()) + '"></div>\
                            <div class="target-values">\
                                <span class="progress-percent">' + Number.getPercentage(this.getProgressPercent(), 1) + '</span>\
                            </div>\
                        </div>\
                    </li>';
        });
        $("#targets").html(html);
    }
};