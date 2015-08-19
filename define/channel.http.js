var Sealious = require("sealious");
var Hapi = require("hapi");

var servers = [];

var http_channel = new Sealious.ChipTypes.Channel("http")

http_channel.new_server = function(options){
	return new Hapi.Server(options);
}

http_channel.get_server_by_id = function(id){
	if(servers[id]){
		return servers[id];
	}else{
		return null;
	}
}
