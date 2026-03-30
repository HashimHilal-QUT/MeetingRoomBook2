const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Booking = require('../models/Booking');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { expect } = chai;

chai.use(chaiHttp);

// ─── Shared mock booking data ────────────────────────────────────────────────

const mockUserId   = new mongoose.Types.ObjectId();
const mockBookingId = new mongoose.Types.ObjectId();

const mockBookingBody = {
  title:     'Team Standup',
  room:      'Room A',
  date:      '2026-04-01',
  startTime: '09:00',
  endTime:   '09:30',
};

// ─── CREATE ──────────────────────────────────────────────────────────────────

describe('createBooking Function Test', () => {

  it('should create a new booking successfully', async () => {
    const createdBooking = {
      _id: mockBookingId,
      ...mockBookingBody,
      user: mockUserId,
    };

    const createStub = sinon.stub(Booking, 'create').resolves(createdBooking);

    const req = {
      user: { _id: mockUserId },
      body: mockBookingBody,
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await createBooking(req, res);

    expect(createStub.calledOnceWith({
      ...mockBookingBody,
      user: mockUserId,
    })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdBooking)).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs during creation', async () => {
    const createStub = sinon.stub(Booking, 'create').throws(new Error('DB Error'));

    const req = {
      user: { _id: mockUserId },
      body: mockBookingBody,
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await createBooking(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });

});

// ─── READ (all bookings) ─────────────────────────────────────────────────────

describe('getBookings Function Test', () => {

  it('should return all bookings for the logged-in user', async () => {
    const bookings = [
      { _id: new mongoose.Types.ObjectId(), ...mockBookingBody, user: mockUserId },
      { _id: new mongoose.Types.ObjectId(), title: 'Design Review', room: 'Room B',
        date: '2026-04-02', startTime: '10:00', endTime: '11:00', user: mockUserId },
    ];

    // Booking.find returns a chainable object with .sort()
    const sortStub = sinon.stub().resolves(bookings);
    const findStub = sinon.stub(Booking, 'find').returns({ sort: sortStub });

    const req = { user: { _id: mockUserId } };
    const res = {
      json:   sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getBookings(req, res);

    expect(findStub.calledOnceWith({ user: mockUserId })).to.be.true;
    expect(res.json.calledWith(bookings)).to.be.true;
    expect(res.status.called).to.be.false;

    findStub.restore();
  });

  it('should return 500 if an error occurs during fetch', async () => {
    const findStub = sinon.stub(Booking, 'find').throws(new Error('DB Error'));

    const req = { user: { _id: mockUserId } };
    const res = {
      json:   sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getBookings(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });

});

// ─── READ (single booking) ───────────────────────────────────────────────────

describe('getBookingById Function Test', () => {

  it('should return a single booking by ID', async () => {
    const booking = {
      _id:  mockBookingId,
      ...mockBookingBody,
      user: { toString: () => mockUserId.toString() },
    };

    const findByIdStub = sinon.stub(Booking, 'findById').resolves(booking);

    const req = {
      params: { id: mockBookingId },
      user:   { _id: { toString: () => mockUserId.toString() } },
    };
    const res = {
      json:   sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getBookingById(req, res);

    expect(findByIdStub.calledOnceWith(mockBookingId)).to.be.true;
    expect(res.json.calledWith(booking)).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if booking is not found', async () => {
    const findByIdStub = sinon.stub(Booking, 'findById').resolves(null);

    const req = {
      params: { id: new mongoose.Types.ObjectId() },
      user:   { _id: mockUserId },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await getBookingById(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Booking not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 403 if booking belongs to a different user', async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    const booking = {
      _id:  mockBookingId,
      ...mockBookingBody,
      user: { toString: () => otherUserId.toString() },
    };

    const findByIdStub = sinon.stub(Booking, 'findById').resolves(booking);

    const req = {
      params: { id: mockBookingId },
      user:   { _id: { toString: () => mockUserId.toString() } },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await getBookingById(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Not authorized' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Booking, 'findById').throws(new Error('DB Error'));

    const req = {
      params: { id: mockBookingId },
      user:   { _id: mockUserId },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await getBookingById(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });

});

// ─── UPDATE ──────────────────────────────────────────────────────────────────

describe('updateBooking Function Test', () => {

  it('should update a booking successfully', async () => {
    const existingBooking = {
      _id:       mockBookingId,
      ...mockBookingBody,
      user:      { toString: () => mockUserId.toString() },
      save:      sinon.stub().resolvesThis(),
    };

    const findByIdStub = sinon.stub(Booking, 'findById').resolves(existingBooking);

    const req = {
      params: { id: mockBookingId },
      user:   { _id: { toString: () => mockUserId.toString() } },
      body:   { title: 'Updated Standup', room: 'Room C' },
    };
    const res = {
      json:   sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await updateBooking(req, res);

    expect(existingBooking.title).to.equal('Updated Standup');
    expect(existingBooking.room).to.equal('Room C');
    expect(existingBooking.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if booking is not found', async () => {
    const findByIdStub = sinon.stub(Booking, 'findById').resolves(null);

    const req = {
      params: { id: new mongoose.Types.ObjectId() },
      user:   { _id: mockUserId },
      body:   {},
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await updateBooking(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Booking not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 403 if booking belongs to a different user', async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    const existingBooking = {
      _id:  mockBookingId,
      ...mockBookingBody,
      user: { toString: () => otherUserId.toString() },
    };

    const findByIdStub = sinon.stub(Booking, 'findById').resolves(existingBooking);

    const req = {
      params: { id: mockBookingId },
      user:   { _id: { toString: () => mockUserId.toString() } },
      body:   { title: 'Hacked Title' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await updateBooking(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Not authorized' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Booking, 'findById').throws(new Error('DB Error'));

    const req = {
      params: { id: mockBookingId },
      user:   { _id: mockUserId },
      body:   {},
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await updateBooking(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });

});

// ─── DELETE ──────────────────────────────────────────────────────────────────

describe('deleteBooking Function Test', () => {

  it('should delete a booking successfully', async () => {
    const existingBooking = {
      _id:        mockBookingId,
      ...mockBookingBody,
      user:       { toString: () => mockUserId.toString() },
      deleteOne:  sinon.stub().resolves(),
    };

    const findByIdStub = sinon.stub(Booking, 'findById').resolves(existingBooking);

    const req = {
      params: { id: mockBookingId.toString() },
      user:   { _id: { toString: () => mockUserId.toString() } },
    };
    const res = {
      json:   sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await deleteBooking(req, res);

    expect(findByIdStub.calledOnceWith(mockBookingId.toString())).to.be.true;
    expect(existingBooking.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Booking deleted' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if booking is not found', async () => {
    const findByIdStub = sinon.stub(Booking, 'findById').resolves(null);

    const req = {
      params: { id: new mongoose.Types.ObjectId().toString() },
      user:   { _id: mockUserId },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await deleteBooking(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Booking not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 403 if booking belongs to a different user', async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    const existingBooking = {
      _id:  mockBookingId,
      ...mockBookingBody,
      user: { toString: () => otherUserId.toString() },
    };

    const findByIdStub = sinon.stub(Booking, 'findById').resolves(existingBooking);

    const req = {
      params: { id: mockBookingId.toString() },
      user:   { _id: { toString: () => mockUserId.toString() } },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await deleteBooking(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Not authorized' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Booking, 'findById').throws(new Error('DB Error'));

    const req = {
      params: { id: mockBookingId.toString() },
      user:   { _id: mockUserId },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json:   sinon.spy(),
    };

    await deleteBooking(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });

});