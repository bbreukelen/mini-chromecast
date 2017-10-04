var castv2Cli = require('castv2-client');
var inherits = require('util').inherits;
var Application = castv2Cli.Application;
var RequestResponseController = castv2Cli.RequestResponseController;

var Api = function(client, session) {
  var that = this;
  Application.apply(this, arguments);
  this.reqres = this.createController(RequestResponseController,
    'urn:x-cast:com.google.cast.media');

  var onMessage = function(response, broadcast) {
    if (response.type !== 'MEDIA_STATUS' ||
        !broadcast ||
        !response.status ||
        !response.status.length ||
        !response.status[0]) {
      return;
    }

    var status = response.status[0];
    that.currentSession = status;
    that.emit(status.playerState.toLowerCase(), status);
    that.emit('status', status);
  };

  var onClose = function() {
    that.reqres.removeListener('message', onMessage);
    that.reqres.removeListener('close', onClose);
    that.removeListener('close', onClose);
    if (that.client) {
      that.client.removeListener('close', onClose);
    }
    that.emit('closed');
  };

  this.reqres.on('message', onMessage);
  this.reqres.on('close', onClose);
  this.client.on('close', onClose);
  this.on('close', onClose);
};

Api.APP_ID = 'CC1AD845';

inherits(Api, Application);

Api.prototype.getStatus = function(cb) {
  var that = this;
  this.reqres.request({ type: 'GET_STATUS' },
    function(err, response) {
      if(err) return callback(err);
      var status = response.status[0];
      that.currentSession = status;
      cb(null, status);
    }
  );
};

Api.prototype.updateStatus = function(cb) {
  var that = this;
  cb = cb || function(){};
  this.getStatus(function(err, status) {
    if (status) {
      that.emit(status.playerState.toLowerCase(), status);
      that.emit('status', status);
    }
    cb(err, status);
  });
};

Api.prototype.getCurrentSession = function(cb) {
  if (this.currentSession) return cb(null, this.currentSession);
  this.getStatus(function(err, status) {
    if (err) return cb(err);
    cb(null, status);
  });
};

Api.prototype.sessionRequest = function(data, cb) {
  var that = this;
  cb = cb || function(){};
  this.getCurrentSession(function(err, session) {
    if (err) return cb(err);
    if (!session) return cb(new Error('session not found'));
    data.mediaSessionId = session.mediaSessionId;
    that.reqres.request(data,
      function(err, response) {
        if(err) return cb(err);
        cb(null, response.status[0]);
      }
    );
  });
};


Api.prototype.play = function(cb) {
  this.sessionRequest({ type: 'PLAY' }, cb);
};

Api.prototype.pause = function(cb) {
  this.sessionRequest({ type: 'PAUSE' }, cb);
};

Api.prototype.stop = function(cb) {
  this.sessionRequest({ type: 'STOP' }, cb);
};

module.exports = Api;
