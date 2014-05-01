$(function(){

    $(document).height($(window).height());

    // $("#intro-modal").modal('show');

    // SC api key
    var client_id = '5371eb9743a8c619876d4e967d558f82';

    var numCols = 3;
    var numRows = 2;
    var numPlayers;

    var curRow = -1;
    var curCol = -1;

    var audioWidth = $("#grid").width() / numCols - 5;
    var audioHeight = $("#grid").height() / numRows - 25;

    var audioTags = [];

    var locked = false; // if true, mouseover event will not work

    // initialize the soundcloud app
    SC.initialize({
        client_id: client_id
    });

    addTracks("armin van buuren");

    $('#intro-modal').on('hide.bs.modal', function (e) {
        addTracks("armin van buuren");
    });

    // when page first loads, search for this
    // addTracks("armin van buuren");

    // build the grid of audioTags
    function builGrid() {
        console.log("building grid");
        locked = false;

        var grid = $("#grid");
        for (var i = 0; i < numRows; i++) {
            for (var j = 0; j < numCols; j++) {
                var audio = $('<audio/>').attr('id', 'widget'+i+j);
                audio.attr("controls", "true");
                audio.attr("loop", "true");
                audio.attr("autoplay", "true");
                // audio.attr("muted", "true");

                audio.width(audioWidth);
                audio.height(audioHeight);
                grid.append(audio);
                audioTags.push(audio);
            }
        }
    }

    // reset the state of DOM
    function cleanUp() {
        $("audio").remove();
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

    // loads the tracks into audioTags
    function loadTracks(tracks) {
        numPlayers = Math.min(audioTags.length, tracks.length);

        for (var i = 0; i < numPlayers; i++) {
            var audio = audioTags[i];
            audio.attr("src", tracks[i].stream_url + "?client_id=" + client_id);
            // audio[0].muted = true;
        }
    }

    // // handle cursor movement
    $("#grid").mouseover(function(data) {
        if (!locked) {
            ga('send', 'event', 'input', 'playtrack');
            // song is not locked, we change the current mute status
            // based on hover
            var x = data.clientX;
            var y = data.clientY - $("#search").height();

            var row = Math.max(Math.min(Math.floor(y / audioHeight), numRows-1), 0);
            var col = Math.min(Math.floor(x / audioWidth), numCols-1);

            $("#widget"+row+col)[0].volume = 1;
            // audioTags[row*numCols+col][0].muted = false;
            // audioTags[row*numCols+col][0].volume = 1;
            // console.log(audioTags[row*numCols+col][0].volume);
            // audioTags[row*numCols+col].attr("muted", "false");
            // audioTags[row*numCols+col].addClass("active");

            muteEverythingElse(row, col);

            curRow = row;
            curCol = col;
        }
    });

    // mutes all widgets except the one denoted by (row, col)
    function muteEverythingElse(row, col) {
        // var i;
        // if (row < 0 || col < 0) {
        //     for (i = 0; i < audioTags.length; i++) {
        //         // if (audioTags.eq(i).hasClass("active")) {
        //             // audioTags.eq(i).removeClass("active");
        //         }
        //     }
        //     return;
        // }
        console.log(row, col);
        for (i = 0; i < audioTags.length; i++) {
            if (i != row*numCols+col) {
                console.log("in if");
                audioTags[i][0].volume = 0;
                // audioTags[row*numCols+col][0].muted = true;
                // audioTags[row*numCols+col][0].volume = 1.0;
                // console.log(i + " volume = " + audioTags[i][0].muted);
                // if (audioTags.eq(i).hasClass("active")) {
                    // audioTags.eq(i).removeClass("active");
                // }
            }
            // } else {
            //     console.log("in else");
            //     audioTags[i][0].volume = 1;
            //     // audioTags.eq(i).addClass("active");
            //     // audioTags[row*numCols+col][0].muted = false;
            //     // console.log(i + " volume = " + audioTags[i][0].muted);
            // }
        }
    }

});
