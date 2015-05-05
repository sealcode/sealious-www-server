module.exports = function(www_server, dispatcher, dependencies) {
    var sessionManager = dependencies["service.session_manager"];


    url = "/api/v1/users";

    www_server.route({
        method: "GET",
        path: url,
        handler: function(request, reply) {
                dispatcher.users.get_all_users()
                    .then(function(users) { // wywołanie metody z dispatchera webowego
                        reply(users);
                    })
            }
            // hanlder GET ma zwrócić dane użytkowników w obiekcie JSONowym
    });

    www_server.route({
        method: "GET",
        path: url + "/{user_id}",
        handler: function(request, reply) {
                dispatcher.users.get_user_data(request.params.user_id)
                    .then(function(user_data) { // wywołanie metody z dispatchera webowego
                        reply(user_data);
                    })
                    .catch(function(error) {
                        reply(error);
                    })

            }
            // hanlder GET ma zwrócić dane konkretnego użytkownika w obiekcie JSONowym
    });


    www_server.route({
        method: "POST",
        path: url,
        handler: function(request, reply) {
                dispatcher.users.create_user(request.payload.username, request.payload.password)
                    .then(function(response) {
                        reply().redirect("/login.html#registered");
                    })
                    .catch(function(error) {
                        reply(error);
                    })
            }
            // handler POST ma stworzyć usera o podanej nazwie i haśle
    });

    www_server.route({
        method: "PUT",
        path: url + "/{user_id}",
        handler: function(request, reply) {
            dispatcher.users.update_user_data(request.params.user_id, request.payload)
                .then(function(response) {
                    reply();
                })
        }
    });

    www_server.route({
        method: "DELETE",
        path: url + "/{user_id}",
        handler: function(request, reply) {
            dispatcher.users.delete_user(request.params.user_id)
                .then(function(user_data) {
                    reply(user_data);
                })
                .catch(function(error) {
                    reply(error);
                })
        }
    })

    www_server.route({
        method: "GET",
        path: url + "/me",
        handler: function(request, reply) {
            var session_id = request.state.SealiousSession;
            var user_id = www_server.get_user_id(session_id);
            if (user_id === false) {
                var error = new Sealious.Errors.UnauthorizedRequest("You need to be logged in!")
                reply(error);
            } else {
                dispatcher.users.get_user_data(user_id)
                    .then(function(user_data) {
                        if (user_data) {
                            user_data.user_id = user_id;
                            reply(user_data);
                        } else {
                            reply("You need to be logged in!"); //~
                        }
                    })
                    .catch(function(err) {
                        reply(err);
                    });
            }
        }
    });

    www_server.route({
        method: "PUT",
        path: url + "/me",
        handler: function(request, reply) {
            var session_id = request.state.SealiousSession;
            var user_id = www_server.get_user_id(session_id);
            if (user_id === false) {
                var error = new Sealious.Errors.UnauthorizedRequest("You need to be logged in!")
                reply(error);
            } else {
                dispatcher.users.update_user_data(user_id, request.payload)
                    .then(function() {
                        reply("ok!");
                    })
            }
        }
    })

    www_server.route({
        method: "POST",
        path: "/login",
        handler: function(request, reply) {
            dispatcher.users.password_match(request.payload.username, request.payload.password)
                .then(function(user_id) {
                    if (user_id !== false) {
                        var sessionId = www_server.new_session(user_id);
                        if (request.payload.redirect_success) {
                            reply().state('SealiousSession', sessionId).redirect(request.payload.redirect_success);
                        } else {
                            reply("http_session: Logged in!").state('SealiousSession', sessionId);
                        }
                    }
                })
                .catch(function(error) {
                    reply(error);
                })
        }
    });

    www_server.route({
        method: "POST",
        path: "/logout",
        handler: function(request, reply) {
            www_server.kill_session(request.state.SealiousSession);
            reply().redirect("/login.html");
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


    www_server.route({
        method: "POST",
        path: "/api/v1/files",
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: true
            },
            handler: function(request, reply) w{
                dispatcher.files.save_file(request)
                    .then(function(response) {
                        reply();
                    });
            }
        }
    });

}
