describe('TweLiteSerial', function () {
  it('converts number to hex-string', function () {
    var value;
    value = TweLiteSerial.hexString(0xf);
    chai.expect(value).to.equal('0F');

    value = TweLiteSerial.hexString(0xff);
    chai.expect(value).to.equal('FF');

    value = TweLiteSerial.hexString(0xff, 2);
    chai.expect(value).to.equal('00FF');
  });

  it('constructs command line', function () {
    var line = ':7880010000FFFFFFFFFFFFFFFFX';
    var data = {
      deviceID: 0x78, // all child devices
      command:  0x80, // send
      version: 0x01,
      digital: 0x00,
      digitalChanged: 0x00,
      pwm1: 0xFFFF,
      pwm2: 0xFFFF,
      pwm3: 0xFFFF,
      pwm4: 0xFFFF,
      checkusm: -1 // don't use checksum
    };
    var message = new window.TweLiteSerial.Message(data);
    chai.expect(message.getLine()).to.equal(line);
  });

  it('sets digital values', function () {
    var line = ':7880010000FFFFFFFFFFFFFFFF0D';
    var message = new window.TweLiteSerial.Message(line);
    var digitalInputs;

    digitalInputs = [1, 0, 1, 0];
    message.setDigital(digitalInputs);
    chai.expect(message.data.digital).to.equal('05'); // 0101
    // chai.expect(message.data.digitalChanged).to.equal('05'); // 0101
  });

  it('parse command line', function () {
    var line = ':78811501AE81003AB57859F1000C001D0000FFFFFFFFFFED';
    var data = window.TweLiteSerial.parseReceivedLine(line);
    chai.expect(data.deviceID).to.equal(0x78);
    chai.expect(data.command).to.equal(0x81);
    chai.expect(data.packetID).to.equal(0x15);
    chai.expect(data.version).to.equal(0x01);
    chai.expect(data.lqi).to.equal(0xAE);
    chai.expect(data.uniqueID).to.equal(0x81003AB5);
    chai.expect(data.receiverID).to.equal(0x78);
    chai.expect(data.timestamp).to.equal(0x59F1);
    chai.expect(data.relayed).to.equal(0x00);
    chai.expect(data.voltage).to.equal(0x0C00);
    chai.expect(data.unused).to.equal(0x1D);
    chai.expect(data.digital).to.equal(0x00);
    chai.expect(data.digitalChanged).to.equal(0x00);
    chai.expect(data.analog).to.equal(0xFFFFFFFF);
    chai.expect(data.analogCorrection).to.equal(0xFF);
    chai.expect(data.checksum).to.equal(0xED);
  });
});
