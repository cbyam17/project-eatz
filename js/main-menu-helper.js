var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

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
								console.error('Error adding recipe: ', textStatus, ', Details: ', errorThrown);
								console.error('Response: ', jqXHR.responseText);
								alert('An error occured getting recipes:\n' + jqXHR.responseText);
						}
		});
  }

  function completeGetMyRecipesRequest(result){
    //populate current users
    $('#currentUsername').text('Welcome, ' + currentUsername + '!');
    //iterate through each recipe returned from api
    for (i=0; i<result.length; i++){
      var newRow = $('<tr>');
      var cols = '';
      cols += '<td><a href="view-recipe.html?recipeId='+result[i].id+'">'+result[i].recipeName+'</a></td>';
      cols += '<td>'+result[i].category+'</td>';
      newRow.append(cols);
    	$('#myRecipesTable tbody').append(newRow);
    }

    //TO DO: add thumbnail images to each recipe (put in table/grid view)

    //hide buffering gif and make page visible
    $('#buffering').css('display','none');
    $('#container').css('display', 'block');
  }

}(jQuery));
