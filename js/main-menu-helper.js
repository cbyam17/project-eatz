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


  //wrapper function for what happens on page load
  $(function onDocReady(){
		listMyRecipes();
	});

  function listMyRecipes(){
    //call projecteatz api to fetch recipes for logged in user
		$.ajax({
		  method: 'GET',
			url: _config.api.invokeUrl + '/recipe?createdBy=' + currentUsername,
			headers: {
				'Authorization': authToken
			},
			success: completeGetMyRecipesRequest,
			error: function ajaxError(jqXHR, textStatus, errorThrown) {
			 console.error('Error retrieving recipes: ', textStatus, ', Details: ', errorThrown);
			 console.error('Response: ', jqXHR.responseText);
			 alert('An error occured retrieving recipes:\n' + jqXHR.responseText);
			}
		});
  }

  //build paginated my recipes table
  function completeGetMyRecipesRequest(result){
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
    var tbody = document.querySelector('#myRecipesTable tbody');
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
