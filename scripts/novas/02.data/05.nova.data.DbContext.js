/// <reference path="01.ArrayExtensions.js" />
/// <reference path="02.nova.data.Entity.js" />
/// <reference path="03.nova.data.Queryable.js" />
/// <reference path="04.nova.data.Repository.js" />


if (window.nova == undefined) {
    window.nova = {};
}
if (nova.data == undefined) {
    nova.data = {};
}

var WebSqlOptions = {
    systemTable: "__WebKitDatabaseInfoTable__",
    DBVersionTable:"versions",
    sqliteSequenceTable:"sqlite_sequence"
};


nova.data.DbContext = function (name, version, displayName, estimatedSize) {
    this.db = null;
    this.logSqls = false;
    this.alertErrors = false;
    this.version = version;
    this.versions = new nova.data.Repository(this, nova.data.DbVersion, "versions");
    if (name != undefined) {
        if (window.openDatabase) {
            this.db = window.openDatabase(name, "1.0", displayName, estimatedSize);
        }
    }
};

nova.data.DbContext.prototype.initData = function (callback) {
    if (callback != undefined && callback != null) {
        callback();
    }
};

nova.data.DbContext.prototype.clearAllData = function(callback,excludeTables) {
    var obj = this;
    this.db.transaction(function (t) {
        t.executeSql("select name from sqlite_master where type=\"table\"", [],
            function(t, r) {
                var tables = [];
                for (var x = 0; x < r.rows.length; x++) {
                    tables.push(r.rows.item(x).name);
                }
                if (!excludeTables) {
                    excludeTables = [
                        WebSqlOptions.systemTable,
                        WebSqlOptions.DBVersionTable,
                        WebSqlOptions.sqliteSequenceTable];
                }
                
                var dropSqls = [];
                for (var di = 0; di < tables.length; di++) {
                    if (!excludeTables.any(function() {
                        return this == tables[di];
                    })) {
                        dropSqls.push("drop table " + tables[di]);
                    } ;
                }
                if (dropSqls.length == 0) {
                    callback && callback();
                    return;
                }
                obj.executeSql(dropSqls, function() {
                    callback && callback();
                }, function() {
                    console.log('drop tables failed.');
                });
            },
            function(t, e) {
                console.log(e);
            }
        );
    });
};

nova.data.DbContext.prototype.init = function (callback) {
    var obj = this;
    obj.isTableExisting("versions", function (exists) {
        if (exists) {
            obj.versions.toArray(function (entities) {
                if (entities.length == 0) {
                    obj._initVersionAndData();
                } else {
                    var lastVersion = entities[0];
                    if (lastVersion.version != obj.version) {
                        obj.reCreateTables(function () {
                            obj._initVersionAndData(callback);
                        }, null);
                    }
                    else {
                        if (callback != undefined && callback != null) {
                            callback();
                        }
                    }
                }
            });
        } else {
            obj.reCreateTables(function () {
                obj._initVersionAndData(callback);
            }, null);
        }
    });
};

nova.data.DbContext.prototype._initVersionAndData = function(callback) {
    var obj = this;
    var version = new nova.data.DbVersion();
    version.version = obj.version;

    obj.versions.add(version);
    obj.saveChanges(function() {
        obj.initData(callback);
    }, null);
};

nova.data.DbContext.prototype.getTables = function () {
    var tables = [];
    for (property in this) {
        var query = this[property];
        if (query instanceof nova.data.Repository) {
            tables.push(this[property].table);
        }
    }
    return tables;
};

nova.data.DbContext.prototype.isTableExisting = function (table, callback) {
    var obj = this;
    var sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + table + "'";
    this.query(sql, function (items) {
        callback(items.length > 0);
    }, function (err) {
        if (obj.alertErrors) {
            alert(sql + ":" + err);
        }
        return false;
    });
};

nova.data.DbContext.prototype.dropAllTables = function(callback) {
    var obj = this;
    var existingTablesQuery = "select name from sqlite_master where type='table'";
    obj.query(existingTablesQuery, function (tables) {
        var systemTables = ['__WebKitDatabaseInfoTable__', 'sqlite_sequence'];
        var dropSqls = [];
        tables.each(function () {
            var table = this;
            var excluded = systemTables.any(function () {
                return this == table.name;
            });
            if (!excluded) {
                dropSqls.push("DROP TABLE IF EXISTS " + table.name);
            }
        });
        obj.executeSql(dropSqls, function () {
            callback && callback();
        }, function () {
            console.log('drop tables failed.');
        });
    });
};

nova.data.DbContext.prototype.reCreateTables = function (successCallback, errorCallback) {
    var obj = this;
    obj.dropAllTables(function() {
        var sqls = [];
        obj.getTables().each(function () {
            var table = this;
            var columns = [];
            obj[table].getFields().each(function () {
                if (this.name == "id") {
                    columns.push("id INTEGER PRIMARY KEY AUTOINCREMENT");
                } else {
                    columns.push(this.name + " " + nova.data.Entity.getDbType(this.type));
                }
            });
            sqls.push("CREATE TABLE " + table + " (" + columns.join() + ")");
        });
        obj.executeSql(sqls, successCallback, errorCallback);
    });
};

nova.data.DbContext.prototype.saveChanges = function (successCallback, errorCallback) {
    var obj = this;
    var sqlDelegates = [];
    var tables = this.getTables();
    for (var ti = 0; ti < tables.length; ti++) {
        var table = tables[ti];
        var query = this[table];
        if (query instanceof nova.data.Repository) {
            var fields = query.getFields();
            query.pendingDeleteEntities.each(function () {
                var removeWhere = this;
                if (this instanceof query.type) {
                    removeWhere = " where id=" + this.id;
                }
                var deleteSql = "delete from " + table + removeWhere;
                sqlDelegates.push({
                    sql: deleteSql
                });
            });

            query.pendingDeleteEntities = [];
            if (query.pendingAddEntities.any()) {
                var columns = fields.select(function () {
                    return this.name;
                }).join();

                query.pendingAddEntities.each(function () {
                    var toAdd = this;
                    var values = [];
                    fields.each(function () {
                        if (this.name == "id") {
                            values.push("null");
                        } else {
                            values.push(nova.data.Entity.getDbValue(this.type, toAdd[this.name]));
                        }
                    });

                    var sqlInsert = "insert into " + table + " (" + columns + ") values (" + values.join() + ")";
                    sqlDelegates.push({
                        sql: sqlInsert,
                        entity: toAdd
                    });
                });
                query.pendingAddEntities = [];
            }

            query.pendingUpdateEntities.each(function () {
                var toUpdate = this;
                var sets = fields.where(function () {
                    return this.name != "id";
                }).select(function () {
                    return this.name + "=" + nova.data.Entity.getDbValue(this.type, toUpdate[this.name]);
                }).join();
                var sqlUpdate = "update " + table + " set " + sets + " where id = " + toUpdate.id;
                sqlDelegates.push({
                    sql: sqlUpdate
                });
            });
            query.pendingUpdateEntities = [];
        }
    }
    if (this.db != null) {
        this.db.transaction(function (dbContext) {
            for (var s = 0; s < sqlDelegates.length; s++) {
                var sqlDelegate = sqlDelegates[s];
                if (obj.logSqls) {
                    console.log(sqlDelegate.sql);
                }
                dbContext.executeSql(sqlDelegate.sql, [], function (tx, result) {
                    if (sqlDelegate.entity) {
                        sqlDelegate.entity.id = result.insertId;
                    }
                });
            }
        }, function (err) {
            if (obj.alertErrors) {
                alert(err);
            }
            if (errorCallback == undefined || errorCallback == null) {
                throw err;
            }
            errorCallback(err);
        }, function() {
            successCallback && successCallback();
        });
    }
};

nova.data.DbContext.prototype.executeSql = function (sqls, successCallback, errorCallback) {
    var obj = this;
    if (this.db != null) {
        this.db.transaction(function (dbContext) {
            if (sqls instanceof Array) {
                for (var s = 0; s < sqls.length; s++) {
                    var sql = sqls[s];
                    if (obj.logSqls) {
                        console.log(sql);
                    }
                    dbContext.executeSql(sql);
                }
            } else {
                if (obj.logSqls) {
                    console.log(sqls);
                }
                dbContext.executeSql(sqls);
            }
        }, function (err) {
            if (obj.alertErrors) {
                alert(err);
            }
            if (errorCallback == undefined || errorCallback == null) {
                throw err;
            }
        }, function () {
            if (successCallback != undefined) {
                successCallback();
            }
        });
    }
};

nova.data.DbContext.prototype.query = function (sql, successCallback, errorCallback, paras) {
    var obj = this;
    if (obj.db != null) {
        obj.db.transaction(function (dbctx) {
            if (obj.logSqls) {
                console.log(sql);
            }
            var sqlParas = paras == undefined ? [] : paras;
            dbctx.executeSql(sql, sqlParas, function (tx, result) {
                var items = [];
                for (var i = 0; i < result.rows.length; i++) {
                    items.push(result.rows.item(i));
                }
                successCallback(items);
            }, function (err) {
                if (obj.alertErrors) {
                    alert(err);
                }
                if (errorCallback == undefined || errorCallback == null) {
                    throw err;
                }
                else {
                    errorCallback(err);
                }
            });
        }, function (err) {
            if (obj.alertErrors) {
                alert(err);
            }
            if (errorCallback == undefined || errorCallback == null) {
                throw err;
            }
            else {
                errorCallback(err);
            }
        });
    }
};

nova.data.DbVersion = function() {
    nova.data.Entity.call(this);
    this.version = "";
};
nova.data.DbVersion.prototype = new nova.data.Entity();
nova.data.DbVersion.constructor = nova.data.DbVersion;
