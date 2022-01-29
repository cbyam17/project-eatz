/*
   javascript helper file for browse-cookbook.html
	 Contributors:
		- mike: fetching images from AWS S3 and rendering page
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

	//DEBUGGING ONLY: create test JSON for debugging
	var dataStr = '[{\n\t\t\"id\": \"123ABC\",\n\t\t\"name\": \"Test recipe 1\",\n\t\t\"category\": \"Main\",\n\t\t\"description\": \"Makes about 4-6 servings\",\n\t\t\"ingredients\": [{\n\t\t\t\t\"ingredient\": \"1 large yellow onion\",\n\t\t\t\t\"notes\": \"Finely chopped\"\n\t\t\t},\n\t\t\t{\n\t\t\t\t\"ingredient\": \"2 sprigs rosemary\",\n\t\t\t\t\"notes\": \"Dried can be substituted, just use half\"\n\t\t\t},\n\t\t\t{\n\t\t\t\t\"ingredient\": \"1 cup vegetable broth\",\n\t\t\t\t\"notes\": \"Water can be used if you do not have broth on hand\"\n\t\t\t}\n\n\t\t],\n\t\t\"steps\": [\n\t\t\t\"Sautee onion in oil over medium heat until translucent\",\n\t\t\t\"Add rosemary springs and stir around for a few minutes\",\n\t\t\t\"Add the vegetable broth and bring to a simmer on high heat\"\n\t\t]\n\t},\n\t{\n\t\t\"id\": \"456ABC\",\n\t\t\"name\": \"Test recipe 2\",\n\t\t\"category\": \"Appetizer\",\n\t\t\"description\": \"To make this a meal, just double the recipe\",\n\t\t\"ingredients\": [{\n\t\t\t\t\"ingredient\": \"1 roma tomato\",\n\t\t\t\t\"notes\": \"Diced, but canned also works too\"\n\t\t\t},\n\t\t\t{\n\t\t\t\t\"ingredient\": \"1 Tbsp olive oil\",\n\t\t\t\t\"notes\": \"Any neutral oil can be used\"\n\t\t\t}\n\t\t],\n\t\t\"steps\": [\n\t\t\t\"Add diced tomatoes to a large pan over medium heat\",\n\t\t\t\"Stir in the oil and sautee for a few minutes\"\n\t\t]\n\t}\n]';
	var dataJSON = JSON.parse(dataStr);
	console.log(dataJSON);

	//TO DO: fetch all recipes from api

	$(function onDocReady(){
		listAllRecipes(dataJSON);
	});

	function listAllRecipes(dataJSON){
		//list all recipes in <ul> getElementById
		for(i=0; i<dataJSON.length; i++){
			var newItem = $('<li>');
			var recipe = '<a href="view-recipe.html?recipeId='+dataJSON[i].id+'">'+dataJSON[i].name+'</a>'
			newItem.append(recipe);
			$('#recipeList').append(newItem);
		}

		//TO DO: add thumbnail images to each recipe (put in table/grid view)

	}

}(jQuery));

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
