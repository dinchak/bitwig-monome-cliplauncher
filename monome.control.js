loadAPI(1);

load('Framework4Bitwig/helper/ClassLoader.js');
load('osc/SerialOSC.js');

host.defineController ("monome", "cliplauncher", "1.0", "431000e0-2322-11e4-8c21-0800200c9a66");
host.defineMidiPorts(1, 0);

var SERIALOSC_HOST = '127.0.0.1';
var SERIALOSC_PORT = 12002;
var RECEIVE_HOST = '127.0.0.1';
var RECEIVE_PORT = 7198;

var serialosc;

function init() {
  serialosc = new SerialOSC({
    serialoscHost: SERIALOSC_HOST,
    serialoscPort: SERIALOSC_PORT,
    host: RECEIVE_HOST,
    port: RECEIVE_PORT
  });
  serialosc.trackbank = host.createMainTrackBankSection(16, 0, 16);
  serialosc.hasContent = initArray(0, 256);
  serialosc.isPlaying = initArray(0, 256);
  serialosc.isRecording = initArray(0, 256);
  serialosc.isQueued = initArray(0, 256);
  serialosc.ledState = initArray(0, 256);
  for (var i = 0; i < 16; i++) {
    var track = serialosc.trackbank.getTrack(i);
    var clipLauncher = track.getClipLauncher();
    clipLauncher.addHasContentObserver(getGridObserverFunction(i, serialosc.hasContent));
    clipLauncher.addIsPlayingObserver(getGridObserverFunction(i, serialosc.isPlaying));
    clipLauncher.addIsRecordingObserver(getGridObserverFunction(i, serialosc.isRecording));
    clipLauncher.addIsQueuedObserver(getGridObserverFunction(i, serialosc.isQueued));
  }
  var transport = host.createTransportSection();
  transport.getPosition().addTimeObserver(":", 4, 1, 1, 2, function (time) {
    var pieces = time.split(':');
    serialosc.beat = pieces[2];
  });
}

function flush() {
  serialosc.update();
}

function getGridObserverFunction(track, varToStore) {
  return function (scene, value) {
    varToStore[scene * 16 + track] = value;
  }
}