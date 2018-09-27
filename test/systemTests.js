const chai = require('chai')

	, id = Math.random().toString()
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
	, { specQueueClient, create, pop, remove } = require('..')
	, sqc = specQueueClient(uri)

chai.should()
chai.use(require('chai-as-promised'))



describe('spec-queue-client', function() {
	this.timeout(10000)

	describe('create', function() {
		afterEach(() => remove(uri, id))
		it('should create a new queue', () =>
			create(uri, id, queue)
				.should.eventually.deep.equal({})
		)
		it('should create a new queue with object arguments', () =>
			create({uri, id, queue})
				.should.eventually.deep.equal({})
		)
	})

	describe('remove', function() {
		it('should remove a queue', () =>
			remove(uri, id)
				.should.eventually.deep.equal({})
		)
		it('should remove a queue with object arguments', () =>
			remove({uri, id})
				.should.eventually.deep.equal({})
		)
		it('should remove a non existent queue', () =>
			remove(uri, noQueueId)
				.should.eventually.deep.equal({})
		)
		it('should create a non existent queue with object arguments', () =>
			remove({uri, id:noQueueId})
				.should.eventually.deep.equal({})
		)
	})

	describe('pop', function() {
		describe('existing queue', function()  {
			beforeEach(() => create(uri, id, queue))
			afterEach(() => remove(uri, id))

			it('should pop a queue', () =>
				pop(uri, id)
					.should.eventually.deep.equal(i1Expected)
			)
			it('should pop a queue to empty', () =>
				pop(uri, id)
				.should.eventually.deep.equal(i1Expected)
				.then(() => pop(uri, id))
				.should.eventually.deep.equal(i2Expected)
				.then(() => pop(uri, id))
				.should.eventually.deep.equal(i3Expected)
				.then(() => pop(uri, id))
				.should.eventually.deep.equal(emptyExpected)
			)
			it('should pop a queue with object arguments', () =>
				pop({uri, id})
					.should.eventually.deep.equal(i1Expected)
			)

		})
		it('should pop a non existent queue', () =>
			pop(uri, noQueueId)
				.should.eventually.deep.equal(emptyExpected)

		)
		it('should create a non existent queue with object arguments', () =>
			pop({uri, id:noQueueId})
				.should.eventually.deep.equal(emptyExpected)
		)
	})

	describe('specQueueClient', function() {
		describe('create', function() {
			it('should create a new queue', () =>
				sqc.create(id, queue)
					.should.eventually.deep.equal({})
			)
			it('should create a new queue with object arguments', () =>
				sqc.create({id, queue})
					.should.eventually.deep.equal({})
			)
		})
	})

})

