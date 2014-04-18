$(function(){

    $(document).height($(window).height());

    // SC api key
    var client_id = '5371eb9743a8c619876d4e967d558f82';

    var numCols = 2;
    var numRows = 2;

    var iframeWidth = $("#grid").width() / numCols - 5;
    var iframeHeight = $("#grid").height() / numRows - 5;

    var widgets = [];

    // initialize the soundcloud app
    SC.initialize({
        client_id: client_id
    });

    // build the grid of iframes
    var builGrid = function() {

        var grid = $("#grid");
        for (var i = 0; i < numCols; i++) {
            for (var j = 0; j < numRows; j++) {
                var iframe = $('<iframe/>').attr('id', 'widget'+i+j);
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

            addTracks();
        }

    });

    // searches and plays a track
    function addTracks(q) {
        SC.get('/tracks', { q: q, limit: 10 }, function(tracks) {
            loadTracks(tracks);
        });
    }

    function loadTracks(tracks) {
        var iframes = $("iframe");

        for (var i = 0; i < iframes.length; i++) {
            var $iframe = iframes[i];
            console.log($iframe);
            $iframe.src = 'http://w.soundcloud.com/player/?url=https://soundcloud.com/partyomo/partynextdoor-west-district';
            widgets.push(SC.Widget($iframe));

            console.log(tracks[i]);

            widgets[i].load(tracks[i].uri, {
                auto_play: false,
                buying: false,
                sharing: false,
                show_playcount: false,
                show_comments: false
            });
        }
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
        audioElem.play();
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

    // Run stuff
    builGrid();

});


