$(function(){

    $(document).height($(window).height());

    // SC api key
    var client_id = '7182630dc6a6fc8aa606657648545826';

    // store all tracks after a search query
    var all_tracks = [];

    // timer to search only after a while
    var timer;

    // iframe that stores the SC player
    var iframe = $("#widget")[0];

    // the SC Widget object
    var widget;

    // initialize the soundcloud app
    SC.initialize({
        client_id: client_id
    });

    var audioElem = $("#widget")[0];

    // keyboard shortcut bindings
    $(document).keydown(function(e) {
        // this won't work if search field is focussed
        if (!$("#searchterm").is(':focus')) {
            if (e.keyCode == 39) {
                // right arrow key pressed, play next
                next();
            } else if (e.keyCode == 32) {
                // space key to toggle playback
                toggle();
            } else if (e.shiftKey && e.keyCode == 38) {
                // shift up
                volumeUp();
            } else if (e.shiftKey && e.keyCode == 40) {
                // shift down
                volumeDown();
            }
        }
    });

    // bind events to the widget
    // widget.bind(SC.Widget.Events.READY, function() {
    //     // when the track finishes, play the next one
    //     widget.bind(SC.Widget.Events.FINISH, function(e) {
    //         next();
    //     });
    // });

    // main function that handles searching
    $('#searchterm').keyup(function(event) {

        event.preventDefault();

        // google analytics
        // ga('send', 'event', 'input', 'search');

        var q = $("#searchterm").val();

        // validate query
        if (q == '' || q == undefined) {
            return;
        }

        if (event.keyCode == 17 || event.keyCode == 18 || event.keyCode == 91 ||
            event.keyCode == 9 || event.keyCode == 16) {
            // control, option, command, tab, shift
            return;
        }

        clearTimeout(timer);

        timer = setTimeout(function() {
            instaSearch(q);
        }, 200); // wait for 200ms after search query

    });

    // searches and plays a track
    function instaSearch(q) {
        SC.get('/tracks', { q: q, limit: 10 }, function(tracks) {
            if (tracks.length == 0) {
                cleanUpSpace();
                $('#error').append('No tracks found');
            } else {
                all_tracks = tracks;
                var track = all_tracks.splice(0, 1)[0];
                playTrack(track);
            }
        });
    }

    // takes a track from SoundCloud and plays it.
    function playTrack(track) {
        // ga('send', 'event', 'play', 'songPla');
        cleanUpSpace();
        console.log(track);
        // update the iframe source
        SC.get(track.uri, {}, function(sound, error) {
          $('#widget').attr('src', sound.stream_url + '?client_id=' + client_id);
        });

        $("#artwork").css("background", "url(" + track.artwork_url.replace("large", "original") + ") no-repeat center center fixed")

        // set the title of the track
        $('#trackname').text(track.title);

        // console.log("loaded " + track.title);
    }

    // toggle play and paused state of audio player
    var toggle = function() {
        widget.toggle();
    }

    // play the next song in queue and remove the track that
    // is to be played.
    var next = function() {
        if (all_tracks.length != 0) {
            var track = all_tracks.splice(0, 1)[0];
            playTrack(track);
        } else {
            cleanUpSpace();
            $('#error').append('No more songs. Try searching.');
            $('#searchterm').focus();
        }
    }

    var volumeUp = function() {
        widget.getVolume(function(volume) {
            widget.setVolume(Math.min(100, volume + 5));
        });
    }

    var volumeDown = function() {
        widget.getVolume(function(volume) {
            widget.setVolume(Math.max(0, volume - 5));
        });
    }

    var cleanUpSpace = function() {
        $('#widget').empty();
        $('#error').empty();
    }

});


