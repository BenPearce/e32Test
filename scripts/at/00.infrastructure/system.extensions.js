
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