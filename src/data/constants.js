export const services = [
  { title: 'Swedish Full Body Massage', time: '60 min', price: '$85' },
  { title: 'Facial Rejuvenation', time: '50 min', price: '$75' },
  { title: 'Hot Stone Therapy', time: '75 min', price: '$95' },
  { title: 'Hair Styling & Cut', time: '45 min', price: '$65' },
  { title: 'Manicure & Pedicure', time: '90 min', price: '$120' },
  { title: 'Aromatherapy Massage', time: '55 min', price: '$80' },
];

export const initialMessages = [
  { id: 1, author: 'Sofia', text: 'Your Swedish massage appointment is confirmed for Saturday at 2:00 PM!', type: 'incoming' },
  { id: 2, author: 'You', text: 'Perfect! Looking forward to it. Can I add a hot stone treatment?', type: 'outgoing' },
  { id: 3, author: 'Sofia', text: 'Absolutely! We can add that to your session. See you soon! 🧘‍♀️', type: 'incoming' },
];

export const roleOptions = [
  { value: 'client', label: 'Client' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'manager', label: 'Manager' },
];

export const features = [
  { icon: '🧑‍⚕️', title: 'Expert Therapists', text: 'Certified professionals with years of experience in massage, skincare, and hairstyling.' },
  { icon: '🌿', title: 'Premium Products', text: 'We use only organic, cruelty-free products sourced from sustainable suppliers.' },
  { icon: '🕯️', title: 'Serene Ambiance', text: 'Calming music, aromatherapy, and warm lighting designed for your relaxation.' },
  { icon: '📱', title: 'Easy Booking', text: 'Book, reschedule, or cancel appointments anytime from your phone or computer.' },
];

export const testimonials = [
  { name: 'Emily R.', text: 'The Swedish massage was absolutely divine. I left feeling like a new person. The ambiance was so relaxing!', rating: 5 },
  { name: 'James K.', text: "Best facial I've ever had. My skin has never looked better. The esthetician was incredibly knowledgeable.", rating: 5 },
  { name: 'Sarah M.', text: 'I booked the hot stone therapy for my anniversary and it was unforgettable. Truly a gem of a spa.', rating: 5 },
];

export const footerLinks = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacy Policy', href: '#privacy' },
];
