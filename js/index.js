var audioContext = wavesAudio.audioContext; 
var loader = new wavesLoaders.AudioBufferLoader(); // instantiate loader
var containerId = '#controls-container';


//ReverbJs
var wetGain;
var dryGain;

  //setup dry signal node chain
  dryGain = audioContext.createGain();
  dryGain.gain.value  = 0.7;
  //dryGain.connect(audioContext.destination);

//Later we route dryGain through this limiter 
var hardLimiter = audioContext.createDynamicsCompressor();
hardLimiter.threshold.value = 0.0; // this is the pitfall, leave some headroom
hardLimiter.knee.value = 0.0; // brute force
hardLimiter.ratio.value = 20.0; // max compression
hardLimiter.attack.value = 0.005; // 5ms attack
hardLimiter.release.value = 0.050; // 50ms release
hardLimiter.connect(audioContext.destination);

//setup wet signal node chain
reverbjs.extend(audioContext);
// 2) Load the impulse response; upon load, connect it to the audio output.
//var reverbUrl = "http://reverbjs.org/Library/KinoullAisle.m4a";
var reverbUrl = "http://reverbjs.org/Library/AbernyteGrainSilo.m4a";
var reverbNode = audioContext.createReverbFromUrl(reverbUrl, function() {
  //reverbNode.connect(audioContext.destination);
  wetGain = audioContext.createGain();
  wetGain.gain.value  = 0.3;
  dryGain.connect(wetGain);
  wetGain.connect(reverbNode);
  reverbNode.connect(audioContext.destination);
  
  
   
});


/* EQ
*/

        var EQ = [
            {
                f: 32,
                type: 'lowshelf'
            }, {
                f: 64,
                type: 'peaking'
            }, {
                f: 125,
                type: 'peaking'
            }, {
                f: 250,
                type: 'peaking'
            }, {
                f: 500,
                type: 'peaking'
            }, {
                f: 1000,
                type: 'peaking'
            }, {
                f: 2000,
                type: 'peaking'
            }, {
                f: 4000,
                type: 'peaking'
            }, {
                f: 8000,
                type: 'peaking'
            }, {
                f: 16000,
                type: 'highshelf'
            }
        ];

        // Create filters
        var filters = EQ.map(function (band) {
            var filter = audioContext.createBiquadFilter();
            filter.type = band.type;
            filter.gain.value = 0;
            filter.Q.value = 1;
            filter.frequency.value = band.f;
            
          
            new wavesBasicControllers.Slider("Band: " + band.f, -40, 40, 0.010, 0, "sec", 'large', containerId, function(value) {
              filter.gain.value = value;});
          
            return filter;
        });

            filters.reduce(function (prev, curr) {
                prev.connect(curr);
                return curr;
            }, dryGain).connect(audioContext.destination/*hardLimiter*/);


//var audioFile ='https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3';
//var audioFile ='https://rawgit.com/katspaugh/wavesurfer.js/master/example/media/demo.wav';
//var audioFile ="https://rawgit.com/wavesjs/waves-audio/master/examples/assets/drum-loop.wav";
var audioFile = "ableton_loop03.wav";
// load audio file //
loader.load(audioFile).then(function(loaded) {
  // get scheduler and create scheduled granular engine
  var scheduler = wavesAudio.getScheduler();
  var scheduledGranularEngine = new wavesAudio.GranularEngine({
    buffer: loaded
  });
  scheduledGranularEngine.connect(dryGain);

  // create transport with play control and transported granular engine
  var transportedGranularEngine = new wavesAudio.GranularEngine({
    buffer: loaded,
    cyclic: true
  });
  var playControl = new wavesAudio.PlayControl(transportedGranularEngine);
  transportedGranularEngine.connect(dryGain);

  // create GUI elements
  new wavesBasicControllers.Title("Granular Engine in Scheduler", containerId);

  new wavesBasicControllers.Toggle("Enable", false, containerId, function(value) {
    if (value)
      scheduler.add(scheduledGranularEngine);
    else
      scheduler.remove(scheduledGranularEngine);
  });

  new wavesBasicControllers.Slider("Position", 0, 20.6, 0.010, 0, "sec", 'large', containerId, function(value) {
    scheduledGranularEngine.position = value;
  });

  new wavesBasicControllers.Title("Granular Engine with Play Control", containerId);

  new wavesBasicControllers.Toggle("Play", false, containerId, function(value) {
    
scheduledGranularEngine.positionVar = 0.011;
transportedGranularEngine.positionVar = 0.011;

scheduledGranularEngine.periodAbs = 0.015;
transportedGranularEngine.periodAbs = 0.015;

scheduledGranularEngine.durationAbs = 0.11;
transportedGranularEngine.durationAbs = 0.11;

filters[0].gain.value = -10;
filters[1].gain.value = -10;
    
    
    
    if (value)
      playControl.start();
    else
      playControl.stop();
  });

  var speedSlider = new wavesBasicControllers.Slider("Speed", -2, 2, 0.01, 1, "", '', containerId, function(value) {
    playControl.speed = value;
    speedSlider.value = playControl.speed;
 /*   // set pos var to 0 when speed is 1, and increase otherwise
    var newVal = Math.abs( (1-value) * 0.01);
    scheduledGranularEngine.positionVar = newVal;
    transportedGranularEngine.positionVar = newVal;    
    
    var value = Math.abs( (value) ) 
    var durval = (1/value+0.1 )/80 ;
    scheduledGranularEngine.durationAbs = durval;
    transportedGranularEngine.durationAbs = durval;
    console.log(durval);
    
    scheduledGranularEngine.periodAbs = value/80;
    transportedGranularEngine.periodAbs = value/80;*/

    
  });

    var distanceSlider = new wavesBasicControllers.Slider("Distance/Clarity/Reverb", 0, 1, 0.01, 0.3, "", '', containerId, function(value) {
    distanceSlider.value = value;
    
    //inrease reverb when slowing audio down
    wetGain.gain.value  = value;
    dryGain.gain.value  = 1-value;
    
  });
  
  new wavesBasicControllers.Title("Common Parameters", containerId);

  new wavesBasicControllers.Slider("Position Var", 0, 0.200, 0.001, 0.005, "sec", '', containerId, function(value) {
    scheduledGranularEngine.positionVar = value;
    transportedGranularEngine.positionVar = value;
  });

  new wavesBasicControllers.Slider("Period", 0.001, 0.500, 0.001, 0.002, "sec", '', containerId, function(value) {
    scheduledGranularEngine.periodAbs = value;
    transportedGranularEngine.periodAbs = value;
  });

  new wavesBasicControllers.Slider("Duration", 0.010, 0.500, 0.001, 0.020, "sec", '', containerId, function(value) {
    scheduledGranularEngine.durationAbs = value;
    transportedGranularEngine.durationAbs = value;
  });

  new wavesBasicControllers.Slider("Resampling", -2400, 2400, 1, 0, "cent", '', containerId, function(value) {
    scheduledGranularEngine.resampling = value;
    transportedGranularEngine.resampling = value;
  });

  new wavesBasicControllers.Slider("Resampling Var", 0, 1200, 1, 0, "cent", '', containerId, function(value) {
    scheduledGranularEngine.resamplingVar = value;
    transportedGranularEngine.resamplingVar = value;
  });

});
