var Sealious = require("sealious");
var www_server = Sealious.ChipManager.get_chip("channel", "www_server");

Sealious.ConfigManager.set_default_config("session_timeout", {
    timeout: null // session time-life
})

url = "/api/v1/users";


www_server.route({
    method: "POST",
    path: "/login",
    handler: function(request, reply) {
        var session_timeout = Sealious.ConfigManager.get_config().session_timeout.timeout;
        var context = www_server.get_context(request);
        Sealious.UserManager.password_match(context, request.payload.username, request.payload.password)
        .then(function(user_id){
            var session_id = www_server.new_session(user_id);
            if(request.payload.redirect_success){
                reply().state('SealiousSession', session_id, {ttl: session_timeout}).redirect(request.payload.redirect_success);
            }else{
                reply("http_session: Logged in!").state('SealiousSession', session_id, {ttl: session_timeout});
            }
        })
        .catch(function(error){
            reply(error);
        })
    }
});

www_server.route({
    method: "POST",
    path: "/logout",
    handler: function(request, reply) {
        var context = www_server.get_context(request);
        www_server.kill_session(request.state.SealiousSession);
        var response = new Sealious.Response({}, false, "response", "logged out");
        if(request.payload.redirect_success){
            reply(response).redirect(request.payload.redirect_success);
        }else{
            reply(response);
        }
    }
});

www_server.route({
    method: "GET",
    path: "/api/v1/make_coffee",
    handler: function(request, reply) {
        Sealious.Logger.transports.console.level = "lazyseal";
        Sealious.Logger.lazyseal("Trying to make coffee...");
        Sealious.Logger.lazyseal("Oops, I'm a teapot.");
        Sealious.Logger.transports.console.level = "info";
        reply().code(418);
    }
});

www_server.unmanaged_route({
    method: "GET", 
    path: "/managed-files/{file_id}/{file_name}",
    handler: function(request, reply){
        var context = www_server.get_context(request);
        Sealious.FileManager.find(context, {id: request.params.file_id})
        .then(function(file_info){
            var r = reply.file(file_info[0].path_on_hdd);
            if(file_info[0].mime) r.type(file_info[0].mime);
        })

    }
});
