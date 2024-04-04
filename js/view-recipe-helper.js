/*
   javascript helper file for view-recipe.html
	 contributors:
		- mike: fetching images in AWS S3
		- chris: fetching recipe details from API and rendering on page
*/

var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

	//redirect user to signin page if not logged in (common flow)
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

	//get current username (common flow)
  var poolData = {
      UserPoolId: _config.cognito.userPoolId,
      ClientId: _config.cognito.userPoolClientId
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  if (typeof AWSCognito !== 'undefined') {
      AWSCognito.config.region = _config.cognito.region;
  }
  var currentUser = userPool.getCurrentUser();
  var currentUsername = currentUser.username;
  //placeholder for savedBy functionality
  var savedByIndex;

	//extract the recipe id from url string (recipeId=xxx) and retrieve recipe details from API
	var queryString = window.location.href.split('/').pop();
	var recipeId = queryString.split('=').pop();

	//wrapper function for what to set up event listeners on page load
  $(function onDocReady(){
		populateRecipeDetails();
    $('#editRecipeButton').on('click', handleEditRecipe);
    $('#saveRecipeButton').on('click', handleSaveRecipe);
    $('#unsaveRecipeButton').on('click', handleUnsaveRecipe);
  });

	function populateRecipeDetails(){
		//call projecteatz api to fetch recipe details
		$.ajax({
						method: 'GET',
						url: _config.api.invokeUrl + '/recipe/' + recipeId,
						headers: {
							'Authorization': authToken
						},
						contentType: 'application/json',
						success: completeGetRecipeRequest,
						error: function ajaxError(jqXHR, textStatus, errorThrown) {
								console.error('Error retrieving recipe: ', textStatus, ', Details: ', errorThrown);
								console.error('Response: ', jqXHR.responseText);
								alert('An error occured retrieving recipe:\n' + jqXHR.responseText);
						}
		});
	}

	function completeGetRecipeRequest(result) {
		//check result for server error (REVISIT THIS)
		if (result.statusCode == 500){
			alert('An error occured retrieving recipe:\n' + result.body);
			return false;
		}

		//get index in savedBy array of current user
		savedByIndex = result.savedBy.indexOf(currentUsername);

		//populate recipe name, category, description, createdby
		$('#recipeName').text(result.recipeName);
		$('#category').text(result.category);
		$('#description').text(result.description);
		$('#createdBy').text(result.createdBy);

		//populate recipe ingredients table
		for (i=0; i<result.ingredients.length; i++){
			var ingredient = result.ingredients[i].ingredient;
			var notes = result.ingredients[i].notes;
			var ingredientItem = '';
			if (notes != ''){
				ingredientItem = '<li>'+ingredient+' ('+notes+')</li>';
			}
			else ingredientItem = '<li>'+ingredient+'</li>'
			$('#ingredients').append(ingredientItem);
		}

		//populate recipe steps as ordered list
		for (i=0; i<result.steps.length; i++){
			var step = result.steps[i];
			var stepItem = '<li>'+result.steps[i]+'</li>';
			$('#steps').append(stepItem);
		}

		//TO DO: render the image from AWS S3 on page

		//if current user created recipe, show the edit recipe button
		if (currentUsername == result.createdBy){
			$('#editRecipeButton').css('display', 'inline');
		}

		//if current user has saved the recipe, remove save recipe button, show unsave button
		if (result.savedBy.includes(currentUsername)){
			$('#saveRecipeButton').css('display','none');
			$('#unsaveRecipeButton').css('display','inline');
			$('#unsaveRecipeButton').css('background-color','#b53737');
		}

		//hide buffering gif and make page visible
		$('#buffering').css('display','none');
		$('#container').css('display', 'block');
	}

	//function to handle edit recipe button
	function handleEditRecipe(event){
		var url = "update-recipe.html?recipeId=" + recipeId;
		window.location.href = url;
	}

	//function to handle save recipe button
	function handleSaveRecipe(event){
		var dataJSON = {username: currentUsername};

		//call projecteatz api to save recipe
		$.ajax({
						method: 'POST',
						url: _config.api.invokeUrl + '/recipe/' + recipeId + '/save',
						headers: {
							'Authorization': authToken
						},
						data: JSON.stringify(dataJSON),
						contentType: 'application/json',
						success: completeSaveRecipeRequest,
						error: function ajaxError(jqXHR, textStatus, errorThrown) {
								console.error('Error saving recipe: ', textStatus, ', Details: ', errorThrown);
								console.error('Response: ', jqXHR.responseText);
								alert('An error occured saving recipe:\n' + jqXHR.responseText);
						}
		});
	}

	function completeSaveRecipeRequest(result){
		//check result for server error (REVISIT THIS)
		if (result.statusCode == 500){
			alert('An error occured saving recipe:\n' + result.body);
			return false;
		}

		//refresh page
		alert('Recipe saved! Find it under saved recipes in My Profile');
		var url = "view-recipe.html?recipeId=" + recipeId;
		window.location.href = url;			
	}

	//function to handle unsave recipe button
	function handleUnsaveRecipe(event){
		var dataJSON = {
			username: currentUsername,
			index: savedByIndex
		};

		//call projecteatz api to unsave recipe
		$.ajax({
						method: 'DELETE',
						url: _config.api.invokeUrl + '/recipe/' + recipeId + '/save',
						headers: {
							'Authorization': authToken
						},
						data: JSON.stringify(dataJSON),
						contentType: 'application/json',
						success: completeUnsaveRecipeRequest,
						error: function ajaxError(jqXHR, textStatus, errorThrown) {
								console.error('Error removing from saved recipes: ', textStatus, ', Details: ', errorThrown);
								console.error('Response: ', jqXHR.responseText);
								alert('An error occured removing from saved recipes:\n' + jqXHR.responseText);
						}
		});
	}

	function completeUnsaveRecipeRequest(result){
		//check result for server error (REVISIT THIS)
		if (result.statusCode == 500){
			alert('An error occured removing from saved recipes:\n' + result.body);
			return false;
		}

		//refresh page
		alert('Recipe removed from saved recipes in My Profile');
		var url = "view-recipe.html?recipeId=" + recipeId;
		window.location.href = url;			
	}

}(jQuery));

/*



			function loadImage (key, imgData) {
				//Variables to get the picture from S3
					var recipeBucketName = 'my-recipe-pictures';
					AWS.config.region = 'us-east-2'; // Region
					AWS.config.credentials = new AWS.CognitoIdentityCredentials({
					IdentityPoolId: 'us-east-2:e4c9746c-7ccc-487d-9e97-97771e73a0f2',});

				// Create a new service object
				var s3 = new AWS.S3({
					  apiVersion: '2006-03-01',
					  params: {Bucket: recipeBucketName}
				});

				s3.getObject({Bucket: recipeBucketName, Key: key}, function(err, data) {
					// Handle any error and exit
					if (err) {
						if (err.statusCode == '404') {
							var element = document.getElementById("picture");
							imgData.setAttribute('src', "img/NoPicture.jpg");
							imgData.setAttribute('width', "200");
							imgData.setAttribute('height', "200");
						} else {
						console.log(err);
						}
					} else {
						var href = "https://s3." + AWS.config.region + ".amazonaws.com/";
						var bucketUrl = href + recipeBucketName + "/";
						var photoUrl = bucketUrl + key;
						var element = document.getElementById("picture");
						imgData.setAttribute('src', photoUrl);
						imgData.setAttribute('width', "200");
						imgData.setAttribute('height', "200");

					}
				});

			}
		}*/
