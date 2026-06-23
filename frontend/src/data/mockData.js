// Mock data for Phase 1 of CampusEcho (Pure JavaScript)

export const USER_ROLES = {
  STUDENT: 'student',
  LECTURER: 'lecturer',
  ADMIN: 'admin'
};

export const INITIAL_PROFILES = {
  student: {
    firstName: 'Alex',
    lastName: 'Kariuki',
    regNumber: 'BCS-05-0021-2023',
    course: 'B.Sc. Computer Science',
    email: 'alex.kariuki@students.must.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    yearOfStudy: 'Year 3, Sem 2',
    department: 'Computing and Informatics'
  },
  lecturer: {
    firstName: 'Dr. Jane',
    lastName: 'Mugo',
    regNumber: 'LEC-MUST-4082',
    course: 'Advanced Distributed Systems',
    email: 'jane.mugo@must.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Software Engineering',
    title: 'Senior Lecturer'
  },
  admin: {
    firstName: 'Clara',
    lastName: 'Ndora',
    regNumber: 'ADM-MUST-0012',
    course: 'Director of ICT Services',
    email: 'clara.ndora@must.ac.ke',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Administration',
    role: 'Super Administrator'
  }
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Assignment Due Tomorrow',
    description: 'BCS 3101: Distributed Systems project submission by 11:59 PM.',
    time: '30 mins ago',
    type: 'alert',
    unread: true
  },
  {
    id: 2,
    title: 'Class Starts in 30 minutes',
    description: 'Advanced Network Protocols (BCS 3102) is starting in LH 03.',
    time: '1 hour ago',
    type: 'class',
    unread: true
  },
  {
    id: 3,
    title: 'Class Venue Changed',
    description: 'BCS 3105 (Mobile Computing) moved from Lab 3 to Science Complex Hall A.',
    time: '3 hours ago',
    type: 'venue',
    unread: false
  },
  {
    id: 4,
    title: 'New Announcement Posted',
    description: 'The Office of the Registrar released the official 10th Graduation Clearance Guidelines.',
    time: '1 day ago',
    type: 'announcement',
    unread: false
  }
];

export const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Graduation Rehearsal Schedule',
    content: 'All graduating students are requested to attend the mandatory rehearsal on Wednesday, Nov 25th, 2026, at the Main Graduation Square starting at 9:00 AM.',
    date: 'June 18, 2026',
    category: 'Graduation',
    author: 'Office of the Registrar'
  },
  {
    id: 2,
    title: 'Semester Registration Deadline Extension',
    content: 'The deadline for online course and fee registration for the May-August semester has been extended until June 28, 2026. No late registrations will be accepted.',
    date: 'June 15, 2026',
    category: 'Academic',
    author: 'Finance & Academics'
  },
  {
    id: 3,
    title: 'Student Governing Council (SGC) Elections',
    content: 'Nominations are now open for the various SGC positions. Pick up nomination forms from the Dean of Students office. Deadline for submission is June 25th.',
    date: 'June 12, 2026',
    category: 'Elections',
    author: 'Electoral Commission'
  }
];

export const EVENTS = [
  {
    id: 1,
    title: '10th Graduation Ceremony',
    description: 'Celebrating the achievements of our class of 2026 at the Main Campus Graduation Square.',
    date: 'Fri, Nov 27, 2026',
    time: '08:00 AM - 02:00 PM',
    venue: 'Graduation Square',
    tag: 'Academic'
  },
  {
    id: 2,
    title: 'MUST Tech Innovation Week',
    description: 'Exhibit your coding, robotics, and hardware hackathon projects. Win prizes up to KES 50,000.',
    date: 'Jul 15 - Jul 19, 2026',
    time: '09:00 AM - 04:30 PM Daily',
    venue: 'Science Complex Quadrangle',
    tag: 'Technology'
  },
  {
    id: 3,
    title: 'Annual Cultural Festival',
    description: 'Experience diversity, traditional dances, cultural cuisines, and the annual Miss & Mr. MUST contest.',
    date: 'Aug 05 - Aug 07, 2026',
    time: '02:00 PM - 10:00 PM',
    venue: 'Sports Complex Main Ground',
    tag: 'Cultural'
  }
];

export const CAMPUS_NEWS = [
  {
    id: 1,
    title: 'MUST Receives KES 20M Research Grant for Smart Agriculture IoT Solutions',
    summary: 'The Department of Computing has partnered with international bodies to build solar-powered precision farming networks.',
    date: 'June 19, 2026',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&auto=format&fit=crop&q=80',
    category: 'Research'
  },
  {
    id: 2,
    title: 'Modern Library Wing Officially Commissioned',
    summary: 'The state-of-the-art wing features double the seating capacity, active collaboration rooms, and 24/7 high-speed fiber.',
    date: 'June 14, 2026',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop&q=80',
    category: 'Infrastructure'
  },
  {
    id: 3,
    title: 'MUST Men\'s Basketball Team Qualifies for East Africa University Games',
    summary: 'Following a dramatic 78-75 overtime victory, the Lions have punched their ticket to represent the university regionally.',
    date: 'June 10, 2026',
    image: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=400&auto=format&fit=crop&q=80',
    category: 'Sports'
  }
];

export const CAFETERIA_MENU = {
  breakfast: [
    { id: 1, name: 'Toasted Mandazi', price: 15, duration: '2 mins' },
    { id: 2, name: 'Chapatis (Pair)', price: 30, duration: '3 mins' },
    { id: 3, name: 'African Brewed Tea', price: 20, duration: '1 min' },
    { id: 4, name: 'Spanish Omelette', price: 50, duration: '5 mins' },
  ],
  lunch: [
    { id: 5, name: 'Ugali Beef with Sukumawiki', price: 120, duration: '5 mins' },
    { id: 6, name: 'Yellow Rice with Chicken Stew', price: 150, duration: '6 mins' },
    { id: 7, name: 'Githeri Mixed Special (Guacamole)', price: 70, duration: '3 mins' },
    { id: 8, name: 'Mokimo with Veg/Gravy', price: 80, duration: '4 mins' },
    { id: 9, name: 'Fried Tilapia with Ugali', price: 180, duration: '10 mins' },
  ],
  drinks: [
    { id: 10, name: 'Cold Fresh Mango Juice', price: 40, duration: '1 min' },
    { id: 11, name: 'Soda (300ml)', price: 40, duration: '1 min' },
    { id: 12, name: 'Bottled Mineral Water', price: 30, duration: '1 min' },
  ]
};

export const CAMPUS_LOCATIONS = [
  {
    id: 'library',
    name: 'Main Library Wing',
    description: 'A modern, multi-story quiet study area, research spaces, and electronic media resources holding over 100,000 journals.',
    walkingTime: '4 mins',
    distance: '300m',
    icon: 'BookOpen',
    coordinates: { x: '45%', y: '35%' },
    services: ['Study rooms', 'E-resources', 'Printing', 'Silent study'],
    floorCount: '3 floors'
  },
  {
    id: 'main-hall',
    name: 'Main Assembly Hall',
    description: 'The monumental multipurpose hall used for university orientation, indoor sports, lectures, theater dramas, and student townhalls.',
    walkingTime: '2 mins',
    distance: '150m',
    icon: 'Award',
    coordinates: { x: '50%', y: '60%' },
    services: ['Indoor Stage', 'Acoustic Sound', 'Seating: 1500', 'Exhibition Area'],
    floorCount: '1 floor'
  },
  {
    id: 'admin-block',
    name: 'Administration Block',
    description: 'Houses critical administrative units including Vice Chancellor\'s lobby, Finance/Cashier desk, Academic registrar, and exam offices.',
    walkingTime: '5 mins',
    distance: '400m',
    icon: 'Building',
    coordinates: { x: '30%', y: '40%' },
    services: ['Fee clearances', 'Hostel allocations', 'Dean office', 'ID Card center'],
    floorCount: '5 floors'
  },
  {
    id: 'ict-labs',
    name: 'Science & ICT Complex Labs',
    description: 'Equipped with over 300 modern workstations with fast networks, Linux servers, AI research modules, and microcontroller engineering tools.',
    walkingTime: '6 mins',
    distance: '450m',
    icon: 'Cpu',
    coordinates: { x: '65%', y: '30%' },
    services: ['ICT Lab 1 - 4', 'Robotics Bench', 'Free Printing', 'Cisco Academy'],
    floorCount: '2 floors'
  },
  {
    id: 'cafeteria',
    name: 'University Student Mess (Cafeteria)',
    description: 'Provides affordable, delicious, hot local meals from dawn to night. Accommodates students across expansive indoor and scenic outdoor decks.',
    walkingTime: '3 mins',
    distance: '220m',
    icon: 'Utensils',
    coordinates: { x: '40%', y: '70%' },
    services: ['Main Meals counter', 'Fast-foods snackbar', 'Snooker section', 'Beverage bar'],
    floorCount: '1 floor'
  },
  {
    id: 'hostels',
    name: 'Chuka and Ruiri Hostels',
    description: 'Cozy secure on-campus residential areas for first-years and scholarship students featuring constant laundry lines and study common areas.',
    walkingTime: '8 mins',
    distance: '600m',
    icon: 'Home',
    coordinates: { x: '20%', y: '25%' },
    services: ['WI-FI lobbies', 'Badminton court', 'Hot water', 'Guarded entry'],
    floorCount: '4 blocks'
  },
  {
    id: 'sports-complex',
    name: 'Main Sports Complex',
    description: 'Outdoor athletic tracks, professional football pitch, standard basketball court, lawn tennis surfaces, and volleyball fields.',
    walkingTime: '10 mins',
    distance: '750m',
    icon: 'Trophy',
    coordinates: { x: '75%', y: '75%' },
    services: ['Synthetic Track', 'Changing closets', 'Basketball court', 'Gymnasiums'],
    floorCount: 'Outdoor'
  }
];

export const TIMETABLE_DATA = {
  monday: [
    { unitCode: 'BCS 3101', unitName: 'Distributed Systems', lecturer: 'Dr. Jane Mugo', venue: 'ICT Lab 2', time: '08:00 AM - 11:00 AM' },
    { unitCode: 'BCS 3102', unitName: 'Network Security', lecturer: 'Prof. J. Nderitu', venue: 'Main Hall A', time: '11:00 AM - 02:00 PM' }
  ],
  tuesday: [
    { unitCode: 'BCS 3103', unitName: 'Compiler Construction', lecturer: 'Dr. Evans Gaka', venue: 'Science Lect. Theatre 1', time: '11:00 AM - 02:00 PM' },
    { unitCode: 'BCS 3104', unitName: 'Machine Learning', lecturer: 'Grace Wanjiku', venue: 'ICT Lab 4', time: '02:00 PM - 05:00 PM' }
  ],
  wednesday: [
    { unitCode: 'BCS 3105', unitName: 'Mobile App Development', lecturer: 'Mr. Peter Otieno', venue: 'ICT Lab 1', time: '08:00 AM - 11:00 AM' }
  ],
  thursday: [
    { unitCode: 'BCS 3101', unitName: 'Distributed Systems (Lab)', lecturer: 'Dr. Jane Mugo', venue: 'ICT Lab 3', time: '02:00 PM - 05:00 PM' }
  ],
  friday: [] // Empty state illustration trigger
};

export const BOT_RESPONSES = [
  {
    keywords: ['library', 'books', 'quiet', 'read'],
    response: 'The **Main Library Wing** is located north of the Science Complex. It is open **Monday to Friday from 8:00 AM to 10:00 PM**, and **Saturday from 9:00 AM to 5:00 PM**. It offers e-journals, silent research desks, and student study cells.'
  },
  {
    keywords: ['graduation', 'graduate', 'clearance', 'rehearsal'],
    response: 'The magnificent **10th Graduation Ceremony** is scheduled for **Friday, November 27th, 2026** at the central Graduation Square. Mandatory graduation clearance must be completed via the Student Portal by Nov 10th. The rehearsal takes place on Wednesday, Nov 25th.'
  },
  {
    keywords: ['class', 'timetable', 'today', 'lecture', 'classes'],
    response: 'Based on your timetable, today you have: \n• **BCS 3101: Distributed Systems** | 08:00 AM - 11:00 AM | ICT Lab 2\n• **BCS 3102: Network Security** | 11:00 AM - 02:00 PM | Main Hall A.\n\nKeep track of your classes to avoid missing any lectures!'
  },
  {
    keywords: ['lab', 'ict', 'computer', 'server'],
    response: 'Our university features **4 advanced ICT Labs** situated on the first and second floor of the **Science & ICT Complex**. They compile high-performance machines with high speed internet access and are open to IT/CS students during weekdays.'
  },
  {
    keywords: ['cafeteria', 'food', 'lunch', 'menu', 'eat'],
    response: 'The **Student Mess (Cafeteria)** is serving some delicious delicacies today! Popular dishes today: **Ugali Beef with Sukumawiki (KES 120)** and **Yellow Rice with Chicken Stew (KES 150)**. They also serve Spanish Omelette and hot African Tea for breakfast.'
  },
  {
    keywords: ['sports', 'gym', 'basketball', 'football'],
    response: 'The **Main Sports Complex** on the south side contains full athletic running tracks, professional basketball court, and the main football stadium. Feel free to register for the upcoming semester leagues!'
  },
  {
    keywords: ['venue', 'classroom', 'hall'],
    response: 'Common venues are located in the Science Complex (Main Hall, LH1-6, Lab 1-4) or the Old Assembly Hall behind the administration offices.'
  }
];

export const DEFAULT_BOT_REPLY = "I'm EchoBot, your campus companion! You can ask me query keywords like **library**, **graduation**, **today's classes**, **ICT lab**, **cafeteria menu**, or **sports complex** to get smart insights, directions, and timings!";
