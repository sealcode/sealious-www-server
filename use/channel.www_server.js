module.exports = function(www_server, dispatcher, dependencies){
	var sessionManager = dependencies["service.session_manager"];


	url = "/api/v1/users";

	www_server.route({
		method: "GET",
		path: url,
		handler: function(request, reply){
			var context = www_server.get_context(request);
			dispatcher.users.get_all_users(context)
			.then(function(users){ // wywołanie metody z dispatchera webowego
				reply(users);
			})
		}
		// hanlder GET ma zwrócić dane użytkowników w obiekcie JSONowym
	});

	www_server.route({
		method: "GET",
		path: url + "/{user_id}",
		handler: function(request, reply){
			var context = www_server.get_context(request);
			dispatcher.users.get_user_data(context, request.params.user_id)
				.then(function(user_data){ // wywołanie metody z dispatchera webowego
					reply(user_data);
				})
				.catch(function(error){
					reply(error);
				})

			}
		// hanlder GET ma zwrócić dane konkretnego użytkownika w obiekcie JSONowym
	});


	www_server.route({
		method: "POST",
		path: url,
		handler: function(request, reply){
			var context = www_server.get_context(request);
			dispatcher.users.create_user(context, request.payload.username, request.payload.password)
			.then(function(response){
				reply().redirect("/login.html#registered");
			})
			.catch(function(error){
				reply(error);
			})			
		}
		// handler POST ma stworzyć usera o podanej nazwie i haśle
	});

	www_server.route({
		method: "PUT",
		path: url+"/{user_id}",
		handler: function(request, reply){
			var context = www_server.get_context(request);
			dispatcher.users.update_user_data(context, request.params.user_id, request.payload)
			.then(function(response){
				reply();
			})
		}
	});

	www_server.route({
		method: "DELETE",
		path: url+"/{user_id}",
		handler: function(request, reply){
			var context = www_server.get_context(request);
			dispatcher.users.delete_user(context, request.params.user_id)
			.then(function(user_data){
				reply(user_data);
			})
			.catch(function(error){
				reply(error);
			})
		}
	})

	www_server.route({
		method: "GET",
		path: url+"/me",
		handler: function(request, reply){

			Tutaj powinien być po prostu redirect na id użytkownika


			var context = Sealious.dispatcher.users.get_context(request);
			var user_id = Sealious.dispatcher.users.get_user_id(context.session_id);
			console.log(user_id)
			dispatcher.users.get_user_data(context, user_id)
			.then(function(user_data){
				if(user_data){
					user_data.user_id = user_id;
					reply(user_data);					
				}else{
					reply("You need to be logged in!"); //~
				}
			})
			.catch(function(err){
				reply(err);
			});	
		}
	});

	www_server.route({
		method: "PUT",
		path: url+"/me",
		handler: function(request, reply){
			var context = www_server.get_context(request);
			dispatcher.users.update_user_data(context, user_id, request.payload)
			.then(function(){
				reply("ok!");
			})
			
		}	
	})

	www_server.route({
		method: "POST",
		path: "/login",
		handler: function(request, reply) {
			var context = www_server.get_context(request);
			Sealious.Dispatcher.users.login_and_start_session(context, request.payload.username, request.payload.password)
			.then(function(session_id){
				if(request.payload.redirect_success){
					reply().state('SealiousSession', session_id).redirect(request.payload.redirect_success);
				}else{
					reply("http_session: Logged in!").state('SealiousSession', session_id);
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
			www_server.kill_session(context, request.state.SealiousSession);
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

}