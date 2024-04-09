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
    showContainer();
  }

  //iterate through table to show only active page
  function renderTablePage(event){
    var pageNum = event.srcElement.value;
    var minIndex = ((pageNum-1) * rowsPerPage) + 1;
    var maxIndex = (pageNum * rowsPerPage);
    var table = document.getElementById("myRecipesTable");
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
