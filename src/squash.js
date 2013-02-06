var request = require('request');
var async = require('async');

var oldPrepareStack = Error.prepareStackTrace;
Error.prepareStackTrace = function (error, stack) {
  error.__stackArray = stack;
  return oldPrepareStack(error, stack);
};

/*Error.prepareStackTrace = function (error, stack) {
  return stack;
};
*/

var  __hasProp = {}.hasOwnProperty, __slice = [].slice;
var ISODateString, any, buildBacktrace, mergeBang;

var Squash = function() {};

Squash.prototype.configure = function(options) {
  var key, value, _results;
  this.options || (this.options = {
    disabled: false,
    notifyPath: '/api/1.0/notify',
    transmitTimeout: 15000,
    ignoredExceptionClasses: [],
    ignoredExceptionMessages: {}
  });
  _results = [];
  for (key in options) {
    if (!__hasProp.call(options, key)) continue;
    value = options[key];
    _results.push(this.options[key] = value);
  }
  return _results;
};

Squash.prototype.notify = function(error) {
  throw error;
};

Squash.prototype.report = function(error) {
  var self = this;
  var body, fields, matches, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
  try {

    if ((_ref = this.options) != null ? _ref.disabled : void 0) {
      return false;
    }
    if (!((_ref1 = this.options) != null ? _ref1.APIKey : void 0) || !((_ref2 = this.options) != null ? _ref2.environment : void 0) || !((_ref3 = this.options) != null ? _ref3.revision : void 0) || !((_ref4 = this.options) != null ? _ref4.APIHost : void 0)) {
      console.error("Missing required Squash configuration keys");
      return false;
    }
    if (this.shouldIgnoreError(error)) {
      return false;
    }
    if (!error.stack) {
      return false;
    }
    fields = arguments[1] || new Object();
    fields.api_key = this.options.APIKey;
    fields.environment = this.options.environment;
    fields.client = "node";
    fields.revision = this.options.revision;
    fields.class_name = error.type || error.name;
    if (!error.name && (matches = error.message.match(/^(Uncaught )?(\w+): (.+)/))) {
      fields.class_name = matches[2];
      fields.message = matches[3];
    } else {
      fields.message = error.message;
    }
    if ((_ref5 = fields.class_name) == null) {
      fields.class_name = 'Error';
    }

    buildBacktrace(error.stack, function(err, backtraces) {
  	  fields.backtraces = backtraces;
      fields.capture_method = error.mode;
      fields.occurred_at = ISODateString(new Date());
      body = fields;
      self.HTTPTransmit(self.options.APIHost + self.options.notifyPath, [['Content-Type', 'application/json']], body);
      return true;
    });

  } catch (internal_error) {
    console.error("Error while trying to notify Squash:", internal_error.stack);
    return console.error("-- original error:", error);
  }
};

Squash.prototype.addUserData = function(data, block) {
  var _ref;
  try {
    return block();
  } catch (err) {
    if ((_ref = err._squash_user_data) == null) {
      err._squash_user_data = {};
    }
    mergeBang(err._squash_user_data, data);
    throw err;
  }
};

Squash.prototype.addingUserData = function(data, block) {
  return function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return SquashJavascript.instance().addUserData(data, function() {
      return block.apply(null, args);
    });
  };
};

Squash.prototype.ignoreExceptions = function() {
  var block, exceptions, _i;
  exceptions = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), block = arguments[_i++];
  try {
    return block();
  } catch (err) {
    err._squash_ignored_exceptions = (err._squash_ignored_exceptions || []).concat(exceptions);
    throw err;
  }
};

Squash.prototype.ignoringExceptions = function() {
  var block, exceptions, _i;
  exceptions = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), block = arguments[_i++];
  return function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = SquashJavascript.instance()).ignoreExceptions.apply(_ref, __slice.call(exceptions).concat([function() {
      return block.apply(null, args);
    }]));
  };
};

Squash.prototype.HTTPTransmit = function(url, headers, postbody) {
  var header, _i, _len;
  var opt = {url: url,headers : headers, body: postbody, json: true};

  var req = request.post(opt, function (err, res, body) {
    return req;
  });

};

Squash.prototype.shouldIgnoreError = function(error) {
  var ignored_classes;
  ignored_classes = this.options.ignoredExceptionClasses.concat(error._squash_ignored_exceptions || []);
  if (any(ignored_classes, function(klass) {
    return error.name === klass;
  })) {
    return true;
  }
  return any(this.options.ignoredExceptionMessages, function(class_name, messages) {
    if (error.name === class_name) {
      return any(messages, function(message) {
        return error.message.match(message);
      });
    } else {
      return false;
    }
  });
};

var buildBacktrace = function(stack, callback) {
  var backtraces, context, line, _i, _len;
  backtraces = [];

  async.forEach(stack, function(line, next) {
    context = line.getEvalOrigin();
    if (context && any(context, function(cline) {
      return cline.length > 200;
    })) {
      context = null;
    }

    backtraces.push({
      file: line.getFileName(),
      line: line.getLineNumber(),
      column: line.getColumnNumber(),
      symbol: line.getFunctionName(),
      context: context
    });

    next();
  }, function (err) {
    callback(null, [
      {
        name: "Active Thread",
        faulted: true,
        backtrace: backtraces
      }
    ]);
  });
};

var ISODateString = function(d) {
  var pad;
  pad = function(n) {
    if (n < 10) {
      return '0' + n;
    } else {
      return n;
    }
  };
  return "" + (d.getUTCFullYear()) + "-" + (pad(d.getUTCMonth() + 1)) + "-" + (pad(d.getUTCDate())) + "T" + (pad(d.getUTCHours())) + ":" + (pad(d.getUTCMinutes())) + ":" + (pad(d.getUTCSeconds())) + "Z";
};

var any = function(obj, condition) {
  var element, key, value, _i, _len;
  if (obj instanceof Array) {
    for (_i = 0, _len = obj.length; _i < _len; _i++) {
      element = obj[_i];
      if (condition(element)) {
        return true;
      }
    }
  } else {
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      value = obj[key];
      if (condition(key, value)) {
        return true;
      }
    }
  }
  return false;
};

var mergeBang = function(modified, constant) {
  var key, value, _results;
  _results = [];
  for (key in constant) {
    if (!__hasProp.call(constant, key)) continue;
    value = constant[key];
    _results.push(modified[key] = value);
  }
  return _results;
};


module.exports.Squash = Squash;
