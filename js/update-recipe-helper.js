/*
   javascript helper file for update-recipe.html
	 Contributors:
		- mike: persisting and fetching images in AWS S3
		- chris: serializing form data and submitting RESTful PUT request to update recipe, rendering recipe details
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

	//TO DO: Fetch recipe details from api (see snippet below)

	//DEBUGGING ONLY: create test JSON for debugging
	var dataStr = '{\n\t\"id\": \"123ABC\",\n\t\"name\": \"Test recipe 1\",\n\t\"category\": \"Main\",\n\t\"description\": \"Makes about 4-6 servings\",\n\t\"ingredients\": [{\n\t\t\t\"ingredient\": \"1 large yellow onion\",\n\t\t\t\"notes\": \"Finely chopped\"\n\t\t},\n\t\t{\n\t\t\t\"ingredient\": \"2 sprigs rosemary\",\n\t\t\t\"notes\": \"Dried can be substituted, just use half\"\n\t\t},\n\t\t{\n\t\t\t\"ingredient\": \"1 cup vegetable broth\",\n\t\t\t\"notes\": \"Water can be used if you do not have broth on hand\"\n\t\t}\n\n\t],\n\t\"steps\": [\n\t\t\"Sautee onion in oil over medium heat until translucent\",\n\t\t\"Add rosemary springs and stir around for a few minutes\",\n\t\t\"Add the vegetable broth and bring to a simmer on high heat\"\n\t]\n}'
	var dataJSON = JSON.parse(dataStr);

	$(function onDocReady(){
		populateRecipeDetails(dataJSON);
		$('#addIngredientButton').on('click', handleAddIngredientRow);
		$('#ingredientsTable').on('click','.deleteButtonClass', handleRemoveIngredientRow);
		$('#addStepButton').on('click', handleAddStepRow);
		$('#stepsTable').on('click','.deleteButtonClass', handleRemoveStepRow);
		$('#cancelUpdateRecipeButton').on('click', handleCancelUpdateRecipe);
		$('#updateRecipeForm').submit(handleUpdateRecipe);
  });

	function populateRecipeDetails(dataJSON){
		//populate recipe name, category, description
		$('#name').val(dataJSON.name);
		$('#category').val(dataJSON.category);
		$('#description').val(dataJSON.description);

		//populate recipe ingredients table
		for (i=0; i<dataJSON.ingredients.length; i++){
			var newRow = $('<tr>');
			var cols = '';
			//note: keep these in sync with ingredients table in add-recipe.html and update-recipe.html
			cols += '<td><input type="text" name="ingredients[][ingredient]" id="ingredient" value="'+dataJSON.ingredients[i].ingredient+'"/></td>';
			cols += '<td><textarea name="ingredients[][notes]" id="notes" value="">'+dataJSON.ingredients[i].notes+'</textarea></td>';
			cols += '<td><input type="button" id="deleteIngredientButton" class="deleteButtonClass" value="-"/></td>';
			newRow.append(cols);
			$('#ingredientsTable tbody').append(newRow);
		}

		//populate recipe steps stepsTable
		for (i=0; i<dataJSON.steps.length; i++){
			var newRow = $('<tr>');
			var cols = '';
			//note: keep these in sync with steps table in add-recipe.html and update-recipe.html
			cols += '<td><textarea name="steps[]" id="step">'+dataJSON.steps[i]+'</textarea></td>';
			cols += '<td><input type="button" id="deleteStepButton" class="deleteButtonClass" value="-"/></td>';
			newRow.append(cols);
			$('#stepsTable tbody').append(newRow);
		}

		//TO DO: implement image preview and update

	}

	//function to add new row to ingredients table
  function handleAddIngredientRow(event){
    var newRow = $('<tr>');
  	var cols = '';
  	//note: keep these in sync with ingredients table in add-recipe.html
  	cols += '<td><input type="text" name="ingredients[ingredient] id="ingredient"/></td>';
    cols += '<td><textarea name="ingredients[notes]" id="notes"></textarea></td>';
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
	function handleCancelUpdateRecipe(event){
		var url = "view-recipe.html?recipeId=" + recipeId;
		window.location.href = url;
	}

	function handleUpdateRecipe(event){
		//serialize form data as formatted JSON object (this doesn't capture the picture)
		var newDataJSON = $('#updateRecipeForm').serializeJSON();
		event.preventDefault();
		console.log(newDataJSON);

		//TO DO: implement PATCH request to API (see below snippet)

		//TO DO: replace image file on AWS S3 instance

		//send user to view-recipe.html
		var url = "view-recipe.html?recipeId=" + recipeId;
		window.location.href = url;
	}

}(jQuery));

/*
//extract the recipe id from url string (recipeId=xxx) and retrieve recipe details from API
//url will look something like this: .../view-recipe.html?recipeId=ZsZFXcMmtvXFQ-8xoiWR6w
var queryString = window.location.href.split('/').pop();
var id = queryString.split('=').pop();
var authToken = '0eb6b64d-4aee-40d9-908d-4846044ee0f0';
var req = 'https://d8qga9j6ob.execute-api.us-east-1.amazonaws.com/dev/recipe/' + id;

//get recipe details then parse response and build html for page
fetch(req, {
	method: 'GET',
	headers: {
		'authorizationToken': authToken
	}
})
	.then(response => response.json())
	.then(data => populateRecipeDetails(data));

//button functions (add/delete ingredient, add/delete directions)
$(document).ready(function () {

	//function to call api to update recipe
	$("#submitRecipe").on('click', function() {

		//serialize form data as formatted JSON object (this doesn't capture the picture)
		var dataJSON = $('#addRecipeForm').serializeJSON();
		//console.log(dataJSON);

		//extract the recipe id from url string (recipeId=xxx) and retrieve recipe details from API
		//url will look something like this: .../update-recipe.html?recipeId=ZsZFXcMmtvXFQ-8xoiWR6w
		var queryString = window.location.href.split('/').pop();
		var id = queryString.split('=').pop();
		var patchUrl = 'https://d8qga9j6ob.execute-api.us-east-1.amazonaws.com/dev/recipe/' + id;
		var authToken = '0eb6b64d-4aee-40d9-908d-4846044ee0f0';

		// Example PATCH method implementation:
		async function patchData(url = '', data = {}) {
		  // Default options are marked with *
		  const response = await fetch(url, {
			method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
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
		  });
		  return response.json(); // parses JSON response into native JavaScript objects
		}

		patchData(patchUrl, dataJSON)
		  .then(data => {
			uploadPicture(data); // JSON data parsed by `data.json()` call
		  });

		//get response from this post, save the recipeId returned, and then add to s3 with the name of that id
		function uploadPicture(data){
			//console.log(data);
			var recipeId = data.recipeId;
			var url = "view-recipe.html?recipeId=" + recipeId;
			window.location.href = url;
		}

	});

	//cancel update: return to view recipe page
	$("#cancel").on('click', function() {
		var queryString = window.location.href.split('/').pop();
		var recipeId = queryString.split('=').pop();
		var url = "view-recipe.html?recipeId=" + recipeId;
		window.location.href = url;
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
	});

});
*/
