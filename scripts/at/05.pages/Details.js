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