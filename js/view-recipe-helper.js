/*
   javascript helper file for view-recipe.html
	 contributors:
		- mike: fetching images in AWS S3
		- chris: fetching recipe details from API and rendering on page
*/

//extract the recipe id from url string (recipeId=xxx) and retrieve recipe details from API
//url will look something like this: .../update-recipe.html?recipeId=ZsZFXcMmtvXFQ-8xoiWR6w
var queryString = window.location.href.split('/').pop();
var recipeId = queryString.split('=').pop();
console.log(recipeId);

//TO DO: fetch recipe details from api (see snippet below)

//DEBUGGING ONLY: create test JSON for debugging
var dataStr = '{\n    \"name\": \"test recipe\",\n    \"category\": \"main\",\n    \"description\": \"test recipe description\",\n    \"ingredients\": [\n        {\n            \"quantity\": \"1\",\n            \"ingredient\": \"yellow onion\",\n            \"notes\": \"finely chopped\"\n        },\n        {\n            \"quantity\": \"2\",\n            \"ingredient\": \"sprigs rosemary\",\n            \"notes\": \"dried can be substituted, just use half\"\n        }\n    ],\n    \"steps\": [\n        \"sautee onion in oil over medium heat\",\n        \"add rosemary springs and stir until aromatic\"\n    ]\n}';
var dataJSON = JSON.parse(dataStr);
console.log(dataJSON);

$(document).ready(function () {

	//populate recipe name, category, description
	$('#name').text(dataJSON.name);
	$('#category').text(dataJSON.category);
	$('#description').text(dataJSON.description);

	//populate recipe ingredients table
	for (i=0; i<dataJSON.ingredients.length; i++){
		var newRow = $('<tr>');
		var cols = '';
		//note: keep these in sync with ingredients table in add-recipe.html and update-recipe.html
		cols += '<td>'+dataJSON.ingredients[i].quantity+'</td>';
		cols += '<td>'+dataJSON.ingredients[i].ingredient+'</td>';
		cols += '<td>'+dataJSON.ingredients[i].notes+'</td>';
		newRow.append(cols);
		$('#ingredientsTable tbody').append(newRow);
	}

	//populate recipe steps stepsTable
	for (i=0; i<dataJSON.steps.length; i++){
		var newRow = $('<tr>');
		var cols = '';
		//note: keep these in sync with steps table in add-recipe.html and update-recipe.html
		cols += '<td>'+(i+1)+'</td>';
		cols += '<td>'+dataJSON.steps[i]+'</td>';
		newRow.append(cols);
		$('#stepsTable tbody').append(newRow);
	}

	//function to go to update recipe page when edit recipe button is clicked
	$("#editRecipeButton").on('click', function() {
		var queryString = window.location.href.split('/').pop();
		var recipeId = queryString.split('=').pop();
		var url = "update-recipe.html?recipeId=" + recipeId;
		window.location.href = url;
	});
});

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
