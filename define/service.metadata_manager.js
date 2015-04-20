var Promise = require("bluebird");

module.exports =  function(metadata_manager, dispatcher){

	metadata_manager.get_value = function(dispatcher, key){
		return new Promise(function(resolve, reject){
			dispatcher.datastore.find("meta", { "key": key }, {}).then(function(response){
				if(response.length==0){
					resolve(undefined);
				}else{
					resolve(response[0].value);
				}
			});			
		})
	}
	
	metadata_manager.has_key = function(dispatcher, key){
		return new Promise(function(resolve, reject){
			dispatcher.datastore.find("meta", { key: key }, {}).then(function(response){
				if(response.length===0){
					resolve(false);
				}else{
					resolve(true);
				}
			});			
		});
	}

	metadata_manager.set_value = function(dispatcher, key, value){
		return new Promise(function(resolve, reject){
			dispatcher.services.metadata_manager.has_key(key, dispatcher).then(function(has){
				function actual_set(){
					dispatcher.datastore.update("meta", { key: key }, {key:key, value: value}).then(function(response){
						if(response.length==0){
							resolve(false);
						}else{
							resolve(true);
						}
					});					
				}
				if(!has){
					dispatcher.datastore.insert("meta", {key: key, value: value}, {}).then(function(data){
						actual_set();
					})
				}else{
					actual_set();
				}
			})			
		})
	}

	metadata_manager.increment_variable = function(dispatcher, key){
		return new Promise(function(resolve, reject){
			dispatcher.services.metadata_manager.get_value(key, dispatcher).then(function(data){
				if(isNaN(data)){
					var new_id=0;
				}else{
					var new_id = data+1;						
				}
				dispatcher.services.metadata_manager.set_value(key, new_id, dispatcher).then(function(dataL){
					resolve(new_id);
				});
			});			
		})
	}
}
