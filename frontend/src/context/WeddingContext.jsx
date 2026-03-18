import { createContext, useContext, useState, useCallback } from 'react'

const WeddingContext = createContext(null)

export const INDIAN_CITIES = [
  "Chennai","Mumbai","Delhi","Hyderabad","Bangalore","Kolkata","Pune","Ahmedabad",
  "Jaipur","Surat","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal",
  "Visakhapatnam","Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik",
  "Faridabad","Meerut","Rajkot","Kalyan-Dombivali","Vasai-Virar","Varanasi",
  "Srinagar","Amritsar","Coimbatore","Madurai","Guwahati","Chandigarh","Kochi",
  "Udaipur","Jodhpur","Dehradun","Shimla","Mysuru","Thiruvananthapuram"
]

export const ALL_EVENTS = [
  { id: "Engagement", emoji: "💍", label: "Engagement" },
  { id: "Haldi", emoji: "🌼", label: "Haldi" },
  { id: "Mehendi", emoji: "🌿", label: "Mehendi" },
  { id: "Sangeet", emoji: "🎵", label: "Sangeet" },
  { id: "Pre Wedding Cocktail", emoji: "🥂", label: "Cocktail Party" },
  { id: "Wedding Day Ceremony", emoji: "💒", label: "Wedding Ceremony" },
  { id: "Reception", emoji: "🎊", label: "Reception" },
]

export const WEDDING_TYPES = [
  { id: "Hindu",     emoji: "🪔", label: "Hindu Wedding",     desc: "Pheras, Mandap" },
  { id: "Islam",     emoji: "☪️",  label: "Islamic Wedding",   desc: "Nikah ceremony" },
  { id: "Sikh",      emoji: "🏯", label: "Sikh Wedding",      desc: "Anand Karaj" },
  { id: "Christian", emoji: "⛪",  label: "Christian Wedding", desc: "Church ceremony" },
  { id: "Buddhist",  emoji: "☸️",  label: "Buddhist Wedding",  desc: "Temple blessings" },
  { id: "Jain",      emoji: "🕊️",  label: "Jain Wedding",      desc: "Traditional rites" },
  { id: "Generic",   emoji: "✨",  label: "Generic / Mixed",   desc: "Multi-culture" },
]

export const VENUE_TYPES = [
  { id: "Banquet Hall",    emoji: "🏛️", label: "Banquet / Mandapam" },
  { id: "Wedding Lawn",    emoji: "🌳", label: "Lawns & Gardens" },
  { id: "Hotel 3-5 Star",  emoji: "🏨", label: "Hotels & Convention" },
  { id: "Resort",          emoji: "🌴", label: "Resort & Destination" },
  { id: "Heritage Palace", emoji: "🏰", label: "Heritage & Palace" },
  { id: "Beach Venue",     emoji: "🏖️", label: "Beach Wedding" },
  { id: "Farmhouse",       emoji: "🌾", label: "Farmhouse & Estate" },
  { id: "Temple",          emoji: "⛩️",  label: "Temple Venue" },
  { id: "Home Intimate",   emoji: "🏡", label: "Home / Intimate" },
]

export const HOTEL_TIERS = [
  { id: "5-star Palace", emoji: "👑", label: "5★ Palace", desc: "₹25K–₹80K/night", ppr: 2 },
  { id: "5-star City",   emoji: "🌆", label: "5★ City",   desc: "₹10K–₹30K/night", ppr: 2 },
  { id: "4-star",        emoji: "⭐", label: "4★ Hotel",   desc: "₹5K–₹12K/night",  ppr: 2 },
  { id: "Resort",        emoji: "🌴", label: "Resort",     desc: "₹8K–₹25K/night",  ppr: 3 },
  { id: "Farmhouse",     emoji: "🏡", label: "Farmhouse",  desc: "₹3K–₹10K/room",   ppr: 4 },
]

export const FOOD_TIERS = [
  { id: "Extravaganza", emoji: "🍽️",  label: "Extravaganza", desc: "₹250–₹500/plate" },
  { id: "High",         emoji: "🥘",  label: "High",         desc: "₹700–₹1,500/plate" },
  { id: "Modern",       emoji: "👨‍🍳", label: "Modern",       desc: "₹1,500–₹5,000/plate" },
]

export const FOOD_CATEGORIES = [
  { id: "Veg",    emoji: "🥦", label: "Vegetarian" },
  { id: "Non-Veg",emoji: "🍗", label: "Non-Vegetarian" },
  { id: "Jain",   emoji: "🌿", label: "Jain" },
]

export const BAR_TYPES = [
  { id: "Dry Event", emoji: "🚫", label: "Dry Event" },
  { id: "Beer-Wine", emoji: "🍷", label: "Beer & Wine" },
  { id: "Full Bar",  emoji: "🍸", label: "Full Bar" },
]

export const SPECIALTY_COUNTERS = [
  { id: "Chaat",             emoji: "🥙", label: "Chaat Counter" },
  { id: "Mocktail",          emoji: "🥤", label: "Mocktail Bar" },
  { id: "Ice Cream",         emoji: "🍦", label: "Ice Cream Station" },
  { id: "Tea-Coffee (24hr)", emoji: "☕", label: "Tea-Coffee 24hr" },
]

export const ARTIST_TYPES = [
  { id: "Local DJ",          emoji: "🎧", label: "Local DJ",           cost: "₹50K–₹1.5L" },
  { id: "Professional DJ",   emoji: "🎚️",  label: "Pro DJ",             cost: "₹2L–₹5L" },
  { id: "Bollywood Singer A",emoji: "🎤", label: "Bollywood Singer A", cost: "₹8L–₹12L" },
  { id: "Bollywood Singer B", emoji: "🎶", label: "Bollywood Singer B", cost: "₹5L–₹9L" },
  { id: "Live Band (Local)",  emoji: "🎸", label: "Live Band (Local)",  cost: "₹1L–₹3L" },
  { id: "Live Band (National)",emoji:"🎺",label: "Live Band (National)",cost: "₹5L–₹15L" },
  { id: "Folk Artist",        emoji: "🪘", label: "Folk Artist",        cost: "₹30K–₹1L" },
  { id: "Myra Entertainment", emoji: "🎭", label: "Myra Entertainment", cost: "₹2L–₹6L" },
  { id: "Choreographer",      emoji: "💃", label: "Choreographer",      cost: "₹50K–₹2L" },
  { id: "Anchor / Emcee",     emoji: "🎙️", label: "Anchor / Emcee",     cost: "₹30K–₹1.5L" },
]

export const SFX_ITEMS = [
  { id: "Cold Pyro",        emoji: "✨", label: "Cold Pyro",        cost: "₹15K" },
  { id: "Confetti Cannon",  emoji: "🎊", label: "Confetti Cannon",  cost: "₹8K" },
  { id: "Smoke Machine",    emoji: "💨", label: "Smoke Machine",    cost: "₹5K" },
  { id: "Laser Show",       emoji: "🔴", label: "Laser Show",       cost: "₹25K" },
]

export const initialWeddingState = {
  // Tab 1
  wedding_date: '',
  is_weekend: false,
  wedding_type: '',
  budget_tier: '',
  events: [],
  // Tab 2
  venue_type: '',
  wedding_city: '',
  seating_capacity: 200,
  total_guests: 200,
  outstation_guests: 50,
  hotel_tier: '',
  bride_hometown: '',
  groom_hometown: '',
  // Tab 3
  decor_total: 0,
  selected_decor: [],
  // Tab 4
  food_categories: [],
  food_budget_tier: '',
  bar_type: '',
  specialty_counters: [],
  guest_counts_by_event: {},
  // Tab 5
  selected_artists: [],
  artists_total: 0,
  // Tab 6 (Sundries)
  room_basket_budget: 'standard',
  // Tab 7
  logistics_total: 0,
  ghodi: false,
  dholi_count: 0,
  dholi_hours: 2,
  sfx_items: [],
  // Budget
  budget_result: null,
}

export function WeddingProvider({ children }) {
  const [wedding, setWedding] = useState(initialWeddingState)

  const update = useCallback((key, value) => {
    setWedding(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateMany = useCallback((updates) => {
    setWedding(prev => ({ ...prev, ...updates }))
  }, [])

  return (
    <WeddingContext.Provider value={{ wedding, update, updateMany }}>
      {children}
    </WeddingContext.Provider>
  )
}

export const useWedding = () => useContext(WeddingContext)

export const formatRupees = (n) => {
  if (!n) return '₹0'
  if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`
  if (n >= 1000)     return `₹${(n/1000).toFixed(0)}K`
  return `₹${n}`
}
