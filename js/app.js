$(function() {

    // SC api key
    var client_id = ['5371eb9743a8c619876d4e967d558f82', '0dc8789a4e3488e1ba3d798f48b6a5e7'];

    // initialize the soundcloud app
    SC.initialize({
        client_id: client_id[0]
    });

    $(document).height($(window).height());
    $("#grid").height($(document).height()-$("#header").height());

    var numCols = 3;    // number of columns in the grid
    var numRows = 2;    // number of rows in the grid
    var numPlayers;     // total number of players to add in the grid

    var curRow = -1;    // the row of currently playing song
    var curCol = -1;    // the col of currently playing song

    var audioWidth = $("#grid").width() / numCols;
    var audioHeight = $("#grid").height() / numRows;

    var allTracks = []; // holds a list of all tracks in memory
    var audioTags = []; // all audio players
    var h2s = [];   // all h2 tags
    var imgs = [];  // all image tags

    var locked = false; // if true, mouseover event will not work

    // start a track after the first modal is closed
    $('#intro-modal').on('hide.bs.modal', function (e) {
        localStorage.setItem('intromodal', true);   // register in local storage
        addTracks("armin van buuren");
    });

    // if we've shown the modal to the user already, then don't again
    if (localStorage.getItem("intromodal")) {
        // we've shown the modal before
        addTracks("armin van buuren");
    } else {
        $("#intro-modal").modal('show');
    }

    // browser has been resized
    $(window).resize(function() {
        handleResizing();
    });
    $(document).resize(function() {
        handleResizing();
    });

    function handleResizing() {
        $(document).height($(window).height());
        $("#grid").height($(document).height()-$("#header").height());
        audioWidth = $("#grid").width() / numCols;
        audioHeight = $("#grid").height() / numRows;
        setCardSize();
    }

    // when page first loads, search for this
    // addTracks("armin van buuren");
    // addTracks("dada life");

    // build the grid of audioTags. images and h2 titles
    // every element is just empty after this point
    function builGrid() {
        console.log("building grid");
        locked = false;

        var i = 0, j = 0;

        var grid = $("#grid");
        for (i = 0; i < numRows; i++) {
            for (j = 0; j < numCols; j++) {
                // make an audio tag
                var audio = $('<audio/>').attr('id', 'widget'+i+j);
                // make an image tag
                var image = $('<img/>').attr("id", "img"+i+j);
                // make a h2 tag
                var h2 = $('<h2/>');

                // add properties to the audio player
                audio.attr("loop", "true");
                audio.attr("controls", "true");
                audio.attr("autoplay", "true");

                // set the dimensions of image
                image.width(audioWidth);
                image.height(audioHeight);

                grid.append(image);
                grid.append(h2);
                grid.append(audio);

                audioTags.push(audio);
            }
        }

        setCardSize();
    }

    // reset the state of DOM
    function cleanUp() {
        $("audio").remove();
        $("img").remove();
        $("h2").remove();
        audioTags = [];
        h2s = [];
        imgs = [];
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

    // handles the locking event by toggling the state of the flag
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
            allTracks = tracks;
            loadTracks();
        });
    }

    // loads the tracks into audioTags
    function loadTracks() {
        numPlayers = Math.min(audioTags.length, allTracks.length);
        var tracksAdded = 0;
        var i = 0;

        while (tracksAdded < numPlayers) {
            var thisTrack = allTracks.pop();
            if (thisTrack.streamable === true) {
                console.log(thisTrack);
                var audio = audioTags[tracksAdded];
                audio.attr("src", thisTrack.stream_url + "?client_id="+client_id[tracksAdded%2]);
                audio[0].volume = 0;
                audio[0].play();

                $(h2s[tracksAdded]).append("<a href='" + thisTrack.permalink_url + "' target='_blank'>" + thisTrack.title + "</a>");

                if (thisTrack.artwork_url) {                
                    imgs[tracksAdded].src = thisTrack.artwork_url.replace("large", "t500x500");
                } else {
                    imgs[tracksAdded].src = "images/default.png";
                }
                tracksAdded++;
            }
            i++;
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

            console.log(row, col);

            $("#widget"+row+col)[0].volume = 1;
            imgs.eq(row*numCols+col).addClass("active");
            h2s.eq(row*numCols+col).addClass("active");

            muteEverythingElse(row, col);

            curRow = row;
            curCol = col;
        }
    });

    // mutes all widgets except the one denoted by (row, col)
    function muteEverythingElse(row, col) {
        var i;
        if (row < 0 || col < 0) {
            for (i = 0; i < audioTags.length; i++) {
                if (imgs[i].hasClass("active")) {
                    imgs[i].removeClass("active");
                    h2s.eq(i).removeClass("active");
                }
            }
            return;
        }

        for (i = 0; i < audioTags.length; i++) {
            if (i != row*numCols+col) {
                audioTags[i][0].volume = 0;
                if (imgs.eq(i).hasClass("active")) {
                    imgs.eq(i).removeClass("active");
                    h2s.eq(i).removeClass("active");
                }
            }
        }
    }

    // sizes every thing in a single card to the appropriate
    // width and height
    function setCardSize() {
        h2s = $("h2");
        imgs = $("img");

        i = 0;
        j = 0;
        
        $("img").each(function() {
            $(this).width(audioWidth);
            $(this).height(audioHeight);

            var imgHeight = $(this).height();
            var position = $(this).position();
            var positionTop = (position.top);
            var playerTop = position.top+imgHeight-$(audioTags[i]).height();
            $(h2s[i]).css({"position":"absolute", "top":positionTop+"px", "left":j*audioWidth+"px", "width":audioWidth +"px"});
            $(audioTags[i]).css({"position":"absolute", "top":playerTop+"px", "left":j*audioWidth+"px", "width":audioWidth +"px"});
            i++;
            j++;
            if (j >= numCols) {
                j = 0;
            }
        });
    }

});
