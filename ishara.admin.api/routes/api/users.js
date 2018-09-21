const router = require('express').Router();
const Users = require('../../models/Users');

router.get('/', (req, res, next) => {
    return Users.find()
        .then(users =>
            res.json({
                users: users.map(user => user.toJSON())
            }))
        .catch(next);
});

router.param('username', (req, res, next, username) => {
    return Users.findById(username)
        .then(user => {
            if (user) {
                req.user = user;
            }
        })
        .catch(() => res.sendStatus(404))
        .finally(next);
});

router.get('/:username', (req, res, next) => {
    return res.json({
        user: req.user.toJSON()
    });
});

module.exports = router;