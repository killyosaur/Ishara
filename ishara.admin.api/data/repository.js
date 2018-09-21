const { Database } = require('arangojs');

const db = new Database('http://localhost:8529');
db.useBasicAuth('root', 'B@dR3l1g10n');

const dataRepository = {
    query: async(aqlQuery, createObj) => {
        let cursor = await db.query(aqlQuery);

        return (await cursor.all()).map(a => createObj(a));
    },

    querySingle: async(aqlQuery, createObj) => {
        let cursor = await db.query(aqlQuery);

        return createObj(await cursor.next());
    },

    execute: async(aqlQuery) => {
        await db.query(aqlQuery);
    }
};

module.exports = dataRepository;