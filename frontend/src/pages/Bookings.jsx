import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';
import { useAuth } from '../context/AuthContext';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get('/api/bookings', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBookings(response.data);
      } catch (error) {
        alert('Failed to fetch bookings.');
      }
    };
    if (user) fetchBookings();
  }, [user]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <BookingForm
        bookings={bookings}
        setBookings={setBookings}
        editingBooking={editingBooking}
        setEditingBooking={setEditingBooking}
      />
      <BookingList
        bookings={bookings}
        setBookings={setBookings}
        setEditingBooking={setEditingBooking}
      />
    </div>
  );
};

export default Bookings;
