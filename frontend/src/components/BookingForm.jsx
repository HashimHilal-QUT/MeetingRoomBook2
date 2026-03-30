import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BookingForm = ({ bookings, setBookings, editingBooking, setEditingBooking }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', room: '', date: '', startTime: '', endTime: '' });

  useEffect(() => {
    if (editingBooking) {
      setFormData({
        title: editingBooking.title,
        room: editingBooking.room,
        date: editingBooking.date,
        startTime: editingBooking.startTime,
        endTime: editingBooking.endTime,
      });
    } else {
      setFormData({ title: '', room: '', date: '', startTime: '', endTime: '' });
    }
  }, [editingBooking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        const response = await axiosInstance.put(`/api/bookings/${editingBooking._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBookings(bookings.map((b) => (b._id === response.data._id ? response.data : b)));
      } else {
        const response = await axiosInstance.post('/api/bookings', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBookings([...bookings, response.data]);
      }
      setEditingBooking(null);
      setFormData({ title: '', room: '', date: '', startTime: '', endTime: '' });
    } catch (error) {
      alert('Failed to save booking.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingBooking ? 'Edit Booking' : 'New Booking'}</h1>
      <input type="text" placeholder="Meeting Title" value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded" required />
      <input type="text" placeholder="Room Name" value={formData.room}
        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
        className="w-full mb-4 p-2 border rounded" required />
      <input type="date" value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="w-full mb-4 p-2 border rounded" required />
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Start Time</label>
          <input type="time" value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full p-2 border rounded" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">End Time</label>
          <input type="time" value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full p-2 border rounded" required />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {editingBooking ? 'Update Booking' : 'Create Booking'}
        </button>
        {editingBooking && (
          <button type="button" onClick={() => setEditingBooking(null)}
            className="flex-1 bg-gray-400 text-white p-2 rounded hover:bg-gray-500">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default BookingForm;
