export interface EventData {
  slug: string;
  number: string;
  title: string;
  date: string;
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  gallery?: string[];
}

export const events: EventData[] = [
  {
    slug: "ignition-2025",
    number: "01",
    title: "Ignition 2025",
    date: "March 2025",
    description: "The flagship technical fest — a grand celebration of innovation, technology, and engineering excellence.",
    longDescription: "Ignition 2025 was the flagship technical festival of IEEE SGBIT — a grand celebration of innovation, technology, and engineering excellence. The event featured multiple competitions, technical exhibitions, expert talks from industry leaders, coding challenges, and robotics demonstrations. Over 500 students participated across various events, making it one of the largest technical festivals in the region. The fest showcased cutting-edge projects in AI, IoT, robotics, and sustainable engineering, inspiring the next generation of innovators.",
    tags: ["Technical Fest", "Competitions", "Exhibitions"],
    image: "/images/ignition2025.jpeg",
    gallery: ["/images/ig_2025(1).JPG", "/images/ig_25.jpeg", "/images/ig_25n.jpeg"],
  },
  {
    slug: "nkcon-2024",
    number: "02",
    title: "NKCon 2024",
    date: "November 2024",
    description: "National Knowledge Conference — insightful paper presentations, keynotes, and academic discourse on emerging tech.",
    longDescription: "NKCon 2024 was a prestigious National Knowledge Conference that brought together researchers, industry experts, and students for a day of insightful paper presentations, keynote speeches, and stimulating academic discourse on emerging technologies. The conference covered topics ranging from artificial intelligence and machine learning to quantum computing and sustainable energy solutions. Distinguished speakers from leading tech companies and research institutions shared their insights, while students presented their research papers to a panel of expert judges.",
    tags: ["Conference", "Research", "Keynotes"],
    image: "/images/nkcon2024.jfif",
  },
  {
    slug: "wie-2024",
    number: "03",
    title: "WiE 2024",
    date: "October 2024",
    description: "Women in Engineering — celebrating and empowering women in STEM through mentorship and workshops.",
    longDescription: "Women in Engineering (WiE) 2024 was a landmark initiative celebrating and empowering women in STEM fields. The event featured mentorship programs pairing students with successful women engineers, hands-on workshops on emerging technologies, panel discussions with industry leaders, and inspiring success stories from women who have broken barriers in engineering. The event aimed to create a supportive community and address the gender gap in technology, encouraging more women to pursue careers in engineering and technology.",
    tags: ["Women in Engineering", "Empowerment", "Mentorship"],
    image: "/images/wie24.jpg",
    gallery: ["/images/bec_wie_25.jpeg"],
  },
  {
    slug: "hack-n-hunt",
    number: "04",
    title: "Hack-n-Hunt",
    date: "September 2024",
    description: "Hackathon meets treasure hunt — coding meets problem-solving in a race against time.",
    longDescription: "Hack-n-Hunt was an adrenaline-fueled event that combined the intensity of a hackathon with the excitement of a treasure hunt. Teams competed to solve complex coding challenges while simultaneously hunting for clues scattered across the campus. The event tested participants' programming skills, logical thinking, teamwork, and time management. With innovative problem statements and challenging puzzles, Hack-n-Hunt pushed participants to think outside the box and develop creative solutions under pressure.",
    tags: ["Hackathon", "Coding", "Innovation"],
    image: "/images/hack-n-hunt.jpg",
  },
  {
    slug: "idea-2025",
    number: "05",
    title: "IDEA 2025",
    date: "February 2025",
    description: "Innovation Design and Entrepreneurship Arena — pitch ideas, build prototypes, interact with mentors.",
    longDescription: "IDEA 2025 (Innovation Design and Entrepreneurship Arena) provided a platform for students to pitch groundbreaking ideas, develop working prototypes, and interact with experienced mentors from the industry. The event featured multiple rounds including ideation, prototype development, and final pitching to a panel of investors and industry experts. Participants received mentorship on business model development, market analysis, and technical feasibility, making it a comprehensive entrepreneurship experience.",
    tags: ["Innovation", "Design", "Entrepreneurship"],
    image: "/images/events/Idea_25.jpg",
  },
  {
    slug: "vaad-2025",
    number: "06",
    title: "VAAD 2025",
    date: "January 2025",
    description: "Discussion and debate forum fostering critical thinking on technology and societal topics.",
    longDescription: "VAAD 2025 was a stimulating discussion and debate forum that fostered critical thinking and articulate communication on contemporary technological and societal topics. Participants engaged in structured debates on topics such as AI ethics, data privacy, sustainable technology, and the future of work. The event featured both formal debate rounds and open discussion panels, encouraging students to develop well-reasoned arguments and consider multiple perspectives on complex issues.",
    tags: ["Discussion", "Debate", "Critical Thinking"],
    image: "/images/events/Vaad_2025.jpeg",
  },
  {
    slug: "jam-2025",
    number: "07",
    title: "JAM 2025",
    date: "January 2025",
    description: "Just A Minute — fast-paced speaking competition showcasing spontaneity and technical knowledge.",
    longDescription: "JAM 2025 (Just A Minute) was a fast-paced, high-energy speaking competition where participants showcased their spontaneity, wit, and technical knowledge under intense time pressure. Each participant was given random topics and had to speak coherently and engagingly for exactly one minute without hesitation, repetition, or deviation. The event tested quick thinking, communication skills, and subject knowledge, making it one of the most entertaining and competitive events of the year.",
    tags: ["Speaking", "Competition", "Quick Thinking"],
    image: "/images/events/jam_2025.jpg",
  },
  {
    slug: "launch-2025",
    number: "08",
    title: "Launch 2025",
    date: "August 2025",
    description: "Grand inauguration welcoming new members to the IEEE SGBIT family.",
    longDescription: "Launch 2025 was the grand inauguration and orientation event that welcomed new members to the IEEE SGBIT family. The event set the tone for a year of innovation and technological exploration with keynote addresses from faculty advisors, demonstrations of past achievements, interactive sessions about IEEE membership benefits, and networking opportunities with senior members. New members were introduced to the various technical committees, special interest groups, and upcoming events planned for the academic year.",
    tags: ["Inauguration", "Orientation", "Networking"],
    image: "/images/events/launch_2025.jpeg",
  },
];
