const { aql } = require('arangojs');
const Users = require('./Users');
const { query, querySingle, execute } = require('../data/repository');

class Articles {
    constructor(value) {
        this.title = value.title;
        this.author = value.author;
        this.body = value.body;
        this.postedOn = value.postedOn || Date.now();
        this.editedOn = value.editedOn || Date.now();
        this._id = value._id;

        this.toJSON = this.toJSON.bind(this);
    }

    static create(v) {
        return new Articles(v);
    }

    static async find() {
        return await query(aql `FOR p IN post \
                FOR u IN 1..1 OUTBOUND p written_by \
                RETURN {\
                    title: p.title, \
                    body: p.body, \
                    _id: p._key, \
                    postedOn: p.postedOn, \
                    editedOn: p.modifiedOn, \
                    author: u.username, \
                    firstname: u.firstname, \
                    lastname: u.lastname\
                }`, this.create);
    }

    static async findById(id) {
        return await querySingle(aql `FOR p IN post \
                    FOR u IN 1..1 OUTBOUND p written_by \
                    FILTER p._key == ${id} \
                    RETURN {\
                        title: p.title, \
                        body: p.body, \
                        _id: p._key, \
                        postedOn: p.postedOn, \
                        editedOn: p.modifiedOn, \
                        author: u.username, \
                        firstname: u.firstname, \
                        lastname: u.lastname\
                    }`, this.create);
    }

    static async findByIdAndRemove(id) {
        await execute(aql `LET keys = (FOR v, e IN 1..1 ANY ${"post/" + id} GRAPH 'Ishara' RETURN e._key)\
            LET r = (FOR key IN keys REMOVE key IN written_by)\
            REMOVE ${id} IN post`);
    }

    async save() {
        let user = await Users.findById(this.author);

        var today = Date.now();

        let post = await querySingle(aql `UPSERT {\
                _key: ${this._id || 0}\
            }\
            INSERT {\
                createdOn: ${today},\
                postedOn: ${today},\
                modifiedOn: ${today},\
                title: ${this.title},\
                body: ${this.body}\
            }\
            UPDATE {\
                modifiedOn: ${today},\
                title: ${this.title},\
                body: ${this.body}\
            }\
            INTO post\
            RETURN NEW._key`);

        await execute(aql `UPSERT {\
                _from: ${"post/" + post},\
                _to: ${"user/" + user._key}\
            }\
            INSERT {\
                _from: ${"post/" + post},\
                _to: ${"user/" + user._key}\
            }\
            UPDATE {}\
            INTO written_by`);

        return post;
    }

    toJSON() {
        return {
            _id: this._id,
            title: this.title,
            body: this.body,
            author: this.author,
            createdAt: this.postedOn,
            updatedAt: this.editedOn
        };
    }
}

module.exports = Articles;