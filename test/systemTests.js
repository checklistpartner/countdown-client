const chai = require('chai')
	, _ = require('lodash')
	, id = Math.random().toString().replace('.', '')
	, noQueueId = 'noQueueId'
	, count = 150
	, size1 = 50
	, pop1Expected =    {next: {start: 0, end: 49}}
	, pop2Expected =    {next: {start: 50, end: 99}}
	, pop3Expected =    {next: {start: 100, end: 149}}
	, popAllExpected =  {next: {start: 0, end: 149}}
	, emptyExpected = {empty: true}
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
				create(uri, id, count)
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}create a new queue with object arguments`, () =>
				create({uri, id, count})
					.should.eventually.deep.equal({})
			)
		})


		describe(`${itPrefix}pop`, function() {

			describe('existing queue', function()  {
				beforeEach(() => create(uri, id, count))
				// afterEach(() => remove(uri, id))

				it(`should ${itPrefix}pop a queue`, () =>
					pop(uri, id, size1)
						.should.eventually.deep.equal(pop1Expected)
				)

				it(`should ${itPrefix}pop a queue to empty`, () =>
					 pop(uri, id, size1)              .should.eventually.deep.equal(pop1Expected)
						.then(() => pop(uri, id, size1)).should.eventually.deep.equal(pop2Expected)
						.then(() => pop(uri, id, size1)).should.eventually.deep.equal(pop3Expected)
						.then(() => pop(uri, id, size1)).should.eventually.deep.equal(emptyExpected)
				)

				it(`should ${itPrefix}pop a queue past empty`, () =>
					 pop(uri, id, count + 10).should.eventually.deep.equal(popAllExpected)
				)

				it(`should ${itPrefix}pop a queue with object arguments`, () =>
					pop({uri, id, size:size1})
						.should.eventually.deep.equal(pop1Expected)
				)

				it(`should ${itPrefix}create pop concurrently from an existing queue`, function() {
					this.timeout(40000)
					const cCount = 200
					const count = 2000
					const size = 10
					const expecteds = _.range(cCount).map(i => ({next:{start:i*size, end:i*size + size - 1}}))

					console.log(`popping ${cCount} concurrent please wait`)

					return create(uri, id, count)
						.should.eventually.deep.equal({})
						.then(() => {
							const pops = _.range(cCount).map(() => pop({uri, id, size})
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
				pop(uri, noQueueId, size1)
					.should.eventually.deep.equal(emptyExpected)

			)

			it(`should ${itPrefix}pop a non existent queue with object arguments`, () =>
				pop({uri, id:noQueueId, size:size1})
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