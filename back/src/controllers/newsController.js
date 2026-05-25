const News = require('../models/newsModel');

const getNewsList = async (req, res) => {
    console.log('Received request to fetch news list');
	try {
		const news = await News.find();
        console.log('Fetched news:', news);
		res.status(200).json(news);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addNews = async (req, res) => {
    console.log('Received request to add news with data:', req.body, 'and file:', req.file);
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const news = new News(data);
        await news.save();
        res.status(201).json(news);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateNews = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const news = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.status(200).json(news);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteNews = async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.status(200).json({ message: 'News deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNewsList,
    getNewsById,
    addNews,
    updateNews,
    deleteNews
};