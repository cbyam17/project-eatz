/*
   javascript helper file for browse-cookbook.html
	 Contributors:
		- mike: fetching images from AWS S3 and rendering page
*/

var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

	//global var declarations
  var rowsPerPage = 10;

  //redirect user to signin page if not logged in
  var category;
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

  //functions to perform on page load
	$(function onDocReady(){
    $('#viewAppsButton').on('click', function(category){
    	handleViewRecipes('Appetizer');
    });
    $('#viewMainsButton').on('click', function(category){
    	handleViewRecipes('Main');
    });
    $('#viewSidesButton').on('click', function(category){
    	handleViewRecipes('Side');
    });
    $('#viewSoupsButton').on('click', function(category){
    	handleViewRecipes('Soup');
    });
    $('#viewDessertsButton').on('click', function(category){
    	handleViewRecipes('Dessert');
    });
    $('#viewDrinksButton').on('click', function(category){
    	handleViewRecipes('Drink');
    });
	});

  function handleViewRecipes(category){
  	clearRecipesTable();
  	showBufferingGIF();
  	clearPagination();
  	//get rid of current pagination div
    getRecipesByCategory(category);
  }

  //function to get main dish recipes from api and display
  function getRecipesByCategory(category){
    //call projecteatz api to fetch recipes
		$.ajax({
			method: 'GET',
			url: _config.api.invokeUrl + '/recipe?category=' + category,
			headers: {
				'Authorization': authToken
			},
			success: completeGetRecipesByCategoryRequest,
			error: function ajaxError(jqXHR, textStatus, errorThrown) {
				console.error('Error retrieving recipes: ', textStatus, ', Details: ', errorThrown);
				console.error('Response: ', jqXHR.responseText);
				alert('An error occured retrieving recipes:\n' + jqXHR.responseText);
			}
		});
  }

  function completeGetRecipesByCategoryRequest(result){
    //iterate through each recipe returned from api and build full table
    for (i=0; i<result.length; i++){
      var newRow = $('<tr>');
      var cols = '';
      cols += '<td><a href="' + 'view-recipe.html?recipeId=' + result[i].id + '">' + result[i].recipeName + '</a></td>';
      cols += '<td>' + result[i].category + '</td>';
      cols += '<td>' + result[i].createdBy + '</td>';
      newRow.append(cols);
    	$('#browseRecipesTable tbody').append(newRow);
    	//only show first page of results
    	if (i>=rowsPerPage){
    		newRow.css('display','none');
    	}
    }

    //get total pages in result
    var totalPages = Math.ceil(result.length/rowsPerPage);
    var paginationDiv = document.getElementById("paginationContainer");

    //pouplate pagination div
    for (i=0; i<totalPages; i++){
    	var pageNum = i+1;
    	//add page button
    	pageButton = document.createElement('input');
    	pageButton.type = 'button';
    	pageButton.value = pageNum;
    	pageButton.id = 'pageButton'+pageNum
    	//on click, render active page
    	pageButton.addEventListener('click', function(event){
    		renderTablePage(event);
    	});
    	paginationDiv.append(pageButton);
    }

    //TO DO: add thumbnail images to each recipe (put in table/grid view)

    //hide buffering gif and make page visible
    hideBufferingGIF();
    showRecipesTable();
  }

  //iterate through table to show only active page
  function renderTablePage(event){
  	var pageNum = event.srcElement.value;
  	var minIndex = ((pageNum-1) * rowsPerPage) + 1;
  	var maxIndex = (pageNum * rowsPerPage);
  	var table = document.getElementById("browseRecipesTable");
  	for (var i=1,row;row=table.rows[i]; i++) {
  		//if row outside of page range, make hidden, else display it
  		if (i<minIndex || i>maxIndex){
  			row.style.display = 'none';
  		}
  		else{
  			row.style.display = '';
  		}
  	}
  }

  function showRecipesTable(){
  	$('#recipesTableContainer').css('display', 'block');
  }

  function clearRecipesTable(){
  	$('#recipesTableContainer').css('display', 'none');
  	//remove current table rows
    $('#browseRecipesTable tbody tr').remove();
  }

   function showBufferingGIF(){
  	$('#buffering').css('display','block');
  }

  function hideBufferingGIF(){
  	$('#buffering').css('display','none');
  }

  function clearPagination(){
  	$('#paginationContainer').empty();
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
