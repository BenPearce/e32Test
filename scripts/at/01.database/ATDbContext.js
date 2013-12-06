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

