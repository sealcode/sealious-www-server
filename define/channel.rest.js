module.exports = function(channel, dispatcher, dependencies){

	//console.log("\nREST dependencies:", dependencies);

	var www_server = dependencies["channel.www_server"];

	channel.add_path = function(url, resource_type_name){

		www_server.route({
			method: "GET",
			path: url+"/signature",
			handler: function(request, reply){
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
				dispatcher.resources.list_by_type(resource_type_name)
				.then(function(resources){ // wywołanie metody z dispatchera webowego
					//console.log("GOT RESPONSE FROM DISPATCHER");
					//var resources_arr = resources.map(function(resource){return resource.getData()});
					reply(resources);
				});
			}
			// hanlder GET ma wypisać wszystkie zasoby o podanym typie
		});

		www_server.route({
			method: "POST",
			path: url,
			handler: function(request, reply){
				var id_by_session = www_server.get_user_id(request.state.SealiousSession);
				console.log("id_by_session:", id_by_session);
				if(id_by_session!==false){
					dispatcher.resources.create(resource_type_name, request.payload, id_by_session)
					.then(function(response){
						reply(response).code(201);
					})
					.catch(function(error) {
						console.log("caught error:", error, error.stack);
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
				dispatcher.resources.delete(resource_type_name, request.params.id).then(function(response){
					reply().code(204);
				});
			}
		});

		www_server.route({
			method: "GET",
			path: url+"/{id}",
			handler: function(request, reply){
				//console.log("rest.js get_resource_by_id", request.params.id);
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
				//console.log("rest.js get_resource_by_id", request.params.id, request.payload.access_mode, request.payload.access_mode_args);
				dispatcher.resources.edit_resource_access_mode(request.params.id, request.payload.access_mode, request.payload.access_mode_args).then(function(response){
					reply(response);
				});
			}
		});

		www_server.route({
			method: "PUT",
			path: url+"/{id}",
			handler: function(request, reply){
				//console.log("rest.js get_resource_by_id", request.params.id, request.payload.access_mode, request.payload.access_mode_args);
				dispatcher.resources.update_resource(request.params.id, request.payload).then(function(response){
					reply(response);
				});
			}
		});


		www_server.route({
			method: "GET",
			path: url+"/{id}/access_mode",
			handler: function(request, reply){
				//console.log("rest.js get_resource_access_mode_by_id");
				dispatcher.resources.get_access_mode(request.params.id).then(function(response){
					reply(response);
				});
			}
		});

		
	}
}
