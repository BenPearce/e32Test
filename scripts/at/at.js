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