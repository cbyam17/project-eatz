Hi team,

To work on a new feature, create a feature branch from main. When you've finished testing locally, create a pull request to merge your feature into main. There's a CI/CD pipeline set up in AWS Ampllfy to deploy to the testing environment. Once feature is validated there, create a pull request to merge main into staging, where we will confirm the scope of change. Lastly, create a pull request to merge staging into prod. There is another CI/CD pipeline set up in AWS Amplify to deploy to the live environment.

Since Project Eatz is serverless application, this repository only contains the static website content and scripts. Currently, all the backend AWS components (API Gateway, Lambda, Cognito, DynamoDB, S3, etc) are configured under my AWS account. If any of your features require modification of these components, I can give you access.

-Chris
