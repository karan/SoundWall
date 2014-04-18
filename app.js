$(function(){

    $(document).height($(window).height());

    // SC api key
    var client_id = '5371eb9743a8c619876d4e967d558f82';

    var numCols = 2;
    var numRows = 3;

    var curRow = 0;
    var curCol = 0;

    var iframeWidth = $("#grid").width() / numCols - 5;
    var iframeHeight = $("#grid").height() / numRows - 5;

    var widgets = [];

    // initialize the soundcloud app
    SC.initialize({
        client_id: client_id
    });


    // when page first loads, search for this
    addTracks("party");

    // build the grid of iframes
    function builGrid() {
        var grid = $("#grid");
        for (var i = 0; i < numRows; i++) {
            for (var j = 0; j < numCols; j++) {
                var iframe = $('<iframe/>').attr('id', 'widget'+i+j);
                iframe.attr('frameborder', '0');
                iframe.width(iframeWidth);
                iframe.height(iframeHeight);
                grid.append(iframe);
            }
        }
    }

    // main function that handles searching
    $('#searchterm').keypress(function(event) {

        if (event.which == 13) {
            event.preventDefault();
            var q = $("#searchterm").val();
            addTracks(q);
        }

    });

    // searches and plays a track
    function addTracks(q) {
        $("iframe").remove();
        builGrid();

        SC.get('/tracks', { q: q, limit: 10 }, function(tracks) {
            loadTracks(tracks);
        });
    }

    function loadTracks(tracks) {
        var iframes = $("iframe");

        for (var i = 0; i < iframes.length; i++) {
            var $iframe = iframes[i];
            $iframe.src = 'http://w.soundcloud.com/player/?url=https://soundcloud.com/partyomo/partynextdoor-west-district';
            var widget = SC.Widget($iframe);
            
            widget.setVolume(0);
            bindIt(widget);

            widgets.push(widget);

            widget.load(tracks[i].uri, {
                auto_play: true,
                buying: false,
                sharing: false,
                show_playcount: false,
                show_comments: false,
                single_active: false
            });
        }
    }

    function bindIt(widget) {
        widget.bind(SC.Widget.Events.READY, function() {
            console.log("setting volume to 0");
            widget.setVolume(0);
        });
    }

    $("#grid").mouseover(function(data) {

        var x = data.clientX;
        var y = data.clientY - $("#search").height();

        console.log("x, y = " + x + ", " + y);

        var row = Math.max(Math.min(Math.floor(y / iframeHeight), numRows-1), 0);
        var col = Math.min(Math.floor(x / iframeWidth), numCols-1);

        console.log("new: " + row + ", " + col);
        widgets[row*numCols+col].setVolume(100);
        muteEverythingElse(row, col);
    });

    function muteEverythingElse(row, col) {
        var iframes = $("iframe");

        for (var i=0; i < iframes.length; i++) {
            if (i != row*numCols+col) {
                widgets[i].setVolume(0);
            }
        }
    }

});


