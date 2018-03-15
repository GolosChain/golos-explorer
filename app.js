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

var $headBlockNumber = document.getElementById('head-block-number');
var $reverseBlocksCount = document.getElementById('revers-blocks-count');
var $recentBlocksTable = document.getElementById('recent-blocks').getElementsByTagName('tbody')[0];

var getLastBlockInterval = setInterval(function() {
	
	getLastBlock(function(properties, block) {
		//console.log(properties);
		//console.log(block);
		let reverseBlockCount = properties.head_block_number - properties.last_irreversible_block_num;
		console.debug('Current Height', properties.head_block_number);
		console.debug('Reversable blocks awaiting concensus', reverseBlockCount);
		$headBlockNumber.innerHTML = properties.head_block_number;
		$reverseBlocksCount.innerHTML = reverseBlockCount;
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
				operationsStr += `<a class="btn btn-outline-secondary btn-sm">${key} <span class="badge badge-secondary">${operations[key]}</span></a> `; 
			}
			console.debug(properties.last_irreversible_block_num, block.timestamp, block.witness, block.transactions.length, operationsCount, operationsStr);
			
			let $newRow = $recentBlocksTable.insertRow(0);
			$newRow.innerHTML = `<tr>
									<td><a href="#">${properties.last_irreversible_block_num}</a></td>
									<td>${block.timestamp}</td>
									<td><a href="#">${block.witness}</a></td>
									<td>${block.transactions.length}</td>
									<td>${operationsCount}</td>
								</tr>`;
			
			$newRow = $recentBlocksTable.insertRow(1);
			$newRow.innerHTML = `<tr>
									<td colspan="5"><span class="badge badge-secondary">Operations:</span> ${operationsStr}</td>
								</tr>`;
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