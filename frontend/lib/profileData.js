export const workerCategories = [
  { id: "baker", label: "Baker", detail: "Bakery, desserts, ovens" },
  { id: "waiter", label: "Waiter", detail: "Service, tables, guests" },
  { id: "cleaner", label: "Cleaner", detail: "Housekeeping, hygiene" },
  { id: "cashier", label: "Cashier", detail: "Billing, POS, cash" },
  { id: "delivery_boy", label: "Delivery Boy", detail: "Route handling, packages" },
  { id: "cook", label: "Cook", detail: "Kitchen prep, meals" },
  { id: "helper", label: "Helper", detail: "General support work" }
];

export const suggestedSkills = [
  "Baking",
  "Cleaning",
  "Customer service",
  "Cooking",
  "Delivery handling",
  "Cash management"
];

export const languageSuggestions = ["English", "Hindi", "Marathi", "Kannada"];

export const availabilityOptions = [
  { id: "available", label: "Available for work", badge: "Open" },
  { id: "working", label: "Currently working", badge: "Working" },
  { id: "part_time", label: "Part-time available", badge: "Part-time" },
  { id: "not_available", label: "Not available", badge: "Away" }
];

export const initialProfile = {
  fullName: "Rohan Patil",
  phone: "9876543210",
  email: "rohan.patil@example.com",
  address: "Pune, Maharashtra",
  dateOfBirth: "",
  gender: "Male",
  bio: "Reliable worker with experience in customer-facing service and daily operations.",
  category: "waiter",
  availability: "available",
  experienceLevel: "Intermediate",
  skills: ["Customer service", "Cash management"],
  languages: [
    { name: "Hindi", proficiency: "Native" },
    { name: "English", proficiency: "Conversational" }
  ],
  experiences: [
    {
      company: "Cafe Nova",
      role: "Waiter",
      startDate: "2024-01",
      endDate: "2025-04",
      current: false,
      description: "Handled table service, billing support, and daily customer requests."
    }
  ],
  photo: null,
  resume: null
};
