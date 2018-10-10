/**
 * Promise functions for the spec-queue
 */

const _ = require('lodash')
	, rp = require('request-promise');

module.exports = _.assign(specQueueClient, {
	create,
	pop,
	remove
})

/**
 * Creates a new queue referenced by id
 * Overwrites existing queue reference by id
 *
 * @param uri
 * @param id
 * @param queue
 * @return Promise
 */
function create({uri, id, count}){
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	count = count || arguments[1].count || arguments[2]

	return postQueue({uri, command:'create', id, count})
}

/**
 * Pops the next item of the queue reference by id
 *
 * @param uri
 * @param id of the queue to pop
 * @return Promise next item off the queue or empty
 */
function pop({uri, id, size}) {
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	size =  size  || arguments[1].size  || arguments[2]
	return postQueue({uri, command:'pop', id, size})
}

/**
 * remove the the queue reference by id
 *
 * @param uri
 * @param id of the queue to remove
 * @return Promise empty
 */
function remove({uri, id}) {
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	return postQueue({uri, command:'remove', id})
}

/**
 * wrap create, pop, remove in uri
 * @param uri
 * @returns {{uri: (function(): *), create: *, pop: *, remove: *}}
 */
function specQueueClient(uri) {
	return {
		uri: () => uri,
		create: createUriWrapper(uri),
		pop: popUriWrapper(uri),
		remove:removeUriWrapper(uri)
	}
}


function createUriWrapper(uri) {
	return create.bind(null, uri)
}

function popUriWrapper(uri) {
	return pop.bind(null, uri)
}

function removeUriWrapper(uri) {
	return remove.bind(null, uri)
}

function postQueue({uri, command, id, count, size}) {
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
