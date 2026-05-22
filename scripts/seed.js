const mongoose = require('mongoose');
require('dotenv').config();

const Country = require('../src/models/countryModel');
const State = require('../src/models/stateModel');
const City = require('../src/models/cityModel');
const BusinessCategory = require('../src/models/businessCategoryModel');
const Business = require('../src/models/businessModel');
const Post = require('../src/models/postModel');
const Gallery = require('../src/models/galleryModel');
const Festival = require('../src/models/festivalModel');
const Event = require('../src/models/eventModel');
const Config = require('../src/models/configModel');
const User = require('../src/models/userModels');
const seedData = require('./seedData');

const collections = [
	{ name: 'countries', model: Country, data: seedData.countries },
	{ name: 'states', model: State, data: seedData.states },
	{ name: 'cities', model: City, data: seedData.cities },
	{ name: 'business categories', model: BusinessCategory, data: seedData.businessCategories },
	{ name: 'businesses', model: Business, data: seedData.businesses },
	{ name: 'posts', model: Post, data: seedData.posts },
	{ name: 'galleries', model: Gallery, data: seedData.galleries },
	{ name: 'festivals', model: Festival, data: seedData.festivals },
	{ name: 'events', model: Event, data: seedData.events },
	{ name: 'configs', model: Config, data: seedData.configs }
];

const seedDB = async () => {
	try {
		const mongoURI = process.env.MONGO_URI;
		if (!mongoURI) {
			throw new Error('MONGO_URI environment variable is missing in .env');
		}

		console.log('Connecting to database...');
		await mongoose.connect(mongoURI);
		console.log('Connected to database 🍃');

		for (const collection of collections) {
			console.log(`Clearing existing ${collection.name}...`);
			await collection.model.deleteMany();
			console.log(`Existing ${collection.name} cleared.`);

			if (collection.data && collection.data.length) {
				console.log(`Inserting ${collection.data.length} ${collection.name}...`);
				await collection.model.insertMany(collection.data);
				console.log(`Successfully seeded ${collection.name}.`);
			}
		}

		console.log('Clearing existing users...');
		await User.deleteMany();
		console.log('Existing users cleared.');

		console.log('Inserting seed users...');
		for (const user of seedData.users) {
			await User.create(user);
		}
		console.log(`Successfully seeded ${seedData.users.length} users! 🎉`);

		await mongoose.connection.close();
		console.log('Database connection closed.');
		process.exit(0);
	} catch (error) {
		console.error(`Seeding failed: ${error.message} ❌`);
		process.exit(1);
	}
};

seedDB();