/**
 * Promise functions for the countdown
 *
 *
 * curl --header "Content-Type: application/json" \
        --request POST \
        --data '{"command":"create","id":"abc", "count":20}' \
        https://us-east1-countdown-219723.cloudfunctions.net/countdown
 *
 * curl --header "Content-Type: application/json" \
        --request POST \
        --data '{"command":"addResult","id":"abc", "resultId":200, "result":["123", "321", "sdfsfd"]}' \
        https://us-east1-countdown-219723.cloudfunctions.net/countdown
 */

const _ = require('lodash')
	, rp = require('request-promise');

module.exports = _.assign(countdownClient, {
	addResult,
	create,
	decrement,
	remove
})

/**
 * Creates a new count referenced by id
 * Overwrites existing count reference by id
 *
 * @param uri
 * @param id
 * @param count
 * @return Promise
 */
function create({uri, id, count}){
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	count = count || arguments[1].count || arguments[2]

	return postCount({uri, command:'create', id, count})
}

function addResult({uri, id, resultId, result}){
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	resultId =  resultId  || arguments[1].resultId  || arguments[2]
	result =  result      || arguments[1].result  || arguments[3]
	return rp({
		uri,
		method: 'post',
		json:true,
		body:{
			command:'addResult',
			id,
			resultId,
			result
		}
	})
}

/**
 * decrements the next item of the count reference by id
 *
 * @param uri
 * @param id of the count to decrement
 * @return Promise next item off the count or empty
 */
function decrement({uri, id, size}) {
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	size =  size  || arguments[1].size  || arguments[2]
	return postCount({uri, command:'decrement', id, size})
}

/**
 * remove the the count reference by id
 *
 * @param uri
 * @param id of the count to remove
 * @return Promise empty
 */
function remove({uri, id}) {
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	return postCount({uri, command:'remove', id})
}

/**
 * wrap create, decrement, remove in uri
 * @param uri
 * @returns {{uri: (function(): *), create: *, decrement: *, remove: *}}
 */
function countdownClient(uri) {
	return {
		uri: () => uri,
		create: createUriWrapper(uri),
		decrement: decrementUriWrapper(uri),
		remove:removeUriWrapper(uri),
		addResult:addResultUriWrapper(uri)
	}
}


function addResultUriWrapper(uri) {
	return addResult.bind(null, uri)
}

function createUriWrapper(uri) {
	return create.bind(null, uri)
}

function decrementUriWrapper(uri) {
	return decrement.bind(null, uri)
}

function removeUriWrapper(uri) {
	return remove.bind(null, uri)
}

function postCount({uri, command, id, count, size}) {
	return rp({
		uri,
		method: 'post',
		json:true,
		body:{
			command,
			id,
			...count && {count},
			...size && {size}
		}
	})
}
