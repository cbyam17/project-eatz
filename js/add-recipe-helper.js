/*
   javascript helper file for add-recipe.htmls
	 contributors:
	 	- matt: JQuery to dynamically add and remove table rows
		- mike: persisting and fetching images in AWS S3
		- chris: serializing form data and submitting RESTful POST request to create recipe
*/

var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

  //get current user
  var poolData = {
      UserPoolId: _config.cognito.userPoolId,
      ClientId: _config.cognito.userPoolClientId
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  if (typeof AWSCognito !== 'undefined') {
      AWSCognito.config.region = _config.cognito.region;
  }
  var currentUser = userPool.getCurrentUser().username.replace('-at-', '@');

  //redirect user to signin page if not logged in
  var authToken;
  ProjectEatz.authToken.then(function setAuthToken(token) {
      if (token) {
          authToken = token;
      } else {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
      }
  }).catch(function handleTokenError(error) {
      alert(error);
      window.location.href = 'signin.html';
  });

  //wrapper function for what to set up event listeners on page load
  $(function onDocReady(){
    $('#addIngredientButton').on('click', handleAddIngredientRow);
    $('#ingredientsTable').on('click','.deleteButtonClass', handleRemoveIngredientRow);
    $('#addStepButton').on('click', handleAddStepRow);
    $('#stepsTable').on('click','.deleteButtonClass', handleRemoveStepRow);
    $('#cancelAddRecipeButton').on('click', handleCancelAddRecipe);
    $('#addRecipeForm').submit(handleAddRecipe);
  });

  //function to add new row to ingredients table
  function handleAddIngredientRow(event){
    var newRow = $('<tr>');
  	var cols = '';
  	//note: keep these in sync with ingredients table in add-recipe.html
  	cols += '<td><input type="text" name="ingredients[][ingredient]" id="ingredient"/></td>';
    cols += '<td><textarea name="ingredients[][notes]" id="notes"></textarea></td>';
  	cols += '<td><input type="button" id="deleteIngredientButton" class="deleteButtonClass" value="-"/></td>';
  	newRow.append(cols);
  	$('#ingredientsTable tbody').append(newRow);
  	return false;
  }

  //function to delete row of ingredients table
  function handleRemoveIngredientRow(event){
    $(this).closest('tr').remove();
  	return false;
  }

  //function to add new row to steps table
  function handleAddStepRow(event){
    var newRow = $('<tr>');
  	var cols = '';
  	//note: keep these in sync with steps table in add-recipe.html
  	cols += '<td><textarea name="steps[]" id="step"></textarea></td>';
  	cols += '<td><input type="button" id="deleteStepButton" class="deleteButtonClass" value="-"/></td>';
  	newRow.append(cols);
  	$('#stepsTable tbody').append(newRow);
  	return false;
  }

  //function to delete row of steps table
  function handleRemoveStepRow(event){
    $(this).closest('tr').remove();
  	return false;
  }

  //function to return to view-recipe.html when cancel button clicked
	function handleCancelAddRecipe(event){
		var url = "main-menu.html";
		window.location.href = url;
	}

  //function to collect form data and send request to create new recipe
  function handleAddRecipe(event){
    //capture form data as JSON object
  	var dataJSON = $('#addRecipeForm').serializeJSON();
    //add createdBy user to JSON objeect
    dataJSON.createdBy = currentUser;
    event.preventDefault();

  	//call projecteatz api to create new recipe
    $.ajax({
            method: 'POST',
            url: 'https://d8qga9j6ob.execute-api.us-east-1.amazonaws.com/dev/recipe',////_config.api.invokeUrl + '/recipe',
            headers: {
              'Authorization': authToken
            },
            data: JSON.stringify(dataJSON),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error adding recipe: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when adding your recipe:\n' + jqXHR.responseText);
            }
    });
  }

  //function that runs upon successful create of new recipe
  function completeRequest(result) {

    //TO DO: send image file to AWS S3 instance (see below snippet)

    //send user to view-recipe.html
    var recipeId = result.id;
    console.log(recipeId);
    //var url = "view-recipe.html?recipeId=" + recipeId;
    //window.location.href = url;
    }

}(jQuery));

  	/* use this snippet to help with generating post request

  	$("#submitRecipe").on('click', function() {

  		//serialize form data as formatted JSON object (this doesn't capture the picture)
  		var dataJSON = $('#addRecipeForm').serializeJSON();
  		var recipeID = '';
  		var cat = '';

  		var postUrl = 'https://d8qga9j6ob.execute-api.us-east-1.amazonaws.com/dev/recipe'; //createRecipeUrl
  		var authToken = '0eb6b64d-4aee-40d9-908d-4846044ee0f0'; //authToken

  		// Example POST method implementation:
  		async function postData(url = '', data = {}) {
  		  // Default options are marked with *


  		 // Temporary to get a file and put to s3
  		 // catElement= document.getElementById('category');
  		 // cat = catElement.value;
  		 //uploadPicture ("temp", cat);
  		 // return;
  		 //

  		  const answer = await fetch(url, {
  			method: 'POST', // *GET, POST, PUT, DELETE, etc.
  			mode: 'cors', // no-cors, *cors, same-origin
  			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  			credentials: 'same-origin', // include, *same-origin, omit
  			headers: {
  			  'Content-Type': 'application/json',
  			  'authorizationToken': authToken
  			},
  			redirect: 'follow', // manual, *follow, error
  			referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  			body: JSON.stringify(data) // body data type must match "Content-Type" header
  		  })
  		  .then(response => response.json())
  		  .then (data => {
  			alert('Successful add of recipe!');
  			recipeID = data.recipeId;
  			cat = document.getElementById('category').value;
  		  })
  		  .catch(error => {
  			alert('Failure to add recipe');
  		  });
  		}

  		result = postData(postUrl, dataJSON)
  		  .then(data => {
  			uploadPicture(recipeID, cat);
  		  });

  		//get response from this post, save the recipeId returned, and then add to s3 with the name of that id
  		function uploadPicture(recipeId, category){
  			// Initialize the Amazon Cognito credentials provider
  			var recipeBucketName = 'my-recipe-pictures';
  			AWS.config.region = 'us-east-2'; // Region
  			AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      		IdentityPoolId: 'us-east-2:e4c9746c-7ccc-487d-9e97-97771e73a0f2',});

  			// Create a new service object
  			var s3 = new AWS.S3({
   			 	apiVersion: '2006-03-01',
    				params: {Bucket: recipeBucketName}
  			});

  			if (recipeID !==  '') {
  				var files = document.getElementById("file-input").files;
  				if (!files.length) {
  				  return alert("Error - can't access file");
  				}
  				var file = files[0];
  				var fileName = file.name;
  				var categoryKey = encodeURIComponent(category) + "/";

  				var recipeKey = categoryKey + recipeId;

  				// Use S3 ManagedUpload class as it supports multipart uploads
  				var upload = new AWS.S3.ManagedUpload({
  				  params: {
  					Bucket: recipeBucketName,
  					Key: recipeKey,
  					Body: file,
  					ACL:'public-read'
  				  }
  				});

  				var promise = upload.promise();
  				promise.then(
  				  function(data) {
  					alert("Successfully uploaded photo.");
  					window.location.href = "index.html";
  				  },
  				  function(err) {
  					return alert("There was an error uploading your photo: ", err.message);
  				  }
  				);

  			} else {
  				window.location.href = "index.html";

  			}
  		}

  	});

  	$('#file-input').change(function() {
  		//var i = $(this).prev('label').clone();
  		var imgDiv = document.getElementById("image-div");
  		var file = $('#file-input')[0].files[0].name;
  		var p = document.createElement("p");
  		p.id = "filename";
  		var fileText = document.createTextNode(file);

  		//check for existing file already uploaded
  		var existingFilename = document.getElementById("filename");
  		if (existingFilename !== null){
  			imgDiv.removeChild(existingFilename);
  		}

  		//add filename to form
  		p.appendChild(fileText);
  		imgDiv.appendChild(p);
  	});*/
