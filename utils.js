let operationFormatter = (object) => {
	let resultStr = '',
		operation = {};
	for (var key in object) {
		let operationValue = escapeHtml(object[key]);
		switch (key) {
			case 'title': case 'body': case 'memo': continue;
			case 'parent_author': operation.parent_author = object[key]; break;
			case 'author': case 'comment_author': operation.author = object[key]; break;
			case 'parent_permlink': operationValue = `<a target="_blank" href="https://golos.io/@${operation.parent_author}/${operationValue}">${operationValue}</a>`; break;
			case 'permlink': case 'comment_permlink': operationValue = `<a target="_blank" href="https://golos.io/@${operation.author}/${operationValue}">${operationValue}</a>`; break;
		}
		let keyBeauty = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
		if (typeof(object[key]) !== 'object') {
			resultStr += `${keyBeauty}: <span class="badge badge-secondary">${operationValue}</span> `;
		}
		else {
			for (var paramsKey in object[key]) {
				resultStr += `${keyBeauty} ${paramsKey}: <span class="badge badge-secondary">${object[key][paramsKey]}</span> `;
			}
		}
	}
	return resultStr;
};
let operationHumanFormatter = (transaction) => {
	switch (transaction[0]) {
		//case 'transfer': return `Notification from @robot: ${transaction[1].memo}`; break;
		default: return '';
	}
};

let entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'/': '&#x2F;',
	'`': '&#x60;',
	'=': '&#x3D;'
};
let escapeHtml = (string) => {
	return String(string).replace(/[&<>"'`=\/]/g, (s) => {
		return entityMap[s];
	});
}

let fractional_part_len = (value) => {
	const parts = (Number(value) + '').split('.');
	return parts.length < 2 ? 0 : parts[1].length;
}
// https://github.com/steemit/condenser/blob/master/src/app/utils/ParsersAndFormatters.js#L8
let formatDecimal = (value, decPlaces = 2, truncate0s = true) => {
	let decSeparator, fl, i, j, sign, thouSeparator, abs_value;
	if (value === null || value === void 0 || isNaN(value)) {
		return 'NaN';
	}
	if (truncate0s) {
		fl = fractional_part_len(value);
		if (fl < 2) fl = 2;
		if (fl < decPlaces) decPlaces = fl;
	}
	decSeparator = '.';
	thouSeparator = ',';
	sign = value < 0 ? '-' : '';
	abs_value = Math.abs(value);
	i = parseInt(abs_value.toFixed(decPlaces), 10) + '';
	j = i.length;
	j = i.length > 3 ? j % 3 : 0;
	const decPart = decPlaces
		? decSeparator +
		Math.abs(abs_value - i)
			.toFixed(decPlaces)
			.slice(2)
		: '';
	return [
		sign +
			(j ? i.substr(0, j) + thouSeparator : '') +
			i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator),
		decPart,
	];
}

// https://github.com/steemit/condenser/blob/master/src/app/utils/ParsersAndFormatters.js#L47
let log10 = (str) => {
	const leadingDigits = parseInt(str.substring(0, 4));
	const log = Math.log(leadingDigits) / Math.LN10 + 0.00000001;
	const n = str.length - 1;
	return n + (log - parseInt(log));
}
let rep2 = (rep2) => {
	if (rep2 == null) return rep2;
	let rep = String(rep2);
	const neg = rep.charAt(0) === '-';
	rep = neg ? rep.substring(1) : rep;

	let out = log10(rep);
	if (isNaN(out)) out = 0;
	out = Math.max(out - 9, 0); // @ -9, $0.50 earned is approx magnitude 1
	out = (neg ? -1 : 1) * out;
	out = out * 9 + 25; // 9 points per magnitude. center at 25
	// base-line 0 to darken and < 0 to auto hide (grep rephide)
	out = parseInt(out);
	return out;
}

let camelCase = (str) => {
	str = str.replace(/(#)/g, '').replace(/\./g, '');
	str = str.replace(/-([a-z])/g, (_m, l) => {
		return l.toUpperCase();
	});
	return str.replace(/ ([a-z])/g, (_m, l) => {
		return l.toUpperCase();
	});
}

let initHtmlElements = ($htmlElements) => {
	/*document.addEventListener('DOMContentLoaded', () => {
	});*/
	for (let name in $htmlElements) {
		let nameConst = $htmlElements[name];
		nameConst = camelCase(nameConst);
		eval('window.$' + nameConst + ' = document.querySelector("' + $htmlElements[name] + '");');
	}
};

let paramsToGetQuery = (obj, prefix) => {
	let str = [],
		p;
	for (p in obj) {
		if (obj.hasOwnProperty(p)) {
			let k = prefix ? prefix + '[' + p + ']' : p,
				v = obj[p];
			str.push((v !== null && typeof v === 'object') ?
				paramsToGetQuery(v, k) :
				encodeURIComponent(k) + '=' + encodeURIComponent(v));
		}
	}
	return str.join('&');
};

/*let paramsToGetQuery = (params, prefix) => {
	const query = Object.keys(params).map((key) => {
		const value  = params[key];
		if (params.constructor === Array) key = `${prefix}[]`;
		else if (params.constructor === Object) key = (prefix ? `${prefix}[${key}]` : key);
		if (typeof value === 'object') return paramsToGetQuery(value, key);
		else return `${key}=${encodeURIComponent(value)}`;
	});
	return [].concat.apply([], query).join('&');
}*/