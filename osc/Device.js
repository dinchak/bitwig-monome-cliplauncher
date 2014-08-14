function Device(config) {
  this.config = config;
  this.sendOSC('/sys/host', config.serialosc.config.host);
  this.sendOSC('/sys/port', config.serialosc.config.port);
  this.sendOSC('/sys/info', config.serialosc.config.host, config.serialosc.config.port);
}

Device.prototype.handleMessage = function (msg) {
  if (msg.address.indexOf('/press')) {
    if (msg.values[2] == 1) {
      this.config.serialosc.trackbank.getTrack(msg.values[0]).getClipLauncher().launch(msg.values[1]);
    }
  }
};

Device.prototype.led = function (x, y, s) {
  this.sendOSC(this.prefix + '/grid/led/set', x, y, s);
};

Device.prototype.sendOSC = function () {
  var msg = this.config.serialosc.createOSCMessage(Array.prototype.slice.call(arguments, 0));
  host.sendDatagramPacket(this.config.serialosc.config.serialoscHost, this.config.devicePort, msg);
};