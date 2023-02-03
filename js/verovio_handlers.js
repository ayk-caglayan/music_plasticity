var vrvToolkit = new verovio.toolkit();
var page = 1;
var zoom = 40;
var pageHeight = 2970;
var pageWidth = 2100;
var ids = [];
var isPlaying = false;

function setOptions() {
    pageHeight = document.documentElement.scrollHeight * 100 / zoom;
    pageWidth = document.documentElement.scrollWidth * 100 / zoom;
    options = {
                pageHeight: pageHeight,
                pageWidth: pageWidth,
                scale: zoom,
                adjustPageHeight: true
            };
    vrvToolkit.setOptions(options);
}
function loadData(data) {
    setOptions();
    vrvToolkit.loadData(data);
    page = 1;
    loadPage();
}
/////////////////////////////////////////////
/* A function that loads the selected page */
/////////////////////////////////////////////
function loadPage() {
    console.log('loadPage');
    svg = vrvToolkit.renderToSVG(page, {});
    // $("#svg_output").html(svg);
    document.getElementById('svg_output').innerHTML=svg;
}

////////////////////////////////////////////
/* A function that start playing the file */
////////////////////////////////////////////
function play_midi() {
    if (isPlaying == false) {
        var base64midi = vrvToolkit.renderToMIDI();
        var song = 'data:audio/midi;base64,' + base64midi;
        // $("#player").show();
        // $("#player").midiPlayer.play(song);
        // document.getElementById('player').midiPlayer.play(song);
        midiPlayerPlay(song);
        isPlaying = true;
        // midiUpdate(millisec)
        // console.log('song', song);
    }
}
function stop_midi() {
    stop();
    isPlaying = false;
}

///////////////////MIDI///////////////////////////////
/* Two callback functions passed to the MIDI player */
//////////////////////////////////////////////////////
var midiUpdate = function(time) {
    // time needs to - 400 for adjustment
    var vrvTime = Math.max(0, time - 400);
    var elementsattime = vrvToolkit.getElementsAtTime(vrvTime);
    if (elementsattime.page > 0) {
        if (elementsattime.page != page) {
            page = elementsattime.page;
            loadPage();
        }
        if ((elementsattime.notes.length > 0) && (ids != elementsattime.notes)) {
            ids.forEach(function(noteid) {
                // if ($.inArray(noteid, elementsattime.notes) == -1) {
                if (noteid.includes(elementsattime.notes)) {
                    console.log('noteid', noteid);
                    // $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
                    document.getElementById(noteid).setAttribute("fill", "#000");
                    document.getElementById(noteid).setAttribute("stroke", "#000");
                }
            });
            ids = elementsattime.notes;
            ids.forEach(function(noteid) {
                // if ($.inArray(noteid, elementsattime.notes) != -1) {
                if (noteid.includes(elementsattime.notes)) {
                    console.log('noteid', noteid);
                    // $("#" + noteid).attr("fill", "#c00").attr("stroke", "#c00");;
                    document.getElementById(noteid).setAttribute("fill", "#c00");
                    document.getElementById(noteid).setAttribute("stroke", "#c00");
                }
            });
        }
    }
}

var midiStop = function() {
    ids.forEach(function(noteid) {
        $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
    });
    $("#player").hide();
    isPlaying = false;
}

// $(document).ready(function() {

//     $(window).keyup(function(event){
//         ////////////////////////////////
//         /* Key events 'p' for playing */
//         ////////////////////////////////
//         if (event.keyCode == 80) {
//             play_midi();
//         }
//     });

//     $(window).resize(function(){
//         applyZoom();
//     });

//     $("#player").midiPlayer({
//         color: "#c00",
//         onUpdate: midiUpdate,
//         onStop: midiStop,
//         width: 250
//     });

//     loadFile();
// });

// document.addEventListener('keydown', function(event) {
//     console.log(event.key);
//     if (event.key == "p") {
//         play_midi();
//     }
// });



////////////////////////////////////////////////////////////
/* A function that redoes the layout and reloads the page */
////////////////////////////////////////////////////////////
function applyZoom() {
    setOptions();
    vrvToolkit.redoLayout();
    page = 1;
    loadPage();
}
////////////////////////////////////////////////
/* Some functions for handling various events */
////////////////////////////////////////////////
function nextPage() {
    if (page >= vrvToolkit.getPageCount()) {
        return;
    }
    page = page + 1;
    loadPage();
};
function prevPage() {
    if (page <= 1) {
        return;
    }
    page = page - 1;
    loadPage();
};
function firstPage() {
    page = 1;
    loadPage();
};
function lastPage() {
    page = vrvToolkit.getPageCount();
    loadPage();
};
function zoomOut() {
    if (zoom < 20) {
        return;
    }
    zoom = zoom / 2;
    applyZoom();
}
function zoomIn() {
    if (zoom > 80) {
        return;
    }
    zoom = zoom * 2;
    applyZoom();
}
// $(document).ready(function() {
//     ////////////////////////
//     /* Binding the events */
//     ////////////////////////
//     $(window).keyup(function(event){
//         if (event.ctrlKey && (event.keyCode == 37)) {
//             firstPage();
//         }
//         else if (event.keyCode == 37) {
//             prevPage();
//         }
//         else if (event.ctrlKey && (event.keyCode == 39)) {
//             lastPage();
//         }
//         else if (event.keyCode == 39) {
//             nextPage();
//         }
//         // see http://www.javascripter.net/faq/keycodes.htm
//         else if ((event.keyCode == 107) || (event.keyCode == 187) || (event.keyCode == 61) ) {
//             zoomIn();
//         }
//         else if ((event.keyCode == 109) || (event.keyCode == 189) || (event.keyCode == 173)) {
//             zoomOut();
//         }
//     });
//     $(window).resize(function(){
//         applyZoom();
//     });
//   });
// const heightOutput = document.querySelector('#height');
// const widthOutput = document.querySelector('#width');

// function reportWindowSize() {
//   heightOutput.textContent = window.innerHeight;
//   widthOutput.textContent = window.innerWidth;
// }

window.onresize = applyZoom();
