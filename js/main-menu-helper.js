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
}(jQuery));
