var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

  //global var declarations for pagination
  var itemsPerPage = 10;
  var currentPage = 1;

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

  //get current user (common flow)
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
  var currentUserEmail;
  var isEmailVerified;

  //get current user attributes
  if (currentUser != null) {
    currentUser.getSession(function (err, session) {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      //console.log('session validity: ' + session.isValid());

      // NOTE: getSession must be called to authenticate user before calling getUserAttributes
      currentUser.getUserAttributes(function (err, attributes) {
        if (err) {
          // Handle error
          } else {
          currentUserEmail = attributes[2].Value;
          isEmailVerified = attributes[1].Value;
        }
      });
    });
  }

  //wrapper function for what happens on page load
  $(function onDocReady(){
    getUserRecipeCount();
		listSavedRecipes();
	});

  //get the number of recipes created by current user
  function getUserRecipeCount(){
    //call projecteatz api to fetch recipes for logged in user
    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/recipe?createdBy=' + currentUsername,
      headers: {
        'Authorization': authToken
      },
      success: completeGetUserRecipeCountRequest,
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error retrieving recipes: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured retrieving recipes:\n' + jqXHR.responseText);
      }
    });
  }

  //complete getUserRecipeCount function
  function completeGetUserRecipeCountRequest(result){
    //populate current user info
    $('#currentUsername').text('Username: ' + currentUsername);
    $('#currentUserEmail').text('Email: ' + currentUserEmail);
    $('#isEmailVerified').text('Verified user: ' + isEmailVerified);
    $('#currentUserRecipeCount').text('Recipes added: ' + result.length);
  }

  //list saved recipes for current user
  function listSavedRecipes(){
    //call projecteatz api to fetch recipes saved by current user
		$.ajax({
			method: 'GET',
		  url: _config.api.invokeUrl + '/recipe?savedBy=' + currentUsername,
			headers: {
				'Authorization': authToken
			},
			success: completeGetSavedRecipesRequest,
			error: function ajaxError(jqXHR, textStatus, errorThrown) {
				console.error('Error retrieving recipes: ', textStatus, ', Details: ', errorThrown);
				console.error('Response: ', jqXHR.responseText);
				alert('An error occured retrieving recipes:\n' + jqXHR.responseText);
			}
		});
  }

  //build paginated saved recipes table
  function completeGetSavedRecipesRequest(result){
    var paginatedData = paginate(result, currentPage);
    displayData(paginatedData);
    renderPagination(result);
  }

  //paginate table data
  function paginate(data, page) {
    var startIndex = (page - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }

  //display paginated table data
  function displayData(data) {
    var tbody = document.querySelector('#savedRecipesTable tbody');
    tbody.innerHTML = '';
    data.forEach(function(item) {
      var row = '<tr><td><a href="view-recipe.html?recipeId='+item.id+'">'+item.recipeName+'</a></td><td>'+item.category+'</td><td>'+item.createdBy+'</td></tr>';
      tbody.innerHTML += row;
    });
  }

  //render pagination below table
  function renderPagination(data) {
    var pagination = document.querySelector('#pagination');
    pagination.innerHTML = "";

    var totalPages = Math.ceil(data.length / itemsPerPage);

    for (var i= 1; i<=totalPages; i++) {
      var button = document.createElement("button");//input?
      button.innerText = i;
      button.addEventListener("click", function() {
        currentPage = parseInt(this.innerText);
        var paginatedData = paginate(data, currentPage);
        displayData(paginatedData);
        renderPagination(data);
      });
      pagination.appendChild(button);
    }

    //hid buffering gif, show page
    hideBufferingGIF();
    showContainer();
  }

  function hideBufferingGIF(){
    $('#buffering').css('display','none');
  }

  function showContainer(){
    $('#container').css('display','');
  }

}(jQuery));
