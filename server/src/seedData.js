import Post from "./models/Post.js";

const examplePosts = [
  {
    type: "event",
    title: "Python Workshop Tomorrow",
    description: "Join us for an exciting Python programming workshop! Learn the basics of Python, data structures, and build your first project. Perfect for beginners and intermediate programmers. We'll cover everything from basic syntax to building a simple web application.",
    location: "Computer Science Lab 101",
    eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    authorSid: "demo_user_1",
    imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop",
    rsvp: {
      going: 15,
      interested: 8,
      notGoing: 2
    }
  },
  {
    type: "lostfound",
    title: "Lost iPhone 15 - Blue Case",
    description: "Lost my iPhone 15 with a blue case near the main library entrance yesterday evening around 6 PM. It has a cracked screen protector and my contact info on the lock screen. Please contact if found! Reward offered.",
    location: "Main Library Entrance",
    lostFoundType: "lost",
    item: "iPhone 15 with blue case",
    authorSid: "demo_user_2",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop"
  },
  {
    type: "announcement",
    title: "Final Exam Schedule Released",
    description: "The Computer Science Department has released the final exam schedule for the current semester. All exams will be held in the main auditorium. Please check your student portal for specific dates and times. Study materials are available in the library.",
    department: "Computer Science Department",
    authorSid: "demo_user_3",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
  },
  {
    type: "event",
    title: "Hackathon 2024",
    description: "Get ready for the biggest hackathon of the year! 48 hours of coding, innovation, and amazing prizes. Teams of 2-4 members. Registration closes this Friday. Prizes include laptops, tablets, and internship opportunities.",
    location: "Main Auditorium",
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    authorSid: "demo_user_4",
    imageUrl: "/uploads/hackathon.png",
    rsvp: {
      going: 45,
      interested: 23,
      notGoing: 5
    }
  },
  {
    type: "lostfound",
    title: "Found Silver MacBook Pro",
    description: "Found a silver MacBook Pro in the cafeteria this morning. It has a sticker of a cat on the lid. Please come to the lost and found office with proof of ownership to claim it. The laptop is in good condition.",
    location: "Cafeteria",
    lostFoundType: "found",
    item: "Silver MacBook Pro",
    authorSid: "demo_user_5",
    imageUrl: "/uploads/mackbook.jpg"
  },
  {
    type: "announcement",
    title: "Holiday Schedule Update",
    description: "The university will be closed for the upcoming holiday weekend. All classes are suspended from Friday to Monday. Regular schedule resumes on Tuesday. Library will remain open for study purposes.",
    department: "Administration",
    authorSid: "demo_user_6",
    imageUrl: "/uploads/HolidaySchedule.jpg"
  },
  {
    type: "event",
    title: "Campus Photography Contest",
    description: "Show off your photography skills! Submit your best campus photos for a chance to win amazing prizes. Categories include architecture, nature, student life, and creative shots. Deadline: Next Friday.",
    location: "Student Center",
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    authorSid: "demo_user_7",
    imageUrl: "/uploads/photography-contest.jpg",
    rsvp: {
      going: 28,
      interested: 15,
      notGoing: 3
    }
  },
  {
    type: "lostfound",
    title: "Lost Student ID Card",
    description: "Lost my student ID card near the gym yesterday afternoon. It has my photo and name 'Sarah Johnson'. Please return to the student services office or contact me directly. Need it for exams next week!",
    location: "Gym Area",
    lostFoundType: "lost",
    item: "Student ID Card",
    authorSid: "demo_user_8",
    imageUrl: "/uploads/lost-id-card.jpg"
  },
  {
    type: "announcement",
    title: "New Library Hours",
    description: "Starting next week, the library will extend its hours to 24/7 during exam periods. Study rooms can be booked online. Coffee shop will also have extended hours. Study hard, everyone!",
    department: "Library Services",
    authorSid: "demo_user_9",
    imageUrl: "/uploads/library-hours.jpg"
  },
  {
    type: "event",
    title: "Career Fair 2024",
    description: "Connect with top companies and explore internship and job opportunities! Over 50 companies will be present including Google, Microsoft, Amazon, and local startups. Bring your resume and dress professionally.",
    location: "Sports Complex",
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
    authorSid: "demo_user_10",
    imageUrl: "/uploads/career-fair.jpg",
    rsvp: {
      going: 120,
      interested: 45,
      notGoing: 8
    }
  },
  {
    type: "lostfound",
    title: "Found Black Wireless Earbuds",
    description: "Found a pair of black wireless earbuds in the computer lab yesterday. They were left on the desk near the window. Please describe the brand and any identifying features to claim them.",
    location: "Computer Lab 203",
    lostFoundType: "found",
    item: "Black Wireless Earbuds",
    authorSid: "demo_user_11",
    imageUrl: "/uploads/found-earbuds.jpg"
  },
  {
    type: "announcement",
    title: "WiFi Maintenance Notice",
    description: "Scheduled WiFi maintenance will occur this Saturday from 2 AM to 6 AM. Internet connectivity may be intermittent during this time. Please plan your online activities accordingly. We apologize for any inconvenience.",
    department: "IT Services",
    authorSid: "demo_user_12",
    imageUrl: "/uploads/wifi-maintenance.jpg"
  },
  {
    type: "event",
    title: "Movie Night: The Matrix",
    description: "Join us for a classic movie night! We'll be screening 'The Matrix' in the auditorium. Free popcorn and drinks provided. Doors open at 7 PM, movie starts at 7:30 PM. Bring your friends!",
    location: "Main Auditorium",
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    authorSid: "demo_user_13",
    imageUrl: "/uploads/movie-night.jpg",
    rsvp: {
      going: 67,
      interested: 34,
      notGoing: 12
    }
  },
  {
    type: "lostfound",
    title: "Lost Red Water Bottle",
    description: "Lost my red Hydro Flask water bottle with stickers on it. Last seen in the cafeteria around lunch time. It has my name written on the bottom. Please return if found!",
    location: "Cafeteria",
    lostFoundType: "lost",
    item: "Red Water Bottle",
    authorSid: "demo_user_14",
    imageUrl: "/uploads/lost-water-bottle.jpg"
  },
  {
    type: "announcement",
    title: "Parking Permit Renewal",
    description: "All student parking permits expire at the end of this month. Renew your permit online or visit the parking office. New permits will be required starting next month. Don't get a ticket!",
    department: "Parking Services",
    authorSid: "demo_user_15",
    imageUrl: "/uploads/parking-permit.jpg"
  }
];

export async function seedPosts() {
  try {
    // Clear existing posts
    await Post.deleteMany({});
    
    // Insert example posts
    const createdPosts = await Post.insertMany(examplePosts);
    
    console.log(`✅ Seeded ${createdPosts.length} example posts`);
    return createdPosts;
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./index.js').then(() => {
    seedPosts().then(() => {
      console.log('Seeding completed');
      process.exit(0);
    }).catch(() => {
      process.exit(1);
    });
  });
}
