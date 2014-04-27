$(function(){

    $(document).height($(window).height());

    $("#intro-modal").modal('show');

    // SC api key
    var client_id = '5371eb9743a8c619876d4e967d558f82';

    var numCols = 2;
    var numRows = 3;
    var numPlayers;

    var curRow = -1;
    var curCol = -1;

    var iframeWidth = $("#grid").width() / numCols - 5;
    var iframeHeight = $("#grid").height() / numRows - 25;

    var widgets = [];
    var iframes = [];

    var locked = false; // if true, mouseover event will not work

    // initialize the soundcloud app
    SC.initialize({
        client_id: client_id
    });

    $('#intro-modal').on('hide.bs.modal', function (e) {
        addTracks("armin van buuren");
    });

    // when page first loads, search for this
    // addTracks("armin van buuren");

    // build the grid of iframes
    function builGrid() {
        locked = false;

        var grid = $("#grid");
        for (var i = 0; i < numRows; i++) {
            for (var j = 0; j < numCols; j++) {
                var iframe = $('<iframe/>').attr('id', 'widget'+i+j);
                iframe.addClass("song");
                iframe.attr('frameborder', '0');
                iframe.width(iframeWidth);
                iframe.height(iframeHeight);
                grid.append(iframe);
                iframes.push(iframe);
            }
        }
    }

    // reset the state of DOM
    function cleanUp() {
        $(".song").remove();
        widgets = [];
        var curRow = 0;
        var curCol = 0;
    }

    // main function that handles searching
    $('#searchterm').keypress(function(event) {
        if (event.which == 13) {
            ga('send', 'event', 'input', 'search');
            event.preventDefault();
            var q = $("#searchterm").val();
            addTracks(q);
        }

    });

    function handleLocking(event) {
        if (event.shiftKey && event.which == 76) {
            // control key pressed, pause the state
            locked = !locked;
        }
    }

    $(window).keypress(function(event) {
        ga('send', 'event', 'input', 'locking');
        handleLocking(event);
    });
    
    // resets the grid, make a new one, searches for songs
    function addTracks(q) {
        cleanUp();
        builGrid();

        SC.get('/tracks', { q: q, limit: 5*numCols*numRows }, function(tracks) {
            // now we randomize the tracks
            tracks.sort(function() { 
                return 0.5 - Math.random(); 
            });
            loadTracks(tracks);
        });
    }

    // loads the tracks into iframes
    function loadTracks(tracks) {
        var iframes = $(".song");

        numPlayers = Math.min(iframes.length, tracks.length);

        for (var i = 0; i < numPlayers; i++) {
            var iframe = iframes[i];
            iframe.src = 'http://w.soundcloud.com/player/?url=https://soundcloud.com/partyomo/partynextdoor-west-district';
            var widget = SC.Widget(iframe);
            
            bindIt(widget);

            widgets.push(widget);

            widget.load(tracks[i].uri, {
                auto_play: true,
                buying: false,
                liking: false,
                sharing: false,
                show_playcount: false,
                show_comments: false,
                single_active: false,
                show_user: false
            });
        }
    }

    // handles muting the widget on load
    function bindIt(widget) {
        widget.bind(SC.Widget.Events.READY, function() {
            console.log("setting volume to 0");
            widget.setVolume(0);

            widget.bind(SC.Widget.Events.FINISH, function() {
                // loop over
                widget.skip(0).seekTo(0);
                widget.play();
            });
        });
    }

    // handle cursor movement
    $("#grid").mouseover(function(data) {
        if (!locked) {
            ga('send', 'event', 'input', 'playtrack');
            // song is not locked, we change the current mute status
            // based on hover
            var x = data.clientX;
            var y = data.clientY - $("#search").height();

            var row = Math.max(Math.min(Math.floor(y / iframeHeight), numRows-1), 0);
            var col = Math.min(Math.floor(x / iframeWidth), numCols-1);

            widgets[row*numCols+col].setVolume(100);
            iframes[row*numCols+col].addClass("active");

            muteEverythingElse(row, col);

            curRow = row;
            curCol = col;
        }
    });

    // mutes all widgets except the one denoted by (row, col)
    function muteEverythingElse(row, col) {
        var iframes = $(".song");

        var i;
        if (row < 0 || col < 0) {
            for (i = 0; i < iframes.length; i++) {
                if (iframes.eq(i).hasClass("active")) {
                    iframes.eq(i).removeClass("active");
                }
            }
            return;
        }

        for (i = 0; i < iframes.length; i++) {
            if (i != row*numCols+col && widgets[i]) {
                widgets[i].setVolume(0);
                if (iframes.eq(i).hasClass("active")) {
                    iframes.eq(i).removeClass("active");
                }
            } else if (widgets[i]) {
                iframes.eq(i).addClass("active");
                widgets[i].setVolume(100);
            }
        }
    }

});
