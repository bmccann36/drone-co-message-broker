

## notes for new users

*pre-requisites*
- AWS cli installed + aws account and IAM user
- install serverless globally
- you may want to chose a different AWS region
- credentials configured
- use the same node version as lambda


### getting started

run locally with sls offline


### running api locally
sls offline --env local
`--env` needed

### deploying

1) make sure you have AWS credentials configured on you machine + aws cli installed    
[creating an AWS admin account](https://serverless-stack.com/chapters/create-an-aws-account.html)   
[aws cli setup only](https://serverless-stack.com/chapters/configure-the-aws-cli.html)

1) run `sls deploy -v` (-v gives verbose output) this will deploy your stack.    
*stack = all the resources defined in the `serverless.yml` file*

### using your drone-co-message-broker app

Anytime you run `sls deploy` to create or update your app, once finished it will output details about your stack. In the output take note of the endpoints which look like
```
endpoints:
  POST - https://<SOME_UUID>.execute-api.us-east-1.amazonaws.com/dev/mapping
  POST - https://<SOME_UUID>.execute-api.us-east-1.amazonaws.com/dev/content
  GET - https://<SOME_UUID>.execute-api.us-east-1.amazonaws.com/dev/messages/{id}
```
You can always see this information again by running `sls info`. You can check out your api in the AWS console by selecting the api gateway service. Also the cloud formation will give you an overview of all the deployed resources within this stack and let you easily navigate to each.

1) create some message content  
```
POST <\YOUR API ENDPOINT>/dev/content
BODY {   
	    "contentId": "103",
	    "messageContent": "thanks for downloading where's my drone!"
     }
```
you should get a success response, then go to DynamoDB in the AWS console and check out the MessageContent table. You should see your message in the table

2) create some user => message mappings
```
POST <\YOUR API ENDPOINT>/dev/mapping
BODY {
        "messageContentId": "103",
        "recipientIds": ["1","2","3"]
     }
```
3) get messages for user #1
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



### Enabling / Disabling SQS component





















### Notes about provisioned throughput 