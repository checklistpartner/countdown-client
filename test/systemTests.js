const chai = require('chai')
	, _ = require('lodash')
	, id = Math.random().toString().replace('.', '')
	, noCountId = 'noCountId'
	, count = 150
	, size1 = 50
	, decrement1Expected =    {next: {start: 0, end: 49}}
	, decrement2Expected =    {next: {start: 50, end: 99}}
	, decrement3Expected =    {next: {start: 100, end: 149}}
	, decrementAllExpected =  {next: {start: 0, end: 149}}
	, emptyExpected = {empty: true}
	, uri = 'https://us-east1-countdown-219723.cloudfunctions.net/countdown'
	, countdownClient = require('..')
	, { create, decrement, remove } = countdownClient
	, sqc = countdownClient(uri)

chai.should()
chai.use(require('chai-as-promised'))

const types = {
	functions: {itPrefix: '', create, decrement, remove},
	countdownClient: {
		itPrefix: 'countdownClient.',
		create: function () {
			return sqc.create(...removeUriFromArguments(arguments))
		},
		decrement: function () {
			return sqc.decrement(...removeUriFromArguments(arguments))
		},
		remove: function () {
			return sqc.remove(...removeUriFromArguments(arguments))
		}
	}
}



describe('countdown-client', function() {
	this.timeout(10000)

	;([
		'functions',
		'countdownClient'
	]).map(type => {
		const {itPrefix, create, decrement, remove} = types[type]

		describe(`${itPrefix}create`, function() {
			afterEach(() => remove(uri, id))

			it(`should ${itPrefix}create a new count`, () =>
				create(uri, id, count)
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}create a new count with object arguments`, () =>
				create({uri, id, count})
					.should.eventually.deep.equal({})
			)
		})


		describe(`${itPrefix}decrement`, function() {

			describe('existing count', function()  {
				beforeEach(() => create(uri, id, count))
				// afterEach(() => remove(uri, id))

				it(`should ${itPrefix}decrement a count`, () =>
					decrement(uri, id, size1)
						.should.eventually.deep.equal(decrement1Expected)
				)

				it(`should ${itPrefix}decrement a count to empty`, () =>
					 decrement(uri, id, size1)              .should.eventually.deep.equal(decrement1Expected)
						.then(() => decrement(uri, id, size1)).should.eventually.deep.equal(decrement2Expected)
						.then(() => decrement(uri, id, size1)).should.eventually.deep.equal(decrement3Expected)
						.then(() => decrement(uri, id, size1)).should.eventually.deep.equal(emptyExpected)
				)

				it(`should ${itPrefix}decrement a count past empty`, () =>
					 decrement(uri, id, count + 10).should.eventually.deep.equal(decrementAllExpected)
				)

				it(`should ${itPrefix}decrement a count with object arguments`, () =>
					decrement({uri, id, size:size1})
						.should.eventually.deep.equal(decrement1Expected)
				)

				it(`should ${itPrefix}create decrement concurrently from an existing count`, function() {
					this.timeout(40000)
					const cCount = 200
					const count = 2000
					const size = 10
					const expecteds = _.range(cCount).map(i => ({next:{start:i*size, end:i*size + size - 1}}))

					console.log(`decrementping ${cCount} concurrent please wait`)

					return create(uri, id, count)
						.should.eventually.deep.equal({})
						.then(() => {
							const decrements = _.range(cCount).map(() => decrement({uri, id, size})
								.should.eventually.not.deep.equal(emptyExpected)
								.then(actual => {
									_.remove(expecteds, expected => _.isEqual(expected, actual))
										.should.have.length(1, `${actual} wasn't removed from expected`)
									return actual
								})

							)
							return Promise.all(decrements)
								.then(() => expecteds)
								.should.eventually.have.length(0)
						})
				})

			})

			it(`should ${itPrefix}decrement a non existent count`, () =>
				decrement(uri, noCountId, size1)
					.should.eventually.deep.equal(emptyExpected)

			)

			it(`should ${itPrefix}decrement a non existent count with object arguments`, () =>
				decrement({uri, id:noCountId, size:size1})
					.should.eventually.deep.equal(emptyExpected)
			)

		})


		describe(`${itPrefix}remove`, function() {

			it(`should ${itPrefix}remove a count`, () =>
				remove(uri, id)
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}remove a count with object arguments`, () =>
				remove({uri, id})
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}remove a non existent count`, () =>
				remove(uri, noCountId)
					.should.eventually.deep.equal({})
			)

			it(`should ${itPrefix}remove a non existent count with object arguments`, () =>
				remove({uri, id:noCountId})
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