var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

  //redirect user to signin page if not logged in (common)
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

  //get current user (common)
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
      console.log('session validity: ' + session.isValid());

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
                console.error('Error getting recipes: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured getting recipes:\n' + jqXHR.responseText);
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

    //hide buffering gif and make page visible (common)
    $('#buffering').css('display','none');
    $('#container').css('display', 'block');
  }

  //to implement
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
								console.error('Error getting recipes: ', textStatus, ', Details: ', errorThrown);
								console.error('Response: ', jqXHR.responseText);
								alert('An error occured getting recipes:\n' + jqXHR.responseText);
						}
		});
  }

  //to implement
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
    }

    //TO DO: add thumbnail images to each recipe (put in table/grid view)

    //hide buffering gif and make page visible
    $('#buffering').css('display','none');
    $('#container').css('display', 'block');
  }

}(jQuery));
