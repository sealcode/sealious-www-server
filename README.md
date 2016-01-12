## How to use configure `sealious-www-server`?
WWW-server configuration allows you to open ports for listening, definin
protocols served on those ports and redirections(useful when you want to
force users to use HTTPS by redirecting them from HTTP). Configuration is
separated into 2 sections: `connections` and `redirections`.

### How `connections` section works?
It's just an array with all connections configurations. All sub-sections should
be objects with properties prepared to be passed directly to [server.connection()](http://hapijs.com/api#serverconnectionoptions) method from HapiJS.
As described in HapiJS docs, passing `tls` object in config causes connection to use TLS/SSL.
You can take a look at example of how to do it in [hello-world](https://github.com/Rayvenden/hello-world/tree/https_example).

### How `redirections` section works?
It's also an array for sub-sections which are being later iterated by
`www_server.start()`. Every sub-section should be an object containing following properties:
* `protocol`
* source redirection port(`from`)
* destination redirection port(`to`)

`www_server.start()` reads this sub-sections and tells server how to handle
connection on each port by calling [server.ext()](http://hapijs.com/api#serverextevent-method-options) from HapiJS.

### How to test HTTPS?
After getting [hello-world](https://github.com/Rayvenden/hello-world/tree/https_example) and [www_server](https://github.com/Sealious/sealious-www-server/tree/trello%23https_support) and launching it(`sudo` isn't needed) following links should get you to HTTPS version of service on 4430 port(HTTP 2 HTTPS redirection is enabled in example):
* https://localhost:4430/
* http://localhost:8080/

Your browser will warn you about insecure certificate, because it's self-signed.
