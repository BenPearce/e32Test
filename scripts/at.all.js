// last build: 20131023.0555

window.at = nova.application;

at.pages = {};
at.domain = {};
at.services = {};
at.globals = {
    currentYear:new Date().getFullYear()
};
at.db = {
    _instance: null,
    withSamples: false,
    init: function(callback) {
        if (this._instance == null) {
            var db = new at.domain.AtDbContext(this.withSamples);
            try {
                db.init(function() {
                    at.db._instance = db;
                    callback && callback();
                });
            } catch(ex) {
                alert(ex);
            }
        } else {
            callback();
        }
    },
    getInstance: function() {
        return this._instance;
    }
};

Date.prototype.getDaysUntil = function(futureDay) {
    var future = new Date(futureDay.getFullYear(), futureDay.getMonth(), futureDay.getDate());
    var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    return (future - today) / (24 * 3600000);
};

Date.prototype.getDaysTillNow = function (since) {
    var past = new Date(since.getFullYear(), since.getMonth(), since.getDate());
    var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    return (today - past) / (24 * 3600000);
};

Date.prototype.toShortDateString = function() {
    return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate();
};

if(Number == undefined) {
    window.Number = function() {

    };
}

Number.getPercentage = function(percent, precision) {
    var value = 100 * percent;
    if (precision != undefined && precision != null && precision >= 0) {
        value = value.toFixed(precision) * 1;
    }
    return value + "%";
};

Number.getDisplayText = function(number) {
    if (number < 1000) {
        return number;
    }
    if (number < 1000000) {
        return (number / 1000).toFixed(1) * 1 + "k";
    }
    return (number / 1000000).toFixed(1) * 1 + "m";
};
/* if you want to re-create the DB(due to schema changes, re-init sample data, etc.), 
change the version parameter on line:
    nova.data.DbContext.call(...);
*/
at.domain.AtDbContext = function (withSampleData) {
    nova.data.DbContext.call(this, "AnualTargetDB", "1.0005", "AnualTargetDB", 1000000);
    this.logSqls = true;
    this.alertErrors = true;
    this.withSampleData = withSampleData == undefined ? false : withSampleData;
    this.targets = new nova.data.Repository(this, at.domain.Target, "targets");
};

at.domain.AtDbContext.prototype = new nova.data.DbContext();
at.domain.AtDbContext.constructor = at.domain.AtDbContext;

at.domain.AtDbContext.prototype.initData = function(callback) {
    var me = this;
    if (this.withSampleData == false) {
        nova.data.DbContext.prototype.initData.call(this, callback);
    }
    else {
        var year = new Date().getFullYear();
        var progress = new Date().getDaysTillNow(new Date(year, 0, 1)) / 365;

        var run = new at.domain.Target();
        run.title = "Run";
        run.startDate = new Date(year, 0, 1);
        run.target = 300;
        run.complete = Math.round(300 * progress * 1.2);
        run.year = year;
        run.displayOrder = 1;
        me.targets.add(run);
        
        var blogPost = new at.domain.Target();
        blogPost.title = "Blog Posts";
        blogPost.startDate = new Date(year, 0, 1);
        blogPost.target = 50;
        blogPost.complete = Math.round(50 * progress * 1.4);
        blogPost.year = year;
        blogPost.displayOrder = 2;
        me.targets.add(blogPost);

        var read = new at.domain.Target();
        read.title = "Read Books";
        read.startDate = new Date(year, 0, 1);
        read.target = 10;
        read.complete = Math.round(10 * progress * 0.8);
        read.year = year;
        read.displayOrder = 3;
        me.targets.add(read);
        
        var travel = new at.domain.Target();
        travel.title = "Travel Days";
        travel.startDate = new Date(year, 0, 1);
        travel.target = 16;
        travel.complete = Math.round(16 * progress * 1.3);
        travel.year = year;
        travel.displayOrder = 4;
        me.targets.add(travel);
        
        var income = new at.domain.Target();
        income.title = "Income";
        income.startDate = new Date(year, 0, 1);
        income.target = 100000;
        income.complete = Math.round(100000 * progress * 0.8);
        income.year = year;
        income.displayOrder = 5;
        me.targets.add(income);
        
        var pushup = new at.domain.Target();
        pushup.title = "Push-ups";
        pushup.startDate = new Date(year, 0, 1);
        pushup.target = 15000;
        pushup.complete = Math.round(15000 * progress * 0.7);
        pushup.year = year;
        pushup.displayOrder = 1;
        me.targets.add(pushup);
        
        function doCallback() {
            if (callback != undefined && callback != null) {
                callback();
            }
        }
        me.saveChanges(doCallback, doCallback);
    }
};


at.domain.Target = function () {
    nova.data.Entity.call(this);
    this.title = "";
    this.startDate = new Date();
    this.target = 0;
    this.complete = 0;
    this.year = 0;
    this.displayOrder = 0;
};

at.domain.Target.prototype = new nova.data.Entity();
at.domain.Target.constructor = at.domain.Target;

at.domain.Target.prototype.updateYear = function () {
    this.year = this.startDate.getFullYear();
};

at.domain.Target.prototype.getTotalDays = function () {
    var date = new Date(this.startDate);
    date.setFullYear(this.startDate.getFullYear() + 1);
    date.setMonth(0);
    date.setDate(1);
    return this.startDate.getDaysUntil(date);
};

at.domain.Target.prototype.updateFrom = function (target) {
    this.title = target.title;
    this.startDate = target.startDate;
    this.target = target.target;
    this.complete = target.complete;
    this.displayOrder = target.displayOrder;
    this.updateYear();
};

at.domain.Target.prototype.getProgressPercent = function () {
    return this.complete / this.target;
};

at.domain.Target.prototype.getTodayProgressPercent = function () {
    var daysPast = this.getPastDays();
    var totalDays = this.getTotalDays();
    return daysPast / totalDays;
};

at.domain.Target.prototype.getPastDays = function () {
    return this.startDate.getDaysUntil(new Date());
};
at.services.TargetService = function () {
    
};

at.services.TargetService.prototype.saveTarget = function (target, callback) {
    var db = at.db.getInstance();
    target.updateYear();
    if (target.id == 0) {
        db.targets.add(target);
    } else {
        db.targets.update(target);
    }
    db.saveChanges(callback);
};

at.services.TargetService.prototype.getTarget = function (id, callback) {
    return at.db.getInstance().targets.where("id=" + id).toArray(function (items) {
        return callback(items.firstOrDefault());
    });
};

at.services.TargetService.prototype.deleteTarget = function (id, callback) {
    this.getTarget(id, function (toDelete) {
        var db = at.db.getInstance();
        db.targets.remove(toDelete);
        db.saveChanges(callback);
    });
};

at.services.TargetService.prototype.addComplete = function (targetId, callback) {
    this.getTarget(targetId, function (target) {
        var db = at.db.getInstance();
        target.complete += 1;
        db.targets.update(target);
        db.saveChanges(callback);
    });
};

at.services.TargetService.prototype.getCurrentYearTargets = function (callback) {
    var year = new Date().getFullYear();
    this.getYearTargets(year, callback);
};

at.services.TargetService.prototype.getYearTargets = function (year, callback) {
    var db = at.db.getInstance();
    db.targets.where("year=" + year).toArray(function (items) {
        return callback(items.orderBy("displayOrder"));
    });
};

at.services.TargetService.prototype.getAllTargetYears = function (callback) {
    var db = at.db.getInstance();
    db.targets.toArray(function (items) {
        return callback(items.orderBy("year").groupBy("year"));
    });
};


at.pages.Details = function () {
    nova.Page.call(this, 'pages/details.html');
    this.target = null;
};

at.pages.Details.prototype = new nova.Page();
at.pages.Details.constructor = at.pages.Details;

at.pages.Details.prototype.onLoaded = function() {
    var me = this;
    $("#lblTitle").html(me.target.title);
    $("#lblStart").html(me.target.startDate.toDateString());
    $("#lblTotalDays").html(me.target.getTotalDays());
    me.updateProgress();

    $("#content").height($(window).height() - 102 + "px");
    var scroller = new nova.Scroller(".content-scroll");
    scroller.init();

    nova.touch.bindClick("#btnBack", function () {
        nova.application.goBack();
    });
    nova.touch.bindClick("#btnCancel", function () {
        $("#lblTobeAdded").html("0");
    });
    nova.touch.bindClick("#btnEdit", function () {
        var page = new at.pages.EditTarget();
        page.editingTarget = me.target;
        at.gotoPage(page);
    });
    nova.touch.bindClick("#btnAdds .link", function () {
        var count = $(this).attr('data-add') * 1;
        var current = $("#lblTobeAdded").html() * 1;
        $("#lblTobeAdded").html(current + count);
    });
    nova.touch.bindClick("#btnApply", function () {
        me.apply();
    });
};

at.pages.Details.prototype.apply = function() {
    var me = this;
    var tobeAdded = $("#lblTobeAdded").html() * 1;
    if (tobeAdded <= 0) {
        var dialog = new nova.widgets.Dialog("dialogError");
        dialog.title = "Not Added";
        dialog.height = 150;
        dialog.width = 0.8;
        dialog.content = "To be added is 0.";
        dialog.buttons = {
            "OK": function () {
                dialog.close();
            }
        };
        me.autoCancelDialog(dialog);
        dialog.show();
        return;
    }
    var confirmDialog = new nova.widgets.Dialog("confirmDialog");
    confirmDialog.title = "Add Confirm";
    confirmDialog.height = 180;
    confirmDialog.content = "To be added to progress is: " + tobeAdded + ". Correct?";
    confirmDialog.buttons = {
        "Make Progress": function () {
            me.target.complete += tobeAdded;
            var service = new at.services.TargetService();
            service.saveTarget(me.target, function () {
                new nova.widgets.Toast("Done").show();
                me.updateProgress();
                $("#lblTobeAdded").html("0");
                confirmDialog.close();
            });
        },
        "Cancel": function () {
            confirmDialog.close();
        }
    };
    me.autoCancelDialog(confirmDialog);
    confirmDialog.show();
};

at.pages.Details.prototype.updateProgress = function() {
    var me = this;
    var dayPercent = me.target.getTodayProgressPercent();
    var valuePercent = me.target.getProgressPercent();
    var expectedCompletion = me.target.target * dayPercent;
    var completeMargin = Math.round(me.target.complete - expectedCompletion);

    $(".progress").css("width", Number.getPercentage(valuePercent));
    $(".progress-today").css("width", Number.getPercentage(dayPercent));
    $(".progress-percent").html(Number.getPercentage(valuePercent, 1));
    $(".progress-count").html(Number.getDisplayText(me.target.complete) + "/" + Number.getDisplayText(me.target.target));

    var $margin = $('#lblMargin');
    if (completeMargin >= 0) {
        $margin.removeClass('warning');
    } else {
        $margin.addClass('warning');
    }

    var marginPercent = Number.getPercentage(completeMargin / me.target.target, 1);
    $margin.html(completeMargin + '<small>' + marginPercent + '</small>');
};
at.pages.EditTarget = function () {
    nova.Page.call(this, 'pages/editTarget.html');
    this.editingTarget = null;
};

at.pages.EditTarget.prototype = new nova.Page();
at.pages.EditTarget.constructor = at.pages.EditTarget;

at.pages.EditTarget.prototype.onLoaded = function () {
    var me = this;
    me.bindData();
    nova.touch.bindClick(".btn-cancel", function () {
        at.goBack();
    });
    nova.touch.bindClick("#btnSave", function () {
        me.save();
    });
    if (me.editingTarget.id > 0) {
        nova.touch.bindClick("#btnDelete", function () {
            me.deleteTarget();
        });
    }
    else {
        $("#btnDelete").parent().removeClass("nav3").addClass("nav2");
        $("#btnDelete").remove();
    }
    new nova.Form(".form").init();
    $("#content").height($(window).height() - 102 + "px");
    var scroller = new nova.Scroller(".content-scroll");
    scroller.init();
};

at.pages.EditTarget.prototype.bindData = function() {
    var me = this;
    $("#txtTitle").html(me.editingTarget.title);
    $("#txtStartDate").html(me.editingTarget.startDate.toShortDateString());
    $("#txtDisplayOrder").html(me.editingTarget.displayOrder);
    $("#txtTarget").html(me.editingTarget.target);
};

at.pages.EditTarget.prototype.parseData = function () {
    var me = this;
    me.editingTarget.title = $("#txtTitle").html();
    me.editingTarget.startDate = new Date($("#txtStartDate").html());
    me.editingTarget.displayOrder = $("#txtDisplayOrder").html() * 1;
    me.editingTarget.target = $("#txtTarget").html() * 1;
};

at.pages.EditTarget.prototype.save = function() {
    var me = this;
    me.parseData();
    if (me.editingTarget.target <= 0) {
        navigator.notification.alert('Target must be greater than 0', function() {

        }, 'Error', 'OK');
        return;
    }
    var service = new at.services.TargetService();
    service.saveTarget(me.editingTarget, function () {
        at.goBack();
    });
};

at.pages.EditTarget.prototype.deleteTarget = function () {
    var me = this;
    var dialog = new nova.widgets.Dialog("deleteDialog");
    dialog.title = "Delete Confirm";
    dialog.height = 160;
    dialog.content = "Are you sure you want to delete this target?";
    dialog.buttons = {
        "Delete": function() {
            var service = new at.services.TargetService();
            service.deleteTarget(me.editingTarget.id, function () {
                at.goBack(new at.pages.Home());
            });
        },
        "Cancel": function() {
            dialog.close();
            me.backbuttonHandlers.pop();
        }
    };
    me.backbutton(function() {
        dialog.close();
    });
    dialog.show();
};
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
at.pages.Menu = function() {
    nova.Page.call(this, 'pages/menu.html');
};

at.pages.Menu.prototype = new nova.Page();
at.pages.Menu.constructor = at.pages.Menu;

at.pages.Menu.prototype.onLoaded = function() {
    nova.touch.bindClick("#btnBack", function() {
        at.goBack();
    });
    nova.touch.bindClick("#btnAbout", function() {
        at.gotoPage("pages/about.html");
    });
    nova.touch.bindClick("#btnSwitchYear", function() {
        at.gotoPage(new at.pages.SwitchYear());
    });
    nova.touch.bindClick("#btnAddTarget", function() {
        var page = new at.pages.EditTarget();
        page.editingTarget = new at.domain.Target();
        at.gotoPage(page);
    });
};
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