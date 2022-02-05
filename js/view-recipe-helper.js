/*
   javascript helper file for view-recipe.html
	 contributors:
		- mike: fetching images in AWS S3
		- chris: fetching recipe details from API and rendering on page
*/

var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

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

	//extract the recipe id from url string (recipeId=xxx) and retrieve recipe details from API
	var queryString = window.location.href.split('/').pop();
	var recipeId = queryString.split('=').pop();

	/*DEBUGGING ONLY: create test JSON for debugging
	var dataStr = '{\n\t\"id\": \"123ABC\",\n\t\"name\": \"Test recipe 1\",\n\t\"category\": \"Main\",\n\t\"description\": \"Makes about 4-6 servings\",\n\t\"ingredients\": [{\n\t\t\t\"ingredient\": \"1 large yellow onion\",\n\t\t\t\"notes\": \"Finely chopped\"\n\t\t},\n\t\t{\n\t\t\t\"ingredient\": \"2 sprigs rosemary\",\n\t\t\t\"notes\": \"Dried can be substituted, just use half\"\n\t\t},\n\t\t{\n\t\t\t\"ingredient\": \"1 cup vegetable broth\",\n\t\t\t\"notes\": \"Water can be used if you do not have broth on hand\"\n\t\t}\n\n\t],\n\t\"steps\": [\n\t\t\"Sautee onion in oil over medium heat until translucent\",\n\t\t\"Add rosemary springs and stir around for a few minutes\",\n\t\t\"Add the vegetable broth and bring to a simmer on high heat\"\n\t]\n}'
	var dataJSON = JSON.parse(dataStr);*/

	//wrapper function for what to set up event listeners on page load
  $(function onDocReady(){
		populateRecipeDetails();
    $('#editRecipeButton').on('click', handleEditRecipe);
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
						success: completeRequest,
						error: function ajaxError(jqXHR, textStatus, errorThrown) {
								console.error('Error adding recipe: ', textStatus, ', Details: ', errorThrown);
								console.error('Response: ', jqXHR.responseText);
								alert('An error occured when adding your recipe:\n' + jqXHR.responseText);
						}
		});
	}

		function completeRequest(result) {
			//check result for server error (REVISIT THIS)
			if (result.statusCode == 500){
				alert('An error occured retrieving recipe:\n' + result.body);
				return false;
			}

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

			//hide buffering gif and make page visible
			$('#buffering').css('display','none');
			$('#container').css('display', 'block');

	}

	//function to handle edit recipe button
	function handleEditRecipe(event){
		var url = "update-recipe.html?recipeId=" + recipeId;
		window.location.href = url;
	}
}(jQuery));

/*


		//get recipe details then parse response and build html for page
		fetch(req, {
			method: 'GET',
			headers: {
				'authorizationToken': authToken
			}
		})
		  .then(response => response.json())
		  .then(data => populateRecipeDetails(data));

		function populateRecipeDetails(dataJSON){
			//add recipe name
			var tag = document.createElement("h1");
			var text = document.createTextNode(dataJSON.recipeName);
			tag.appendChild(text);
			var element = document.getElementById("recipeName");
			element.appendChild(tag);

			// Add image
			var imgData = document.createElement("img");
			var categoryKey = dataJSON.category + "/";
			var recipeKey = categoryKey + id;
			loadImage(recipeKey, imgData);
			var element = document.getElementById("picture");
			element.appendChild(imgData);

			//add recipe description
			var tag = document.createElement("p");
			var text = document.createTextNode(dataJSON.description);
			tag.appendChild(text);
			var element = document.getElementById("description");
			element.appendChild(tag);

			//add recipe category
			var tag = document.createElement("p");
			var text = document.createTextNode(dataJSON.category);
			tag.appendChild(text);
			var element = document.getElementById("category");
			element.appendChild(tag);

			//add recipe ingredients table
			var ingredients = dataJSON.ingredients;

			//create new table
			var table = document.createElement("table");
			var tableBody = document.createElement("tbody");
			for (i=0; i<ingredients.length; i++){
				//console.log(ingredients[i]);
				var tableRow = document.createElement("tr");
				var ingredientData = document.createElement("td");
				var ingredientText;
				if (ingredients[i].notes !== ''){
					ingredientText = document.createTextNode(ingredients[i].amount + ' ' + ingredients[i].ingredient + ' (' + ingredients[i].notes + ')');
				}
				else{
					ingredientText = document.createTextNode(ingredients[i].amount + ' ' + ingredients[i].ingredient);
				}
				ingredientData.appendChild(ingredientText);
				tableRow.appendChild(ingredientData);
				tableBody.appendChild(tableRow);
			}
			//add table head and body to new table, then add new table to ingredients
			table.appendChild(tableBody);
			var element = document.getElementById("ingredients");
			element.appendChild(table);


			//add recipe directions table
			var directions = dataJSON.directions;
			var table = document.createElement("table");
			//for each direction, build table body
			var tableBody = document.createElement("tbody");
			for (i=0; i<directions.length; i++){
				//console.log(directions[i]);
				var tableRow = document.createElement("tr");
				var tableData = document.createElement("td");
				var direction = document.createTextNode(i+1+'. '+directions[i]);
				tableData.appendChild(direction);
				tableRow.appendChild(tableData);
				tableBody.appendChild(tableRow);
			}
			//add table body to new table, then add new table to directions
			table.appendChild(tableBody);
			var element = document.getElementById("directions");
			element.appendChild(table);

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
		}

$(document).ready(function () {

		//function to go to update recipe page when edit recipe button is clicked
		//<a href="update-recipe.html?recipeId=4QbeZj-vibNdBi2AUHS6zQ"> <!-- hardcoded now, but will need to be done programmatically-->
	$("#editRecipe").on('click', function() {
		var queryString = window.location.href.split('/').pop();
		var recipeId = queryString.split('=').pop();
		var url = "update-recipe.html?recipeId=" + recipeId;
		window.location.href = url;
	});
});

*/
