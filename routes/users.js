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

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    var userToDelete = req.params.id;
    collection.remove({ '_id' : userToDelete }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 * PUT to updateuser.
 */
router.put('/updateuser/:id', function(req, res) {
	var db = req.db;
	var collection = db.get('userlist');
	var userToUpdate = req.params.id;
	// I stumbled around for awhile with mongo update, and then noticed that Anna just updated the doc body - it's all JSON! that's why it's so easy!
    var userDataToUpdate = req.body;
    collection.update({'_id':userToUpdate}, userDataToUpdate, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;
