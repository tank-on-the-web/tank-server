window.addEventListener("load", function() {
  const PORT = 8080;
  var lRange = document.getElementById('left');
  var rRange = document.getElementById('right');
  var lVal = document.getElementById('lval');
  var rVal = document.getElementById('rval');
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
    checkusm: -1
  };
  var message = new window.TweLiteSerial.Message(data);
  var socket;
  var httpd;

  lval.textContent = 0;
  rval.textContent = 0;

  lRange.addEventListener('change', onRangeChanged);
  rRange.addEventListener('change', onRangeChanged);

  connect((newSocket) => {
    socket = newSocket;
  });

  InputReceiver.start(PORT, (input) => {
    if (input.lv && input.rv) {
      onValueChanged(input.lv, input.rv);
    }
  });
  document.getElementById('listening').textContent =
    'Listening on http://' + getIpAddress() + ':' + PORT;

  function onRangeChanged() {
    var lv = lRange.value;
    var rv = rRange.value;
    lVal.textContent = lv;
    rVal.textContent = rv;
    onValueChanged(lv, rv);
  }

	function connect(callback, ip) {
    var addr = (ip || '127.0.0.1');
    var socket = navigator.mozTCPSocket.open(addr, 9943);
    socket.onopen = function () {
      var param = {
        devicename: 'ttyUSB0',
        bitrate: 115200
      };
      console.log('Opened');
      socket.send(JSON.stringify(param));
      setTimeout(() => { callback(socket) }, 0);
    }
    socket.ondata = function (evt) {
      if (typeof evt.data === 'string') {
        // console.log('Received a string: ' + evt.data);
      } else {
        console.log('Received a Uint8Array');
      }
    }
    socket.onerror = function (evt) {
      console.log('Error:' + evt.type + ': ' + data.toString());
    }
  }	

  function onValueChanged(leftValue, rightValue) {
    var lv = makeOutputValues(leftValue);
    var rv = makeOutputValues(rightValue);

    message.setDigital([lv.d1, lv.d2, rv.d1, rv.d2]);
    message.pwm1 = lv.pwm;
    message.pwm4 = rv.pwm;
    var commandLine = message.getLine();
    socket.send(commandLine);    
  }

  function makeOutputValues(value) {
    var d1, d2, pwm;
    if (Math.abs(value) < 10) { // threshold
      d1 = d2 = 0; // free
      pwm = 0xFFFF; // not used
    } else if (value < 0) { // forward
      d1 = 0;
      d2 = 1;
      pwm = value * -11;
    } else { // reverse
      d1 = 1;
      d2 = 0;
      pwm = value * 11;
    }
    if (pwm > 1024) {
      pwm = 1024;
    }
    // reverse digital values (in twe-lite, HI=0, LO=1)
    d1 = d1 ? 0 : 1;
    d2 = d2 ? 0 : 1;
    return { 
      d1: d1,
      d2: d2,
      pwm: pwm
    };
  }

  function getIpAddress() {
    if (navigator.mozWifiManager) {
      var conn = navigator.mozWifiManager.connectionInformation;
      if (conn) {
        return conn.ipAddress;
      }
    }
    return '';
  }
});
