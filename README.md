Web-app musicplasticity allows users to change rhythmic and harmonic content of a multi-part music. 

It is a MusicXML processor for browser, which does the whole job on the client-side. 

It imports MusicXML file, translates musical (symbolic) data into numeric  domain, process it according to user input and translate it back to symbolic data, displays it with verovio library and serialize it as .musicxml data, which then can be downloaded by the user. 

You can upload your own MusicXML file to process. Processing take place on x (time) and y (harmony) coordinates by rescaling their value. 
Time can be fastened and slowed down (i.e. multiplying each note by a scaler) - accordingly, note values and time signatures are being changed, notes are repacked into bars. Metre can be modified with gradual change. At this case notes are rescaled with corresponding interpolated values between start and end values. 

Harmonic processing is being achieved by changing upper and lower ranges of a given multi-part music and calculating/rescaling each part according to these new ranges.

Exporting MusicXML was the most difficult stage at this project. I write an experimental .musicxml exporter, which does the job not perfectly. Some note within a bar might be missing, though softwares like MuseScore or Logic Pro corrects it perfectly. 

CREDITS:
For rescaling and interpolating I adapted H. Taube’s rescale and interp functions from his [commonmusic](https://commonmusic.sourceforge.net) library.
To encode xml file I utilise [xmlbuilder2](https://github.com/oozcitak/xmlbuilder2) library.
To display music score on web page > [verovio](https://www.verovio.org/index.xhtml) library
To unzip .mxl files > [jszip] (https://stuk.github.io/jszip/)
For midi playback [wildwebmidi](https://github.com/zz85/wild-web-midi)


TODO:
Tuplets. I need to add capabilities to quantize rhythmic values to multiples of 0.2 (quintuplets) and 0.3 (triplets) and serialize them to MusicXML file.

Time-signatures. It needs to be reissued the algorithm, which is responsible for packing notes as bars. 

