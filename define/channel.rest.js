module.exports = function(channel, dispatcher, dependencies){

	var www_server = dependencies["channel.www_server"];

	channel.add_path = function(url, resource_type_name){

		www_server.route({
			method: "GET",
			path: url+"/signature",
			handler: function(request, reply){
				Sealious.Logger.info("GET "+url+"/signature");
				dispatcher.resources.get_resource_type_signature(resource_type_name)
				.then(function(signature){
					reply(signature);
				}).catch(function(err){
					reply(err);
				})
			}
			// hanlder GET ma wypisać wszystkie zasoby o podanym typie
		});

		www_server.route({
			method: "GET",
			path: url,
			handler: function(request, reply){
				Sealious.Logger.info("GET "+url);
				dispatcher.resources.list_by_type(resource_type_name)
				.then(function(resources){ // wywołanie metody z dispatchera webowego
					reply(resources);
				});
			}
			// hanlder GET ma wypisać wszystkie zasoby o podanym typie
		});

		www_server.route({
			method: "POST",
			path: url,
			handler: function(request, reply){
				Sealious.Logger.info("POST ", url);
				var id_by_session = www_server.get_user_id(request.state.SealiousSession);
				if(id_by_session!==false){
					dispatcher.resources.create(resource_type_name, request.payload, id_by_session)
					.then(function(response){
						reply(response).code(201);
					})
					.catch(function(error) {
						reply(error);
					});
				} else {
					reply(new Sealious.Errors.InvalidCredentials("You are not logged in"));
				}
			}
			// handler POST ma stworzyć zasób z podanymi wartościami
		});

		www_server.route({
			method: "DELETE",
			path: url+"/{id}",
			handler: function(request, reply){
				Sealious.Logger.info("DELETE "+url+"/{id}");
				dispatcher.resources.delete(resource_type_name, request.params.id).then(function(response){
					reply().code(204);
				});
			}
		});

		www_server.route({
			method: "GET",
			path: url+"/{id}",
			handler: function(request, reply){
				Sealious.Logger.info("GET "+url+"/{id}");
				dispatcher.resources.get_by_id(request.params.id).then(function(response){
					reply(response);
				}).catch(function(error){
					reply().code(409);
				});
			}
		});

		www_server.route({
			method: "PUT",
			path: url+"/{id}/access_mode",
			handler: function(request, reply){
				Sealious.Logger.info("PUT "+url+"/{id}/access_mode");
				dispatcher.resources.edit_resource_access_mode(request.params.id, request.payload.access_mode, request.payload.access_mode_args).then(function(response){
					reply(response);
				});
			}
		});

		www_server.route({
			method: "PUT",
			path: url+"/{id}",
			handler: function(request, reply){
				Sealious.Logger.info("PUT "+url+"/{id}");
				dispatcher.resources.update_resource(request.params.id, request.payload).then(function(response){
					reply(response);
				});
			}
		});


		www_server.route({
			method: "GET",
			path: url+"/{id}/access_mode",
			handler: function(request, reply){
				Sealious.Logger.info("GET "+url+"/{id}/access_mode");
				dispatcher.resources.get_access_mode(request.params.id).then(function(response){
					reply(response);
				});
			}
		});

		
	}
}
