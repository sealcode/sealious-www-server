var sha1 = require("sha1");
module.exports = function(www_server, dispatcher, dependencies){
    var http_channel = dependencies["channel.http"];

    var session_id_to_user_id = {};
    //póki co hashe sesji sa trzymane tylko w RAMie. Być może trzeba będzie je trzymac w pliku (albo w plikach!) na dysku.

    www_server.default_configuration = {
        port: 80
    }

    www_server.server = http_channel.new_server();
    www_server.server.connection({port: www_server.configuration.port,  routes: { cors: true }})
    
    www_server.start = function(){
        www_server.server.start(function(err){
            Sealious.Logger.info('SERVER RUNNING: '+www_server.server.info.uri+"\n");
        })
    }

    www_server.get_context = function(request){
        var d = new Date();
        var timestamp = d.getTime();
        var ip = request.info.remoteAddress;
        var user_id = www_server.get_user_id(request.state.SealiousSession);
        return new Sealious.Context(timestamp, ip, user_id);
    }

    function custom_reply_function(original_reply_function, request_details, obj){
        var ret;
        if(obj==undefined){
            obj={};
        };
        if(obj.is_sealious_error){
            var res = Sealious.Response.fromError(obj);
            Sealious.Logger.error(request_details.method+" "+request_details.path+" failed - "+obj.status_message);
            ret = original_reply_function(res).code(obj.http_code);
        }else if(obj instanceof Error){
            Sealious.Logger.error(obj);
            var res = Sealious.Response.fromError(Sealious.Errors.Error("Internal server error"));
            ret = original_reply_function(res);
        }else{
            Sealious.Logger.info(request_details.method+" "+request_details.path+" - success!");
            ret = original_reply_function(obj);
        }
        return ret;
    }

    function process_request(old_request){
        var context = www_server.get_context(old_request);
        if(old_request.mime=="multipart/form-data"){
            for(var i in old_request.payload){
                if(old_request.payload[i].readable){
                    //this means this attribute is a file
                    var filename = old_request.payload[i].hapi.filename;
                    var data = old_request.payload[i]._data;
                    old_request.payload[i] = new Sealious.File(context, filename, data);
                }else if(old_request.payload[i] instanceof Array){
                    for(var j in old_request.payload[i]){
                        var filename = old_request.payload[i][j].hapi.filename;
                        var data = old_request.payload[i][j]._data;
                        old_request.payload[i][j] = new Sealious.File(context, filename, data);
                    }
                }
            }
        }
        return old_request;
    }

    www_server.route = function(){
        var original_handler = arguments[0].handler || arguments[0].config.handler;
        if(original_handler && typeof original_handler=="function"){
            var new_handler = function(request, reply){
                var request_details = {
                    method: request.method.toUpperCase(),
                    path: request.path,
                    _request_object: request
                };
                var new_reply = custom_reply_function.bind(custom_reply_function, reply, request_details);
                var new_request = process_request(request);
                original_handler(new_request, new_reply);
            }
            if(arguments[0].handler) arguments[0].handler = new_handler; else arguments[0].config.handler = new_handler;
        }
        www_server.server.route.apply(this.server, arguments);
    }


    www_server.static_route = function(path, url) {        
        this.server.route({ 
            method: 'GET',
            path: url + '/{param*}',
            handler: {
                directory: {
                    path: path
                }
            }
        });
    }


    function generate_session_id() {
        var seed = Math.random().toString();
        var session_id = sha1(seed);
        return session_id;
    }

    function new_session(user_id) {
        var session_id = generate_session_id();
        session_id_to_user_id[session_id] = user_id;
        return session_id;
    }

    function kill_session(session_id) {
        Sealious.Logger.info("Killing session: ", session_id);
        delete session_id_to_user_id[session_id];
    }

    function get_user_id(session_id) {
        if (session_id_to_user_id[session_id]==undefined) {
            return false;        
        }else{
            return session_id_to_user_id[session_id];
        }
    }

    www_server.generate_session_id = generate_session_id;
    www_server.new_session = new_session;
    www_server.kill_session = kill_session;
    www_server.get_user_id = get_user_id;
}