const router = require('express').Router();
const Articles = require('../../models/Articles');

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body.title) {
        return res.status(422).json({
            errors: {
                title: 'is required'
            }
        });
    }

    if (!body.author) {
        return res.status(422).json({
            errors: {
                author: 'is required'
            }
        });
    }

    if (!body.body) {
        return res.status(422).json({
            errors: {
                body: 'is required'
            }
        });
    }

    const finalArticle = new Articles(body);
    return finalArticle.save()
        .then(() => res.json({ article: finalArticle.toJSON() }))
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Articles.find()
        .then(articles =>
            res.json({
                articles: articles.map(article => article.toJSON())
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Articles.findById(id)
        .then(article => {
            if (article) {
                req.article = article;
            }
        })
        .catch(() => res.sendStatus(404))
        .finally(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        article: req.article.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body.title !== 'undefined') {
        req.article.title = body.title;
    }

    if (typeof body.author !== 'undefined') {
        req.article.author = body.author;
    }

    if (typeof body.body !== 'undefined') {
        req.article.body = body.body;
    }

    return req.article.save()
        .then(() => res.json({ article: req.article.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Articles.findByIdAndRemove(req.article._id)
        .then(() => res.sendStatus(204))
        .catch(next);
});

module.exports = router;