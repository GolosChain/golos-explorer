swal.setDefaults({
	buttonsStyling: true,
	confirmButtonText: '<span class="icon-checkmark"></span> Ok',
	confirmButtonColor: '#5cb85c',
	cancelButtonText: '<span class="icon-cross"></span> Cancel',
	cancelButtonColor: '#d9534f',
});

golos.api.setWebSocket('wss://server-ws.golos.io');

var getLastBlock = function(callback) {
	
	golos.api.getDynamicGlobalProperties(function(err, properties) {
		//console.log(err, 'getDynamicGlobalProperties: ', properties);

		golos.api.getBlock(properties.last_irreversible_block_num, function(err, block) {
			//console.log(err, 'getBlock: ', block)
			callback(properties, block);
		});

	});
	
};

var blocksIds = {};

var getLastBlockInterval = setInterval(function() {
	
	getLastBlock(function(properties, block) {
		//console.log(properties);
		//console.log(block);
		console.log('Current Height', properties.head_block_number);
		console.log('Reversable blocks awaiting concensus', properties.head_block_number - properties.last_irreversible_block_num,);
		if ( ! blocksIds[properties.last_irreversible_block_num]) {
			blocksIds[properties.last_irreversible_block_num] = true;
			let operations = {};
			let operationsCount = 0;
			block.transactions.forEach(function(transaction) {
				transaction.operations.forEach(function(operation) {
					if ( ! operations[operation[0]]) operations[operation[0]] = 0;
					operations[operation[0]]++;
					operationsCount++;
				});
			});
			let operationsStr = '';
			for (var key in operations) {
				operationsStr += key + ':' + operations[key] + '; '; 
			}
			console.log(properties.last_irreversible_block_num, block.timestamp, operationsCount, operationsStr);
		}
	});

}, 1000);

var getTransaction = function() {
	
	let trx = {
		ref_block_num: 49191,
		ref_block_prefix: 2024493436
	};

	golos.api.getTransactionHex(trx, function(err, transaction) {

		console.log(err, 'getTransactionHex: ' + transaction);

		let transaction_id = 'e3aa587c665c222061694ece21deb1910c35f75b';
		golos.api.getTransaction(transaction_id, function(err, result) {
			console.log(err, 'getTransaction: ', result);
		});

	});
};