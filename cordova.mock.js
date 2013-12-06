if (window.navigator == undefined) {
    window.navigator = {
        
    };
}
if (navigator.notification == undefined) {
    navigator.notification = {
        confirm:function(message, confirmCallback, title, buttonLabels) {
            if (confirm(message)) {
                confirmCallback(1);
            }
        },
        alert:function(message, alertCallback, title, buttonName) {
            alert(message);
            setTimeout(alertCallback);
        }
    };
}

setTimeout(function () {
    cordova.mock.trigger('deviceready');
}, 2000);

if (window.cordova == undefined) {
    window.cordova = {
        mock: {}
    };
}

cordova.exec = function (success, fail, className, methodName, paras) {
    if (success != null) {
        success();
    }
};

cordova.mock.trigger = function(eventName) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(eventName, false, true);
    document.dispatchEvent(evt);
};

cordova.mock.triggerBackbutton = function () {
    this.trigger('backbutton');
};

//---------connection ---------------------------
var Connection = function() {

};

Connection.WIFI = 'WIFI';
Connection.NONE = 'NONE';

navigator.connection = {
    type: Connection.WIFI
};

//---------end connection --------------------------