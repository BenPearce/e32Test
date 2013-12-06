nova.widgets.busy = {
    show: function(content, deplay, css) {
        content = content == undefined ? 'Loading...' : content;
        var $busy = $('.busy');
        if ($busy.length > 0) {
            $busy.remove();
        }
        css = css != undefined && css != '' && css != null ? ' ' + css : '';
        var html = '<div class="busy' + css + '">\
                        <div class="busy-content">' + content + '</div>\
                    </div>';
        $busy = $(html).appendTo('#body');
        if (deplay == undefined || deplay == null || deplay <= 0) {
            showBusy();
        } else {
            setTimeout(function() {
                showBusy();
            }, deplay);
        }
        
        function showBusy() {
            $busy.show();
            var $content = $('.busy-content');
            $content.css('top', ($busy.height() - $content.height()) / 2 + 'px');
            $content.css('left', ($busy.width() - $content.width()) / 2 + 'px');
        }
    },
    remove: function() {
        $('.busy').remove();
    }
};