var dynamic_gui = document.getElementById("dynamic_gui");
var dynamic_gui_x = document.getElementById("dynamic_gui_x");
var dynamic_gui_y = document.getElementById("dynamic_gui_y");
var X_slider; 
var Y_slider=[BOTTOM_STATIC, CEILING_STATIC]; 
var X0_slider;
var X1_slider;
// var X0=AR;
// var X1=AR;

var nr_input;
var nr_of_env_nodes_div;
var nr_of_env_nodes_input;
var canvas_x_y_display;
var multiple_slider_div;
var canvas_size=250;

// var BOTTOM_STATIC=65;
// var CEILING_STATIC=127;
var MAX_NR_OF_ENV_NODES=2;
var NR_OF_ENV_NODES=2;
var ENV_NODE_VALUES=[{x:0, y:canvas_size/2}, {x:canvas_size,y:canvas_size/2}];

//triggered by checkbox
function update_dynamic_gui() {
  if (document.getElementById("x_enved").checked) { //enved
    enved_gui();
  } else { //default 
    default_gui();
  }
}

//start-up default gui
function default_gui() {
  clear_dyn_gui();
  dynamic_gui.style.display = "flex";
  dynamic_gui.style.marginTop = "0px";
  dynamic_gui_x.style.display = "initial";
  dynamic_gui_x.style.marginLeft = "0px";
  dynamic_gui_x.style.marginTop = "100px";
  dynamic_gui_y.style.marginLeft = "0px";
  dynamic_gui_x.style.width = "50%";
  dynamic_gui_y.style.width = "10%";
  create_X_slider();
  create_Y_slider();
}

//enved gui
function enved_gui() {
  clear_dyn_gui();
  dynamic_gui.style.display = "flex";
  dynamic_gui.style.marginTop = "10px";
  dynamic_gui_x.style.display = "flex";
  dynamic_gui_x.style.marginTop = "0px";
  dynamic_gui_x.style.marginLeft = "50px";
  dynamic_gui_y.style.marginLeft = "160px";
  dynamic_gui_x.style.width = "initial";
  dynamic_gui_y.style.width = "initial";
  create_X_0_slider();
  create_display_canvas();
  canvas_x_y_display.style.display = "table-cell";
  // drawCanvas();
  create_X_1_slider();
  create_Y_slider();
  drawCanvas();
}


function create_display_canvas() {
  canvas_x_y_display = document.createElement("canvas");
  canvas_x_y_display.id = "x_y_control";
  dynamic_gui_x.appendChild(canvas_x_y_display);
}
// clear dynamic gui
function clear_dyn_gui() {
  // let div_to_be_cleared = document.getElementById("dynamic_gui");
  let x_div_to_be_cleared = document.getElementById("dynamic_gui_x");
  let y_div_to_be_cleared = document.getElementById("dynamic_gui_y");
  // div_to_be_cleared.innerHTML = "";
  x_div_to_be_cleared.innerHTML = "<label for='X_slider' style='display: inline-block; width: 100px;'> rescale metre </label>";
  y_div_to_be_cleared.innerHTML = "<label for='Y_slider' style='display: inline-block; width: 300px;'> rescale notes to new octave range </label>";
}

//default functions
function create_X_slider() {
  X_slider = document.createElement("div");
  X_slider.id = "X_slider";
    
  noUiSlider.create(X_slider, {
    start:AR[0]*100,
    range: {'min': 0, 'max': 201},
    keyboardSupport: false,
    format: format_X_slider,
    tooltips: {
      to: function (value) {
        return (value/100).toFixed(1);
      }
    }
  });
  X_slider.setAttribute("onclick", "stop_midi()");
  X_slider.setAttribute("onmouseup", "get_X_slider(); transform()");
  dynamic_gui_x.appendChild(X_slider);
}

function create_Y_slider() {
  Y_slider = document.createElement("div");
  Y_slider.id = "Y_slider";
  
  noUiSlider.create(Y_slider, {
    start:[BOTTOM_CHANGING, CEILING_CHANGING],
    range: {'min': 1, 'max': 127},
    keyboardSupport: false,
    orientation: "vertical",
    direction: "rtl",
    connect: [false, true, false],
    // format: format_Y_slider,
    tooltips: [
      {to: function (value) {return 'lowest note ' + pitch_num_to_note_w_octave_symbol(value)}, from: function (value) {console.log("from value",value);return value;}},
      {to: function (value) {return 'highest note ' +pitch_num_to_note_w_octave_symbol(value)}, from: function (value) {console.log("from value",value);return value;}}
    ]
  });
  Y_slider.setAttribute("onclick", "stop_midi()");
  Y_slider.setAttribute("onmouseup", "get_Y_slider(); transform()");
  dynamic_gui_y.appendChild(Y_slider);
  // Y_slider.style.display = "table-cell";
  // Y_slider.noUiSlider.set([BOTTOM_CHANGING, CEILING_CHANGING]);
}

function get_X_slider() {
  let slider_val=X_slider.noUiSlider.get();
  AR[0]=Number(slider_val);
  AR[1]=Number(slider_val);
  console.log("X -" ,slider_val, "AR", AR);
}

function get_Y_slider() {
  let slider_val=Y_slider.noUiSlider.get();
  BOTTOM_CHANGING=Number(slider_val[0]);
  CEILING_CHANGING=Number(slider_val[1]);
}

function get_X01_sliders() {
  let slider_val=X0_slider.noUiSlider.get();
  AR[0]=Number(slider_val);
  console.log("X0 -" ,slider_val, "X0", AR[0]);
  slider_val=X1_slider.noUiSlider.get();
  AR[1]=Number(slider_val);
  console.log("X1 -" ,slider_val, "X1", AR[1]);
  drawCanvas()
}

var format_X_slider = {
  from: function (formattedValue) {
    return Number(formattedValue);
  },
  to: function(numericValue) {
    return Math.round(numericValue)/100;
  }
};

function pitch_num_to_note_w_octave_symbol(pitch_num) {
  pitch_num=Number(pitch_num).toFixed(0);
  let note_list=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  let octave = Math.floor(pitch_num / 12) - 1;
  let note = note_list[pitch_num % 12];
  // console.log(note, octave);
  return String(note) + ' ' + String(octave);
}

//enved functions

function create_X_0_slider() {
  X0_slider = document.createElement("div");
  X0_slider.id = "X0_slider";
  dynamic_gui_x.appendChild(X0_slider);
  //set div style float left
  X0_slider.style.display = "table-cell";
  noUiSlider.create(X0_slider, {
    orientation: "vertical",
    direction: "rtl",
    start:[AR[0]*100],
    range: {'min': [0], 'max': [201]},
    keyboardSupport: false,
    format: format_X_slider,
    // 
    tooltips: [{
      to: function (value) {
        // return value.toFixed(1);
        return (value/100).toFixed(1);
      }
    }]
  });
  X0_slider.setAttribute("onmouseup", "get_X01_sliders(), transform()");
  X0_slider.setAttribute("onclick", "stop_midi()");

}

function create_X_1_slider() {
  X1_slider = document.createElement("div");
  X1_slider.id = "X1_slider";
  dynamic_gui_x.appendChild(X1_slider);
  //set div style float right
  X1_slider.style.display = "table-cell";
  noUiSlider.create(X1_slider, {
    orientation: "vertical",
    direction: "rtl",
    start:[AR[1]*100],
    range: {'min': [0], 'max': [201]},
    keyboardSupport: false,
    format: format_X_slider,
    tooltips: [{
      to: function (value) {
        // return value.toFixed(1);
        return (value/100).toFixed(1);
      }
    }]
  });
  X1_slider.setAttribute("onmouseup", "get_X01_sliders(), transform()");
  X1_slider.setAttribute("onclick", "stop_midi()");
}

const containerr=document.getElementById("settings");

// DRAWING THE CANVAS //

function drawCanvas() {
  const dot_list=[canvas_x_y_display.getContext("2d"),canvas_x_y_display.getContext("2d")];
  const line_list=[canvas_x_y_display.getContext("2d")];
  // let linee=canvas_x_y_display.getContext("2d");
  const tick_context=canvas_x_y_display.getContext("2d");
  const rect = canvas_x_y_display.getBoundingClientRect();
  let dot_radius=10;
  let dot_area=Math.PI*(dot_radius*dot_radius);
  ENV_NODE_VALUES[0].y=rescale(AR[0], 0, 2, canvas_size, 0);
  ENV_NODE_VALUES[1].y=rescale(AR[1], 0, 2, canvas_size, 0);
  canvas_x_y_display.width=canvas_size;
  canvas_x_y_display.height=canvas_size;

  var coordinate_x=canvas_x_y_display.getContext("2d");
  coordinate_x.beginPath();
  coordinate_x.lineWidth="5";
  coordinate_x.strokeStyle="black"
  coordinate_x.moveTo(0,canvas_size);
  coordinate_x.lineTo(canvas_size,canvas_size);
  coordinate_x.stroke();
  coordinate_x.closePath();
  var coordinate_y=canvas_x_y_display.getContext("2d");
  coordinate_y.beginPath();
  coordinate_y.lineWidth="5";
  coordinate_y.strokeStyle="black"
  coordinate_y.moveTo(0,canvas_size);
  coordinate_y.lineTo(0,0);
  coordinate_y.stroke();
  coordinate_y.closePath();

  for (var c in dot_list) {
    dot_list[c].beginPath();
    dot_list[c].arc(ENV_NODE_VALUES[c].x, ENV_NODE_VALUES[c].y, dot_radius, 0, Math.PI*2);
    dot_list[c].fillStyle = "#0095DD";
    dot_list[c].fill();
    dot_list[c].closePath();
  }
  for (var l in line_list) {
    line_list[l].beginPath()
    line_list[l].moveTo(ENV_NODE_VALUES[l].x, ENV_NODE_VALUES[l].y);
    line_list[l].lineTo(ENV_NODE_VALUES[Number(l)+1].x, ENV_NODE_VALUES[Number(l)+1].y);
    line_list[l].stroke();
    line_list[l].closePath();
  }
}

// draw ticks on x axis
function drawTicks() {
  let x_tick_unit = canvas_size/NR_OF_MEASURES;
  for (let i = 0; i < NR_OF_MEASURES; i++) {
    tick_context.fillStyle = "#FF0000"; //red
    tick_context.fillRect(x_tick_unit*i,150,5,4);
  }
}

// draw points on canvas_x_y_display
function drawPoints() {
  let env_nodes_unit_x = (canvas_size/NR_OF_MEASURES)/2;
  // let env_nodes_unit_y = canvas_size/100;
  //empty dot_list  
  if (dot_list.length > 0) {
    dot_list[0].clearRect(0, 0, canvas_x_y_display.width, canvas_x_y_display.height);
  }
  dot_list.length = 0;
  for (let i = 0; i < ENV_NODE_VALUES.length; i++) {
    dot_list.push(canvas_x_y_display.getContext("2d"));
    dot_list[i].fillStyle = "#00008B"; //blue
    dot_list[i].fillRect(ENV_NODE_VALUES[i].x * env_nodes_unit_x ,rescale(ENV_NODE_VALUES[i].y, 50, 200, 200, 100),6,6);
  }
};
