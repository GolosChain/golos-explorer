swal.setDefaults({
	buttonsStyling: true,
	confirmButtonText: '<span class="icon-checkmark"></span> Ok',
	confirmButtonColor: '#5cb85c',
	cancelButtonText: '<span class="icon-cross"></span> Cancel',
	cancelButtonColor: '#d9534f',
});

let getLastBlock = function(callback) {
	
	golos.api.getDynamicGlobalProperties(function(err, properties) {
		//console.log(err, 'getDynamicGlobalProperties: ', properties);

		golos.api.getBlock(properties.last_irreversible_block_num, function(err, block) {
			//console.log(err, 'getBlock: ', block)
			callback(properties, block);
		});

	});
	
};

let blocksIds = {};

let $headBlockNumber = document.getElementById('head-block-number');
let $reverseBlocksCount = document.getElementById('revers-blocks-count');
let $recentBlocksTable = document.getElementById('recent-blocks');
let $recentBlocksTableTbody = $recentBlocksTable.getElementsByTagName('tbody')[0];
let $aboutBlockTable = document.getElementById('about-block');
let $aboutBlockTableTbody = $aboutBlockTable.getElementsByTagName('tbody')[0];
let $resetBlockBtn = document.getElementById('reset-block');
let $resetAccountBtn = document.getElementById('reset-account');
let $aboutAccountTable = document.getElementById('about-account');
let $aboutAccountTableTbody = $aboutAccountTable.getElementsByTagName('tbody')[0];
let $loader = document.getElementsByClassName('lding')[0];
let $recentBlocksInfo = document.getElementById('recent-blocks-info');
let $resetHexBtn = document.getElementById('reset-hex');

let getLastBlockInterval = setInterval(function() {
	
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
			for (let key in operations) {
				operationsStr += `<a class="btn btn-outline-info btn-sm">${key} <span class="badge badge-info">${operations[key]}</span></a> `; 
			}
			console.debug(properties.last_irreversible_block_num, block.timestamp, block.witness, block.transactions.length, operationsCount, operationsStr);
			
			let $newRow = $recentBlocksTableTbody.insertRow(0);
			$newRow.innerHTML = `<tr>
									<td><a href="#block/${properties.last_irreversible_block_num}">${properties.last_irreversible_block_num}</a></td>
									<td>${block.timestamp}</td>
									<td><a href="#account/${block.witness}">${block.witness}</a></td>
									<td>${block.transactions.length}</td>
									<td>${operationsCount}</td>
								</tr>`;
			
			$newRow = $recentBlocksTableTbody.insertRow(1);
			if (operationsStr) $newRow.innerHTML = `<tr>
									<td colspan="5">${operationsStr}</td>
								</tr>`;
		}
	});

}, 1000);

document.getElementById('search-block').addEventListener('submit', function(e) {
	e.preventDefault();
	$recentBlocksTable.style.display = 'none';
	$aboutBlockTable.style.display = 'table';
	$resetBlockBtn.style.display = 'block';
	let blockNumberVal = this.querySelector('.form-control[name="block-number"]').value;
	//window.location.hash = 'block/' + blockNumberVal;
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	golos.api.getBlock(blockNumberVal, function(err, block) {
		console.log(err, 'getBlock: ', block);
		if ( ! err) {
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
			for (let key in operations) {
				operationsStr += `<a class="btn btn-outline-secondary btn-sm">${key} <span class="badge badge-secondary">${operations[key]}</span></a> `; 
			}
			console.debug(blockNumberVal, block.timestamp, block.witness, block.transactions.length, operationsCount, operationsStr);

			let $newRow = $aboutBlockTableTbody.insertRow(0);
			$newRow.innerHTML = `<tr>
									<td>${blockNumberVal}</td>
									<td>${block.timestamp}</td>
									<td><a href="#account/${block.witness}">${block.witness}</a></td>
									<td>${block.transactions.length}</td>
									<td>${operationsCount}</td>
								</tr>`;

			$newRow = $aboutBlockTableTbody.insertRow(1);
			$newRow.innerHTML = `<tr>
									<td colspan="5"><span class="badge badge-secondary">Operations:</span> ${operationsStr}</td>
								</tr>`;
		}
		else swal({title: 'Error', type: 'error', text: err});
	});
	return false;
});

$resetBlockBtn.addEventListener('click', function() {
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$recentBlocksTable.style.display = 'table';
	$aboutBlockTable.style.display = 'none';
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

document.getElementById('search-account').addEventListener('submit', function(e) {
	e.preventDefault();
	$loader.style.display = 'block';
	$recentBlocksTable.style.display = 'none';
	$aboutAccountTable.style.display = 'block';
	$resetAccountBtn.style.display = 'block';
	let usernameVal = this.querySelector('.form-control[name="account-username"]').value;
	//window.location.hash = 'account/' + usernameVal;
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$aboutBlockTable.style.display = 'none';
	let transfersCount = 0;
	$aboutAccountTableTbody.innerHTML = '';
	$recentBlocksInfo.style.display = 'none';
	golos.api.getAccountHistory(usernameVal, -1, 100, function(err, transactions) {
		//console.log(err, 'getAccountHistory: ', transactions);
		$loader.style.display = 'none';
		if ( ! err) {
			//transactions.reverse();
			transactions.forEach(function(transaction) {
				if (transaction[1].op[0] == 'transfer') {
					transfersCount++;
					console.debug(transaction[1].timestamp, transaction[1].op[1], transaction[1].trx_id);
					let $newRow = $aboutAccountTableTbody.insertRow(0);
					$newRow.innerHTML = `<tr>
									<td>${transaction[1].timestamp}</td>
									<td>${transaction[1].op[1].from}</td>
									<td>${transaction[1].op[1].to}</td>
									<td>${transaction[1].op[1].amount}</td>
									<td>${transaction[1].trx_id}</td>
									<td>${transaction[1].op[1].memo}</td>
								</tr>`;
				}
			});
			if (transfersCount == 0) swal({title: 'Error', type: 'error', text: 'This account did not make any translations!'});
		}
		else swal({title: 'Error', type: 'error', text: err});
	});
	return false;
});

$resetAccountBtn.addEventListener('click', function() {
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$recentBlocksTable.style.display = 'table';
	$aboutBlockTable.style.display = 'none';
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

document.getElementById('search-hex').addEventListener('submit', function(e) {
	e.preventDefault();
	$recentBlocksTable.style.display = 'none';
	$aboutBlockTable.style.display = 'table';
	$resetHexBtn.style.display = 'block';
	let hexNumberVal = this.querySelector('.form-control[name="hex-number"]').value;
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	golos.api.getTransaction(hexNumberVal, function(err, result) {
		console.debug(err, 'getTransaction: ', result);
		if ( ! err) {
			let blockNumberVal = transaction.block_num;
			golos.api.getBlock(blockNumberVal, function(err, block) {
				console.log(err, 'getBlock: ', block);
				if ( ! err) {
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
					for (let key in operations) {
						operationsStr += `<a class="btn btn-outline-secondary btn-sm">${key} <span class="badge badge-secondary">${operations[key]}</span></a> `; 
					}
					console.debug(blockNumberVal, block.timestamp, block.witness, block.transactions.length, operationsCount, operationsStr);

					let $newRow = $aboutBlockTableTbody.insertRow(0);
					$newRow.innerHTML = `<tr>
											<td><a href="#">${blockNumberVal}</a></td>
											<td>${block.timestamp}</td>
											<td><a href="#">${block.witness}</a></td>
											<td>${block.transactions.length}</td>
											<td>${operationsCount}</td>
										</tr>`;

					$newRow = $aboutBlockTableTbody.insertRow(1);
					$newRow.innerHTML = `<tr>
											<td colspan="5"><span class="badge badge-secondary">Operations:</span> ${operationsStr}</td>
										</tr>`;
				}
				else swal({title: 'Error', type: 'error', text: err});
			});
		}
		else swal({title: 'Error', type: 'error', text: err});
	});
	return false;
});

$resetHexBtn.addEventListener('click', function() {
	document.getElementById('search-hex').querySelector('.form-control[name="hex-number"]').value = '';
	$resetHexBtn.style.display = 'none';
	$recentBlocksTable.style.display = 'table';
	$aboutBlockTable.style.display = 'none';
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

window.addEventListener('hashchange', function() {
	var hash = window.location.hash.substring(1);
	if (hash) {
		if (hash.split('/')[1]) {
			let paramVal = hash.split('/')[1];
			if (hash.search('block') != -1) {
				console.debug('block', paramVal);
				document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = paramVal;
				document.getElementById('search-block').dispatchEvent(new CustomEvent('submit'));
			}
			else if (hash.search('account') != -1) {
				console.debug('account', paramVal);
				document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = paramVal;
				document.getElementById('search-account').dispatchEvent(new CustomEvent('submit'));
			}
		}
	}
});
window.dispatchEvent(new CustomEvent('hashchange'));