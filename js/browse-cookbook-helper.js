/*
   javascript helper file for browse-cookbook.html
	 Contributors:
		- mike: fetching images from AWS S3 and rendering page
*/

//DEBUGGING ONLY: create test JSON for debugging
var dataStr = "[{\"id\": \"123ABC\",\n    \"name\": \"test recipe 1\",\n    \"category\": \"main\",\n    \"description\": \"test recipe 1 description\",\n    \"ingredients\": [\n        {\n            \"quantity\": \"1\",\n            \"ingredient\": \"yellow onion\",\n            \"notes\": \"finely chopped\"\n        },\n        {\n            \"quantity\": \"2\",\n            \"ingredient\": \"sprigs rosemary\",\n            \"notes\": \"dried can be substituted, just use half\"\n        }\n    ],\n    \"steps\": [\n        \"sautee onion in oil over medium heat\",\n        \"add rosemary springs and stir until aromatic\"\n    ]\n},\n{\"id\": \"456ABC\",\n    \"name\": \"test recipe 2\",\n    \"category\": \"app\",\n    \"description\": \"test recipe 2 description\",\n    \"ingredients\": [\n        {\n            \"quantity\": \"2\",\n            \"ingredient\": \"roma tomatoes (diced)\",\n            \"notes\": \"canned tomatoes work too\"\n        },\n        {\n            \"quantity\": \"1\",\n            \"ingredient\": \"tsp garlic powder\",\n            \"notes\": \"\"\n        }\n    ],\n    \"steps\": [\n        \"throw tomatoes in a blender with garlic until smooth\",\n        \"pour mixture in a pan on medium heat for 20 minutes\"\n    ]\n}]"
var dataJSON = JSON.parse(dataStr);

//TO DO: fetch all recipes from api

$(document).ready(function () {

	//list all recipes in <ul> getElementById
	for(i=0; i<dataJSON.length; i++){
		var newItem = $('<li>');
		var recipe = '<a href="update-recipe.html?recipeId='+dataJSON[i].id+'">'+dataJSON[i].name+'</a>'
		newItem.append(recipe);
		$('#recipeList').append(newItem);
	}

});

/*		function getRecipeList(catRecipe) {

		var authToken = '0eb6b64d-4aee-40d9-908d-4846044ee0f0';
		var req = 'https://d8qga9j6ob.execute-api.us-east-1.amazonaws.com/dev/recipe?category=' + catRecipe;

		// set cursor to waiting
		document.getElementById("recipeBody").style.cursor = "progress";


		//get recipe list then parse response and build html for page
		fetch(req, {
			method: 'GET',
			headers: {
				'authorizationToken': authToken
			}
		})
		  .then((response) => {
			if (response.status >= 200 && response.status <= 299) {
			  return response.json();
			} else {
			  throw Error(response.statusText);
			}
		  })
		  .then(data => populateRecipeDetails(data, catRecipe))
		  .catch((error) => {
			// Handle the error
			console.log(error);
		  });

		  // return cursor to default
		  document.getElementById("recipeBody").style.cursor = "default";

		function populateRecipeDetails(dataJSON, cat){



		// Add record total count to the screen

			var searchTotalId = document.getElementById("searchTotal");
			searchTotalId.innerHTML="";
			var createSpan  = document.createElement('span');
			createSpan.textContent = dataJSON.length + " records found";
			searchTotalId.appendChild(createSpan);

		// remove old table from screen
			var recipeTable = document.getElementById("recipeTable");
			recipeTable.innerHTML="";

			for (i=0; i<dataJSON.length; i++){

				var searchResults = document.createElement("div");
				var cardImgContainer = document.createElement("div");
				var cardDetailContainer = document.createElement("div");
				var cardDetailContainerLeft = document.createElement("div");
				var imgData = document.createElement("img");
				var cardSummary = document.createElement("div");
				var createA  = document.createElement('a');
				var createH  = document.createElement('h3');

				// SearchResults
				searchResults.setAttribute('class', "card__facetedSearchResult");

				//Image
				var fileName = dataJSON[i].recipeId;
				var categoryKey = encodeURIComponent(cat) + "/";
				var recipeKey = categoryKey + fileName;
				getImage(recipeKey, imgData);
				imgData.setAttribute('alt', dataJSON[i].recipeName);
				imgData.setAttribute('title', dataJSON[i].recipeName);
				cardImgContainer.setAttribute('class', "card__imageContainer");
				cardImgContainer.appendChild(imgData);

				//Detail Card
				createA.setAttribute('class', "card__titleLink manual-link-behavior");
				createA.setAttribute('title', dataJSON[i].recipeName);
				var nameURL = "view-recipe.html?recipeId=" + dataJSON[i].recipeId;
				createA.setAttribute('href', nameURL);
				createH.setAttribute('class',"card__title");
				createH.textContent = dataJSON[i].recipeName;

				createA.appendChild(createH);
				cardDetailContainerLeft.appendChild(createA);
				cardDetailContainer.appendChild(cardDetailContainerLeft);

				//Summary Card
				cardSummary.setAttribute('class', "card__summary");
				cardSummary.textContent = dataJSON[i].description;

				searchResults.appendChild(cardImgContainer);
				searchResults.appendChild(cardDetailContainer);
				searchResults.appendChild(cardSummary);
				recipeTable.appendChild(searchResults);

			}

			// if there were no recipes then put out error message
		//	if (dataJSON.length==0) {
		//		var tRow = document.createElement("tr");
		//		var nameData = document.createElement("td");
		//		nameData.appendChild(document.createTextNode("No Recipes Found"));
		//		tRow.appendChild(nameData);
		//		tBody.appendChild(tRow);
		//		recipeTable.appendChild(tBody);
		//	} else {
		//		recipeTable.appendChild(tBody);
		//	}

		}
		function getImage (key, imgData) {
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
						// document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
						imgData.setAttribute('src', "img/NoPicture.jpg");
						imgData.setAttribute('width', "265");
						imgData.setAttribute('height', "265");
					} else {
					console.log(err);
					}
				} else {
					var href = "https://s3." + AWS.config.region + ".amazonaws.com/";
					var bucketUrl = href + recipeBucketName + "/";
					var photoUrl = bucketUrl + key;
					imgData.setAttribute('src', photoUrl);
					imgData.setAttribute('width', "265");
					imgData.setAttribute('height', "265");
				}
			});

		}
	}*/
