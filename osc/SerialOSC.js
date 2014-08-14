load('OSCMessage.js');
load('Device.js');

function SerialOSC(config) {
  this.device = null;
  this.config = config;
  host.addDatagramPacketObserver(config.host, config.port, doObject(this, function (data) {
    var msg = new OSCMessage();
    msg.parse(data);
    this.receiveOSC(msg);
  }));
  this.sendOSC('/serialosc/notify', this.config.host, this.config.port);
  this.sendOSC('/serialosc/list', this.config.host, this.config.port);
}

SerialOSC.prototype.createOSCMessage = function(args) {
  var msg = new OSCMessage();
  msg.setAddress(args.shift());
  for (var i = 0; i < args.length; i++) {
    msg.addParam(args[i]);
  }
  return msg.build();
};

SerialOSC.prototype.receiveOSC = function (msg) {
  if (msg.address.match(/\/tilt/)) {
    return;
  }
//  println("addr: " + msg.address);
//  println("types: " + msg.types);
//  println("values: " + msg.values);
//  for (var i = 0; i < msg.data.length; i++) {
//    println(i + ": " + msg.data[i]);
//  }
  if (msg.address == '/serialosc/device') {
    this.device = new Device({
      id: msg.values[0],
      type: msg.values[1],
      devicePort: msg.values[2],
      serialosc: this
    });
    return;
  }
  if (msg.address.indexOf('/sys/prefix') != -1) {
    this.device.prefix = msg.values[0];
  }
  if (msg.address.indexOf('/sys/size') != -1) {
    this.device.sizeX = msg.values[0];
    this.device.sizeY = msg.values[1];
  }
  if (msg.address.indexOf(this.device.prefix) != -1) {
    this.device.handleMessage(msg);
  }
};

SerialOSC.prototype.sendOSC = function () {
  var msg = this.createOSCMessage(Array.prototype.slice.call(arguments, 0));
  host.sendDatagramPacket(this.config.serialoscHost, this.config.serialoscPort, msg);
};

SerialOSC.prototype.update = function () {
  if (!this.device || !this.device.prefix) {
    return;
  }
  for (var y = 0; y < 16; y++) {
    for (var x = 0; x < 16; x++) {
      var idx = y * 16 + x;
      if (this.isPlaying[idx] || this.isQueued[idx] || this.isRecording[idx]) {
        var flashState = 0;
        if (this.isPlaying[idx]) {
          if (this.beat == 1) {
            flashState = 1;
          }
        } else {
          if (this.beat == 1 || this.beat == 3) {
            flashState = 1;
          }
        }
        if (this.ledState[idx] != flashState) {
          this.ledState[idx] = flashState;
          this.device.led(x, y, flashState);
        }
        continue;
      }
      if (this.hasContent[idx] && !this.ledState[idx]) {
        this.ledState[idx] = 1;
        this.device.led(x, y, 1);
      }
      if (!this.hasContent[idx] && this.ledState[idx]) {
        this.ledState[idx] = 0;
        this.device.led(x, y, 0);
      }
    }
  }
};