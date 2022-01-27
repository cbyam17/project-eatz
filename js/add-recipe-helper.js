/*
   javascript helper file for add-recipe.htmls
	 contributors:
	 	- matt: JQuery to dynamically add and remove table rows
		- mike: persisting and fetching images in AWS S3
		- chris: serializing form data and submitting RESTful POST request to create recipe
*/

$(document).ready(function () {

	//function to collect form data and send request to create new recipe
	$('#addRecipeButton').on('click', function(){
		//capture form data as JSON object
		var dataJSON = $('#addRecipeForm').serializeJSON();
		console.log(dataJSON);

		//TO DO: implement POST REST web request (see below snippet)

	});

	//function to add new row to ingredients table
	$('#addIngredientButton').on('click', function(){
		var newRow = $('<tr>');
		var cols = '';
		//note: keep these in sync with ingredients table in add-recipe.html
		cols += '<td><input type="number" name="ingredients[][quantity]" id="quantity"/></td>';
		cols += '<td><input type="text" name="ingredients[][ingredient]" id="ingredient"/></td>';
		cols += '<td><textarea name="ingredients[][notes]" id="notes"></textarea></td>';
		cols += '<td><input type="button" id="deleteIngredientButton" class="deleteButtonClass" value="Delete"/></td>';
		newRow.append(cols);
		$('#ingredientsTable tbody').append(newRow);
		return false;
	});

	//function to delete row of ingredients table
	$('#ingredientsTable').on('click','.deleteButtonClass', function(){
				$(this).closest('tr').remove();
				return false;
	});

	//function to add new row to steps table
	$('#addStepButton').on('click', function(){
		var newRow = $('<tr>');
		var cols = '';
		//note: keep these in sync with steps table in add-recipe.html
		cols += '<td><textarea name="steps[]" id="step"></textarea></td>';
		cols += '<td><input type="button" id="deleteStepButton" class="deleteButtonClass" value="Delete"/></td>';
		newRow.append(cols);
		$('#stepsTable tbody').append(newRow);
		return false;
	});

	//function to delete row of steps table
	$('#stepsTable').on('click','.deleteButtonClass', function(){
		$(this).closest('tr').remove();
		return false;
	});

});

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
