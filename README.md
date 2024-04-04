Hi team,

To work on a new feature, create a feature branch from main. When you've finished testing locally, create a pull request to merge your feature into main. There's a CI/CD pipeline set up in AWS Ampllfy to deploy to the testing environment. Once feature is validated there, create a pull request to merge main into staging, where we will confirm the scope of change. Lastly, create a pull request to merge staging into prod. There is another CI/CD pipeline set up in AWS Amplify to deploy to the prod environment (ProjectEatz.com).

-Chris
