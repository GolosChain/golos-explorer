let golosJsVersion = '0.7.0';
let $nodeAddress = document.getElementById('node-address');
let $nodeAddressInput = $nodeAddress.querySelector('.form-control[name="node-address"]');

if (localStorage && localStorage.nodeAddress) $nodeAddressInput.value = localStorage.nodeAddress;
let nodeAddress = $nodeAddressInput.value;

let getBlockchainVersion = (nodeAddress, callback) => {
	let socket = new WebSocket(nodeAddress);
	socket.onopen = (event) => {
		socket.send(JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			method: 'call',
			params: ['database_api', 'get_config', [0], ]
		}));
		socket.onmessage = (raw) => {
			let data = JSON.parse(raw.data);
			socket.close();
			callback(null, data.result);
		};
	};
	socket.onerror = (event) => {
		console.error('onerror', event);
		callback(event.code, null);
	}
};

getBlockchainVersion(nodeAddress, (err, result) => {
	if (result && parseFloat(result.STEEMIT_BLOCKCHAIN_VERSION) < 0.18) golosJsVersion = '0.6.3';
	loadGolosJsLib();
});

let loadGolosJsLib = () => {
	let golosJsLib = document.createElement('script');
	golosJsLib.src = `https://cdn.jsdelivr.net/npm/golos-js@${golosJsVersion}/dist/golos.min.js`;
	golosJsLib.onload = () => {
		let appLib = document.createElement('script');
		appLib.src = 'app.js?201808231400';
		(document.head || document.documentElement).appendChild(appLib);
	};
	(document.head || document.documentElement).appendChild(golosJsLib);
};