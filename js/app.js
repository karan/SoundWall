$(function(){

    $(document).height($(window).height());
    $("#grid").height($(document).height()-$("#header").height());

    $("#intro-modal").modal('show');

    // SC api key
    var client_id = '5371eb9743a8c619876d4e967d558f82';

    var numCols = 3;
    var numRows = 2;
    var numPlayers;

    var curRow = -1;
    var curCol = -1;

    var audioWidth = $("#grid").width() / numCols;
    var audioHeight = $("#grid").height() / numRows;

    var audioTags = [];

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

    // build the grid of audioTags
    function builGrid() {
        console.log("building grid");
        locked = false;

        var i = 0, j = 0;
        var grid = $("#grid");
        for (i = 0; i < numRows; i++) {
            for (j = 0; j < numCols; j++) {
                var audio = $('<audio/>').attr('id', 'widget'+i+j);
                var image = $('<img/>').attr("id", "img"+i+j);
                var h2 = $('<h2/>');

                audio.attr("loop", "true");
                audio.attr("controls", "true");
                audio.attr("autoplay", "true");

                image.width(audioWidth);
                image.height(audioHeight);

                grid.append(image);
                grid.append(h2);
                grid.append(audio);

                audioTags.push(audio);
            }
        }

        var h2s = $("h2");

        i = 0;
        j = 0;
        $("img").each(function() {
            var imgHeight = $(this).height();
            var position = $(this).position();
            var positionTop = (position.top);
            var positionLeft = (position.left);
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

    // reset the state of DOM
    function cleanUp() {
        $("audio").remove();
        $("img").remove();
        $("h2").remove();
        audioTags = [];
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
        var imgs = $("img");
        var h2s = $("h2");

        console.log(h2s);

        for (var i = 0; i < numPlayers; i++) {
            var audio = audioTags[i];
            audio.attr("src", tracks[i].stream_url + "?client_id=" + client_id);
            audio[0].volume = 0;
            audio[0].play();

            $(h2s[i]).text(tracks[i].title);

            if (tracks[i].artwork_url) {                
                imgs[i].src = tracks[i].artwork_url.replace("large", "t500x500");
            } else {
                imgs[i].src = "images/default.png";
            }

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
            var imgs = $("img");
            var h2s = $("h2");

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
        var imgs = $("img");
        var h2s = $("h2");

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

});
