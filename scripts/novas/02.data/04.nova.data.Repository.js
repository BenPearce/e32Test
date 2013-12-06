/// <reference path="ArrayExtensions.js" />
/// <reference path="nova.data.DbContext.js" />
/// <reference path="nova.data.Queryable.js" />


if(window.nova==undefined) {
    window.nova = { };
}
if (nova.data == undefined) {
    nova.data = { };
}

nova.data.Repository = function (db, type, table) {
    this.db = db;
    this.type = type;
    this.table = table;
    this.pendingAddEntities = [];
    this.pendingDeleteEntities = [];
    this.pendingUpdateEntities = [];
};

nova.data.Repository.prototype.toArray = function (callback) {
    var query = new nova.data.Queryable(this);
    query.toArray(callback);
};

nova.data.Repository.prototype.add = function (entity) {
    this.pendingAddEntities.push(entity);
};

nova.data.Repository.prototype.remove = function (entity) {
    this.pendingDeleteEntities.push(entity);
};

nova.data.Repository.prototype.removeByWhere = function (expression, successCallback, errorCallback) {
    var where = expression == null || expression == '' ? '' : ' where ' + expression;
    this.db.executeSql('delete from ' + this.table + where, successCallback, errorCallback);
};

nova.data.Repository.prototype.removeAll = function (successCallback, errorCallback) {
    this.removeByWhere('', successCallback, errorCallback);
};

nova.data.Repository.prototype.update = function (entity) {
    this.pendingUpdateEntities.push(entity);
};

nova.data.Repository.prototype.where = function (expression) {
    return new nova.data.Queryable(this, expression);
};

nova.data.Repository.prototype.orderBy = function (expression) {
    return new nova.data.Queryable(this).orderBy(expression);
};

nova.data.Repository.prototype.firstOrDefault = function (callback, expression) {
    return new nova.data.Queryable(this).firstOrDefault(callback, expression);
};

nova.data.Repository.prototype.thenBy = function (expression) {
    return new nova.data.Queryable(this).thenBy(expression);
};

nova.data.Repository.prototype.get = function (id, callback) {
    var query = new nova.data.Queryable(this, "id=" + id);
    query.toArray(function (entities) {
        callback(entities.firstOrDefault());
    });
};

nova.data.Repository.prototype.getFields = function () {
    var instance = new this.type();
    return instance.getFields();
};