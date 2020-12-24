#! /bin/bash
arangosh --server.endpoint http+ssl://0.0.0.0:8529 --server.password $ROOT_PASSWORD --javascript.execute-string 'let db = require("@arangodb").db;
db._createDatabase("IsharaDB", {}, [{ username: "$APP_USER", passwd: "$APP_PASSWORD", active: true}]);
db._useDatabase("IsharaDB");
let edgeDefinitions = [
{ collection: "accessed_by", "from": [ "user" ], "to" : [ "access" ] },
{ collection: "secured_by", "from": [ "user" ], "to" : [ "password" ] },
{ collection: "written_by", "from": [ "user" ], "to" : [ "comment", "post" ] },
{ collection: "tagged_as", "from": [ "post" ], "to" : [ "tag" ] }
];
require("@arangodb/general-graph")._create("Ishara", edgeDefinitions);'
