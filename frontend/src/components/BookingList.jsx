import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BookingList = ({ bookings, setBookings, setEditingBooking }) => {
  const { user } = useAuth();

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await axiosInstance.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (error) {
      alert('Failed to delete booking.');
    }
  };

  if (bookings.length === 0) {
    return <p className="text-gray-500 text-center mt-4">No bookings yet. Create one above!</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h3 className="font-bold text-lg">{booking.title}</h3>
          <p className="text-gray-700">Room: {booking.room}</p>
          <p className="text-gray-700">Date: {booking.date}</p>
          <p className="text-sm text-gray-500">{booking.startTime} – {booking.endTime}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setEditingBooking(booking)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</button>
            <button onClick={() => handleDelete(booking._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingList;
