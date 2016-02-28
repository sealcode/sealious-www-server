var Promise = require("bluebird");
var Sealious = require("sealious");
var url = require("url");
var error_to_http_code = require("../error-to-http-code.js");

var urldecode = require("querystring").decode;

var http_channel = Sealious.ChipManager.get_chip("channel", "http");

var www_server = new Sealious.ChipTypes.Channel("www_server");
www_server.server = http_channel.new_server();

Sealious.ConfigManager.set_default_config(
    "chip.channel.www_server", {
        connections: [{
            port: 8080,
            routes: { cors: true }
        }]
    }
);

www_server.routing_table = [];

function add_route(route) {
    try {
        www_server.server.route(route);
    } catch(err) {
        www_server.routing_table.push(route);
    }
}

www_server.start = function(){
    var config = Sealious.ConfigManager.get_config().chip.channel.www_server;
    for (var cnx in config.connections) {
        this.server.connection(config.connections[cnx]);
    }
    for (var rdir in config.redirections) {
        this.server.ext("onRequest", function (request, reply) {
            if (request.connection.info.port === config.redirections[rdir].from) {
                return reply.redirect(url.format({
                    protocol: config.redirections[rdir].protocol,
                    hostname: request.info.hostname,
                    pathname: request.url.path,
                    port: config.redirections[rdir].to
                }));
            }
            reply.continue();
        });
    }
    for (i in this.routing_table) {
        this.server.route(this.routing_table[i]);
    }
	www_server.server.start(function(err){
        if (err) {
            Sealious.Logger.error(err.message);
            process.exit(1);
        } else {
            for (var cnx in config.connections) {
                Sealious.Logger.info(
                    "SERVER RUNNING: " +
                    (typeof config.connections[cnx].tls === "undefined" ? "http" : "https") +
                    "://" +
                    www_server.server.info.host +
                    ":" +
                    config.connections[cnx].port
                );
            }
	    }
    });
}

function process_request(context, old_request){
	request.method = request.method.toUpperCase();
	if(old_request.mime=="multipart/form-data"){
		for(var i in old_request.payload){
			if(old_request.payload[i].readable){
				//this means this attribute is a file
				var filename = old_request.payload[i].hapi.filename;
				if(filename==""){
					old_request.payload[i] = undefined;
				}else{
					var data = old_request.payload[i]._data;
					var mime_type = old_request.payload[i].hapi.headers["content-type"];
					old_request.payload[i] = new Sealious.File(context, filename, data, null, mime_type);
				}
			}else if(old_request.payload[i] instanceof Array){
				for(var j in old_request.payload[i]){
					if(old_request.payload[i][j].readable){
						var filename = old_request.payload[i][j].hapi.filename;
						var data = old_request.payload[i][j]._data;
						var mime_type = old_request.payload[i][j].hapi.headers["content-type"];
						old_request.payload[i][j] = new Sealious.File(context, filename, data, null, mime_type);                            
					}
				}
			}
		}
	}else{
		//it is not multipart
		if(old_request.payload && old_request.payload.readable){
			//it is not multipart BUT it is a stream;
			var data_buffer = old_request.payload.read();
			var data = data_buffer === null? {} : urldecode(data_buffer.toString());
			//assuming the buffer is url_encoded. might be json, though?
			old_request.payload = data;
		}
	}
	return old_request;
}

www_server.get_context = function(request){
	var session_id = request.state.SealiousSession;
	return Sealious.run_action(new Sealious.SuperContext(), ["sessions"], "show", {session_id: session_id})
	.then(function(user_id){
		var d = new Date();
		var timestamp = d.getTime();
		var ip = request.info.remoteAddress;
		return new Sealious.Context(timestamp, ip, user_id);
	})
}

function custom_handler(handler, request, reply){
	var context;
	return www_server.get_context(request)
	.then(function(){
		var processed_request = process_request(context, request);
		return handler(context, processed_request);
	})
	.then(function(result){
		var rep = reply(result);
		if(result instanceof Sealious.Responses.NewSession){
			var one_day = 1000 * 60 * 60 * 24;
			rep.state('SealiousSession', session_id, {ttl: one_day});
		}
	})
	.catch(function(error){
		Sealious.Logger.error(error);
		var rep;
		if(error.is_user_fault){
			rep = reply(error);
		}else{
			rep = reply(new Sealious.Errors.ServerError("Server error."))
		}
		var error_code = error_to_http_code(error);
		rep.code(error_code);
	});
}

www_server.route = function(){

	var handler = arguments[0].handler || arguments[0].config.handler;

	var new_handler = custom_handler.bind(custom_handler, handler);

	if(arguments[0].handler) {
		arguments[0].handler = new_handler;
	} else {
		arguments[0].config.handler = new_handler;
	}

    add_route(arguments[0]);
}

www_server.unmanaged_route = add_route;

www_server.static_route = function(path, url) {        
    var route = { 
		method: 'GET',
		path: url + '/{param*}',
		handler: {
			directory: {
				path: path
			}
		}
	};
    add_route(route);
}
