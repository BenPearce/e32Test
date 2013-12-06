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