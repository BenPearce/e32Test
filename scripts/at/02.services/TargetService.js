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

