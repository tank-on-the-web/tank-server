(function () {
	'use strict';

	var InputReceiver = {
		start: function (port, onInput) {
	    var server = new HttpServer();
	    server.get("/put", function onPutData(req, res, oncomplete) {
	      var qs = req._queryString;
	      console.log('/put?' + qs);
	      if (qs && qs.length > 0) {
	        var queryObj = {};
	        var queryValues = qs.split('&');
	        queryValues.forEach(function(q) {
	          var [type, value] = q.split('=');
	          queryObj[type] = value;
	        });
	        onInput(queryObj);

	        res.write('ok\r\n');
	      } else {
	        res.write('no query\r\n');
	      }
	      oncomplete();
	    });
	    server.start(port);
	    this.server = server;
	  }
	};

	window.InputReceiver = InputReceiver;
})();

