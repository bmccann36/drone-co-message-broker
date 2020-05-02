# drone co message broker
*about*
This project corresponds to a post about optimizing DyanmoDB and Lambda usage. Its a simplified example project meant to help demonstrate DynamoDB billing options, Lambda reserved concurrency, and general AWS best practices and design patterns.    
If you are new to AWS or Serverless architecture or The Serverless Framework here are some good resources to provide background   
- https://serverless-stack.com/
- https://www.serverless.com/

_pre-requisites_

- AWS cli installed + aws account and IAM user [steps](https://serverless-stack.com/chapters/create-an-aws-account.html)
- install serverless globally `npm i -g serverless`
- you may want to chose a different AWS region. The default is us-east-1. It can be changed in [serverless.yml](serverless.yml)
- AWS credentials configured  [aws cli setup](https://serverless-stack.com/chapters/configure-the-aws-cli.html)
- I recommend using the same Node version locally that your lambdas are running. [https://github.com/nvm-sh/nvm](NVM) can help with this 

## quick start

1. clone / fork the repo and run `npm i` in project root to install dependencies
1. run `sls deploy -v` to deploy the application to your AWS account

### npm scripts

`npm run localserver` - uses serverless offline plugin to start a local server. This will let you trigger your functions through a REST interface     
`npm run localserver:watch` - same as above but better for development. Anytime you make a change to a .js file and save, the server will restart with your changes. 

### running api locally

see the definition of the `localserver:watch` script in [package.json](./package.json)    
the --env flag instructs serverless offline to read environment variable values defined in .env.local  

For the app to work for you localy you will need to fill in these values yourself. These values will only be defined after you have deployed the app. Even when this project runs locally it still depends on resources deployed in the cloud. It is totally possible to run mocked out instances of DyanmoDB and SQS but that is outside the scope of this project. If you want to do that go for it. 

*.env.local setup*
go to AWS web console, navigate to cloudformation service page, click on your stack name, take note of the table names which are auto generated, also find the SQS queue URL    
put these values into [SAMPLE.env.local](./SAMPLE.env.local)   
then change the name of the file to just `.env.local`

*debugging locally*
(only for vscode)  
you can use vscode debugger and attach to process launched by `npm run localserver:watch`  
I copied this setup https://github.com/Microsoft/vscode-recipes/tree/master/nodemon . 

### app configuration

_SQS_   
the app is configured so that the `createMsgMapping` [./handlers/createMsgMapping](handler) will send messages to SQS. To turn this off and instead have the handler just directly put the "mapping" items into a DynamoDb table simply remove `USE_SQS=true` from [./.env](.env).

*environment configuration*    

this project uses `serverless-dotenv-plugin` which will automatically source environment variables from a .env file when a `sls` command is run.    
when `sls deploy` is run to deploy/update the app it will by default use [./.env](.env) unless a different configuration is specified like so    
`sls deploy --env custom` (will pull env vars from a file named .env.custom)    

the `localserver:watch` script instructs sls offline to start with the environment `.env.local`

the majority of the environment variables used in the deployed (running on AWS) environment are defined in [serverless.yml](serverless.yml)   
they use cloudformation intrinsic functions to dynamically populate the env var values at deploy time. See CloudFormation documentation for more. 

### deploying

1. make sure you have AWS credentials configured on you machine + aws cli installed  
   [creating an AWS admin account](https://serverless-stack.com/chapters/create-an-aws-account.html)  
   [aws cli setup only](https://serverless-stack.com/chapters/configure-the-aws-cli.html)

1. run `sls deploy -v` (-v gives verbose output) this will deploy your stack.  
   _stack = all the resources defined in the `serverless.yml` file_

1. make changes to your code / aws resources and run `sls deploy -v` again to make updates

1. to delete everything run `sls remove`

### using your drone-co-message-broker app

Anytime you run `sls deploy` to create or update your app, once finished it will output details about your stack. In the output take note of the endpoints which look like

```
endpoints:
  POST - https://<SOME_UUID>.execute-api.us-east-1.amazonaws.com/dev/mapping
  POST - https://<SOME_UUID>.execute-api.us-east-1.amazonaws.com/dev/content
  GET - https://<SOME_UUID>.execute-api.us-east-1.amazonaws.com/dev/messages/{id}
```

You can always see this information again by running `sls info`. You can check out your api in the AWS console by selecting the api gateway service. Also the cloud formation will give you an overview of all the deployed resources within this stack and let you easily navigate to each.

*NOTE*  
When developing you may find it more convenient to start the message broker api server locally and call your local endpoint. Instead of calling the api gateway URL you can call `localhost:3000` instead. See npm scripts section on how to run a local server. Also note that calling your localally running server will still cause your code to be executed against your resources deployed in the cloud such as DyanmoDB and SQS.

1. create some message content

```
POST <\YOUR API ENDPOINT>/dev/content  (api endpoint can point to your local machine or api gateway)
BODY {
	    "contentId": "103",
	    "messageContent": "thanks for downloading where's my drone!"
     }
```

you should get a success response, then go to DynamoDB in the AWS console and check out the MessageContent table. You should see your message in the table

2. create some user => message mappings

```
POST <\YOUR API ENDPOINT>/dev/mapping
BODY {
        "messageContentId": "103",
        "recipientIds": ["1","2","3"]
     }
```

3. get messages for user #1

```
GET <\YOUR API ENDPOINT>/dev/messages/1
```

should return

```
[
    {
        "contentId": "103",
        "messageContent": "thanks for downloading where's my drone!"
    }
]
```

### Notes about provisioned throughput

for simplicity sake and to keep these resources within the AWS free tier I've configured the Dynamo Tables with the default configuration. If you want to get the kind of high performance I talked about in the article you'll need to follow the same steps as I've outlined. Their configuration can be changed through infrastructure as code (instead of the AWS console) by modifying [cloudFormation/tables](./cloudFormation/tables) .  
**Important** Be aware of how these changes may effect your AWS cloud Bill ! 