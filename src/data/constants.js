export const services = [
  { id: 's1', title: 'Swedish Full Body Massage', time: '60 min', price: '$85', category: 'massage', icon: '💆', description: 'A classic full-body relaxation massage using long, flowing strokes to ease tension and improve circulation.' },
  { id: 's2', title: 'Facial Rejuvenation', time: '50 min', price: '$75', category: 'facial', icon: '✨', description: 'Deep-cleansing facial with organic serums designed to restore radiance and hydration.' },
  { id: 's3', title: 'Hot Stone Therapy', time: '75 min', price: '$95', category: 'stone', icon: '🪨', description: 'Heated basalt stones placed on key points of the body to melt away deep muscle tension.' },
  { id: 's4', title: 'Hair Styling & Cut', time: '45 min', price: '$65', category: 'hair', icon: '💇', description: 'Precision cut and professional styling tailored to your face shape and hair type.' },
  { id: 's5', title: 'Manicure & Pedicure', time: '90 min', price: '$120', category: 'nails', icon: '💅', description: 'Complete nail care for hands and feet including shaping, cuticle care, and polish.' },
  { id: 's6', title: 'Aromatherapy Massage', time: '55 min', price: '$80', category: 'aroma', icon: '🌿', description: 'Soothing massage with custom-blended essential oils tailored to your mood and needs.' },
];

export const SERVICE_CATEGORIES = [
  { value: 'massage', label: 'Massage', icon: '💆' },
  { value: 'facial', label: 'Facial', icon: '✨' },
  { value: 'stone', label: 'Hot Stone', icon: '🪨' },
  { value: 'hair', label: 'Hair', icon: '💇' },
  { value: 'nails', label: 'Nails', icon: '💅' },
  { value: 'aroma', label: 'Aromatherapy', icon: '🌿' },
  { value: 'body', label: 'Body Treatment', icon: '🧴' },
  { value: 'other', label: 'Other', icon: '🌟' },
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
