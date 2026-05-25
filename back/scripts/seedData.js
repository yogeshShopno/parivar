const { ALL_PERMISSION_KEYS } = require('../src/config/permissions');

const countries = [
	{ id: '1', name: 'India', country: 'India' },
	{ id: '2', name: 'United States', country: 'United States' }
];

const states = [
	{ id: '1', country_id: '1', name: 'Gujarat', state: 'Gujarat' },
	{ id: '2', country_id: '1', name: 'Maharashtra', state: 'Maharashtra' },
	{ id: '3', country_id: '2', name: 'California', state: 'California' }
];

const cities = [
	{ id: '1', state_id: '1', name: 'Ahmedabad', city: 'Ahmedabad' },
	{ id: '2', state_id: '1', name: 'Surat', city: 'Surat' },
	{ id: '3', state_id: '2', name: 'Mumbai', city: 'Mumbai' },
	{ id: '4', state_id: '3', name: 'San Francisco', city: 'San Francisco' }
];

const businessCategories = [
	{ id: '1', name: 'Restaurants', state_id: '1', business: 'Food & Dining' },
	{ id: '2', name: 'Health & Wellness', state_id: '1', business: 'Healthcare' },
	{ id: '3', name: 'IT Services', state_id: '1', business: 'Technology' }
];

const businesses = [
	{
		id: 'BIZ001',
		member_id: '101',
		business_category_id: '1',
		business_name: 'Parivar Sweets & Family Dining',
		number: '9876543210',
		number_2: '9876501234',
		country_id: '1',
		state_id: '1',
		city_id: '1',
		address: '123 Family Lane, Satellite, Ahmedabad',
		location_link: 'https://maps.example.com/parivar-sweets',
		image: '/uploads/1.jpg',
		about_us: 'Traditional sweets, snacks, and family-friendly dining in the heart of the community.',
		facebook: 'https://facebook.com/parivar.sweets',
		instagram: 'https://instagram.com/parivar_sweets',
		pinterest: '',
		youtube: '',
		website: 'https://parivar.example.com',
		gallery_images: ['/uploads/2.jpg', '/uploads/3.jpg'],
		gallery_image_1: '/uploads/2.jpg',
		gallery_image_2: '/uploads/3.jpg',
		gallery_image_3: '/uploads/4.jpg',
		gallery_image_4: '/uploads/5.jpg',
		gallery_image_5: '/uploads/6.jpg',
		status: 1,
		cdate: '2026-05-22'
	},
	{
		id: 'BIZ002',
		member_id: '103',
		business_category_id: '2',
		business_name: 'Parivar Health & Care',
		number: '9123456780',
		number_2: '9123456781',
		country_id: '1',
		state_id: '1',
		city_id: '1',
		address: '45 Wellness Road, Navrangpura, Ahmedabad',
		location_link: 'https://maps.example.com/parivar-health',
		image: '/uploads/7.jpg',
		about_us: 'Community healthcare service with doctor consultations, wellness sessions, and support for families.',
		facebook: 'https://facebook.com/parivar.health',
		instagram: 'https://instagram.com/parivar_health',
		website: 'https://parivarhealth.example.com',
		gallery_image_1: '/uploads/8.jpg',
		gallery_image_2: '/uploads/9.jpg',
		status: 1,
		cdate: '2026-05-22'
	}
];

const posts = [
	{
		id: 'POST001',
		member_id: '101',
		title: 'Summer Festival Planning',
		description: 'Join our community planning meeting for the upcoming summer festival. Everyone is invited to share ideas and volunteer.',
		image: '/uploads/5.jpg',
		status: 1,
		cdate: '2026-05-20'
	},
	{
		id: 'POST002',
		member_id: '102',
		title: 'Family Reunion Highlights',
		description: 'A recap of the last family reunion with special moments, stories, and photographs from all age groups.',
		image: '/uploads/6.jpg',
		status: 1,
		cdate: '2026-04-12'
	},
	{
		id: 'POST003',
		member_id: '103',
		title: 'Health Awareness Camp Announcement',
		description: 'We are organizing a free health checkup camp next weekend. Please register early to book your slot.',
		image: '/uploads/7.jpg',
		status: 1,
		cdate: '2026-05-23'
	}
];

const galleries = [
	{
		title: 'Family Reunion 2025',
		description: 'Photos from the annual family reunion held in Ahmedabad.',
		image: '/uploads/7.jpg',
		category: 'Reunion',
		year: '2025',
		gallery_category_id: 'G01',
		event_category: 'Family Gathering'
	},
	{
		title: 'Community Diwali Celebration 2024',
		description: 'Lights, rangoli, and sweets from the Diwali celebration event.',
		image: '/uploads/8.jpg',
		category: 'Festival',
		year: '2024',
		gallery_category_id: 'G02',
		event_category: 'Festival'
	},
	{
		title: 'Navratri Garba Night 2023',
		description: 'Vibrant colors and energetic dances from our Navratri event.',
		image: '/uploads/9.jpg',
		category: 'Festival',
		year: '2023',
		gallery_category_id: 'G02',
		event_category: 'Festival'
	}
];

const festivals = [
	{
		title: 'Diwali Celebration',
		description: 'Annual Diwali celebration with lights, music, and family pujas.',
		image: '/uploads/9.jpg',
		date: new Date('2026-11-01'),
		festival_name: 'Diwali 2026',
		festival_date: '2026-11-01',
		button_name: 'RSVP',
		button_link: 'https://example.com/diwali',
		festival_description: 'Prepare your lamps, sweets, and special gifts to celebrate together.'
	},
	{
		title: 'Navratri Garba Night',
		description: 'A nine-night Navratri celebration with dance, music, and community food stalls.',
		image: '/uploads/10.jpg',
		date: new Date('2026-10-05'),
		festival_name: 'Navratri 2026',
		festival_date: '2026-10-05',
		button_name: 'Join Now',
		button_link: 'https://example.com/navratri',
		festival_description: 'Enjoy traditional folk music and colorful attire in our annual Garba celebration.'
	},
	{
		title: 'Holi Festival of Colors',
		description: 'Celebrate the arrival of spring with organic colors and music.',
		image: '/uploads/1.jpg',
		date: new Date('2027-03-22'),
		festival_name: 'Holi 2027',
		festival_date: '2027-03-22',
		button_name: 'View Details',
		button_link: 'https://example.com/holi',
		festival_description: 'Join us for a vibrant morning of music, dance, and festive treats.'
	}
];

const events = [
	{
		title: 'Community Health Camp',
		description: 'Free health screening camp for members, with doctors and wellness sessions.',
		image: '/uploads/9.jpg',
		event_date: new Date('2026-06-15'),
		venue: 'Community Center, Ahmedabad',
		event_category_id: '1',
		event_category_name: 'Health',
		event_name: 'Health Camp 2026',
		event_location: 'Community Center',
		location_link: 'https://maps.example.com/healthcamp',
		start_time: new Date('2026-06-15T09:00:00Z'),
		end_time: new Date('2026-06-15T15:00:00Z'),
		entry_type: 'Free',
		event_description: 'Open to all registered members and their families.'
	},
	{
		title: 'Ganesh Chaturthi Puja',
		description: 'Traditional Ganesh Chaturthi celebration with family prayers and prasad distribution.',
		image: '/uploads/10.jpg',
		event_date: new Date('2026-09-19'),
		venue: 'Parivar Mandir Hall, Ahmedabad',
		event_category_id: '2',
		event_category_name: 'Religious',
		event_name: 'Ganesh Puja 2026',
		event_location: 'Mandir Hall',
		location_link: 'https://maps.example.com/ganesh-puja',
		start_time: new Date('2026-09-19T18:00:00Z'),
		end_time: new Date('2026-09-19T21:00:00Z'),
		entry_type: 'Open',
		event_description: 'Family prayers, aarti, and sweets for every participant.'
	}
];

const users = [
	{
		member_id: '101',
		first_name: 'Bhavik',
		middle_name: '',
		last_name: 'wala',
		email: 'bhavikwala@gmail.com',
		password: 'Bhavik@123',
		number: '8866779008', // Login number
		gender: 'Male',
		dob: new Date('1975-04-12'),
		blood_group: 'B+',
		relation: 'Self',
		is_committee: true,
		committee_role: 'President',
		profile_image: '/uploads/1.jpg',
		country_id: '1',
		state_id: '1',
		city_id: '1',
		address: '101 Sardar parikh Society, Ahmedabad',
		family_code: 'FAM001'
	},
	{
		member_id: '102',
		parent_member_id: '101',
		first_name: 'Sunita',
		middle_name: 'R',
		last_name: 'parikh',
		email: 'sunita.parikh@example.com',
		password: 'password123',
		number: '7990881893', // Shared login number
		gender: 'Female',
		dob: new Date('1978-08-22'),
		blood_group: 'O+',
		relation: 'Spouse',
		is_committee: false,
		committee_role: '',
		profile_image: '/uploads/2.jpg',
		country_id: '1',
		state_id: '1',
		city_id: '1',
		address: '101 Sardar parikh Society, Ahmedabad',
		family_code: 'FAM001'
	},
	{
		member_id: '103',
		first_name: 'Rahul',
		middle_name: 'M',
		last_name: 'Sharma',
		email: 'rahul.sharma@example.com',
		password: 'password123',
		number: '9876543210',
		gender: 'Male',
		dob: new Date('1990-11-05'),
		blood_group: 'A+',
		relation: 'Self',
		is_committee: true,
		committee_role: 'Secretary',
		profile_image: '/uploads/3.jpg',
		country_id: '1',
		state_id: '1',
		city_id: '1',
		address: '405 Green Avenue, Ahmedabad',
		family_code: 'FAM002'
	},
	{
		member_id: '104',
		parent_member_id: '103',
		first_name: 'Priya',
		middle_name: 'R',
		last_name: 'Sharma',
		email: 'priya.sharma@example.com',
		password: 'password123',
		number: '9876543210', // Shared login number
		gender: 'Female',
		dob: new Date('1992-02-18'),
		blood_group: 'AB+',
		relation: 'Spouse',
		is_committee: false,
		committee_role: '',
		profile_image: '/uploads/4.jpg',
		country_id: '1',
		state_id: '1',
		city_id: '1',
		address: '405 Green Avenue, Ahmedabad',
		family_code: 'FAM002'
	},
	{
		member_id: '105',
		parent_member_id: '103',
		first_name: 'Aarav',
		middle_name: 'R',
		last_name: 'Sharma',
		email: 'aarav.sharma@example.com',
		password: 'password123',
		number: '9876543210', // Shared login number
		gender: 'Male',
		dob: new Date('2015-07-30'),
		blood_group: 'A+',
		relation: 'Son',
		is_committee: false,
		committee_role: '',
		profile_image: '',
		country_id: '1',
		state_id: '1',
		city_id: '1',
		address: '405 Green Avenue, Ahmedabad',
		family_code: 'FAM002'
	}
];

const configs = [
	{
		primaryColor: '#E65100',
		secondaryColor: '#F4C95D',
		backgroundColor: '#FFF8F0',
		textColor: '#4E342E',
		buttonColor: '#E65100',
		fontColor: '#FFFFFF',
		borderColor: '#E8D9C8',
		gradientStart: '#E65100',
		gradientEnd: '#7B0D1C'
	}
];

const roles = [
	{
		name: 'Super Admin',
		description: 'Administrator with all permissions',
		permissions: ALL_PERMISSION_KEYS,
		status: 1
	}
];

const news = [
	{
		news_id: 'NEWS001',
		title: "Honorable Prime Minister to Attend parikh Family Wedding",
		description: "Prime Minister Narendra Modi will grace the auspicious wedding ceremony of Chirag  & Mansi  on May 25, 2026, in Ahmedabad.",
		content: "Ahmedabad: In a moment of immense pride for our community, the Honorable Prime Minister Narendra Modi has accepted the invitation to attend the grand wedding of Chirag parikh (son of Shri Babubhai parikh) and Mansi Shah...",
		date: new Date('2026-06-15'),
		category: 'VIP Visit',
		image_url:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
		reporter_name: 'Ramesh Kumar',
		location: 'Ahmedabad, Gujarat'
	},
	{
		news_id: 'NEWS002',
		title: "Parivar Sweets & Family Dining Wins Best Restaurant Award",
		description: "Parivar Sweets & Family Dining has been recognized for its exceptional service and culinary excellence.",
		content: "Ahmedabad: Parivar Sweets & Family Dining has been awarded the 'Best Restaurant' title at the annual Gujarat Food Festival...",
		date: new Date('2026-06-20'),
		category: 'Awards',
		image_url:'https://images.unsplash.com/photo-1513104890138-7c749659a591',
		reporter_name: 'Sunita Sharma',
		location: 'Ahmedabad, Gujarat'
	}
];


module.exports = {
	countries,
	states,
	cities,
	businessCategories,
	businesses,
	posts,
	galleries,
	festivals,
	events,
	users,
	roles,
	configs,
	news
};