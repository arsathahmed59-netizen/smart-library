const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database records with 50+ books and categories...");

  // 1. Clear existing database entries
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.borrowRecord.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Existing tables cleaned.");

  // 2. Hash default passwords
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Users (Student and Admin + Extra Student profiles)
  const student = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "student@aura.edu",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Dr. Sarah Vance",
      email: "admin@aura.edu",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Additional student profiles
  const student2 = await prisma.user.create({
    data: { name: "Emily Watson", email: "emily@aura.edu", password: hashedPassword, role: "STUDENT" },
  });
  const student3 = await prisma.user.create({
    data: { name: "Rahul Sharma", email: "rahul@aura.edu", password: hashedPassword, role: "STUDENT" },
  });
  const student4 = await prisma.user.create({
    data: { name: "Priya Patel", email: "priya@aura.edu", password: hashedPassword, role: "STUDENT" },
  });

  console.log("Demo Users registered:");
  console.log(`- Student: student@aura.edu / password123`);
  console.log(`- Admin/Librarian: admin@aura.edu / password123`);
  console.log(`- Student 2: emily@aura.edu / password123`);
  console.log(`- Student 3: rahul@aura.edu / password123`);
  console.log(`- Student 4: priya@aura.edu / password123`);

  // 4. Create 25 Categories
  const categoryNames = [
    "C Programming", "Python Programming", "Java Programming", "Data Structures", 
    "Operating Systems", "Computer Networks", "Digital Electronics", "Analog Electronics", 
    "Signals and Systems", "Engineering Mathematics", "Physics for Engineers", 
    "Basic Electrical Engineering", "Verilog HDL", "Microprocessors", "Embedded Systems", 
    "Artificial Intelligence", "Machine Learning", "DBMS", "Software Engineering", 
    "Semiconductor Physics", "Communication Systems", "Control Systems", "Linear Algebra", 
    "Calculus", "Aptitude Books"
  ];

  const categories = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.create({ data: { name } });
    categories[name] = cat.id;
  }
  console.log("25 Categories registered.");

  // 5. Create 50 Sample Books (2 for each category)
  const booksData = [
    // 1. C Programming
    {
      title: "The C Programming Language",
      author: "Brian W. Kernighan & Dennis M. Ritchie",
      isbn: "9780131103627",
      coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=300",
      description: "The classical and definitive guide to C programming, written by the developers of the language. Explains C syntax, types, flow control, and functions with legendary clarity.",
      department: "Computer Science",
      rackLocation: "CS-01",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 5,
      categoryName: "C Programming"
    },
    {
      title: "C Programming: A Modern Approach",
      author: "K. N. King",
      isbn: "9780393979503",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300",
      description: "An excellent tutorial and reference for students learning C. Includes complete coverage of the C99 standard and details complex features like pointers and memory management clearly.",
      department: "Computer Science",
      rackLocation: "CS-02",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "C Programming"
    },
    // 2. Python Programming
    {
      title: "Python Crash Course: A Hands-On Project-Based Introduction",
      author: "Eric Matthes",
      isbn: "9781593279288",
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=300",
      description: "A fast-paced, thorough introduction to Python that will have you writing programs, solving problems, and making things that work in no time.",
      department: "Computer Science",
      rackLocation: "CS-03",
      status: "AVAILABLE",
      copiesCount: 8,
      availableCopies: 7,
      categoryName: "Python Programming"
    },
    {
      title: "Learning Python: Powerful Object-Oriented Programming",
      author: "Mark Lutz",
      isbn: "9781449355739",
      coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=300",
      description: "Get a comprehensive, in-depth introduction to the core Python language with this book based on the author's popular training courses.",
      department: "Computer Science",
      rackLocation: "CS-04",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Python Programming"
    },
    // 3. Java Programming
    {
      title: "Effective Java",
      author: "Joshua Bloch",
      isbn: "9780134685991",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300",
      description: "A must-have guide containing best-practices for writing clear, correct, robust, and reusable Java code.",
      department: "Computer Science",
      rackLocation: "CS-05",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Java Programming"
    },
    {
      title: "Head First Java: A Brain-Friendly Guide",
      author: "Kathy Sierra & Bert Bates",
      isbn: "9780596009205",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300",
      description: "A complete object-oriented programming (OOP) learning experience that makes learning Java engaging and visual.",
      department: "Computer Science",
      rackLocation: "CS-06",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 3,
      categoryName: "Java Programming"
    },
    // 4. Data Structures
    {
      title: "Introduction to Algorithms (CLRS)",
      author: "Thomas H. Cormen, Charles E. Leiserson & Ronald L. Rivest",
      isbn: "9780262033848",
      coverImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=300",
      description: "The gold standard reference text for computer algorithms, covering a broad range of data structures and algorithms in depth.",
      department: "Computer Science",
      rackLocation: "CS-07",
      status: "AVAILABLE",
      copiesCount: 10,
      availableCopies: 9,
      categoryName: "Data Structures"
    },
    {
      title: "Data Structures and Algorithms in Java",
      author: "Robert Lafore",
      isbn: "9780672324536",
      coverImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=300",
      description: "An easy-to-read guide to understanding and implementing complex data structures like arrays, stacks, queues, and binary trees in Java.",
      department: "Computer Science",
      rackLocation: "CS-08",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "Data Structures"
    },
    // 5. Operating Systems
    {
      title: "Operating System Concepts",
      author: "Abraham Silberschatz, Peter B. Galvin & Greg Gagne",
      isbn: "9781118063330",
      coverImage: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=300",
      description: "The classic textbook for operating systems, explaining processes, threads, memory management, file systems, and security mechanisms.",
      department: "Computer Science",
      rackLocation: "CS-09",
      status: "AVAILABLE",
      copiesCount: 8,
      availableCopies: 8,
      categoryName: "Operating Systems"
    },
    {
      title: "Modern Operating Systems",
      author: "Andrew S. Tanenbaum",
      isbn: "9780133591620",
      coverImage: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=300",
      description: "Provides an in-depth and practical look into modern OS structures, including virtualization, cloud systems, and multicore systems.",
      department: "Computer Science",
      rackLocation: "CS-10",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 4,
      categoryName: "Operating Systems"
    },
    // 6. Computer Networks
    {
      title: "Computer Networking: A Top-Down Approach",
      author: "James Kurose & Keith Ross",
      isbn: "9780133594140",
      coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=300",
      description: "Focuses on the Internet and its layers, beginning at the application layer and working down to the physical layer.",
      department: "Computer Science",
      rackLocation: "CS-11",
      status: "AVAILABLE",
      copiesCount: 7,
      availableCopies: 7,
      categoryName: "Computer Networks"
    },
    {
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum & David J. Wetherall",
      isbn: "9780132126953",
      coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=300",
      description: "The definitive guide to networking protocols, wireless routing, network security, and architecture design.",
      department: "Computer Science",
      rackLocation: "CS-12",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 5,
      categoryName: "Computer Networks"
    },
    // 7. Digital Electronics
    {
      title: "Digital Design: With an Introduction to the Verilog HDL",
      author: "M. Morris Mano & Michael D. Ciletti",
      isbn: "9780132774079",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300",
      description: "Presents the basic concepts of digital design in a clear, accessible manner. Covers logic gates, combinational networks, and sequential design.",
      department: "Engineering",
      rackLocation: "EC-01",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 4,
      categoryName: "Digital Electronics"
    },
    {
      title: "Fundamentals of Digital Circuits",
      author: "A. Anand Kumar",
      isbn: "9788120352681",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300",
      description: "A comprehensive text covering analog-to-digital conversion, logic families, memory devices, and semiconductor memories.",
      department: "Engineering",
      rackLocation: "EC-02",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "Digital Electronics"
    },
    // 8. Analog Electronics
    {
      title: "Microelectronic Circuits",
      author: "Adel S. Sedra & Kenneth C. Smith",
      isbn: "9780190853464",
      coverImage: "https://images.unsplash.com/photo-1601524909162-be87252be298?q=80&w=300",
      description: "The market-leading textbook for microelectronics courses. Analyzes MOSFET, BJT, operational amplifiers, and high-frequency responses.",
      department: "Engineering",
      rackLocation: "EC-03",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 5,
      categoryName: "Analog Electronics"
    },
    {
      title: "Electronic Devices and Circuit Theory",
      author: "Robert L. Boylestad & Louis Nashelsky",
      isbn: "9780132622264",
      coverImage: "https://images.unsplash.com/photo-1601524909162-be87252be298?q=80&w=300",
      description: "Provides a complete overview of diodes, transistors, power amplifiers, and linear integrated circuits.",
      department: "Engineering",
      rackLocation: "EC-04",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Analog Electronics"
    },
    // 9. Signals and Systems
    {
      title: "Signals and Systems",
      author: "Alan V. Oppenheim, Alan S. Willsky & S. Hamid Nawab",
      isbn: "9780138147570",
      coverImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=300",
      description: "A classic text outlining continuous-time and discrete-time signal processing, Fourier transforms, and system convolution.",
      department: "Engineering",
      rackLocation: "EC-05",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Signals and Systems"
    },
    {
      title: "Linear Systems and Signals",
      author: "B.P. Lathi",
      isbn: "9780190200176",
      coverImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=300",
      description: "Uses a mathematical and intuitive approach to present analog systems, state-space representations, and signal metrics.",
      department: "Engineering",
      rackLocation: "EC-06",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 3,
      categoryName: "Signals and Systems"
    },
    // 10. Engineering Mathematics
    {
      title: "Advanced Engineering Mathematics",
      author: "Erwin Kreyszig",
      isbn: "9780470458365",
      coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=300",
      description: "Comprehensive guide to differential equations, complex analysis, vector calculus, and Fourier analysis.",
      department: "Mathematics",
      rackLocation: "MT-01",
      status: "AVAILABLE",
      copiesCount: 8,
      availableCopies: 8,
      categoryName: "Engineering Mathematics"
    },
    {
      title: "Higher Engineering Mathematics",
      author: "B.S. Grewal",
      isbn: "9788174091955",
      coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=300",
      description: "A highly referenceable handbook covering algebraic equations, numerical analysis, probability, and optimization techniques.",
      department: "Mathematics",
      rackLocation: "MT-02",
      status: "AVAILABLE",
      copiesCount: 7,
      availableCopies: 6,
      categoryName: "Engineering Mathematics"
    },
    // 11. Physics for Engineers
    {
      title: "Physics for Scientists and Engineers",
      author: "Raymond A. Serway & John W. Jewett",
      isbn: "9781133947271",
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300",
      description: "Provides an outstanding explanation of classical mechanics, wave physics, thermodynamics, and electromagnetism.",
      department: "Science",
      rackLocation: "SC-01",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Physics for Engineers"
    },
    {
      title: "Fundamentals of Physics",
      author: "David Halliday, Robert Resnick & Jearl Walker",
      isbn: "9781118230718",
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300",
      description: "The primary reference book for engineering physics. Includes extensive exercises and real-world experiments.",
      department: "Science",
      rackLocation: "SC-02",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 5,
      categoryName: "Physics for Engineers"
    },
    // 12. Basic Electrical Engineering
    {
      title: "Basic Electrical Engineering",
      author: "D.P. Kothari & I.J. Nagrath",
      isbn: "9789353165727",
      coverImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=300",
      description: "Outlines circuit theory, AC/DC machine basics, transformers, and electronic power conversions.",
      department: "Engineering",
      rackLocation: "EE-01",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Basic Electrical Engineering"
    },
    {
      title: "Electrical Engineering Fundamentals",
      author: "Vincent Del Toro",
      isbn: "9780132471312",
      coverImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=300",
      description: "Comprehensive introduction covering networks, electronics, feedback control, and electromechanical systems.",
      department: "Engineering",
      rackLocation: "EE-02",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "Basic Electrical Engineering"
    },
    // 13. Verilog HDL
    {
      title: "Verilog HDL: A Guide to Digital Design and Synthesis",
      author: "Samir Palnitkar",
      isbn: "9780130449115",
      coverImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=300",
      description: "Explains how to write RTL level code using Verilog HDL. Includes synthesis guidelines and gate simulations.",
      department: "Engineering",
      rackLocation: "EC-07",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "Verilog HDL"
    },
    {
      title: "Design Through Verilog HDL",
      author: "T.R. Padmanabhan & B. Bala Tripura Sundari",
      isbn: "9780471439073",
      coverImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=300",
      description: "Provides solid models of combinational circuits, sequential components, and state machine architectures using Verilog.",
      department: "Engineering",
      rackLocation: "EC-08",
      status: "AVAILABLE",
      copiesCount: 3,
      availableCopies: 3,
      categoryName: "Verilog HDL"
    },
    // 14. Microprocessors
    {
      title: "Microprocessor Architecture, Programming, and Applications with the 8085",
      author: "Ramesh S. Gaonkar",
      isbn: "9788187972884",
      coverImage: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=300",
      description: "The standard handbook for microcomputer hardware architectures, interfacing modules, and assembly language programming.",
      department: "Engineering",
      rackLocation: "EC-09",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 5,
      categoryName: "Microprocessors"
    },
    {
      title: "The Intel Microprocessors: Architecture, Programming, and Interfacing",
      author: "Barry B. Brey",
      isbn: "9780135026458",
      coverImage: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=300",
      description: "Covers the Intel family of microprocessors from 8086 to Core2 Duo. Explains interfacing, memory maps, and interrupt lines.",
      department: "Engineering",
      rackLocation: "EC-10",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Microprocessors"
    },
    // 15. Embedded Systems
    {
      title: "Embedded Systems: Architecture, Programming and Design",
      author: "Raj Kamal",
      isbn: "9780070667648",
      coverImage: "https://images.unsplash.com/photo-1517055720413-77a28e0e8037?q=80&w=300",
      description: "A detailed outline of RTOS, microcontrollers, embedded C code structures, and communication buses.",
      department: "Engineering",
      rackLocation: "EC-11",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Embedded Systems"
    },
    {
      title: "Introduction to Embedded Systems",
      author: "Shibu K.V",
      isbn: "9780070145894",
      coverImage: "https://images.unsplash.com/photo-1517055720413-77a28e0e8037?q=80&w=300",
      description: "Ideal for beginners learning hardware-software co-design, MCU modules, and serial programming standards.",
      department: "Engineering",
      rackLocation: "EC-12",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "Embedded Systems"
    },
    // 16. Artificial Intelligence
    {
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell & Peter Norvig",
      isbn: "9780136042594",
      coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=300",
      description: "The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence.",
      department: "Computer Science",
      rackLocation: "CS-13",
      status: "AVAILABLE",
      copiesCount: 10,
      availableCopies: 8,
      categoryName: "Artificial Intelligence"
    },
    {
      title: "Life 3.0: Being Human in the Age of Artificial Intelligence",
      author: "Max Tegmark",
      isbn: "9781101946596",
      coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=300",
      description: "Explores the future of intelligence, safety protocols, AI ethics, and the biological integration of machinery.",
      department: "Computer Science",
      rackLocation: "CS-14",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Artificial Intelligence"
    },
    // 17. Machine Learning
    {
      title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
      author: "Aurélien Géron",
      isbn: "9781492032648",
      coverImage: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=300",
      description: "A highly practical guide to training neural networks, optimizing classification algorithms, and scaling models.",
      department: "Computer Science",
      rackLocation: "CS-15",
      status: "AVAILABLE",
      copiesCount: 8,
      availableCopies: 7,
      categoryName: "Machine Learning"
    },
    {
      title: "Pattern Recognition and Machine Learning",
      author: "Christopher M. Bishop",
      isbn: "9780387310732",
      coverImage: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=300",
      description: "The definitive mathematical treatment of pattern matching, bayesian stats, kernel methods, and graphic models.",
      department: "Computer Science",
      rackLocation: "CS-16",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 6,
      categoryName: "Machine Learning"
    },
    // 18. DBMS
    {
      title: "Database System Concepts",
      author: "Abraham Silberschatz, Henry F. Korth & S. Sudarshan",
      isbn: "9780073523323",
      coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=300",
      description: "Outlines relational databases, SQL statements, database transactions, concurrency control, and indexing schema.",
      department: "Computer Science",
      rackLocation: "CS-17",
      status: "AVAILABLE",
      copiesCount: 8,
      availableCopies: 8,
      categoryName: "DBMS"
    },
    {
      title: "Fundamentals of Database Systems",
      author: "Ramez Elmasri & Shamkant B. Navathe",
      isbn: "9780133970777",
      coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=300",
      description: "Covers E-R modeling, SQL constructs, relational algebra, security structures, and object-oriented DBMS features.",
      department: "Computer Science",
      rackLocation: "CS-18",
      status: "AVAILABLE",
      copiesCount: 7,
      availableCopies: 6,
      categoryName: "DBMS"
    },
    // 19. Software Engineering
    {
      title: "Software Engineering: A Practitioner's Approach",
      author: "Roger S. Pressman",
      isbn: "9780078022128",
      coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300",
      description: "The primary reference book for software engineering processes, quality control, agile development, and system testing.",
      department: "Computer Science",
      rackLocation: "CS-19",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 6,
      categoryName: "Software Engineering"
    },
    {
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=300",
      description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book details the best practices of clean coding.",
      department: "Computer Science",
      rackLocation: "CS-20",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 4,
      categoryName: "Software Engineering"
    },
    // 20. Semiconductor Physics
    {
      title: "Semiconductor Physics and Devices",
      author: "Donald A. Neamen",
      isbn: "9780073529585",
      coverImage: "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=300",
      description: "Examines semiconductor structures, PN junction diode operations, bipolar transistors, and physics theory of solids.",
      department: "Science",
      rackLocation: "SC-03",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Semiconductor Physics"
    },
    {
      title: "Solid State Electronic Devices",
      author: "Ben G. Streetman & Sanjay Kumar Banerjee",
      isbn: "9780133356038",
      coverImage: "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=300",
      description: "Covers semiconductor crystal structures, quantum mechanics basics, bipolar transistors, and lasers.",
      department: "Science",
      rackLocation: "SC-04",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "Semiconductor Physics"
    },
    // 21. Communication Systems
    {
      title: "Communication Systems",
      author: "Simon Haykin",
      isbn: "9780471178699",
      coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=300",
      description: "A comprehensive look at digital/analog modulation systems, noise figures, error codes, and transmission mediums.",
      department: "Engineering",
      rackLocation: "EC-13",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 5,
      categoryName: "Communication Systems"
    },
    {
      title: "Modern Digital and Analog Communication Systems",
      author: "B.P. Lathi & Zhi Ding",
      isbn: "9780195331455",
      coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=300",
      description: "Explains noise mitigation, information theory, signal transmission lines, and digital modulation filters.",
      department: "Engineering",
      rackLocation: "EC-14",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 4,
      categoryName: "Communication Systems"
    },
    // 22. Control Systems
    {
      title: "Control Systems Engineering",
      author: "Norman S. Nise",
      isbn: "9780470917695",
      coverImage: "https://images.unsplash.com/photo-1504607798333-52a30db54a5d?q=80&w=300",
      description: "Focuses on block diagrams, root locus analysis, frequency response parameters, and feedback loop designs.",
      department: "Engineering",
      rackLocation: "EC-15",
      status: "AVAILABLE",
      copiesCount: 4,
      availableCopies: 4,
      categoryName: "Control Systems"
    },
    {
      title: "Modern Control Engineering",
      author: "Katsuhiko Ogata",
      isbn: "9780136156734",
      coverImage: "https://images.unsplash.com/photo-1504607798333-52a30db54a5d?q=80&w=300",
      description: "Outlines transient response calculations, PID control modules, state-space designs, and feedback optimizations.",
      department: "Engineering",
      rackLocation: "EC-16",
      status: "AVAILABLE",
      copiesCount: 5,
      availableCopies: 4,
      categoryName: "Control Systems"
    },
    // 23. Linear Algebra
    {
      title: "Introduction to Linear Algebra",
      author: "Gilbert Strang",
      isbn: "9780980232776",
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=300",
      description: "Written by legendary MIT professor Gilbert Strang, this book explains matrices, linear equations, vector spaces, and eigenvalues.",
      department: "Mathematics",
      rackLocation: "MT-03",
      status: "AVAILABLE",
      copiesCount: 7,
      availableCopies: 6,
      categoryName: "Linear Algebra"
    },
    {
      title: "Linear Algebra and Its Applications",
      author: "David C. Lay",
      isbn: "9780321385178",
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=300",
      description: "An intuitive approach to matrix arithmetic, transformations, eigenvectors, and quadratic formulas.",
      department: "Mathematics",
      rackLocation: "MT-04",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 6,
      categoryName: "Linear Algebra"
    },
    // 24. Calculus
    {
      title: "Calculus: Early Transcendentals",
      author: "James Stewart",
      isbn: "9780538497817",
      coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=300",
      description: "Explains derivatives, integration, multivariable math, and infinite series with outstanding exercises.",
      department: "Mathematics",
      rackLocation: "MT-05",
      status: "AVAILABLE",
      copiesCount: 8,
      availableCopies: 8,
      categoryName: "Calculus"
    },
    {
      title: "Thomas' Calculus",
      author: "George B. Thomas, Maurice D. Weir & Joel R. Hass",
      isbn: "9780321587992",
      coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=300",
      description: "Outlines vector calculations, double/triple integration, differential systems, and mathematical logic structures.",
      department: "Mathematics",
      rackLocation: "MT-06",
      status: "AVAILABLE",
      copiesCount: 6,
      availableCopies: 5,
      categoryName: "Calculus"
    },
    // 25. Aptitude Books
    {
      title: "Quantitative Aptitude for Competitive Examinations",
      author: "R.S. Aggarwal",
      isbn: "9789352535323",
      coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=300",
      description: "A complete review of arithmetic, fractions, ratios, logic calculations, and algebraic problems.",
      department: "Literature",
      rackLocation: "AP-01",
      status: "AVAILABLE",
      copiesCount: 12,
      availableCopies: 12,
      categoryName: "Aptitude Books"
    },
    {
      title: "A Modern Approach to Verbal & Non-Verbal Reasoning",
      author: "R.S. Aggarwal",
      isbn: "9789352832163",
      coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=300",
      description: "The primary reference book for aptitude reasoning tests, logic deductions, and puzzles.",
      department: "Literature",
      rackLocation: "AP-02",
      status: "AVAILABLE",
      copiesCount: 10,
      availableCopies: 9,
      categoryName: "Aptitude Books"
    }
  ];

  const seededBooks = [];
  for (const book of booksData) {
    const categoryId = categories[book.categoryName];
    if (!categoryId) {
      console.error(`Category ID not found for ${book.categoryName}`);
      continue;
    }
    const record = await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        coverImage: book.coverImage,
        description: book.description,
        department: book.department,
        rackLocation: book.rackLocation,
        status: book.status,
        copiesCount: book.copiesCount,
        availableCopies: book.availableCopies,
        categoryId: categoryId
      }
    });
    seededBooks.push(record);
  }

  console.log(`${seededBooks.length} sample books registered.`);

  // 6. Register a past borrow record for historical trends and AI recommendations
  const cleanCodeBook = seededBooks.find(b => b.isbn === "9780132350884");
  if (cleanCodeBook) {
    await prisma.borrowRecord.create({
      data: {
        userId: student.id,
        bookId: cleanCodeBook.id,
        borrowDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 14 days later
        returnDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), // returned on time (17 days ago)
        status: "RETURNED",
        fineAmount: 0.0,
      },
    });
  }

  // 7. Register an active borrow (e.g. Thomas Calculus is checked out)
  const calculusBook = seededBooks.find(b => b.isbn === "9780321587992");
  if (calculusBook) {
    await prisma.borrowRecord.create({
      data: {
        userId: student.id,
        bookId: calculusBook.id,
        borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // due in 4 days
        status: "BORROWED",
        fineAmount: 0.0,
      },
    });
    // Mark the book status in DB
    await prisma.book.update({
      where: { id: calculusBook.id },
      data: { status: "BORROWED", availableCopies: calculusBook.availableCopies - 1 }
    });
  }

  // Register another borrow for student 2 (Emily) to show active borrows in dashboard
  const javaBook = seededBooks.find(b => b.isbn === "9780596009205");
  if (javaBook) {
    await prisma.borrowRecord.create({
      data: {
        userId: student2.id,
        bookId: javaBook.id,
        borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: "BORROWED",
        fineAmount: 0.0,
      },
    });
    await prisma.book.update({
      where: { id: javaBook.id },
      data: { status: "BORROWED", availableCopies: javaBook.availableCopies - 1 }
    });
  }

  // 8. Register an active reservation (e.g. Artificial Intelligence book is marked RESERVED)
  const aiBook = seededBooks.find(b => b.isbn === "9780136042594");
  if (aiBook) {
    await prisma.reservation.create({
      data: {
        userId: student.id,
        bookId: aiBook.id,
        status: "PENDING",
      },
    });
    await prisma.book.update({
      where: { id: aiBook.id },
      data: { status: "RESERVED" }
    });
  }

  // 9. Initial notifications
  await prisma.notification.create({
    data: {
      userId: student.id,
      message: "The new edition of 'Introduction to Algorithms' is now available on Rack CS-07.",
      type: "NEW_ARRIVAL",
    },
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      message: "Your borrow of 'Thomas' Calculus' is due in 4 days. Please return or renew on time.",
      type: "DUE_DATE",
    },
  });

  console.log("Initial transactions, active borrows, and notifications seeded.");
  console.log("Database seeding completed successfully with 50 books!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
