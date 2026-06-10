const express = require('express');
const userController = require('../controllers/userController');
const { authorizeUserUpdate, protect, requirePermission, getTokenFromRequest } = require('../middleware/auth');
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

router.post('/login', parseForm, userController.login);
router.get('/profile', protect, userController.getProfile);

router.get('/', protect, (req, res, next) => {
    if (isAdminCall(req)) {
        return requirePermission('members.list')(req, res, () => userController.getUsers(req, res, next));
    }
    return userController.getUsers(req, res, next);
});

router.get('/:id', protect, (req, res, next) => {
    req.query.id = req.params.id;
    return userController.getUsers(req, res, next);
});

router.post('/', parseForm, (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (token) {
        return protect(req, res, () => {
            if (isAdminCall(req)) {
                return requirePermission('members.add')(req, res, () => userController.createUser(req, res, next));
            }
            return userController.register(req, res, next);
        });
    } else {
        return userController.register(req, res, next);
    }
});

router.put('/:id', protect, parseForm, (req, res, next) => {
    if (isAdminCall(req)) {
        return requirePermission('members.edit')(req, res, () => userController.updateUser(req, res, next));
    }
    return authorizeUserUpdate(req, res, () => userController.updateUser(req, res, next));
});

router.delete('/:id', protect, requirePermission('members.delete'), userController.deleteUser);

module.exports = router;
