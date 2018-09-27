/**
 * Promise functions for the spec-queue
 *
 *
 * @type {*}
 * @private
 */

const _ = require('lodash')
	, rp = require('request-promise');




module.exports = {
	specQueueClient,
	create,
	pop,
	remove
}

/**
 * Creates a new queue referenced by id
 * Overwrites existing queue reference by id
 *
 * @param uri
 * @param id
 * @param queue
 * @return Promise
 */
function create({uri, id, queue}){
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	queue = queue || arguments[1].queue || arguments[2]
	return postQueue(uri, 'create', id, queue)
}

function postQueue(uri, command, id, queue) {
	return rp({
		uri,
		method: 'post',
		json:true,
		body:{ command, id, queue }
	})
				.catch(e => console.log('e', e))

}

/**
 * Pops the next item of the queue reference by id
 *
 * @param uri
 * @param id of the queue to pop
 * @return Promise next item off the queue or empty
 */
function pop({uri, id}) {
	uri =   uri   || arguments[0]
	id =    id    || arguments[1].id    || arguments[1]
	return postQueue(uri, 'pop', id)
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
	return postQueue(uri, 'remove', id)
}


function specQueueClient(url) {
	return {
		url: () => url,
		create: createUriWrapper(url),
		pop: popUriWrapper(url),
		remove:removeUriWrapper(url)
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