export type ResStatus = 'conf' | 'pend' | 'canc';

export type Reservation = {
  id: number;
  time: string;
  date: string;
  name: string;
  phone: string;
  detail: string;
  guests: number;
  table: string;
  status: ResStatus;
  note?: string;
};

export const RESERVATIONS: Reservation[] = [
  { id: 1,  time: '7:00 PM', date: 'Today',     name: 'Sharma Family',     phone: '+91 98201 11223', detail: '4 guests • Table 6',       guests: 4,  table: 'Table 6 (6 pax)', status: 'conf', note: 'Window seat preferred' },
  { id: 2,  time: '7:30 PM', date: 'Today',     name: 'Mehta Birthday',    phone: '+91 90001 55678', detail: '8 guests • Table 9 & 15',  guests: 8,  table: 'Table 9 (8 pax)', status: 'conf', note: 'Birthday cake arrangement' },
  { id: 3,  time: '8:00 PM', date: 'Today',     name: 'Rajesh Nair',       phone: '+91 99887 12345', detail: '2 guests • Table 1',       guests: 2,  table: 'Table 1 (2 pax)', status: 'pend' },
  { id: 4,  time: '8:30 PM', date: 'Today',     name: 'Corporate Dinner',  phone: '+91 80001 99100', detail: '12 guests • Private Room', guests: 12, table: 'Table 9 (8 pax)', status: 'conf', note: 'Projector needed' },
  { id: 5,  time: '9:00 PM', date: 'Today',     name: 'Priya & Ankit',     phone: '+91 78456 23344', detail: '2 guests • Table 4',       guests: 2,  table: 'Table 3 (4 pax)', status: 'pend', note: 'Anniversary dinner' },
  { id: 6,  time: '7:00 PM', date: 'Tomorrow',  name: 'Gupta Anniversary', phone: '+91 91122 33445', detail: '2 guests • Table 3',       guests: 2,  table: 'Table 3 (4 pax)', status: 'conf', note: 'Candle-light setup' },
  { id: 7,  time: '8:00 PM', date: 'Tomorrow',  name: 'Office Party',      phone: '+91 87654 32100', detail: '20 guests • Full Hall',    guests: 20, table: 'Table 9 (8 pax)', status: 'pend', note: 'DJ music allowed' },
  { id: 8,  time: '7:30 PM', date: '28 May',    name: 'Verma Family',      phone: '+91 99001 44556', detail: '6 guests • Table 6',       guests: 6,  table: 'Table 6 (6 pax)', status: 'conf' },
  { id: 9,  time: '6:30 PM', date: 'Yesterday', name: 'Khan Group',        phone: '+91 88123 76543', detail: '5 guests • Table 12',      guests: 5,  table: 'Table 6 (6 pax)', status: 'canc', note: 'Cancelled 2h before' },
  { id: 10, time: '8:30 PM', date: 'Yesterday', name: 'Desai Wedding',     phone: '+91 97654 10293', detail: '30 guests • Banquet Hall', guests: 30, table: 'Table 9 (8 pax)', status: 'conf' },
];