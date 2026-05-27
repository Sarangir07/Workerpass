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
  fullName: "",
  phone: "",
  email: "",
  address: "",
  dateOfBirth: "",
  gender: "",
  bio: "",
  category: "",
  availability: "",
  experienceLevel: "Beginner",
  skills: [],
  languages: [],
  experiences: [],
  photo: null,
  resume: null
};
