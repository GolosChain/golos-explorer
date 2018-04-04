swal.setDefaults({
	buttonsStyling: true,
	confirmButtonText: '<span class="icon-checkmark"></span> Ok',
	confirmButtonColor: '#5cb85c',
	cancelButtonText: '<span class="icon-cross"></span> Cancel',
	cancelButtonColor: '#d9534f',
});

let $headBlockNumber = document.getElementById('head-block-number');
let $reverseBlocksCount = document.getElementById('revers-blocks-count');
let $mainPage = document.getElementById('main-page');
let $recentBlocksTableTbody = document.getElementById('recent-blocks').getElementsByTagName('tbody')[0];
let $aboutBlockPage = document.getElementById('about-block-page');
let $aboutBlockCode = document.getElementById('about-block-code');
let $aboutBlockTableTbody = document.getElementById('about-block').getElementsByTagName('tbody')[0];
let $aboutBlockOperationsTableTbody = document.getElementById('about-block-operations-table').getElementsByTagName('tbody')[0];
let $aboutBlockTransactionsTableTbody = document.getElementById('about-block-transactions-table').getElementsByTagName('tbody')[0];
let $resetBlockBtn = document.getElementById('reset-block');
let $resetAccountBtn = document.getElementById('reset-account');
let $aboutAccountPage = document.getElementById('about-account-page');
let $aboutAccountTableTbody = document.getElementById('about-account').getElementsByTagName('tbody')[0];
let $aboutBlockHeight = document.getElementById('about-block-height');
let $aboutBlockTime = document.getElementById('about-block-time');
let $aboutBlockWitness = document.getElementById('about-block-witness');
let $aboutBlockTransactions = document.getElementById('about-block-transactions');
let $aboutBlockOperations = document.getElementById('about-block-operations');
let $loader = document.getElementsByClassName('lding')[0];
let $recentBlocksInfo = document.getElementById('recent-blocks-info');
let $resetHexBtn = document.getElementById('reset-hex');
let $resetNodeAddress = document.getElementById('reset-node-address');
let $globalPropertiesTableTbody = document.getElementById('global-properties').getElementsByTagName('tbody')[0];
let $chainPropertiesTableTbody = document.getElementById('chain-properties').getElementsByTagName('tbody')[0];
let $aboutAccountAllCount = document.getElementById('about-account-all-count');
let $aboutAccountCount = document.getElementById('about-account-count');
let $aboutAccountFilteredCount = document.getElementById('about-account-filtered-count');
let $autoClearRealTimeAfter = document.getElementById('auto-clear-real-time-after');
let $aboutAccountFilter = document.getElementById('about-account-filter');
let $searchAccount = document.getElementById('search-account');
let $modalAboutBlock = new Modal(document.getElementById('modal-about-block'));
let $modalAboutBlockModalTitle = document.getElementById('modal-about-block').querySelector('.modal-title');
let $modalAboutBlockOperationsTableTbody = document.getElementById('modal-about-block-operations-table').getElementsByTagName('tbody')[0];
let $modalAboutBlockTransactionsTableTbody = document.getElementById('modal-about-block-transactions-table').getElementsByTagName('tbody')[0];
let $modalAboutBlockCode = document.getElementById('modal-about-block-code');
let $aboutAccountPagePrev = document.getElementById('about-account-page-prev');
let $aboutAccountPageNext = document.getElementById('about-account-page-next');
let $nodeAddress = document.getElementById('node-address');
let $nodeAddressInput = $nodeAddress.querySelector('.form-control[name="node-address"]');
let defaultWebsocket = 'wss://ws17.golos.io';

let getBlockchainVersion = function() {
	golos.api.getConfig(function(err, result) {
		console.log(result.STEEMIT_BLOCKCHAIN_VERSION);
		if ( ! err) document.getElementById('blockchain-version').innerHTML = result.STEEMIT_BLOCKCHAIN_VERSION;
	});
};

let getChainProperties = function() {
	golos.api.getChainProperties(function(err, properties) {
		if ( ! err) {
			for (let key in properties) {
				let prop = $chainPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
				if (prop) prop.innerHTML = properties[key];
			}
		}
	});
};

$nodeAddress.addEventListener('submit', function(e) {
	e.preventDefault();
	localStorage.nodeAddress = $nodeAddressInput.value;
	window.location.reload();
});

if (localStorage && localStorage.nodeAddress) $nodeAddressInput.value = localStorage.nodeAddress;
document.getElementById('blockchain-version').innerHTML = '...';
let nodeAddress = $nodeAddressInput.value;
golos.config.set('websocket', nodeAddress);
if (nodeAddress != defaultWebsocket) {
	$resetNodeAddress.style.display = 'block';
}
getBlockchainVersion();
getChainProperties();

$resetNodeAddress.addEventListener('click', function() {
	document.getElementById('node-address').querySelector('.form-control[name="node-address"]').value = defaultWebsocket;
	document.getElementById('node-address').dispatchEvent(new CustomEvent('submit'));
	$resetNodeAddress.style.display = 'none';
});

let workRealTime = true;
document.getElementById('change-work-real-time').addEventListener('click', function() {
	if (workRealTime) {
		workRealTime = false;
		this.innerHTML = '<span class="icon-play3"></span> Start monitoring';
		this.className = 'btn btn-success btn-sm float-right';
	}
	else {
		workRealTime = true;
		this.innerHTML = '<span class="icon-pause2"></span> Pause monitoring';
		this.className = 'btn btn-secondary btn-sm float-right';
	}
});

document.getElementById('clear-real-time').addEventListener('click', function() {
	$recentBlocksTableTbody.innerHTML = '';
	swal({title: 'Table real-time blocks cleared!', type: 'success', showConfirmButton: false, position: 'top-right', toast: true, timer: 3000});
});

golos.api.streamBlockNumber(function(err, lastBlock) {
	if ( ! err) {
		golos.api.getBlock(lastBlock, function(err, block) {
			if (block && workRealTime) {
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
					operationsStr += `<a class="btn btn-outline-info btn-sm" href="#operations/${lastBlock}/${key}">${key} <span class="badge badge-info">${operations[key]}</span></a> `;
				}
				let $newRow = $recentBlocksTableTbody.insertRow(0);
				$newRow.className = 'table-new';
				$newRow.innerHTML = `<tr>
										<td><a href="#block/${lastBlock}">${lastBlock}</a></td>
										<td>${block.timestamp}</td>
										<td><a href="#account/${block.witness}">${block.witness}</a></td>
										<td>${block.transactions.length}</td>
										<td>${operationsCount}</td>
									</tr>`;
				setTimeout(function() {
					$newRow.className = 'table-success';
				}, 500);
				setTimeout(function() {
					$newRow.className = 'table-secondary';
				}, 3000);
				let $newSubRow = $recentBlocksTableTbody.insertRow(1);
				$newSubRow.className = 'table-new';
				$newSubRow.innerHTML = `<tr>${operationsStr ? `<td colspan="5">${operationsStr}</td>` : ``}</tr>`;
				setTimeout(function() {
					$newSubRow.className = 'table-success';
				}, 500);
				setTimeout(function() {
					$newSubRow.className = '';
				}, 3000);
				autoClearRealTime();
			}
			else if (err) console.error(err);
		});
	}
	
	golos.api.getDynamicGlobalProperties(function(err, properties) {
		if ( ! err) {
			for (let key in properties) {
				let prop = $globalPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
				if (prop) prop.innerHTML = properties[key];
			}
			let reverseBlockCount = properties.head_block_number - properties.last_irreversible_block_num;
			$headBlockNumber.innerHTML = properties.head_block_number;
			$reverseBlocksCount.innerHTML = reverseBlockCount;
		}
	});
	
});

if (localStorage && localStorage.clearAfterBlocksVal) $autoClearRealTimeAfter.value = localStorage.clearAfterBlocksVal;

let autoClearRealTime = function() {
	let clearAfterBlocksVal = parseInt($autoClearRealTimeAfter.value),
		$trs = $recentBlocksTableTbody.getElementsByTagName('tr'),
		trsCount = $trs.length;
	localStorage.clearAfterBlocksVal = clearAfterBlocksVal;
	if (trsCount >= clearAfterBlocksVal * 2) {
		let removeCount = trsCount / 2 - clearAfterBlocksVal;
		for (let i = 0; i < removeCount; i++) {
			$recentBlocksTableTbody.removeChild($trs[trsCount - 1]);
			$recentBlocksTableTbody.removeChild($trs[trsCount - 2]);
			trsCount -= 2;
		}
	}
}

$autoClearRealTimeAfter.addEventListener('change', autoClearRealTime);

let getBlockFullInfo = function(blockNumberVal) {
	$aboutBlockOperationsTableTbody.innerHTML = '';
	$aboutBlockTransactionsTableTbody.innerHTML = '';
	$aboutBlockCode.innerHTML = '';
	golos.api.getBlock(blockNumberVal, function(err, block) {
		loadingHide();
		if (block) {
			
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

			$aboutBlockHeight.innerHTML = blockNumberVal;
			$aboutBlockTime.innerHTML = block.timestamp;
			$aboutBlockWitness.innerHTML = `<a href="#account/${block.witness}">${block.witness}</a>`;
			$aboutBlockTransactions.innerHTML = block.transactions.length;
			$aboutBlockOperations.innerHTML = operationsCount;

			$newRow = $aboutBlockTableTbody.insertRow();
			$newRow.innerHTML = `<tr>
									<td colspan="5"><span class="badge badge-secondary"></span> ${operationsStr}</td>
								</tr>`;

			block.transactions.forEach(function(transaction) {
				transaction.operations.forEach(function(operation) {
					$newRow = $aboutBlockOperationsTableTbody.insertRow();
					$newRow.innerHTML = `<tr>
											<td rowspan="${Object.keys(operation[1]).length + 1}"><b>${operation[0]}</b></td>
										</tr>`;
					for (let keyOp in operation[1]) {
						$newRow = $aboutBlockOperationsTableTbody.insertRow();
						$newRow.innerHTML = `<tr>
												<td>${keyOp}</td>
												<td>${operation[1][keyOp]}</td>
											</tr>`;
					}
				});
				//
				for (let keyTr in transaction) {
					if (keyTr == 'operations') transaction[keyTr] = JSON.stringify(transaction[keyTr]);
					$newRow = $aboutBlockTransactionsTableTbody.insertRow();
					$newRow.innerHTML = `<tr>
											<td><b>${keyTr}</b></td>
											<td>${transaction[keyTr]}</td>
										</tr>`;
				}
				$newRow = $aboutBlockTransactionsTableTbody.insertRow();
				$newRow.className = 'table-active';
				$newRow.innerHTML = `<tr><td colspan="2">&nbsp;</td></tr>`;
			});
			
			let blockStr = JSON.stringify(block);
			blockStr = js_beautify(blockStr);
			$aboutBlockCode.innerHTML = blockStr;
			hljs.highlightBlock($aboutBlockCode);
		}
		else {
			if ( ! err) err = 'Block not found!';
			swal({title: 'Error', type: 'error', text: err});
		}
	});
}

document.getElementById('search-block').addEventListener('submit', function(e) {
	e.preventDefault();
	loadingShow();
	$mainPage.style.display = 'none';
	$aboutBlockPage.style.display = 'block';
	$resetBlockBtn.style.display = 'block';
	let blockNumberVal = this.querySelector('.form-control[name="block-number"]').value;
	//window.location.hash = 'block/' + blockNumberVal;
	$searchAccount.querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountPage.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	getBlockFullInfo(blockNumberVal);
	return false;
});

$resetBlockBtn.addEventListener('click', function() {
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	$searchAccount.querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountPage.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

document.getElementById('search-hex').addEventListener('submit', function(e) {
	e.preventDefault();
	loadingShow();
	$mainPage.style.display = 'none';
	$aboutBlockPage.style.display = 'block';
	$resetHexBtn.style.display = 'block';
	let hexNumberVal = this.querySelector('.form-control[name="hex-number"]').value;
	$searchAccount.querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountPage.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	golos.api.getTransaction(hexNumberVal, function(err, result) {
		loadingHide();
		if ( ! err) {
			getBlockFullInfo(result.block_num);
		}
		else swal({title: 'Error', type: 'error', text: err});
	});
	return false;
});

$resetHexBtn.addEventListener('click', function() {
	document.getElementById('search-hex').querySelector('.form-control[name="hex-number"]').value = '';
	$resetHexBtn.style.display = 'none';
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	$searchAccount.querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountPage.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

let loadingShow = function() {
	$loader.style.display = 'block';
};
let loadingHide = function() {
	$loader.style.display = 'none';
};

let accountHistoryFrom = -1;
let accountHistoryCount = 99;
let getAccountTransactions = function() {
	loadingShow();
	let usernameVal = $searchAccount.querySelector('.form-control[name="account-username"]').value;
	let operationsCount = 0;
	$aboutAccountTableTbody.innerHTML = '';
	golos.api.getAccountHistory(usernameVal, accountHistoryFrom, accountHistoryCount, function(err, transactions) {
		loadingHide();
		if (transactions.length > 0) {
			//transactions.reverse();
			transactions.forEach(function(transaction) {
				if ( ! $aboutAccountFilter.value || (transaction[1].op[0] == $aboutAccountFilter.value)) {
					console.log(transaction);
					operationsCount++;
					let $newRow = $aboutAccountTableTbody.insertRow(0);
					$newRow.innerHTML = `<tr>
									<td>${transaction[1].timestamp}</td>
									<td><a href="#tx/${transaction[1].trx_id}">${transaction[1].trx_id}</a></td>
									<td>${transaction[1].op[1].from ? transaction[1].op[1].from : ''}</td>
									<td>${transaction[1].op[1].to ? transaction[1].op[1].to : ''}</td>
									<td>${transaction[1].op[1].amount ? transaction[1].op[1].amount : ''}</td>
									<td>${transaction[1].op[1].memo ? transaction[1].op[1].memo : ''}</td>
								</tr>`;
				}
			});
			if (transactions) {
				let transactionsCount = transactions.length;
				let transactionsAllCount = transactions[transactionsCount - 1][0];
				$aboutAccountAllCount.innerHTML = transactionsAllCount;
				$aboutAccountCount.innerHTML = transactionsCount;
				$aboutAccountFilteredCount.innerHTML = operationsCount;
				if (transactionsAllCount > transactionsCount) {
					// pagination
					let $newPage = `<li class="page-item"><a class="page-link" href="#">2</a></li>`;
				}
			}
			if (operationsCount == 0) swal({title: 'Error', type: 'error', text: `Not have ${$aboutAccountFilter.value} operations!`});
		}
		else {
			if ( ! err) err = 'Account not found!';
			swal({title: 'Error', type: 'error', text: err});
		}
	});
};

$aboutAccountPagePrev.addEventListener('click', function() {
	accountHistoryFrom -= 100;
	accountHistoryCount -= 100;
	getAccountTransactions();
});
$aboutAccountPageNext.addEventListener('click', function() {
	accountHistoryFrom += 100;
	accountHistoryCount += 100;
	getAccountTransactions();
});

$aboutAccountFilter.addEventListener('change', function() {
	let usernameVal = $searchAccount.querySelector('.form-control[name="account-username"]').value;
	window.location.hash = `account/${usernameVal}/${$aboutAccountFilter.value}`;
	getAccountTransactions();
});

$searchAccount.addEventListener('submit', function(e) {
	e.preventDefault();
	$mainPage.style.display = 'none';
	$aboutAccountPage.style.display = 'block';
	$resetAccountBtn.style.display = 'block';
	//window.location.hash = 'account/' + usernameVal;
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$aboutBlockPage.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	getAccountTransactions();
	return false;
});

$resetAccountBtn.addEventListener('click', function() {
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	$searchAccount.querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountPage.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

let getBlockInfo = function(blockNumberVal, operationName, callback) {
	loadingShow();
	$modalAboutBlockOperationsTableTbody.innerHTML = '';
	$modalAboutBlockTransactionsTableTbody.innerHTML = '';
	$modalAboutBlockCode.innerHTML = '';
	$modalAboutBlockModalTitle.innerHTML = `About block #${blockNumberVal}, filtered ${operationName}`;
	golos.api.getBlock(blockNumberVal, function(err, block) {
		loadingHide();
		if (block) {
			let blockTransactionsArr = [];

			block.transactions.forEach(function(transaction) {
				transaction.operations.forEach(function(operation) {
					if (operation[0] == operationName) {
						//console.log(transaction.operations);
						blockTransactionsArr.push(transaction);
						$newRow = $modalAboutBlockOperationsTableTbody.insertRow();
						$newRow.innerHTML = `<tr>
												<td rowspan="${Object.keys(operation[1]).length + 1}"><b>${operation[0]}</b></td>
											</tr>`;
						for (let keyOp in operation[1]) {
							$newRow = $modalAboutBlockOperationsTableTbody.insertRow();
							$newRow.innerHTML = `<tr>
													<td>${keyOp}</td>
													<td>${operation[1][keyOp]}</td>
												</tr>`;
						}

						for (let keyTr in transaction) {
							if (keyTr == 'operations') transaction[keyTr] = JSON.stringify(transaction[keyTr]);
							$newRow = $modalAboutBlockTransactionsTableTbody.insertRow();
							$newRow.innerHTML = `<tr>
													<td><b>${keyTr}</b></td>
													<td>${transaction[keyTr]}</td>
												</tr>`;
						}
						$newRow = $modalAboutBlockTransactionsTableTbody.insertRow();
						$newRow.className = 'table-active';
						$newRow.innerHTML = `<tr><td colspan="2">&nbsp;</td></tr>`;
					}
				});
			});
			
			block.transactions = blockTransactionsArr;
			let blockStr = JSON.stringify(block);
			blockStr = js_beautify(blockStr);
			$modalAboutBlockCode.innerHTML = blockStr;
			hljs.highlightBlock($modalAboutBlockCode);

			callback();
		}
		else {
			if ( ! err) err = 'Block not found!';
			swal({title: 'Error', type: 'error', text: err});
		}
	});
}

window.addEventListener('hashchange', function() {
	let hash = window.location.hash.substring(1);
	if (hash) {
		let params = hash.split('/');
		if (params[1]) {
			switch (params[0]) {
				case 'block': {
					document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = params[1];
					document.getElementById('search-block').dispatchEvent(new CustomEvent('submit'));
				}; break;
				case 'account': {
					$searchAccount.querySelector('.form-control[name="account-username"]').value = params[1];
					if (params[2]) $aboutAccountFilter.value = params[2];
					$searchAccount.dispatchEvent(new CustomEvent('submit'));
				}; break;
				case 'tx': {
					document.getElementById('search-hex').querySelector('.form-control[name="hex-number"]').value = params[1];
					document.getElementById('search-hex').dispatchEvent(new CustomEvent('submit'));
				}; break;
				case 'operations': {
					getBlockInfo(params[1], params[2], function() {
						$modalAboutBlock.show();
					});
				}; break;
			}
		}
	}
	else {
		document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
		document.getElementById('search-hex').querySelector('.form-control[name="hex-number"]').value = '';
		$resetBlockBtn.style.display = 'none';
		$resetHexBtn.style.display = 'none';
		$mainPage.style.display = 'flex';
		$aboutBlockPage.style.display = 'none';
		$searchAccount.querySelector('.form-control[name="account-username"]').value = '';
		$aboutAccountPage.style.display = 'none';
		$resetAccountBtn.style.display = 'none';
		$recentBlocksInfo.style.display = 'block';
	}
});
window.dispatchEvent(new CustomEvent('hashchange'));