// ============================================================
// CENTRAL CONSTANTS — edit here to update across the website
// ============================================================

export const SITE = {
  name: "IEEE SGBIT",
  fullName: "IEEE Student Branch — S.G. Balekundri Institute of Technology",
  email: "ieee@sgbit.edu.in",
  location: "Belagavi, Karnataka, India",
  collegeName: "S.G. Balekundri Institute of Technology",
  branchCode: "SGBIT",
  yearFounded: "2014",
};

export const SOCIAL = {
  instagram: "https://www.instagram.com/ieee_sgbit/",
  linkedin: "https://www.linkedin.com/company/ieee-sgbit/",
  instagramHandle: "@ieee_sgbit",
  linkedinHandle: "IEEE SGBIT",
};

export const IMAGES = {
  logo: "/images/ieee_new_logo.png",
  collegeTopView: "/images/sgbit topview.jpg",
  event1: "/images/5.JPG",
  campusAerial: "/images/DJI_0135.JPG",
  groupPhoto: "/images/groupimage2.jpg",
  event2: "/images/ev1-2.jpg",
  facultyAdvisor: "/images/execoms/Dr.%20Shankargoud%20Patil.JPG",
  instagram: "/images/instagram.svg",
  linkedin: "/images/linkedin.svg",
  excom: "/images/execoms/excom.jpg",
  execoms: {
    chair: "/images/execoms/chair.jpg",
    coChair: "/images/execoms/Co-Chair.jpg",
    secretary: "/images/execoms/Secretary.jpg",
    webmaster: "/images/execoms/Webmaster.jpg",
    treasurer: "/images/execoms/Treasurer.jpg",
    mdcCoChair: "/images/execoms/MDC%20Co-Chair.jpg",
    mdcChair: "/images/execoms/MDC%20Chair.jpg",
    publicityHead: "/images/execoms/Publicity%20Head.jpg",
    publicityHead2: "", // user will upload later
  },
};

export const STATS = {
  members: "200+",
  events: "50+",
  awards: "10+",
  yearFounded: "2014",
  eventsAnnually: "20+",
  yearsActive: "10+",
  ieeeGlobalMembers: "400K+",
  ieeeCountries: "160+",
};

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Team", href: "/team" },
  { name: "Contact", href: "#contact" },
];

export const FACULTY_ADVISOR = {
  name: "Dr. Shankargoud Patil",
  role: "Faculty Advisor",
  image: IMAGES.facultyAdvisor,
  social: {
    email: `mailto:${SITE.email}`,
    linkedin: SOCIAL.linkedin,
    instagram: SOCIAL.instagram,
    github: "#",
    phone: "tel:+910000000000",
  },
};

// Boys — top row (Secretary is featured = 3rd card, slightly larger)
export const BOY_MEMBERS = [
  {
    name: "Chairperson",
    role: "Chair",
    image: IMAGES.execoms.chair,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Co-Chairperson",
    role: "Co-Chair",
    image: IMAGES.execoms.coChair,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Secretary",
    role: "Secretary",
    image: IMAGES.execoms.secretary,
    featured: true, // 3rd card — permanently larger
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Webmaster",
    role: "Webmaster",
    image: IMAGES.execoms.webmaster,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
];

// Girls — bottom row
export const GIRL_MEMBERS = [
  {
    name: "Treasurer",
    role: "Treasurer",
    image: IMAGES.execoms.treasurer,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "MDC Co-Chairperson",
    role: "MDC Co-Chair",
    image: IMAGES.execoms.mdcCoChair,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "MDC Chairperson",
    role: "MDC Chair",
    image: IMAGES.execoms.mdcChair,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Publicity Head",
    role: "Publicity Head",
    image: IMAGES.execoms.publicityHead,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Publicity Head",
    role: "Publicity Head 2", // unique id; user will upload photo
    image: IMAGES.execoms.publicityHead2,
    featured: false,
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
];

/** @deprecated use BOY_MEMBERS / GIRL_MEMBERS instead */
export const EXECOM_MEMBERS = [...BOY_MEMBERS, ...GIRL_MEMBERS];

export const MEMBERSHIP_BENEFITS = [
  {
    icon: "⚡",
    title: "Global IEEE Network",
    description: "Connect with 400,000+ engineers and innovators across 160+ countries.",
    accent: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
  },
  {
    icon: "📡",
    title: "IEEE Xplore Access",
    description: "5M+ technical papers, journals, and cutting-edge IEEE standards — all yours.",
    accent: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: "🚀",
    title: "Career Acceleration",
    description: "Exclusive job board, mentorship programs, and industry networking events.",
    accent: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    icon: "🏆",
    title: "Competitions & Awards",
    description: "Win at hackathons, paper presentations, and gain global recognition.",
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: "🔬",
    title: "Hands-on Workshops",
    description: "Real projects, emerging tech training, and live technical lab sessions.",
    accent: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  {
    icon: "👑",
    title: "Leadership Roles",
    description: "Lead initiatives, take executive positions, and grow your leadership profile.",
    accent: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.2)",
  },
];

export const QUERY_TOPICS = [
  "General Inquiry",
  "Membership & Registration",
  "Upcoming Events",
  "Sponsorship & Collaboration",
  "Technical Support",
  "Other",
];

export const ABOUT_STATS = [
  { value: STATS.members, label: "Active Members" },
  { value: STATS.events,  label: "Events Hosted" },
  { value: STATS.awards,  label: "Awards Won" },
  { value: STATS.yearFounded, label: "Established" },
];

export const ABOUT_VALUES = [
  {
    title: "Innovation",
    description: "We push boundaries and embrace emerging technologies to solve real-world problems.",
  },
  {
    title: "Collaboration",
    description: "We believe the best ideas come from diverse minds working toward a shared goal.",
  },
  {
    title: "Excellence",
    description: "We hold ourselves to high standards — in events, in membership, and in everything we build.",
  },
  {
    title: "Leadership",
    description: "We develop leaders who communicate with clarity, act with integrity, and inspire others.",
  },
  {
    title: "Integrity",
    description: "We are honest, transparent, and committed to ethical conduct in all that we do.",
  },
  {
    title: "Impact",
    description: "Everything we do is measured by how it positively affects our members and community.",
  },
];

export const TIMELINE = [
  { year: "2014", title: "Founded", description: "IEEE SGBIT Student Branch officially established at S.G. Balekundri Institute of Technology." },
  { year: "2017", title: "First Hackathon", description: "Hosted Hack-n-Hunt — our flagship hackathon that now draws 500+ participants annually." },
  { year: "2019", title: "Best Branch Award", description: "Recognized as Best IEEE Student Branch in Karnataka Section for outstanding activities." },
  { year: "2021", title: "Digital Pivot", description: "Hosted 15+ virtual events during the pandemic, keeping the community connected and active." },
  { year: "2023", title: "200 Members", description: "Crossed 200 active members — the largest technical student community in SGBIT." },
  { year: "2025", title: "Today", description: "Continuing to innovate with new initiatives in AI, embedded systems, and industry partnerships." },
];
