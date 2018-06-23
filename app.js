swal.setDefaults({
	buttonsStyling: true,
	confirmButtonText: '<span class="icon-checkmark"></span> Ok',
	confirmButtonColor: '#5cb85c',
	cancelButtonText: '<span class="icon-cross"></span> Cancel',
	cancelButtonColor: '#d9534f',
});

const $htmlElements = [ '#head-block-number', '#revers-blocks-count', '#main-page', '#recent-blocks-table tbody', '#about-block-page', '#about-block-code', '#about-block-table tbody', '#about-block-operations-table tbody', '#about-block-transactions-table tbody', '#reset-search-btn', '#about-account-page', '#about-account-table tbody', '#about-block-height', '#about-block-time', '#about-block-witness', '#about-block-transactions', '#about-block-operations', '.loader', '#recent-blocks-info', '#reset-node-address', '#global-properties-table tbody', '#chain-properties-table tbody', '#about-account-all-count', '#about-account-count', '#about-account-filtered-count', '#auto-clear-real-time-after', '#about-account-filter', '#modal-about-block .modal-title', '#modal-about-block-operations-table tbody', '#modal-about-block-transactions-table tbody', '#modal-about-block-code', '#about-account-page-prev', '#about-account-page-next', '#about-account-page-pages', '#search', '#blockchain-version', '#witnesses-page', '#witnesses-table tbody', '#accounts-page', '#accounts-table tbody', '#about-account-page-nav' ];
/*document.addEventListener('DOMContentLoaded', () => {
});*/
initHtmlElements();

let $modalAboutBlock = new Modal(document.getElementById('modal-about-block'));
let $searchVal = $search.querySelector('.form-control[name="search"]');
let defaultWebsocket = 'wss://ws.golos.io';
let totalVestingShares;
let totalVestingFundSteem;
let $modalGetConfig = new Modal(document.getElementById('modal-get-config'));
let currentPageNumber = 1;

golos.config.set('websocket', nodeAddress);
if (nodeAddress != defaultWebsocket) {
	$resetNodeAddress.style.display = 'block';
}

golos.api.getConfig((err, result) => {
	$blockchainVersion.innerHTML = '...';
	if ( ! err) {
		$blockchainVersion.innerHTML = result.STEEMIT_BLOCKCHAIN_VERSION;
		let $modalGetConfigTableTbody = document.getElementById('modal-get-config-table').querySelector('tbody');
		for (let key in result) {
			let $newRow = $modalGetConfigTableTbody.insertRow(0);
			$newRow.innerHTML = `<tr><td>${key}</td><td><b>${result[key]}</b></td></tr>`;
		}
	}
});

let getChainProperties = () => {
	golos.api.getChainProperties((err, properties) => {
		if ( ! err) {
			for (let key in properties) {
				let prop = $chainPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
				if (prop) prop.innerHTML = properties[key];
			}
		}
	});
};
getChainProperties();

$nodeAddress.addEventListener('submit', (e) => {
	e.preventDefault();
	localStorage.nodeAddress = $nodeAddressInput.value;
	window.location.reload();
});

$resetNodeAddress.addEventListener('click', () => {
	$nodeAddressInput.value = defaultWebsocket;
	$nodeAddressInput.dispatchEvent(new CustomEvent('submit'));
	$resetNodeAddress.style.display = 'none';
});

let workRealTime = true;
document.getElementById('change-work-real-time').addEventListener('click', () => {
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

document.getElementById('clear-real-time').addEventListener('click', () => {
	$recentBlocksTableTbody.innerHTML = '';
	swal({title: 'Table real-time blocks cleared!', type: 'success', showConfirmButton: false, position: 'top-right', toast: true, timer: 3000});
});

golos.api.streamBlockNumber((err, lastBlock) => {
	if ( ! err) {
		golos.api.getBlock(lastBlock, (err, block) => {
			if (block && workRealTime) {
				let operations = {};
				let operationsCount = 0;
				block.transactions.forEach((transaction) => {
					transaction.operations.forEach((operation) => {
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
				setTimeout(() => {
					$newRow.className = 'table-success';
				}, 500);
				setTimeout(() => {
					$newRow.className = 'table-secondary';
				}, 3000);
				let $newSubRow = $recentBlocksTableTbody.insertRow(1);
				$newSubRow.className = 'table-new';
				$newSubRow.innerHTML = `<tr>${operationsStr ? `<td colspan="5">${operationsStr}</td>` : ``}</tr>`;
				setTimeout(() => {
					$newSubRow.className = 'table-success';
				}, 500);
				setTimeout(() => {
					$newSubRow.className = '';
				}, 3000);
				autoClearRealTime();
			}
			else if (err) console.error(err);
		});
	}
	
	getDynamicGlobalPropertiesHandler();
	
});

let getDynamicGlobalPropertiesHandler = () => {
	golos.api.getDynamicGlobalProperties((err, properties) => {
		if ( ! err) {
			totalVestingShares = properties.total_vesting_shares;
			totalVestingFundSteem = properties.total_vesting_fund_steem;
			for (let key in properties) {
				let prop = $globalPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
				if (prop) prop.innerHTML = properties[key];
			}
			let reversBlockCount = properties.head_block_number - properties.last_irreversible_block_num;
			$headBlockNumber.innerHTML = properties.head_block_number;
			$reversBlocksCount.innerHTML = reversBlockCount;
		}
	});
}
getDynamicGlobalPropertiesHandler();

if (localStorage && localStorage.clearAfterBlocksVal) $autoClearRealTimeAfter.value = localStorage.clearAfterBlocksVal;

let autoClearRealTime = () => {
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

let getBlockFullInfo = (blockNumberVal) => {
	$aboutBlockTableTbody.innerHTML = '';
	$aboutBlockOperationsTableTbody.innerHTML = '';
	$aboutBlockTransactionsTableTbody.innerHTML = '';
	$aboutBlockCode.innerHTML = '';
	golos.api.getBlock(blockNumberVal, (err, block) => {
		loadingHide();
		if (block) {
			
			let operations = {};
			let operationsCount = 0;
			block.transactions.forEach((transaction) => {
				transaction.operations.forEach((operation) => {
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

			block.transactions.forEach((transaction) => {
				transaction.operations.forEach((operation) => {
					$newRow = $aboutBlockOperationsTableTbody.insertRow();
					$newRow.innerHTML = `<tr>
											<td rowspan="${Object.keys(operation[1]).length + 1}"><b>${operation[0]}</b></td>
										</tr>`;
					for (let keyOp in operation[1]) {
						operation[1][keyOp] = filterXSS(operation[1][keyOp]);
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

$search.addEventListener('submit', (e) => {
	e.preventDefault();
	loadingShow();
	$resetSearchBtn.style.display = 'block';
	$mainPage.style.display = 'none';
	$aboutBlockPage.style.display = 'none';
	$aboutAccountPage.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	$witnessesPage.style.display = 'none';
	$accountsPage.style.display = 'none';
	let searchVal = $searchVal.value;
	// get HEX
	if (searchVal.length == 40) {
		//window.location.hash = 'tx/' + searchVal;
		$aboutBlockPage.style.display = 'block';
		golos.api.getTransaction(searchVal, (err, result) => {
			loadingHide();
			if ( ! err) {
				getBlockFullInfo(result.block_num);
			}
			else swal({title: 'Error', type: 'error', text: err});
		});
	}
	// get block
	else if (/^-?[0-9]+$/.test(searchVal)) {
		//window.location.hash = 'block/' + searchVal;
		$aboutBlockPage.style.display = 'block';
		getBlockFullInfo(searchVal);
	}
	// get account
	else {
		//window.location.hash = 'account/' + searchVal;
		$aboutAccountPage.style.display = 'block';
		getAccountTransactions();
		getAccountInfo();
	}
	return false;
});

let $profileName = document.getElementById('profile-name');
let $profileWebsite = document.getElementById('profile-website');
let $profileAbout = document.getElementById('profile-about');
let $profileProfileImage = document.getElementById('profile-image');
let $profileCoverImage = document.getElementById('profile-cover-image');
let $profileBalance = document.getElementById('profile-balance');
let $profileMined = document.getElementById('profile-mined');
let $profileLocation = document.getElementById('profile-location');
let $profileSelectTags = document.getElementById('profile-select-tags');
let $profileWitnessVotes = document.getElementById('profile-witness-votes');
let $profileGender = document.getElementById('profile-gender');
let $profileSbdBalance = document.getElementById('profile-sbd-balance');
let $profileOwner = document.getElementById('profile-owner');
let $profileActive = document.getElementById('profile-active');
let $profilePosting = document.getElementById('profile-posting');
let $profileMemo = document.getElementById('profile-memo');
let $profileRecoveryAccount = document.getElementById('profile-recovery-account');
let $profileLastAccountCreated = document.getElementById('profile-account-created');
let $profileLastAccountUpdate = document.getElementById('profile-last-account-update');
let $profileVotingPower = document.getElementById('profile-voting-power');
let $profilePostCount = document.getElementById('profile-post-count');
let $profileLastPost = document.getElementById('profile-last-post');
let $profileReputation = document.getElementById('profile-reputation');
let $profileFollower = document.getElementById('profile-follower');
let $profileFollowing = document.getElementById('profile-following');
let $profilePower = document.getElementById('profile-power');

let getAccountInfo = () => {
	let usernameVal = $searchVal.value;
	golos.api.getAccounts([usernameVal], (err, account) => {
		if ( ! err && account[0]) {
			golos.api.getFollowCount(usernameVal, (err, result) => {
				if ( ! err) {
					$profileFollower.innerHTML = result.follower_count;
					$profileFollowing.innerHTML = result.following_count;
				}
			});
			let jsonMetadata;
			try {
				jsonMetadata = JSON.parse(account[0].json_metadata);
			} catch (e) {
			}
			if (jsonMetadata && jsonMetadata.profile) {
				if (jsonMetadata.profile.name) $profileName.innerHTML = jsonMetadata.profile.name;
				else $profileName.innerHTML = '-';
				if (jsonMetadata.profile.website) {
					$profileWebsite.innerHTML = jsonMetadata.profile.website;
					$profileWebsite.href = jsonMetadata.profile.website;
				}
				else $profileWebsite.innerHTML = '-';
				if (jsonMetadata.profile.location) $profileLocation.innerHTML = jsonMetadata.profile.location;
				else $profileLocation.innerHTML = '-';
				if (jsonMetadata.profile.gender) $profileGender.innerHTML = jsonMetadata.profile.gender;
				else $profileGender.innerHTML = '-';
				if (jsonMetadata.profile.select_tags) $profileSelectTags.innerHTML = jsonMetadata.profile.select_tags;
				else $profileSelectTags.innerHTML = '-';
				if (jsonMetadata.profile.about) $profileAbout.innerHTML = jsonMetadata.profile.about;
				else $profileAbout.innerHTML = '-';
				if (jsonMetadata.profile.profile_image) $profileProfileImage.src = jsonMetadata.profile.profile_image;
				else $profileProfileImage.src = 'graphics/noavatar.png';
				if (jsonMetadata.profile.cover_image) {
					$profileCoverImage.src = jsonMetadata.profile.cover_image;
					$profileCoverImage.style.display = 'block';
				}
				else $profileCoverImage.style.display = 'none';
			}
			else {
				$profileName.innerHTML = '-';
				$profileWebsite.innerHTML = '-';
				$profileLocation.innerHTML = '-';
				$profileGender.innerHTML = '-';
				$profileSelectTags.innerHTML = '-';
				$profileAbout.innerHTML = '-';
				$profileProfileImage.src = 'graphics/noavatar.png';
				$profileCoverImage.style.display = 'none';
			}
			if (account[0].witness_votes.length > 0) $profileWitnessVotes.innerHTML = account[0].witness_votes;
			else $profileWitnessVotes.innerHTML = '-';
			$profileBalance.innerHTML = account[0].balance;
			$profileMined.innerHTML = account[0].mined;
			$profileSbdBalance.innerHTML = account[0].sbd_balance;
			$profileOwner.innerHTML = account[0].owner.key_auths[0][0];
			$profileActive.innerHTML = account[0].active.key_auths[0][0];
			$profilePosting.innerHTML = account[0].posting.key_auths[0][0];
			$profileMemo.innerHTML = account[0].memo_key;
			$profileRecoveryAccount.innerHTML = account[0].recovery_account;
			$profileLastAccountCreated.innerHTML = account[0].created;
			$profileLastAccountUpdate.innerHTML = account[0].last_account_update;
			$profilePostCount.innerHTML = account[0].post_count;
			$profileLastPost.innerHTML = account[0].last_post;
			$profileReputation.innerHTML = rep2(account[0].reputation);
			$profilePower.innerHTML = golos.formatter.vestToGolos(account[0].vesting_shares, totalVestingShares, totalVestingFundSteem).toFixed(2);
			let voteAge = (new Date - new Date(account[0].last_vote_time + 'Z')) / 1000;
			let currentVotingPower = account[0].voting_power + (10000 * voteAge / 432000);
			$profileVotingPower.innerHTML = Math.min(currentVotingPower / 100, 100).toFixed(2) + '%';
		}
	});
}

$resetSearchBtn.addEventListener('click', () => {
	$searchVal.value = '';
	$resetSearchBtn.style.display = 'none';
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	$aboutAccountPage.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

let loadingShow = () => {
	$loader.style.display = 'block';
};
let loadingHide = () => {
	$loader.style.display = 'none';
};

let accountHistoryFrom = -1;
let getAccountTransactions = () => {
	loadingShow();
	let usernameVal = $searchVal.value;
	let operationsCount = 0;
	$aboutAccountTableTbody.innerHTML = '';
	golos.api.getAccountHistory(usernameVal, accountHistoryFrom, 99, (err, transactions) => {
		loadingHide();
		if (transactions && transactions.length > 0) {
			//transactions.reverse();
			transactions.forEach((transaction) => {
				if ( ! $aboutAccountFilter.value || (transaction[1].op[0] == $aboutAccountFilter.value)) {
					operationsCount++;
					let $newRow = $aboutAccountTableTbody.insertRow(0);
					$newRow.className = 'table-light';
					$newRow.innerHTML = `<tr>
									<td>${transaction[1].timestamp}</td>
									<td><a href="#account/${usernameVal}/${currentPageNumber}/${transaction[1].op[0]}">${transaction[1].op[0]}</a></td>
									<td><a href="#block/${transaction[1].block}">${transaction[1].block}</a></td>
									<td><a href="#tx/${transaction[1].trx_id}">${transaction[1].trx_id}</a></td>`;
					$newRow.innerHTML += `</tr>`;
					let $newSubRow = $aboutAccountTableTbody.insertRow(1);
					$newSubRow.innerHTML = `<tr><td class="description" colspan="4">${operationFormatter(transaction[1].op[1])}</td></tr>`;
					let humanDescription = operationHumanFormatter(transaction[1].op);
					if (humanDescription) {
						let $newSubSubRow = $aboutAccountTableTbody.insertRow(2);
						$newSubSubRow.innerHTML = `<tr><td class="description" colspan="4">${humanDescription}</td></tr>`;
					}
				}
			});
			if (transactions) {
				let transactionsCount = transactions.length;
				let transactionsAllCount = transactions[transactionsCount - 1][0] + 1;
				$aboutAccountAllCount.innerHTML = transactionsAllCount;
				$aboutAccountCount.innerHTML = transactionsCount;
				$aboutAccountFilteredCount.innerHTML = operationsCount;
				$aboutAccountPagePages.innerHTML = '';
				if (transactionsAllCount > transactionsCount) {
					// pagination
					$aboutAccountPageNav.style.display = 'block';
					pageNumber = 1;
					let renderPageNumbers = 0;
					while (pageNumber < transactionsAllCount / 100) {
						//<li class="page-item active"><a class="page-link" href="#">1</a></li>
						let $newPage = document.createElement('li');
						$newPage.innerHTML = `<a class="page-link" href="#account/${usernameVal}/${pageNumber}/${$aboutAccountFilter.value}">${pageNumber}</a>`;
						$newPage.className = 'page-item' + (pageNumber == currentPageNumber ? ' active' : '');
						$aboutAccountPagePages.appendChild($newPage);
						pageNumber++;
						renderPageNumbers++;
						if (renderPageNumbers >= 100) break;
					}
				}
			}
			if (operationsCount == 0) swal({title: 'Please change the filter of operation or change the number of page!', type: 'warning', html: `There are no <b>${$aboutAccountFilter.value}</b> operations on <u>this page</u>.`});
		}
		else {
			if ( ! err) err = 'Account not found!';
			swal({title: 'Error', type: 'error', text: err});
		}
	});
};

$aboutAccountPagePrev.addEventListener('click', (e) => {
	e.preventDefault();
	//accountHistoryFrom -= 100;
	//getAccountTransactions();
	currentPageNumber--;
	window.location.hash = `account/${$searchVal.value}/${currentPageNumber}/${$aboutAccountFilter.value}`;
});
$aboutAccountPageNext.addEventListener('click', (e) => {
	e.preventDefault();
	//accountHistoryFrom += 100;
	//getAccountTransactions();
	currentPageNumber++;
	window.location.hash = `account/${$searchVal.value}/${currentPageNumber}/${$aboutAccountFilter.value}`;
});

$aboutAccountFilter.addEventListener('change', () => {
	let usernameVal = $searchVal.value;
	window.location.hash = `account/${usernameVal}/${currentPageNumber}/${$aboutAccountFilter.value}`;
});

let getBlockInfo = (blockNumberVal, operationName, callback) => {
	loadingShow();
	$modalAboutBlockOperationsTableTbody.innerHTML = '';
	$modalAboutBlockTransactionsTableTbody.innerHTML = '';
	$modalAboutBlockCode.innerHTML = '';
	$modalAboutBlockModalTitle.innerHTML = `About block #${blockNumberVal}, filtered ${operationName}`;
	golos.api.getBlock(blockNumberVal, (err, block) => {
		loadingHide();
		if (block) {
			let blockTransactionsArr = [];

			block.transactions.forEach((transaction) => {
				transaction.operations.forEach((operation) => {
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

document.getElementById('get-config-btn').addEventListener('click', () => {
	$modalGetConfig.show();
});

window.addEventListener('hashchange', () => {
	let hash = window.location.hash.substring(1);
	if (hash) {
		let params = hash.split('/');
		if (params[1]) {
			switch (params[0]) {
				case 'block': case 'tx': {
					$searchVal.value = params[1];
					$search.dispatchEvent(new CustomEvent('submit'));
				}; break;
				case 'account': {
					$searchVal.value = params[1];
					if (params[2]) {
						currentPageNumber = params[2];
						if (currentPageNumber > 1) accountHistoryFrom = (currentPageNumber - 1) * 100;
					}
					if (params[3]) $aboutAccountFilter.value = params[3];
					$search.dispatchEvent(new CustomEvent('submit'));
				}; break;
				case 'operations': {
					getBlockInfo(params[1], params[2], () => {
						$modalAboutBlock.show();
					});
				}; break;
			}
		}
		else {
			switch (params[0]) {
				case 'witnesses': {
					$searchVal.value = '';
					$resetSearchBtn.style.display = 'none';
					$mainPage.style.display = 'none';
					$aboutBlockPage.style.display = 'none';
					$aboutAccountPage.style.display = 'none';
					$accountsPage.style.display = 'none';
					$witnessesPage.style.display = 'block';
					$witnessesTableTbody.innerHTML = '';
					golos.api.getWitnessesByVote('', 100, (err, witnesses) => {
						if ( ! err) {
							let witnessRank = 0;
							let accountsArr = [];
							witnesses.forEach((witness) => {
								witnessRank++;
								accountsArr.push(witness.owner);
								let $newRow = $witnessesTableTbody.insertRow();
								const oneM = Math.pow(10, 6);
								const approval = formatDecimal(((witness.votes / oneM) / oneM).toFixed(), 0)[0];
								const percentage = (100 * (witness.votes / oneM / totalVestingShares.split(' ')[0])).toFixed(2);
								const isWitnessesDeactive = /GLS1111111111111111111111111111111114T1Anm/.test(witness.signing_key);
								const noPriceFeed = /0.000 GOLOS/.test(witness.sbd_exchange_rate.base);
								if (isWitnessesDeactive || noPriceFeed) $newRow.className = 'table-danger';
								$newRow.innerHTML = `<tr>
												<td class="witness-rank">${witnessRank}</td>
												<td>
													<a target="_blank" href="#account/${witness.owner}"><img class="rounded float-left" data-username="${witness.owner}" src="https://golos.io/assets/0ee064e31a180b13aca01418634567a1.png"></a>
													<h3><a ${witnessRank < 20 ? ' style="font-weight: bold"' : ''} target="_blank" href="#account/${witness.owner}">${witness.owner}</a></h3>
													<a class="font-weight-light text-dark witness-url" target="_blank" href="${witness.url}">witness url</a>
												</td>
												<td><h5><span class="badge badge-light">${approval}M</span></h5></td>
												<td><h5><span class="badge badge-primary">${percentage}%</span></h5></td>
												<td><h5><span class="badge badge-light">${witness.total_missed}</span></h5></td>
												<td><h5><a class="badge badge-success" target="_blank" href="#block/${witness.last_confirmed_block_num}">${witness.last_confirmed_block_num}</a></h5></td>
												<td>
													${witness.sbd_exchange_rate.quote}
													<br>
													${witness.sbd_exchange_rate.base}
													<br>
													${witness.last_sbd_exchange_update}
												</td>
												<td>
													${witness.props.account_creation_fee}
													<br>
													${witness.props.sbd_interest_rate / 100}%
													<br>
													${witness.props.maximum_block_size}
												</td>
												<td><h5><span class="badge badge-info">${witness.running_version}</span></h5></td>
											</tr>`;
							});
							golos.api.getAccounts(accountsArr, (err, accounts) => {
								if ( ! err) {
									accounts.forEach((account) => {
										try {
											let jsonMetadata = JSON.parse(account.json_metadata);
											if (jsonMetadata.profile && jsonMetadata.profile.profile_image) 
											$witnessesTableTbody.querySelector('img[data-username="' + account.name + '"]').src = jsonMetadata.profile.profile_image;
										}
										catch (e) {
											//console.error(e);
										}
									});
								}
							});
						}
						else {
							console.error(err);
							swal({title: 'Error', type: 'error', text: err});
						}
					});
				}; break;
				case 'accounts': {
					$searchVal.value = '';
					$resetSearchBtn.style.display = 'none';
					$mainPage.style.display = 'none';
					$aboutBlockPage.style.display = 'none';
					$aboutAccountPage.style.display = 'none';
					$witnessesPage.style.display = 'none';
					$accountsPage.style.display = 'block';
					$accountsTableTbody.innerHTML = '';
					golos.api.lookupAccounts('', 10, (err, accounts) => {
						if ( ! err) {
							let accountsArr = [];
							accounts.forEach((account) => {
								accountsArr.push(account);
								let $newRow = $accountsTableTbody.insertRow();
								$newRow.setAttribute('data-username', account);
								$newRow.innerHTML = `<tr>
												<td>
													<a target="_blank" href="#account/${account}"><img class="rounded float-left" src="https://golos.io/assets/0ee064e31a180b13aca01418634567a1.png"></a>
													<h3><a target="_blank" href="#account/${account}">${account}</a></h3>
												</td>
												<td>
												</td>
												<td>
													<span class="posts"></span>
												</td>
												<td>
													<span class="vests"></span>
												</td>
												<td>
												</td>
												<td>
													<span class="balance"></span>
													<br>
													<span class="sbd-balance"></span>
												</td>
											</tr>`;
							});
							golos.api.getAccounts(accountsArr, (err, accounts) => {
								if ( ! err) {
									accounts.forEach((account) => {
										console.log(account);
										let $accountRow = $accountsTableTbody.querySelector('tr[data-username="' + account.name + '"]');
										$accountRow.querySelector('.posts').innerHTML = account.post_count;
										$accountRow.querySelector('.vests').innerHTML = account.vesting_shares;
										$accountRow.querySelector('.balance').innerHTML = account.balance;
										$accountRow.querySelector('.sbd-balance').innerHTML = account.sbd_balance;
										try {
											let jsonMetadata = JSON.parse(account.json_metadata);
											if (jsonMetadata.profile && jsonMetadata.profile.profile_image) 
											$accountRow.querySelector('img').src = jsonMetadata.profile.profile_image;
										}
										catch (e) {
											//console.error(e);
										}
									});
								}
							});
						}
						else {
							console.error(err);
							swal({title: 'Error', type: 'error', text: err});
						}
					});
				}; break;
			}
		}
	}
	else {
		$searchVal.value = '';
		$resetSearchBtn.style.display = 'none';
		$mainPage.style.display = 'flex';
		$aboutBlockPage.style.display = 'none';
		$aboutAccountPage.style.display = 'none';
		$witnessesPage.style.display = 'none';
		$accountsPage.style.display = 'none';
		$recentBlocksInfo.style.display = 'block';
	}
});
window.dispatchEvent(new CustomEvent('hashchange'));