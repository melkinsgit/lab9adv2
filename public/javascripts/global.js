// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();
	
	// Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
	// Add User button click
    $('#btnAddUser').on('click', addUser);
	// Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
	// Edit User link click
    $('#userList table tbody').on('click', 'td a.linkedituser', editUser);
	// Update User link click
    $('#btnEditUser').on('click', updateUser);	

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {
		
		// put the data into a var userListData
		userListData = data

        // For each item in our JSON, add a table row and cells to the content string
		// class identifies method to call, rel identifies user name
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '<td><a href="#" class="linkedituser" rel="' + this._id + '">edit</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();
	
	// in case the user has clicked on a table item to edit, but not submitted changes
	$('#editUser fieldset input').val('');

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on username value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);
	
	// Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);
	
};

// Add User
function addUser(event) {
	event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
	var errorCount = 0;
	// for the input associated with the add user button, cycle through the input boxes
	$('#addUser input').each(function (index, val){
		// if the input value of any given input box is null, increment the error county
		if ($(this).val() === '' )
			{errorCount++;}
	});

    // Check and make sure errorCount's still at zero, which means all boxes have been filled with text
    if(errorCount === 0) {

        // If it is, compile all user info into one object, instantiate the object with the values from teh input boxes with the appropriate names
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service; the adduser fn in the users js file with insert the newUser - a JSON object of data - into the database
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response from the ajax call
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned; the push to the db didn't work
                alert('Error: ' + response.msg);

            }
        });
    }
    else {  // the user didn't fill in all the field
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();
	
	// in case the user has clicked on a table item to edit, but not submitted changes
	$('#editUser fieldset input').val('');

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete - ajax DELETE call with the id attribute of the calling link, just like the show user - in show user we're getting the array position of the user, here we are deleting the user via the ajax call to colleciton.remove in deleteuser
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {
			
			// the response is a message that is null if all OK or the appropriate error msg

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

// Edit user
function editUser (event){
	
	event.preventDefault();
		
	// Retrieve username from link rel attribute
	var thisUserID = $(this).attr('rel');
	
	// Get Index of object based on id value
	var arrayPosition = userListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(thisUserID);
	
	// Get our User Object
	var thisUserObject = userListData[arrayPosition];
	
	// inject object into existing fieldset for edit user; populate edit text boxes
	$('#editUser fieldset input#inputUserName').val(thisUserObject.username);
	$('#editUser fieldset input#inputUserEmail').val(thisUserObject.email);
	$('#editUser fieldset input#inputUserFullname').val(thisUserObject.fullname);
	$('#editUser fieldset input#inputUserAge').val(thisUserObject.age);
	$('#editUser fieldset input#inputUserLocation').val(thisUserObject.location);
	$('#editUser fieldset input#inputUserGender').val(thisUserObject.gender);
	
	
	// Anna had the clever solution of adding the id field (hidden) to her dual addUser/editUser fieldset; I tried everything I could to avoid it, but in the end I needed something the user wouldn't/couldn't change to access the doc in the collection that I wanted to update when the user was done, id number (PK) was the obvious choice
	$('#editUser fieldset input#inputUserID').val(thisUserObject._id);
        
};

// Update user
function updateUser (event){
	event.preventDefault();
	
	// the ability to get the doc by id is based on the fact that id was added to the edit field set
	var idToEdit = $('#editUser fieldset input#inputUserID').val();
	console.log(idToEdit);
	
	// Get Index of object based on username value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(idToEdit);
	console.log(arrayPosition);
	
	// Get our User Object
    var thisUserObject = userListData[arrayPosition];

    // Super basic validation - increase errorCount variable if any fields are blank
	var errorCount = 0;
	// for the input associated with the add user button, cycle through the input boxes
	$('#editUser input').each(function (index, val){
		// if the input value of any given input box is null, increment the error county
		if ($(this).val() === '' )
			{errorCount++;
			console.log($(this).val());}
	});

    // Check and make sure errorCount's still at zero, which means all boxes have been filled with text
    if(errorCount === 0) {

        // If it is, compile all user info into one object, instantiate the object with the values from teh input boxes with the appropriate names
        var newUser = {
            'username': $('#editUser fieldset input#inputUserName').val(),
            'email': $('#editUser fieldset input#inputUserEmail').val(),
            'fullname': $('#editUser fieldset input#inputUserFullname').val(),
            'age': $('#editUser fieldset input#inputUserAge').val(),
            'location': $('#editUser fieldset input#inputUserLocation').val(),
            'gender': $('#editUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to put the object to our updateuser service; the updateuser fn in the users js file with insert the newUser - a JSON object of data - into the database
		console.log('id num for put is ' + thisUserObject._id);
        $.ajax({
            type: 'PUT',
            data: newUser,
            url: '/users/updateuser/' + thisUserObject._id,
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response from the ajax call
            if (response.msg === '') {
				
				console.log('we should have accomplished the update');

                // Clear the form inputs
                $('#editUser fieldset input').val('');

                // Update the table
                populateTable();
				clearVars();

            }
            else {

                // If something goes wrong, alert the error message that our service returned; the push to the db didn't work
                alert('Error: ' + response.msg);

            }
        });
    }
    else {  // the user didn't fill in all the field
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};