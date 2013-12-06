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