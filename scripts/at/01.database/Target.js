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