const chai = require('chai')
	, _ = require('lodash')
	, id = Math.random().toString().replace('.', '')
	, noQueueId = 'noQueueId'
	, i1 = {item: '1'}
	, i2 = {item: '2'}
	, i3 = {item: '3'}
	, i1Expected = {next: i1}
	, i2Expected = {next: i2}
	, i3Expected = {next: i3}
	, emptyExpected = {empty: true}
	, queue = [i1, i2, i3]
	, uri = 'https://us-central1-spec-queue.cloudfunctions.net/queue'
	, specQueueClient = require('..')
	, { create, pop, remove } = specQueueClient
	, sqc = specQueueClient(uri)

chai.should()
chai.use(require('chai-as-promised'))

const types = {
	functions: {itPrefix: '', create, pop, remove},
	specQueueClient: {
		itPrefix: 'specQueueClient.',
		create: function () {
			return sqc.create(...removeUriFromArguments(arguments))
		},
		pop: function () {
			return sqc.pop(...removeUriFromArguments(arguments))
		},
		remove: function () {
			return sqc.remove(...removeUriFromArguments(arguments))
		}
	}
}



describe('spec-queue-client', function() {
	this.timeout(10000)

	;([
		'functions',
		'specQueueClient'
	]).map(type => {
		const {itPrefix, create, pop, remove} = types[type]

		describe(`${itPrefix}create`, function() {
			afterEach(() => remove(uri, id))

			it(`should ${itPrefix}create a new queue`, () =>
				create(uri, id, queue)
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}create a new queue with object arguments`, () =>
				create({uri, id, queue})
					.should.eventually.deep.equal({})
			)
		})


		describe(`${itPrefix}pop`, function() {

			describe('existing queue', function()  {
				beforeEach(() => create(uri, id, queue))
				// afterEach(() => remove(uri, id))

				it(`should ${itPrefix}pop a queue`, () =>
					pop(uri, id)
						.should.eventually.deep.equal(i1Expected)
				)

				it(`should ${itPrefix}pop a queue to empty`, () =>
					 pop(uri, id)              .should.eventually.deep.equal(i1Expected)
						.then(() => pop(uri, id)).should.eventually.deep.equal(i2Expected)
						.then(() => pop(uri, id)).should.eventually.deep.equal(i3Expected)
						.then(() => pop(uri, id)).should.eventually.deep.equal(emptyExpected)
				)

				it(`should ${itPrefix}pop a queue with object arguments`, () =>
					pop({uri, id})
						.should.eventually.deep.equal(i1Expected)
				)

				it(`should ${itPrefix}create pop concurrently from an existing queue`, function() {
					this.timeout(40000)
					const count = 200
					const queue = _.range(count).map(i => ({item: i}))
					const expecteds = _.range(count).map(i => ({next:{item: i}}))
					return create(uri, id, queue).should.eventually.deep.equal({})
						.then(() => {
							const pops = _.range(count).map(() => pop({uri, id:id})
								.should.eventually.not.deep.equal(emptyExpected)
								.then(actual => {
									_.remove(expecteds, expected => _.isEqual(expected, actual))
										.should.have.length(1, `${actual} wasn't removed from expected`)
									return actual
								})
								
							)
							return Promise.all(pops)
								.then(() => expecteds)
								.should.eventually.have.length(0)
						})
				})

			})

			it(`should ${itPrefix}pop a non existent queue`, () =>
				pop(uri, noQueueId)
					.should.eventually.deep.equal(emptyExpected)

			)

			it(`should ${itPrefix}pop a non existent queue with object arguments`, () =>
				pop({uri, id:noQueueId})
					.should.eventually.deep.equal(emptyExpected)
			)

		})


		describe(`${itPrefix}remove`, function() {

			it(`should ${itPrefix}remove a queue`, () =>
				remove(uri, id)
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}remove a queue with object arguments`, () =>
				remove({uri, id})
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}remove a non existent queue`, () =>
				remove(uri, noQueueId)
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}remove a non existent queue with object arguments`, () =>
				remove({uri, id:noQueueId})
					.should.eventually.deep.equal({})
			)
		})
	})
})


function removeUriFromArguments(args) {
	args = Array.prototype.slice.call(args);
	return  args[0].uri
		? delete args[0].uri && args
		: args.slice(1)
}