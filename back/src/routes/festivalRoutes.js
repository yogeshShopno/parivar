const express = require('express');
const festivalController = require('../controllers/festivalController');
const { protect, requirePermission, getTokenFromRequest } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');

const router = express.Router();

const optionalProtect = async (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (token) {
        return protect(req, res, next);
    }
    return next();
};

const isAdminCall = (req) => {
    return req.user && (req.user.is_committee || req.user.role_id || req.user.role === 'admin');
};

router.get('/', optionalProtect, (req, res, next) => {
    if (isAdminCall(req)) {
        return requirePermission('festivals.list')(req, res, () => festivalController.adminGetFestivals(req, res, next));
    }
    return festivalController.getFestivals(req, res, next);
});

router.get('/:id', optionalProtect, (req, res, next) => {
    if (isAdminCall(req)) {
        return requirePermission('festivals.list')(req, res, () => festivalController.getFestivalById(req, res, next));
    }
    return festivalController.getFestivalById(req, res, next);
});

router.post('/', parseForm, (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (token) {
        return protect(req, res, () => {
            if (isAdminCall(req)) {
                return requirePermission('festivals.add')(req, res, () => festivalController.saveFestival(req, res, next));
            }
            return festivalController.saveFestival(req, res, next);
        });
    }
    return festivalController.saveFestival(req, res, next);
});

router.put('/:id', protect, parseForm, (req, res, next) => {
    if (isAdminCall(req)) {
        return requirePermission('festivals.edit')(req, res, () => festivalController.saveFestival(req, res, next));
    }
    return res.status(403).json({ message: 'Forbidden' });
});

router.delete('/:id', protect, (req, res, next) => {
    if (isAdminCall(req)) {
        return requirePermission('festivals.delete')(req, res, () => festivalController.deleteFestival(req, res, next));
    }
    return res.status(403).json({ message: 'Forbidden' });
});

module.exports = router;
