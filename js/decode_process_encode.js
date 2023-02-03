//============================
//---------------_____________
var XML_FILE_IN, XML_FILE_OUT;
const TOTALIST=[];
// const PARTS_LIST=[];
const NOTES=[];
const NOTES_UNIFIED=[];
var parts_id_list=[];
var parts_name_list=[];
var TITLE="__";
var TIED_DUR=0;
var BOTTOM_STATIC=12; //DEFAULT VALUES FOR RESCALING THE PITCHES
var CEILING_STATIC=108; //BOTTOM_STATIC AND CEILING_STATIC won't change after initialisation
var AR=[1, 1];

var X_ENVELOPED=false;
var X_SCALER_VALUES=[1, 1];
var X_SCALER_POINTS=[0,1];
var QUANT=0.25;
var BOTTOM_CHANGING=BOTTOM_STATIC; //LOWEST & HIGHEST NOTE will change according to the user input
var CEILING_CHANGING=CEILING_STATIC;
var NR_OF_BEATS=1;
var NR_OF_MEASURES=0;

//---------------------------------------------------------------------------------------------------------//
//------------------------ PARSES MUSIC XML FILE, WRITES PARTS, BARS, NOTES ETC INTO PARTS_LIST ARRAY -----//

function reset_variables() {
  TOTALIST.length=0;
  NOTES.length=0;
  NOTES_UNIFIED.length=0;
  parts_id_list=[];
  parts_name_list=[];
  TIED_DUR=0;
  AR=[1,1];
}

function reset(){
  reset_variables();
  file2xmlParser();
  if (X0_slider) {
    X0_slider.set=100;
    X1_slider.set=100;
    // X_slider.value=12;
    Y_slider.set=[BOTTOM_CHANGING, CEILING_CHANGING];
  }
  if (X_slider) {
    X_slider.set=100;
    Y_slider.set=[BOTTOM_CHANGING, CEILING_CHANGING];
  }

}

//Start-up function
function starter(){
  // let fr=new FileReader(); //1.STEP
fetch("xml/xml_dirs_4-4-5-4_2-4-4-5-4.xml")
  .then(function(response) {
    return response.blob();
  })
  .then(function(fileBlob) {
    var fileReader = new FileReader();
    fileReader.onloadend = function() {
      // do something with the file contents
      
        const parser = new DOMParser(); //2.STEP
        XML_FILE_IN=parser.parseFromString(fileReader.result, "application/xhtml+xml");
        // XML_FILE_IN=parser.parseFromString(fr.result);
        get_title(XML_FILE_IN);
        partLister(XML_FILE_IN);
        note_parser(XML_FILE_IN);
        make_musicxml();
        add_link();
        loadPage()
        default_gui();
        document.getElementById("xml_file_out").style.visibility="visible";
        document.getElementById("play-button").style.visibility="visible";
        document.getElementById("stop-button").style.visibility="visible";
        document.getElementById("page-help").style.visibility="visible";
        // document.getElementById("gui").style.visibility="visible";
        document.getElementById("settings").style.visibility="visible";
       
}
  fileReader.readAsText(fileBlob);
  });
}

//FILEREADER > DOMPARSER > XML
function file2xmlParser() {
  var fr=new FileReader(); //1.STEP
  // let file_name=filee.files[0].name;
  if (!filee.files[0]) {
    starter();
  }
  else {
    let file_name=filee.files[0].name;
    //check whether the file zipped or not
  if (file_name.includes(".mxl")) {
    var zip=new JSZip();
    zip.loadAsync(filee.files[0]).then(function(zip) {
      zip.file(file_name.replace(/\.mxl$/, ".xml")).async("string").then(function(data) {
    const parser = new DOMParser(); //2.STEP
    XML_FILE_IN=parser.parseFromString(data, "application/xhtml+xml");
    // XML_FILE_IN=parser.parseFromString(fr.result);
    partLister(XML_FILE_IN);
    note_parser(XML_FILE_IN);
    make_musicxml();
    add_link();
    loadPage()
    default_gui();
    document.getElementById("xml_file_out").style.visibility="visible";
    document.getElementById("play-button").style.visibility="visible";
    document.getElementById("stop-button").style.visibility="visible";
    document.getElementById("page-help").style.visibility="visible";
    // document.getElementById("gui").style.visibility="visible";
    document.getElementById("settings").style.visibility="visible";
      })});
  } else {
  fr.readAsText(filee.files[0]);
  fr.onloadend=function(){
    const parser = new DOMParser(); //2.STEP
    XML_FILE_IN=parser.parseFromString(fr.result, "application/xhtml+xml");
    // XML_FILE_IN=parser.parseFromString(fr.result);
    get_title(XML_FILE_IN);
    partLister(XML_FILE_IN);
    note_parser(XML_FILE_IN);
    make_musicxml();
    add_link();
    loadPage()
    document.getElementById("xml_file_out").style.visibility="visible";
    document.getElementById("play-button").style.visibility="visible";
    document.getElementById("stop-button").style.visibility="visible";
    document.getElementById("page-help").style.visibility="visible";
    // document.getElementById("gui").style.visibility="visible";
    document.getElementById("settings").style.visibility="visible";
    default_gui()

};
}
}
}


//  CALCULATES PITCH (AS MIDI NR.) USING STEP, ALTER & OCTAVE TAGS
function calc_pitch(step, alter, octave) {
  let steps = ['C','C#','D','D#','E','F','F#','G','G#','A','A#', 'B'];
  let stepp=steps.indexOf(step);
  let octavee=(Number(octave))*12;
  if (alter) {
    // console.log("alteration mevcut");
    var alterr=Number(alter);
    var out=(stepp+octavee+alterr);
  } else {
    // console.log("no alteration");
    var alterr=0;
    var out=(stepp+octavee+alterr);
  }
  return (out);
}

//RETURNS RELATIVE DURATION AS 1 BEING A QUARTER NOTE, 0.5 EIGHTH
function calc_rhythm(beat_divisions, duration ) {
  return duration/beat_divisions;
}

// FILLS THE PART_LIST WITH PART ID'S
function partLister(xml_file) {
  let parts = "//part-list/score-part";
  let parts_node=xml_file.evaluate(parts, xml_file, null, XPathResult.ANY_TYPE, null);
  let parts_res=parts_node.iterateNext();
  let part_name = "//part-list/score-part/part-name";
  let part_name_node=xml_file.evaluate(part_name, xml_file, null, XPathResult.ANY_TYPE, null);
  let part_name_res=part_name_node.iterateNext();
  let number_of_parts=0;
  while (parts_res) {
    parts_id_list.push(parts_res.getAttribute('id'));
    parts_name_list.push(part_name_res.textContent);
    parts_res=parts_node.iterateNext();
    part_name_res=part_name_node.iterateNext();
  }
  // console.log("parts -", parts_id_list, parts_name_list);
}

//GETS TITLE OF THE SCORE
function get_title(xml_file) {
  // let title = "//work/work-title";
  let title = "//movement-title";
  let title_node=xml_file.evaluate(title, xml_file, null, XPathResult.ANY_TYPE, null);
  let title_res=title_node.iterateNext();
  // TITLE= title_res.textContent;
  while (title_res) {
    TITLE= title_res.textContent;
  }
  // return title_res.textContent;
}

function create_vals_list_for_each_part() {
  for (let i=0; i<(parts_id_list.length); i++){
    eval('var ' + 'P' + i + '_vals' + ' = []');
  }
}

function get_named_child(node, tag_name) {
  var result, child, child_count;
  child_count=node.childElementCount;
  for (let e=0; e<child_count;e++) {
    child=node.children[e];
    if (child.nodeName.toUpperCase()==tag_name.toUpperCase()) {
      result=child;
    };
  }
  return result;
}

function get_named_children(node, tag_name) {
  var result=[], child, child_count;
  child_count=node.childElementCount;
  for (let e=0; e<child_count;e++) {
    child=node.children[e];
    if (child.nodeName.toUpperCase()==tag_name.toUpperCase()) {
      result.push(child);
    };
  }
  return result;
}

//READS .XML FILE -> WRITES NOTES AND DURATIONS INTO LISTS
function note_parser(xml_file) {
  // var txt="";
  var note_list=[];
  var measure_list=[];
  for (let p in parts_id_list) { //LOOP THROUGH PARTS
    let note_nr=1;
    var part_name="";
    var part_pitches=[]; //resets at each part//
    var part_dures=[]; //resets at each part//
    var part_notes=[];
    // txt+=parts_id_list[p] + "<br>";
    var divisions_xpath="//score-partwise/part[@id=" + '"' + parts_id_list[p] + '"' + "]/measure[@number='1']/attributes/divisions";
    var divisions_node = xml_file.evaluate(divisions_xpath, xml_file, null, XPathResult.ANY_TYPE, null);
    var divisions_res=divisions_node.iterateNext();
    if (divisions_res) {
      var divisions=divisions_res.childNodes[0].nodeValue;

    }
    // console.log(divisions);
    var measure_xpath="//score-partwise/part[@id=" + '"' + parts_id_list[p] + '"' + "]/measure";
    var measure=xml_file.evaluate(measure_xpath, xml_file); //, null, XPathResult.ANY_TYPE, null);
    var measure_res=measure.iterateNext();

    TIED_DUR=0;

    while (measure_res) { //LOOPS THROUGH MEASURES
      // console.log(measure_res);
      var measure_number=measure_res.getAttribute("number");
      //GETS TIME-SIGNATURE OF EACH MEASURE
      var time_signature;
      var time_sig_beats_xpath="//score-partwise/part[@id=" + '"' + parts_id_list[p] + '"' + "]/measure[@number=" + measure_number + "]/attributes/time/beats";
      var time_sig_beats_node=xml_file.evaluate(time_sig_beats_xpath, xml_file);
      var time_sig_beats_res=time_sig_beats_node.iterateNext();
      var time_sig_beat_type_xpath="//score-partwise/part[@id=" + '"' + parts_id_list[p] + '"' + "]/measure[@number=" + measure_number + "]/attributes/time/beat-type";
      var time_sig_beat_type_node=xml_file.evaluate(time_sig_beat_type_xpath, xml_file);
      var time_sig_beat_type_res=time_sig_beat_type_node.iterateNext();
      if (time_sig_beats_res) {
        time_signature=time_sig_beats_res.childNodes[0].nodeValue + "/" + time_sig_beat_type_res.childNodes[0].nodeValue;
      };

      //!!! UPDATE DIVISIONS AT EACH MEASURE !!! some encoders change it at ever measure///
      divisions_xpath="//score-partwise/part[@id=" + '"' + parts_id_list[p] + '"' + "]/measure[@number=" + measure_number + "]/attributes/divisions";
      divisions_node=xml_file.evaluate(divisions_xpath, xml_file);
      divisions_res=divisions_node.iterateNext();
      if (divisions_res) {
        // console.log(divisions_res);
        divisions=divisions_res.childNodes[0].nodeValue;
      }

      var note_xpath="//score-partwise/part[@id=" + '"' + parts_id_list[p] + '"' + "]/measure[@number=" + measure_number + "]/note[voice=1]"; //!!READS ONLY FIRST VOICE
      var note=xml_file.evaluate(note_xpath, xml_file);//, null, XPathResult.ANY_TYPE, null);
      var get_note=note.iterateNext();
      var restt=get_named_child(get_note, 'rest');
      var midi_num=0;
      var rhy=0;

      while (get_note) {
        var restt=get_named_child(get_note, 'rest');
        var durationn=get_named_child(get_note, 'duration');
        var tied=get_named_children(get_note, 'tie'); //get tie types ('start' and/or 'stop')
        rhy=calc_rhythm(divisions, durationn.innerHTML);
        rhy_str=calc_rhythm(divisions, durationn.innerHTML);

        if (restt) { //RESTS
          midi_num=0;
          // txt += measure_number + " " + "R" + " " + rhy + " " + midi_num + "<br>";
          note_list.push({p:0, d:rhy, i: note_nr});
        } else { // get PITCH components
          var pitch = get_named_child(get_note, 'pitch');
          var alteration=0;
          var stepp=get_named_child(pitch, 'step');
          var alterr=get_named_child(pitch, 'alter');
          var octavee=get_named_child(pitch, 'octave');
          if (alterr) {
            alteration=alterr.innerHTML;
          } else {
            alteration=0;
          };
          //!! IF A NOTE IS TIED, THEN IT'S WRITTEN AS A STRING INTO DUR_LIST
          if (tied[0]) { //TIED NOTES ARE BEING SUMMED
            //1. tie start
            if (tied.length==1 && tied[0].getAttribute('type')=='start') {
              TIED_DUR=rhy;
              midi_num=calc_pitch(stepp.innerHTML,alteration,octavee.innerHTML);
              note_list.push({p:midi_num, d:rhy+"-", i: note_nr}); //TIE START AS "1-"
              // TIED_DUR=rhy_str+"-";
            }
            //2.tie stopped
            if (tied.length==1 && tied[0].getAttribute('type')=='stop') {
              // tie_stopped=true;
              TIED_DUR=TIED_DUR+rhy;
              midi_num=calc_pitch(stepp.innerHTML,alteration,octavee.innerHTML);
              // txt += measure_number + " " + stepp.innerHTML + " " + TIED_DUR + " " + midi_num + "<br>";
              note_list.push({p:midi_num, d:"-"+rhy, i: note_nr}); //TIE STOP AS "-1"
              TIED_DUR=0;
            }
            //3. tie continue
            if (tied.length==2) {
              midi_num=calc_pitch(stepp.innerHTML,alteration,octavee.innerHTML);
              note_list.push({p:midi_num, d:"-"+rhy+"-", i: note_nr}); //TIE CONTINUE AS "-1-"
              TIED_DUR=rhy+TIED_DUR;
            }
        } else {
          TIED_DUR=0;
          midi_num=calc_pitch(stepp.innerHTML,alteration,octavee.innerHTML);
          // txt += measure_number + " " + stepp.innerHTML + " " + rhy + " " + midi_num + "<br>";
          note_list.push({p:midi_num, d:rhy, i: note_nr});
        }
      };
      get_note=note.iterateNext();
      note_nr++;
    }
    // measure_list.push([time_signature, note_list]);
    
    let just_notes=note_list.slice();
    part_notes.push(just_notes);

    note_list.unshift(time_signature);
    measure_list.push(note_list);
    // console.log(measure_list);
    
    note_list=[];
    measure_res=measure.iterateNext();
  }; //END OF LOOP -> MEASURES

  NOTES.push(concatenate(part_notes)); //WRITES PART NOTES INTO NOTES ARRAY

  TOTALIST.push(measure_list.slice()); //WRITES PART NOTES AS SUBARRAYS OF MEASURES INTO TOTALIST ARRAY
  
  // txt="";
  measure_list=[];
  }; //END OF LOOP -> PARTS

console.log("1 _-_-_-_-_-_- 1", TOTALIST);
// DETECTS LOWEST AND HIGHEST PITCHES

CEILING_CHANGING=NOTES[0][0].p;
BOTTOM_CHANGING=NOTES[0][0].p;

for (let partt in NOTES) {
  let part_notes=NOTES[partt];
  for (let notee in part_notes) {
    let note=part_notes[notee];
    if (note.p>CEILING_CHANGING) {
      CEILING_CHANGING=note.p;
    }
    if (note.p<BOTTOM_CHANGING && note.p!=0) {
      BOTTOM_CHANGING=note.p;
    }
  };
}

// BOTTOM_STATIC & CEILING_STATIC ARE USED TO RESCALE THE PITCHES TO THE RANGE OF CHOSEN LOWEST AND HIGHEST NOTE
BOTTOM_STATIC=BOTTOM_CHANGING;
CEILING_STATIC=CEILING_CHANGING;

NR_OF_MEASURES=TOTALIST[0].length;
MAX_NR_OF_ENV_NODES=NR_OF_MEASURES;
// console.log("lowest", BOTTOM_CHANGING, "highest", CEILING_CHANGING, "bottom", BOTTOM_STATIC, "top", CEILING_STATIC, "nr_of_measure", NR_OF_MEASURES, "max env nodes", MAX_NR_OF_ENV_NODES);
}

//----------------------------------------------------------------------------//
//--------- NOTES TRANSFORMER FUNCTIOINS -------------------------------------//
//--------- RECEIVES PARAMETERS FROM GUI, APPLIES IT TO PARTS_LIST -----------//
function midi_to_hertz(midi_val) {
  return 440*Math.pow(2, (midi_val-69)/12);
}

function hertz_to_midi(freq_val) {
  return Math.round(12 * Math.log2(freq_val/440) + 69);
}

function rescale(x,x1,x2,y1,y2, mode='lin') {
  // BASED ON RICK TAUBE'S COMMONMUSIC/GRACE/MUSX SOURCE CODE
  if (x>x2) {
    return y2;
  }
  if (x<=x1) {
    return y1;
  }
  // as x moves x1 to x2 mu moves 0 to 1
  var mu=(x-x1)/(x2-x1);
  var mu2=0;
  b=512;
  switch (mode) {
    case 'lin':
    return (y1 * (1-mu) + (y2 * mu))
    break;

    case 'cos':
    mu2= (1 - Math.cos(mu*Math.PI)) / 2 ;
    return (y1 * (1 - mu2) + y2 * mu2)
    break;
    
    case 'exp':
    return y1 + ( ((y2-y1)/b) * Math.pow(b,mu));
    break;
    default:
      }
}

function interp(x, pairs, mode='lin') {
  // BASED ON RICK TAUBE'S COMMONMUSIC/GRACE/MUSX SOURCE CODE
  var walk=[], xr=pairs[0], yr, xl, yl, wx, wy;
  let xys_len=pairs.length;
  if (x<xr) {
    return xr;
  }
  for (let lx=0; lx<xys_len; lx=lx+2) {
    // console.log(pairs[lx], pairs[lx+1]);
    walk.push(pairs[lx]);
    walk.push(pairs[lx+1]);
  }
  // console.log(walk);
  // for (let lx=0;xr<x;lx=lx+2) {
  for (let l=0; l<xys_len;l=l+2) {
    if (xr>x) {
      break;
    }
    let wx=walk[l];
    let wy=walk[l+1];
    xl=xr;
    yl=yr;
    xr=wx;
    yr=wy;
  }
  return rescale(x,xl,xr,yl,yr,mode)
};

//a range which runs on floating steps
function my_range(a,b,step) {
  a=formatTiedDur(a);
  b=formatTiedDur(b);
  let ruler=[];
  let start=a;
  let stop=b;
  while (a<b) {
    ruler.push(parseFloat(a.toFixed(3)));
    a=a+step;
  }
  return ruler;
}


//replaces x with y in the list a
function replace(a, x, y) {
  x=formatTiedDur(x);
  for (let i in a) {
    ai=formatTiedDur(a[i]);
    if (ai==x) {
      ai=y;
    }
  }
  return a;
}


//returns part number of shortest list of lists (assuming the first element of each list is part number)
function return_shortest(lists_in_list) {
  let lengths=[];
  let shortest_arr=[];
  let shortest_;
  for (var i in lists_in_list) {
    lengths.push(lists_in_list[i].length);
  }
  shortest_=Math.min(...lengths);
  for (var l in lists_in_list) {
    if (lists_in_list[l].length==shortest_) {
      shortest_arr=lists_in_list[l];
    }
  }
  return shortest_arr[0]; //returns shortest_array part_num
}

function quantize(x, step) {
  return Math.floor( (Number(x)/step) + 0.5) * step;
}

function returnShortest_array(...args) {
  let len=args[0].length;
  for (var i in args) {
    if (args[i].length<len) {
      len=args[i].length;
    }
  };
  return len;
}

//similar to Python's zip function
function zip(a,b) {
  const out=[];
  const shortest_len=returnShortest_array(a,b);
  for (var i = 0; i < shortest_len; i++) {
    out.push([a[i],b[i]]);
  }
  return out;
}

function quantize_obj_list(liste, obj_key="d", step_size=0.25) {
  let out=[];
  for (let i in liste){
    quantized_val=quantize(Number(liste[i][obj_key]), step_size);
    if (quantized_val==0) {
      quantized_val=step_size;//prohibits 0 as dur value, rather puts the smallest step value
    }
    // out.push({d:quantized_val});
    liste[i][obj_key]=quantized_val;
  }
  return liste;
}

// console.log(quantize_list([3.4,3.6,3.655,3.78,3.9,4.1123,4.444,4.49], 0.3));

//flattens sub-arrays, depth 1.
function concatenate(list_of_lists) {
  let out=[];
  for (let l in list_of_lists){
    for (let r in list_of_lists[l]){
      out.push(list_of_lists[l][r]);
    }
  }
  return out
}


//returns sum of a list of objects' given key//
function sum_objects(object_list, key_to_be_summed) {
  summe=0;
  for (let i in object_list){
    let ele=object_list[i][key_to_be_summed];
    if (typeof(ele)=='string') {//removes any '-' sign 
      ele=ele.replace(/-/g, "");
     }
    summe=summe+Number(ele);
  }
  return summe
}

//SPLIT NUMBERS FROM THEIR TIE SUFFIX-AFFIXES AND TURN THEM TO NUMBERS FROM STRING
function formatTiedDur(dur) {
  if (typeof(dur)=='string') {
    return Number(dur.replaceAll("-",""))
  } else {
    return dur;
  }
}

//ACCEPTS DUR ARRAY AND RETURNS IT AFTER SUMMING TIED VALUES
// [1,"1-", "-1-", "-1", 1] -> [1,3,1]
function sumTiedDurs(durs) {
  let out=[];
  let tied_val=0;
  for (var d in durs) {
    let du=durs[d];
    if (typeof(du)=='string') {
      tied_val=tied_val+formatTiedDur(du);
      if (du[0]=='-' && du[du.length-1]!="-") {
        out.push(tied_val);
        tied_val=0;
      }
    } else {
      out.push(du);
    }
  }
  return out;
}

function unifyTiedNotes(notes) {//ACCEPTS A LIST OF NOTE OBJECTS i.e. {p: 60, d:1}, RETURNS A NEW LIST
  let out=[];
  let tied_val=0;
  for (var n in notes) {
    let du=notes[n]["d"];
    if (typeof(du)=='string') {
      tied_val=tied_val+formatTiedDur(du);
      if (du[0]=='-' && du[du.length-1]!="-") {
        out.push({p:notes[n]["p"], d:tied_val});
        tied_val=0;
      }
    } else {
      out.push({p:notes[n]["p"], d:du})
    }
  }
  return out;
}


//PACKAGES NOTES AS BEATS INTO ARRAYS
function pack_as_beats(arr, beat_len=0.89) { //GET NOTES, RETURNS A NEW LIST
  // arr=sumTiedDurs(arr);
  let liste=arr;
  let out=[];
  let in_out=[];
  let pops=[];
  //sequentially adds up durations and pack into given lengths
  for (var i in liste) {
    // dur=formatTiedDur(liste[i])
    dur=liste[i]["d"];
    in_out.push(liste[i]);
    if (sum_objects(in_out, "d")>=beat_len) {
      out.push(in_out);
      in_out=[];

    } else {
      continue
    }
  }
  //appends the rest, which are shorter than beat_len
  pops=concatenate(out); //flattens out list to loop over

  for (var p in my_range(0, pops.length, 1)) {
    liste.shift();
  }
  if (liste.length!=0) {
    out.push(liste)
  }
  return out;
}

//find first and last note of a given part and measure
function find_first_last_indexes(part, measure_num) {
  // measure_num=Number(measure_num)+1;
  let out=[];
  let first_note;
  let last_note;
  let act_measure=part[Number(measure_num)-1];
  console.log("part", part, "measure_num", measure_num, "act_measure", act_measure);
  first_note=act_measure[0];
  last_note=act_measure[act_measure.length-1];
  return [first_note["i"], last_note["i"]];
}


//# adjust the array's total sum to the given value by chopping from tail or adding extras
function equalize(notess,target_sum, note_key="d"){ //ACCEPTS NOTE OBJ LIST//
  notes=notess;
  let diff=target_sum-sum_objects(notes, note_key);
  if (diff>0) { //when target_sum is larger than the given array
    notes.push({p: notes[notes.length-1]["p"], d:diff}); //!!! THAT NOTE COULD BE TIED PREVIOUS NOTE!!!
    return notes;
  }
  else if (diff<0) {//when target_sum smaller than..
    diff=Math.abs(diff);
    if (notes[notes.length-1][note_key]>diff) {
      notes[notes.length-1][note_key]=notes[notes.length-1][note_key]-diff;
    }
    if (notes[notes.length-1][note_key]==diff) {
      notes.pop();
    }
    if (notes[notes.length-1][note_key]<diff) {
      notes.pop();
      equalize(notes,target_sum)
    }
  }
  return notes;
}

function align_beats(raw, ref, beat_len=0.89) {
  let raw_in_beats=pack_as_beats(raw, beat_len);
  let ref_in_beats=pack_as_beats(ref, beat_len);
  let aligned_out=[];
  let zipped=zip(raw_in_beats, ref_in_beats);
  for (var xy in zipped) {
    let x=zipped[xy][0];
    let y=zipped[xy][1];
    let sumss=sum_objects(y, "d")/sum_objects(x, "d");
    aligned_out.push(multiply_object(x, sumss));
  };
  return aligned_out;
}

// # multi-point rhythmic series accel. decel. based on musx.envelope interp #
// # interp([1,1,1,1], 0,1,0.33, 2, 0.66, 4, 1,0.5)
function rhythm_enveloper_in_beats(notes, note_key="d", quantize_bit=QUANT) {
  const out=[];
  const enveloped_note=[];
  const notes_in_beats=pack_as_beats(notes);
  // console.log("notes_in_beats", notes_in_beats);
  let note_index=1;
  let scaler=1;
  let normalized_beat_nr=0;
  for (var b in notes_in_beats) { //loops over beats
    normalized_beat_nr = b / (notes_in_beats.length-1);
    // scaler = interp(normalized_beat_nr, [0, a_scaler, 0.5, d_scaler, 1, r_scaler]);
    scaler = interp(normalized_beat_nr, [0, AR[0], 1, AR[1]]);
    // scaler = interp(normalized_beat_nr, concatenate(zip(X_SCALER_POINTS, X_SCALER_VALUES)));
    for (var e in notes_in_beats[b]) { // loops over notes in a beat
      let x=notes_in_beats[b][e];
      let notee={ p:x["p"], d:quantize(x[note_key]*scaler, quantize_bit), i:note_index };
      // let notee={p:x["p"],d:quantize(x[note_key]*scaler)};
      out.push(notee);
      note_index++;
      console.log("normalized_beat_nr", normalized_beat_nr, "scaler", scaler, "notee", notee);
    };
    // out.push(enveloped_note);
    // enveloped_note.length=0;
  }
  console.log("out", out);
  return out;
}

//total uniform scaling of note values
function rhythm_values_scaler(notes, scaler_val=AR[0], note_key="d") {
  let notes_packed=pack_as_beats(notes);
  var out=[];
  let note_ind=1;
  for (var b in notes_packed) {
    for (var n in notes_packed[b]) {
      let x=notes_packed[b][n];
      let notee={p:x["p"],d:quantize(x[note_key]*scaler_val, QUANT), i:note_ind};
      out.push(notee);
      note_ind++;
    }
  }
  return out;
}

//REPACK A LIST OF NUMBERS (DURATIONS) INTO SUB-ARRAYS OF GIVEN SUM
//SERVES AS 'BAR MAKER'
function reframe(notes, summe=3) { //ACCEPTS NOTE OBJECTS RATHER THAN DUR_LIST
  let average_dur=sum_objects(notes, "d")/(notes.length);
  let main_out=[];
  let out=[];
  let counter=0;
  for (let i in notes) {
    pit=notes[i]["p"];
    dur=notes[i]["d"];
    out.push({p:pit, d:dur});
    if (!(counter==notes.length-1)) {//if notes dur bigger than average, than it needs to be put to the next frame//
      if (notes[i+1]>(average_dur*2)) {
        main_out.push(out);
        out=[];
      }
    }
    if ((sum_objects(out, "d")>=summe) && !(counter==notes.length-1)) {
      main_out.push(out);
      if (!(counter==notes.length-1)) { //when it's last element
        out=[];

      } else {}
    };
    if (counter==notes.length-1) { //this to append to uncompleted rest into the array
      if (sum_objects(out, "d")<2 && sum_objects(main_out[main_out.length-1], "d")<=3) { //if shorter than two beats append it to the last frame
        out=concatenate([main_out[main_out.length-1]], out);
        main_out[main_out.length-1]=out;

      } else {//if longer than 2 beats pack it as notes seperate frame
        main_out.push(out);
      }
    }
    counter=counter+1
  }
  return main_out
}

function reframe2reference(notes, ref_bars) {//ACCEPTS TWO NOTE_OBJ LISTS 1. TO BE PROCESSED 2. AS A REFERENCE
  let out=[];
  let syncopation;
  let syncopated_pitch;
  for (var ref in ref_bars) {
    let bar=ref_bars[ref];
    // console.log("bar ",bar);
    let in_out=[];
    if (syncopation) {
      in_out.push({p:syncopated_pitch, d:"-"+syncopation});
      // console.log("block 1", "syncopation", "-"+syncopation);
    }
    let last; 
    let bar_sum=sum_objects(bar, "d");
    while (sum_objects(in_out, "d")<bar_sum && notes.length!==0) {
      last=notes.shift();//removes and returns first element, updates array//
      in_out.push(last);
      // console.log("block 2", "last", last);
    }
    if (sum_objects(in_out, "d")>bar_sum) {
      let diff=Math.abs(bar_sum-sum_objects(in_out, "d"));
      let in_out_last=in_out.pop();//cut last element
      let new_last_dur=Math.abs((in_out_last["d"])-diff);//calculates fitting dur
      in_out.push({p: in_out_last["p"], d:new_last_dur+"-"});//adds new dur as tied start note to the tail of the bar
      syncopation=Math.abs(in_out_last["d"]-new_last_dur);//tied stop note as the onset of thenext bar
      syncopated_pitch=in_out_last["p"];
      // console.log("block 3",  "in_out_last", in_out_last, "new_last_dur", new_last_dur+"-", "syncopation", syncopation);
    } else if (sum_objects(in_out, "d")==bar_sum) {
      syncopation=undefined;
      // console.log("block 4", "syncopation", syncopation);
    }
    out.push(in_out)
    // console.log("block 5", "in_out", in_out);
  }
  // console.log("block 6", "out", out);
  return out;
  
}

//ACCEPTS FRAMED NOTE_OBJ ARRAY (PACKED AS BARS)
//RETURNS THEM WITH TIME SIGNATURES
function note_value(ref_out) {//32nd <-> quarter//
  let out=[];
  // measures=[]; //comporises each measures metrum and durations as list of list of lists
  for (var bar in ref_out) {
    let meas=ref_out[bar];
    let meas_w_time_sign=meas;
    let meas_sum=sum_objects(meas, "d");
    // console.log(meas, sum(meas));
    if (meas_sum%1==0) { // X/4
      time_sig=String(Math.trunc(meas_sum*1))+'/'+String(4);
      meas_w_time_sign.unshift(time_sig);
      out.push(meas_w_time_sign);
    } else if (meas_sum%0.5==0) {// X/8
      time_sig=String(Math.trunc(meas_sum*2))+'/'+String(8);
      meas_w_time_sign.unshift(time_sig);
      out.push(meas_w_time_sign);
    } else if (meas_sum%0.25==0) {// X/16
      time_sig=String(Math.trunc(meas_sum*4))+'/'+String(16);
      meas_w_time_sign.unshift(time_sig);
      out.push(meas_w_time_sign);
    } else if (meas_sum%0.125==0) {// X/32
      time_sig=String(Math.trunc(meas_sum*8))+'/'+String(32);
      meas_w_time_sign.unshift(time_sig);
      out.push(meas_w_time_sign);
    } 
  }
  // console.log("note_value_out", out.shift())
  // out.shift();
  return out;
}

function Taktung(notes, reference_frames, quantize=0.25) {
  // let reframed_notes=note_value(reframe2reference(quantize_obj_list(notes, "d", quantize), reference_frames));
  // reframed_notes=note_value(reframed_notes);
  return note_value(reframe2reference(quantize_obj_list(notes, "d", quantize), reference_frames));
}

function transform() {
  NOTES_UNIFIED.length=0;
  // TOTALIST.length=0;
  let notes_Y_rescaled_out=[];
  let notes_X_enved_out=[];
  for (let parti in NOTES) {//LOOPS THROUGH PARTS
    let part=NOTES[parti];
    NOTES_UNIFIED.push(unifyTiedNotes(part)); //UNITES/SUMS-UP TIED NOTES AS SINGLE VALUES
    for (let not in NOTES_UNIFIED[parti]) { //LOOPS THROUGH NOTES
      let note_p=NOTES_UNIFIED[parti][not]["p"];
      let note_d=NOTES_UNIFIED[parti][not]["d"];
      let note_obj;
      if (note_p==0) {
        note_obj={p:0, d:note_d}; //CREATES NOTE OBJECT for rests
      } else {
        let rescaled_note=rescale(note_p, BOTTOM_STATIC, CEILING_STATIC, BOTTOM_CHANGING, CEILING_CHANGING); //RESCALE PITCHES
        // console.log("rescaled_note", rescaled_note, "note_p", note_p, "BOTTOM_CHANGING", BOTTOM_CHANGING, "CEILING_CHANGING", CEILING_CHANGING, "BOTTOM_STATIC", BOTTOM_STATIC, "CEILING_STATIC", CEILING_STATIC);
        note_obj={p:rescaled_note, d:note_d}; //CREATES NOTE OBJECT
      }
      notes_Y_rescaled_out.push(note_obj);
    }
    // notes_X_enved_out.push(rhythm_values_scaler(notes_Y_rescaled_out, AR)); //this works
    //IF ENVED CHECK BOX IS CHECKED
    if (document.getElementById("x_enved").checked) {
      notes_X_enved_out.push(rhythm_enveloper_in_beats(notes_Y_rescaled_out));
    } else {
      notes_X_enved_out.push(rhythm_values_scaler(notes_Y_rescaled_out, AR[0])); 
    }
}
TOTALIST.length=0;
  var framed_bass_as_reference=reframe(notes_X_enved_out[notes_X_enved_out.length-1]); //gets last part as reference assuming it is bass
  
  for (let parti in notes_X_enved_out) {
      let equalized_part=equalize(notes_X_enved_out[parti], sum_objects(framed_bass_as_reference, "d"));
      let taktized_part=Taktung(equalized_part, framed_bass_as_reference, QUANT);
      TOTALIST.push(taktized_part);
  }
    console.log("4 _-_TOTALIST_-_ 4", TOTALIST);
    make_musicxml();
    add_link();
    // create_X_Y_sliders();
}



//----------------------------------------------------------------------------------//
//--------- XML (OUT) FORMATTING ---------------------------------------------------//

//CREATES BLOB DATA AND DOWNLOAD LINK
function add_link() {

  let url = URL.createObjectURL(new Blob([XML_FILE_OUT], {type: "text/xml;charset=utf-8"}));
  document.getElementById('xml_file_out').setAttribute("href", url);
}

//  CALCULATES PITCH (AS MIDI NR.) USING STEP, ALTER & OCTAVE TAGS
function calc_pitch(step, alter, octave) {
  let steps = ['C','C#','D','D#','E','F','F#','G','G#','A','A#', 'B'];
  let stepp=steps.indexOf(step);
  let octavee=(1+Number(octave))*12;
  if (alter) {
    // console.log("alteration mevcut");
    var alterr=Number(alter);
    var out=(stepp+octavee+alterr);
  } else {
    // console.log("no alteration");
    var alterr=0;
    var out=(stepp+octavee+alterr);
  }
  return (out);
}

//accepts midi pitch number
//IF 0, THEN RETURNS <REST/>
//OTHERWISE RETURNS STEP, ALTER, OCTAVE values
function xml_pitch_formatter(pitch_num) {
  const xml_pitch=[];
  if (pitch_num<=0) { //WHEN THE NOTE IS A REST
    xml_pitch.push(0);

  } else {
    let pitch_class=Math.floor(pitch_num%12);
    let steps = ['C','C#','D','D#','E','F','F#','G','G#','A','A#', 'B'];
    let stepp = steps[pitch_class];
    // stepp=stepp[0];//this is to chop off sharps from the letter.
    let octavee=Number(pitch_num/12);
    let alterr=0;
    octavee=Math.floor(octavee)-1;
    if ([1,3,6,8,10].includes(pitch_class)) {
      alterr=1
    }
    xml_pitch.push(stepp);
    xml_pitch.push(octavee);
    xml_pitch.push(alterr);
  }
  return xml_pitch;
}

//RETURNS RELATIVE DURATION AS 1 BEING A QUARTER NOTE, 0.5 EIGHTH
function calc_rhythm(beat_divisions, duration ) {
  return duration/beat_divisions;
}

//RETURNS DURATION TO BE USED IN XML_BUILDER OBJECT
function xml_rhythm(dure, divisions=32) {
  let single_dure=String(dure).replace(/-/g, "");
  return Number(single_dure)*divisions; //<divisions>  attribute is set to 32 by default
}

//DECIDES WHETHER TO USE G OR F CLEF DEPENDING ON THE RANGE OF THE PART
function choose_clef(part_notes) {
  let sum=0;
  let number_of_notes=0; //part_notes might include rests as well
  let average=0;
  const clefs=[
    {
      'sign': { '#text': 'G' },
      'line': { '#text': '2' }
    },
    {
      'sign': { '#text': 'F' },
      'line': { '#text': '4' }
    }
  ];
  for (var e in part_notes) {
    sum=sum+part_notes[e]["p"];
    if (part_notes[e]["p"]>=1) {
      number_of_notes=number_of_notes+1;
    }
    // console.log(sum, part_notes);
  };
  average=sum/number_of_notes;
  if (average>60) {
    return [clefs[0], 'G'];
  } else {
    return [clefs[1], 'F'];
  }

}

// PART-LIST TAG BUILDER
function buildPartlist(id, name='Piano') {
  return {
    'score-part': {
      '@id': id,
      'part-name': {
        '#text': name
      }
    }
  };
}

const accidental_dic={flats:[], sharps:[], naturals:[]};

// FUNCTION FOR NOTE TAG
// XML_PITCH COMES FROM XML_PITCH_FORMATTER FUNCTION
function noteToMusicXMLObject(note) {
  // xml_pitchh=note["p"];
  let xml_pitchh=xml_pitch_formatter(note["p"]);
  // console.log("xml_pitchh", xml_pitchh);
  let dure=note["d"];
  let obj = {};
  let dure_pur=xml_rhythm(dure,1);//returns dure without divisions 
  let durationnn=xml_rhythm(dure);// times divisions=32
  let dure_type = typeof dure;
  let tie_type='none';
  let pitch_octave_str=xml_pitchh[0]+xml_pitchh[1];
  if (dure_type == 'string') {
    // console.log('yeah it is string');
    if (dure.charAt(0)=='-' && dure.slice(-1)=='-') {///in case of tie continue
      tie_type='continue';
    } else {
      if (dure.slice(-1)=='-') {
        tie_type='start'; //in case of start tie
      };
      if (dure.charAt(0)=='-') {//in case of stop tie
        tie_type='stop';
      }
    }

  } else {
    dot_type='none';

  };
  // PITCH TAG
  if (xml_pitchh[0]==0) {//WHEN THE PITCH_NUM IS O, THEN IT IS A REST
    obj['rest']='';
  } else {
    obj['pitch'] =  {
      'step': { '#text': xml_pitchh[0][0] },
      'alter': xml_pitchh[2],
      'octave': { '#text': xml_pitchh[1] }
    };
  };

  //DURATION TAG
  obj['duration']={'#text': durationnn};

  //TIE TAG
  if (dure_type=='string') {
    if (tie_type=='continue') {
      obj['tie']={'@type': 'stop' };
      obj['tie']={'@type': 'start' };
    } else {
      obj['tie']={'@type': tie_type }
    }
  };

  //VOICE TAG
  obj['voice']={'#text': 1};

  //TYPE TAG ('QUARTER', '16TH', ETC.)
  //DOT TAG IF NECESSARY
// const dure_dic={4: obj['type']='whole', 3.75: obj['type']='half'}
  switch (dure_pur) {
    case 4:
      obj['type']='whole';
      break;

    case 3.75:
      obj['type']='half';
      break;

    case 3.5:
      obj['type']='half';
      obj['dot']='';
      break;

    case 3.25:
      obj['type']='half';
      // obj['notations']={'tied': {'@type': 'start'}}
      break;

    case 3:
      obj['type']='half';
      obj['dot']='';

      break;
    case 2.75:
      obj['type']='half';
      break;

    case 2.5:
      obj['type']='half';
      break;

    case 2.25:
      obj['type']='half';
      break;

    case 2:
      obj['type']='half';
      break;

    case 1.75:
      obj['type']='quarter';
      obj['dot']='';
      break;

    case 1.5:
      obj['type']='quarter';
      obj['dot']='';
      break;

    case 1.25:
      obj['type']='quarter';
      break;

    case 1.125:
      obj['type']='quarter';
      break

    case 1:
      obj['type']='quarter';
      break;

    case 0.875:
      obj['type']='eighth';
      break;

    case 0.75:
      obj['type']='eighth';
      obj['dot']='';
      break;

    case 0.625:
      obj['type']='eighth';
      break;

    case 0.5:
      obj['type']='eighth';
      break;
      
    case 0.375:
      obj['type']='16th';
      obj['dot']='';
      break;

    case 0.25:
      obj['type']='16th';
      break;

    case 0.125:
      obj['type']='32nd';
      break;

    default:
};
//NOTATIONS > TIED TAG
if (dure_type=='string') {
  if (tie_type=='continue') {
    obj['notations']={'tied': {'@type': 'stop'}}
    obj['notations']={'tied': {'@type': 'start'}}
  } else {
    obj['notations']={'tied': {'@type': tie_type}}
  }
};

//ACCIDENTAL TAG
if (xml_pitchh[2]!=0 && xml_pitchh[2]== -1 && !(accidental_dic.flats.includes(pitch_octave_str))) {
  accidental_dic.flats.push(pitch_octave_str);
  obj['accidental']='flat'
}
if (xml_pitchh[2]!=0 && xml_pitchh[2]== 1 && !(accidental_dic.sharps.includes(pitch_octave_str))) {
  accidental_dic.sharps.push(pitch_octave_str);
  obj['accidental']='sharp'
}
if (xml_pitchh[2]==0 && accidental_dic.sharps.includes(pitch_octave_str) && !accidental_dic.naturals.includes(pitch_octave_str)) {
  accidental_dic.sharps.splice(accidental_dic.sharps.indexOf(pitch_octave_str), accidental_dic.sharps.indexOf(pitch_octave_str));
  accidental_dic.naturals.push(pitch_octave_str);
  obj['accidental']='natural'
};
if (xml_pitchh[2]==0 && accidental_dic.flats.includes(pitch_octave_str) && !accidental_dic.naturals.includes(pitch_octave_str)) {
  accidental_dic.flats.splice(accidental_dic.flats.indexOf(pitch_octave_str), accidental_dic.flats.indexOf(pitch_octave_str));
  accidental_dic.naturals.push(pitch_octave_str);
  obj['accidental']='natural'
};
return obj;
}

let current_clef='G';
let current_time_sig='4/4';


//ADDS ATTRIBUTES > DIVISIONS & TIME & KEY & CLEF
function addMeasures(parent, meas_num, meas) {
  const measure = parent.ele({ 'measure': { '@number':  Number(meas_num)+1} });
  const measure_attributes=measure.ele({ 'attributes': {}});
  // console.log("meas is:", meas);
  const time_sig=meas.shift();
  // console.log(time_sig);
  //get first element of meas
  // const time_sig=meas[0];
  const time_sig_splitted=time_sig.split('/');
  const beatss=time_sig_splitted[0];
  const beat_typee=time_sig_splitted[1];
  let chosen_clef=choose_clef(meas);//decides G or F clef based on given pitches

  measure_attributes.ele({'divisions': { '#text': '32' },
    'key': {
      'fifths': { '#text': '0' }
    }});

    if (meas_num==0 || current_time_sig!=time_sig) {
      current_time_sig=time_sig;
      measure_attributes.ele({'time': {
        'beats': { '#text': beatss },
        'beat-type': { '#text': beat_typee }
      }});
    };

    if (meas_num==0 || chosen_clef[1]!=current_clef) { //AT 1ST BAR & WHEN THE CLEF CHANGES
      measure_attributes.ele({'clef': chosen_clef[0]});
      current_clef=chosen_clef[1];
    }

    //LOOPS IN PITCH-LIST OF BAR AND ADDS NOTES
    for (var n in meas) {
      measure.ele({'note': noteToMusicXMLObject(meas[n])});
  }
}

function make_musicxml(totalistt=TOTALIST, metaData) {
  XML_FILE_OUT = xmlbuilder2.create().ele({ 'score-partwise' : { '@version': 3.1 }},
    { version: '1.0', encoding: 'UTF-8', standalone: 'no'},
    {
      pubID: '-//Recordare//DTD MusicXML 3.1 Partwise//EN',
      sysID: 'http://www.musicxml.org/dtds/partwise.dtd'
    },
    {stringify: {}}
  );
  XML_FILE_OUT.root().ele({ 'work': { 'work-title': TITLE }});

  //  PART-LIST buider
  const part_list_tag = XML_FILE_OUT.root().ele('part-list');
  for (var p in totalistt) {
    let part_id="P"+(Number(p)+1);
    let part_namee=parts_name_list[p];
    part_list_tag.ele(buildPartlist(part_id, part_namee));
  }

  //PART BUILDER LOOP
  for (var p in totalistt) {
    part_id="P"+(Number(p)+1);
    let part=XML_FILE_OUT.root().ele({'part': { '@id': part_id}});
    let measures=totalistt[p];
    // console.log("measures", measures);

    //MEASURE LOOP
    // ['2/4', [{p:60, d:1}, {p:61, d:1}]]; 
    for (var meas_numm in measures) {

      let actual_measure=measures[meas_numm];
      // console.log("actual_measure", actual_measure);

      //AT EACH BAR, HANDLES NOTES WITH ACCIDENTALS CORRECTLY
      accidental_dic.flats= [];
      accidental_dic.sharps=[];
      accidental_dic.naturals=[];
      addMeasures(part, meas_numm, actual_measure);
      // console.log("accidental_dic", accidental_dic, "meas_numm", meas_numm, "actual_measure", actual_measure, "time_sig", actual_measure.shift());
    }
  }
// console.log(XML_FILE_OUT.end({prettyPrint: true}));// PRINTS XML TO CONSOLE

  // CREATES DOWNLOAD LINK FOR THE PROCESSED XML_OUT FILE
  let url = URL.createObjectURL(new Blob([XML_FILE_OUT.end({prettyPrint: true})], {type: "text/xml;charset=utf-8"}));
  document.getElementById('xml_file_out').setAttribute("href", url);
//WRITES XML_OUT TO VEROVIO SVG
  var data = vrvToolkit.loadData(XML_FILE_OUT.end({prettyPrint: true}));
  var svg = vrvToolkit.renderToSVG(data, {});
  document.getElementById('svg_output').innerHTML=svg;
}
// oh boy, that was hard to write