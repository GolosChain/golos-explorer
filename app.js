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
let $mainPage = document.getElementById('main-page');
let $recentBlocksTableTbody = document.getElementById('recent-blocks').getElementsByTagName('tbody')[0];
let $aboutBlockPage = document.getElementById('about-block-page');
let $aboutBlockCode = document.getElementById('about-block-code');
let $aboutBlockTableTbody = document.getElementById('about-block').getElementsByTagName('tbody')[0];
let $aboutBlockOperationsTableTbody = document.getElementById('about-block-operations-table').getElementsByTagName('tbody')[0];
let $resetBlockBtn = document.getElementById('reset-block');
let $resetAccountBtn = document.getElementById('reset-account');
let $aboutAccountTable = document.getElementById('about-account');
let $aboutAccountTableTbody = $aboutAccountTable.getElementsByTagName('tbody')[0];
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

let getChainProperties = function() {
	golos.api.getChainProperties(function(err, properties) {
		console.debug(err, properties);
		if ( ! err) {
			for (let key in properties) {
				let prop = $chainPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
				if (prop) prop.innerHTML = properties[key];
			}
		}
	});
}
getChainProperties();

let getLastBlockInterval = setInterval(function() {
	
	getLastBlock(function(properties, block) {
		//console.log(properties);
		//console.log(block);
		for (let key in properties) {
			let prop = $globalPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
			if (prop) prop.innerHTML = properties[key];
		}
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

let editor;

let $aboutBlockTabs = document.querySelectorAll('a[data-toggle="tab"]');
for (var i = 0; i < $aboutBlockTabs.length; i++) {
	$aboutBlockTabs[i].addEventListener('shown.bs.tab', function(e) {
		if (e.target.getAttribute('aria-controls') == 'json') {
			editor.setCursor(0);
		}
	});
}

document.getElementById('search-block').addEventListener('submit', function(e) {
	e.preventDefault();
	$mainPage.style.display = 'none';
	$aboutBlockPage.style.display = 'block';
	$resetBlockBtn.style.display = 'block';
	let blockNumberVal = this.querySelector('.form-control[name="block-number"]').value;
	//window.location.hash = 'block/' + blockNumberVal;
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	golos.api.getBlock(blockNumberVal, function(err, block) {
		console.debug(err, 'getBlock: ', block);
		let blockStr = JSON.stringify(block);
		editor = CodeMirror($aboutBlockCode, {
			mode: 'application/json',
			lineWrapping: true,
			readOnly: true,
			value: blockStr
		});
		editor.autoFormatRange({ch: 0, line: 0}, {ch: blockStr.length, line: 0});
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
			});
		}
		else swal({title: 'Error', type: 'error', text: err});
	});
	return false;
});

$resetBlockBtn.addEventListener('click', function() {
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

document.getElementById('search-account').addEventListener('submit', function(e) {
	e.preventDefault();
	$loader.style.display = 'block';
	$mainPage.style.display = 'none';
	$aboutAccountTable.style.display = 'block';
	$resetAccountBtn.style.display = 'block';
	let usernameVal = this.querySelector('.form-control[name="account-username"]').value;
	//window.location.hash = 'account/' + usernameVal;
	document.getElementById('search-block').querySelector('.form-control[name="block-number"]').value = '';
	$resetBlockBtn.style.display = 'none';
	$aboutBlockPage.style.display = 'none';
	let transfersCount = 0;
	$aboutAccountTableTbody.innerHTML = '';
	$recentBlocksInfo.style.display = 'none';
	golos.api.getAccountHistory(usernameVal, -1, 100, function(err, transactions) {
		//console.log(err, 'getAccountHistory: ', transactions);
		$loader.style.display = 'none';
		if ( ! err) {
			//transactions.reverse();
			console.debug(transactions);
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
									<td><a href="#tx/${transaction[1].trx_id}">${transaction[1].trx_id}</a></td>
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
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

document.getElementById('search-hex').addEventListener('submit', function(e) {
	e.preventDefault();
	$mainPage.style.display = 'none';
	$aboutBlockPage.style.display = 'block';
	$resetHexBtn.style.display = 'block';
	let hexNumberVal = this.querySelector('.form-control[name="hex-number"]').value;
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	golos.api.getTransaction(hexNumberVal, function(err, result) {
		console.debug(err, 'getTransaction: ', result);
		if ( ! err) {
			let blockNumberVal = result.block_num;
			golos.api.getBlock(blockNumberVal, function(err, block) {
				console.debug(err, 'getBlock: ', block);
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
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	document.getElementById('search-account').querySelector('.form-control[name="account-username"]').value = '';
	$aboutAccountTable.style.display = 'none';
	$resetAccountBtn.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

document.getElementById('node-address').addEventListener('submit', function(e) {
	e.preventDefault();
	document.getElementById('blockchain-version').innerHTML = '...';
	$resetNodeAddress.style.display = 'block';
	let nodeAddress = this.querySelector('.form-control[name="node-address"]').value;
	golos.api.setWebSocket(nodeAddress);
	getBlockchainVersion();
	getChainProperties();
	return false;
});

let getBlockchainVersion = function() {
	golos.api.getConfig(function(err, result) {
		if ( ! err) document.getElementById('blockchain-version').innerHTML = result.STEEMIT_BLOCKCHAIN_VERSION;
	});
};

getBlockchainVersion();

$resetNodeAddress.addEventListener('click', function() {
	document.getElementById('node-address').querySelector('.form-control[name="node-address"]').value = 'wss://ws.golos.io';
	document.getElementById('node-address').dispatchEvent(new CustomEvent('submit'));
	$resetNodeAddress.style.display = 'none';
});

window.addEventListener('hashchange', function() {
	let hash = window.location.hash.substring(1);
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
			else if (hash.search('tx') != -1) {
				console.debug('tx', paramVal);
				document.getElementById('search-hex').querySelector('.form-control[name="hex-number"]').value = paramVal;
				document.getElementById('search-hex').dispatchEvent(new CustomEvent('submit'));
			}
		}
	}
});
window.dispatchEvent(new CustomEvent('hashchange'));

// CodeMirror beautifier
(function() {

  CodeMirror.extendMode("javascript", {
    commentStart: "/*",
    commentEnd: "*/",
    // FIXME semicolons inside of for
    newlineAfterToken: function(type, content, textAfter, state) {
      if (this.jsonMode) {
        return /^[\[,{]$/.test(content) || /^}/.test(textAfter);
      } else {
        if (content == ";" && state.lexical && state.lexical.type == ")") return false;
        return /^[;{}]$/.test(content) && !/^;/.test(textAfter);
      }
    }
  });

  // Applies automatic formatting to the specified range
  CodeMirror.defineExtension("autoFormatRange", function (from, to) {
    var cm = this;
    var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");
    var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
    var tabSize = cm.getOption("tabSize");

    var out = "", lines = 0, atSol = from.ch == 0;
    function newline() {
      out += "\n";
      atSol = true;
      ++lines;
    }

    for (var i = 0; i < text.length; ++i) {
      var stream = new CodeMirror.StringStream(text[i], tabSize);
      while (!stream.eol()) {
        var inner = CodeMirror.innerMode(outer, state);
        var style = outer.token(stream, state), cur = stream.current();
        stream.start = stream.pos;
        if (!atSol || /\S/.test(cur)) {
          out += cur;
          atSol = false;
        }
        if (!atSol && inner.mode.newlineAfterToken &&
            inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i+1] || "", inner.state))
          newline();
      }
      if (!stream.pos && outer.blankLine) outer.blankLine(state);
      if (!atSol) newline();
    }

    cm.operation(function () {
      cm.replaceRange(out, from, to);
      for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
        cm.indentLine(cur, "smart");
      cm.setSelection(from, cm.getCursor(false));
    });
  });

})();
