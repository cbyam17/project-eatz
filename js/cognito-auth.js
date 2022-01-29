/*
   javascript file that handles AWS cognito user management
	 contributors:
		- chris: cognito integration for user registration, verification, and signin
*/

var ProjectEatz = window.ProjectEatz || {};

(function scopeWrapper($) {

  var poolData = {
      UserPoolId: _config.cognito.userPoolId,
      ClientId: _config.cognito.userPoolClientId
  };

  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  if (typeof AWSCognito !== 'undefined') {
      AWSCognito.config.region = _config.cognito.region;
  }

  //TO DO: implement signout
  //ProjectEatz.signOut = function signOut() {
  //  console.log('signing out');
  //  userPool.getCurrentUser().signOut();
  //};

  ProjectEatz.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          reject(err);
        } else if (!session.isValid()) {
          resolve(null);
        } else {
          resolve(session.getIdToken().getJwtToken());
        }
      });
    } else {
      resolve(null);
    }
  });

  //console.log(ProjectEatz.authToken);
  //var user = userPool.getCurrentUser().username.replace('-at-', '@');
  //console.log(user);

  $(function onDocReady() {
    $('#signinForm').submit(handleSignin);
    $('#registrationForm').submit(handleRegister);
    $('#verifyForm').submit(handleVerify);
    $('#signoutButton').on('click', handleSignout);
  });

  /*
   * Cognito User Pool functions
   */

   function handleSignin(event) {
       var email = $('#emailInputSignin').val();
       var password = $('#passwordInputSignin').val();
       event.preventDefault();
       signin(email, password,
           function signinSuccess() {
               console.log('Successfully Logged In');
               window.location.href = 'main-menu.html';
           },
           function signinError(err) {
               alert(err);
           }
       );
   }

  function register(email, password, onSuccess, onFailure) {
      var dataEmail = {
          Name: 'email',
          Value: email
      };
      var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

      userPool.signUp(toUsername(email), password, [attributeEmail], null,
          function signUpCallback(err, result) {
              if (!err) {
                  onSuccess(result);
              } else {
                  onFailure(err);
              }
          }
      );
  }

  function signin(email, password, onSuccess, onFailure) {
      var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username: toUsername(email),
          Password: password
      });

      var cognitoUser = createCognitoUser(email);
      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: onSuccess,
          onFailure: onFailure
      });
  }

  function verify(email, code, onSuccess, onFailure) {
      createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
          if (!err) {
              onSuccess(result);
          } else {
              onFailure(err);
          }
      });
  }

  function createCognitoUser(email) {
      return new AmazonCognitoIdentity.CognitoUser({
          Username: toUsername(email),
          Pool: userPool
      });
  }

  function toUsername(email) {
      return email.replace('@', '-at-');
  }

  function handleRegister(event) {
      var email = $('#emailInputRegister').val();
      var password = $('#passwordInputRegister').val();
      var password2 = $('#password2InputRegister').val();

      var onSuccess = function registerSuccess(result) {
          var cognitoUser = result.user;
          console.log('user name is ' + cognitoUser.getUsername());
          var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
          if (confirmation) {
              window.location.href = 'verify.html';
          }
      };
      var onFailure = function registerFailure(err) {
          alert(err);
      };
      event.preventDefault();

      if (password === password2) {
          register(email, password, onSuccess, onFailure);
      } else {
          alert('Passwords do not match');
      }
  }

  function handleVerify(event) {
      var email = $('#emailInputVerify').val();
      var code = $('#codeInputVerify').val();
      event.preventDefault();
      verify(email, code,
          function verifySuccess(result) {
              console.log('call result: ' + result);
              console.log('Successfully verified');
              alert('Verification successful. You will now be redirected to the login page.');
              window.location.href = 'signin.html';
          },
          function verifyError(err) {
              alert(err);
          }
      );
  }

  function handleSignout(event){
    event.preventDefault();
    var res = userPool.getCurrentUser().signOut();
    window.location.href = 'index.html';
  }
}(jQuery));