$(function(){

    $(document).height($(window).height());

    // SC api key
    var client_id = '5371eb9743a8c619876d4e967d558f82';

    var numCols = 2;
    var numRows = 3;

    var curRow = 0;
    var curCol = 0;

    var iframeWidth = $("#grid").width() / numCols - 5;
    var iframeHeight = $("#grid").height() / numRows - 25;

    var widgets = [];
    var iframes = [];

    var locked = false; // if true, mouseover event will not work
    var allMuted = true; // true if all are muted

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
        var curRow = -1;
        var curCol = -1;
    }

    // main function that handles searching
    $('#searchterm').keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            var q = $("#searchterm").val();
            addTracks(q);
        }

    });

    $(document).keypress(function(event) {
        if (event.shiftKey && event.which == 76) {
            // control key pressed, pause the state
            locked = !locked;
        }
    });

    // resets the grid, make a new one, searches for songs
    function addTracks(q) {
        cleanUp();
        builGrid();

        SC.get('/tracks', { q: q, limit: 10 }, function(tracks) {
            loadTracks(tracks);
        });
    }

    // loads the tracks into iframes
    function loadTracks(tracks) {
        var iframes = $(".song");

        for (var i = 0; i < iframes.length; i++) {
            var $iframe = iframes[i];
            $iframe.src = 'http://w.soundcloud.com/player/?url=https://soundcloud.com/partyomo/partynextdoor-west-district';
            var widget = SC.Widget($iframe);
            
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
                show_user: false,
                show_bpm: false
            });
        }
    }

    // handles muting the widget on load
    function bindIt(widget) {
        widget.bind(SC.Widget.Events.READY, function() {
            console.log("setting volume to 0");
            widget.setVolume(0);
        });
    }

    // handle cursor movement
    $("#grid").mouseover(function(data) {
        if (!locked && !allMuted) {
            console.log("right now all is locked and muted");
            // song is not locked, and mute button is not active
            // in this case, we change the current mute status
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
        } else if (allMuted && locked) {
            // everything is muted and one song was locked
            // so we make the locked one play
            console.log(curRow, curRow);
            muteEverythingElse(curRow, curCol);
            allMuted = false;
        }
    });

    // when mute button is clicked
    $(".mute").click(function(data) {
        if (allMuted) {
            // everything was muted, so unmute current one
            muteEverythingElse(curRow, curRow);
        } else {
            // mute everything
            muteEverythingElse(-1, -1);
        }
        $(".mute").toggleClass("allMuted");
        allMuted = !allMuted;
    });

    // mutes all widgets except the one denoted by (row, col)
    function muteEverythingElse(row, col) {
        var iframes = $(".song");

        for (var i=0; i < iframes.length; i++) {
            if (i != row*numCols+col) {
                widgets[i].setVolume(0);
                if (iframes.eq(i).hasClass("active")) {
                    iframes.eq(i).removeClass("active");
                }
            } else {
                iframes.eq(i).addClass("active");
                widgets[i].setVolume(100);
            }
        }
    }

});
