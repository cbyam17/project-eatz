	/* 
   Javascript file for add-recipe.html
   uses Jquery click commands to call functions and add columns to the table
   Version: 1.0.1
*/




$(document).ready(function () {
	//
	// JAVASCRIPT to show image icon on screen after selection
	var imageLoader = document.getElementById('file-input');
	imageLoader.addEventListener('change', handleImage, false);
	var canvas = document.getElementById('imageCanvas');
	var ctx = canvas.getContext('2d');

	function handleImage(e){
		var reader = new FileReader();
		reader.onload = function(event){
			var img = new Image();
			img.onload = function(){
				ctx.drawImage(img,0,0,100,100);
			}
			img.src = event.target.result;
		}
		reader.readAsDataURL(e.target.files[0]);     
	}


    // function which is called when Div ID = addIngredient is clicked (AKA add Ingredient button)
    $("#addIngredient").on("click", function () {
    	var newRow = $("<tr>");
        var cols = "";

        // forms that will be added
        cols += '<td><input type="number" class="form-control-number" name = "ingredients[][amount]" id="amount"/></td>';
		cols += '<td><input type="text" class="form-control" name = "ingredients[][ingredient]" id="name"/></td>';
        //cols += '<td><input type="text" class="form-control" name = "ingredients[][measure]" id="measure"/></td>';        
		cols += '<td><input type="text" name = "ingredients[][notes]" id="notes" class="form-control"></input></td>';
        cols += '<td><button class="delete-button"> <i class="fa fa-minus"></i></button>';
        newRow.append(cols);
        $("#ingredientsTable tbody").append(newRow);
		return false;
    });
	
	// function which is called when Div ID = addInstruction is clicked (AKA add Instruction button)
    $("#addDirection").on("click", function () {
    	var newRow = $("<tr>");
        var cols = "";

        // forms that will be added
        cols += '<td> <textarea class="form-control" rows="2" cols="61" name="directions[]" id="direction"></textarea></td>';
        cols += '<td><button class="delete-button"> <i class="fa fa-minus"></i></button>';
        newRow.append(cols);
        $("#directionsTable tbody").append(newRow);
		return false;
    });
	
    // function which is called when class = btnDel is called (AKA Remove Ingredient button)
    $("table.ingr-list").on("click",".delete-button",function (event) {
        $(this).closest("tr").remove();       
        return false;
    });
	
	$("#submitRecipe").on('click', function() {
		
		//serialize form data as formatted JSON object (this doesn't capture the picture)
		var dataJSON = $('#addRecipeForm').serializeJSON();
		var recipeID = '';
		var cat = '';
		
		
		var postUrl = 'https://d8qga9j6ob.execute-api.us-east-1.amazonaws.com/dev/recipe';
		var authToken = '0eb6b64d-4aee-40d9-908d-4846044ee0f0';
		
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
	
});
