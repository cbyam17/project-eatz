var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

  //global var declarations
  var rowsPerPage = 10;

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

  //build user saved recipes table
  function completeGetSavedRecipesRequest(result){
    //iterate through each recipe returned from api
    for (i=0; i<result.length; i++){
      var newRow = $('<tr>');
      var cols = '';
      cols += '<td><a href="view-recipe.html?recipeId='+result[i].id+'">'+result[i].recipeName+'</a></td>';
      cols += '<td>'+result[i].category+'</td>';
      cols += '<td>'+result[i].createdBy+'</td>';
      newRow.append(cols);
    	$('#savedRecipesTable tbody').append(newRow);
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

    //hide buffering gif and make page visible
    hideBufferingGIF();
    showContainer();

    //TO DO: add thumbnail images to each recipe (put in table/grid view)
  }

   //iterate through table to show only active page
  function renderTablePage(event){
    var pageNum = event.srcElement.value;
    var minIndex = ((pageNum-1) * rowsPerPage) + 1;
    var maxIndex = (pageNum * rowsPerPage);
    var table = document.getElementById("savedRecipesTable");
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

  function hideBufferingGIF(){
    $('#buffering').css('display','none');
  }

  function showContainer(){
    $('#container').css('display','');
  }

}(jQuery));
