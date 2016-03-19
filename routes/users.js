var express = require('express');
var router = express.Router();

// get userList
router.get('/userlist', function( req, res) {
	var db = req.db;
	// get the collection userlist from the db
	var collection = db.get('userlist');
	// find with no limitations and put the docs into a json response
	collection.find( {}, {}, function ( e, docs) {
		res.json(docs);
	} );  // end get from collection
} );  // end get from router

module.exports = router;
