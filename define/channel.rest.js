module.exports = function(channel, dispatcher, dependencies){

	var www_server = dependencies["channel.www_server"];

	var get_context = www_server.get_context;

	channel.add_path = function(url, resource_type_name){

		www_server.route({
			method: "GET",
			path: url+"/signature",
			handler: function(request, reply, context){
				dispatcher.resources.get_resource_type_signature(resource_type_name)
				.then(reply, reply);
			}
			// hanlder GET ma wypisać wszystkie zasoby o podanym typie
		});

		www_server.route({
			method: "GET",
			path: url,
			handler: function(request, reply){
				var context = get_context(request);
				dispatcher.resources.list_by_type(context, resource_type_name)
				.then(reply, reply);
			}
		});

		www_server.route({
			method: "POST",
			path: url,
			handler: function(request, reply){
				var context = get_context(request);
				dispatcher.resources.create(context, resource_type_name, request.payload)
				.then(function(response){
					reply(response).code(201);
				}, reply)
			}
			// handler POST ma stworzyć zasób z podanymi wartościami
		});

		www_server.route({
			method: "DELETE",
			path: url+"/{id}",
			handler: function(request, reply){
				var context = get_context(request);
				dispatcher.resources.delete(context, resource_type_name, request.params.id).then(function(response){
					reply().code(204);
				}, reply);
			}
		});

		www_server.route({
			method: "GET",
			path: url+"/{id}",
			handler: function(request, reply){
				var context = get_context(request);
				dispatcher.resources.get_by_id(context, request.params.id).then(function(response){
					reply(response);
				}).catch(function(error){
					reply(error);
				});
			}
		});

		www_server.route({
			method: "PUT",
			path: url+"/{id}",
			handler: function(request, reply){
				var context = get_context(request);
				dispatcher.resources.update_resource(context, request.params.id, request.payload).then(function(response){
					reply(response);
				});
			}
		});		
	}
}
