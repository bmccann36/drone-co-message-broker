const Dynamodb = require("aws-sdk/clients/dynamodb");
const dynamodb = new Dynamodb();

var params = {
  AttributeDefinitions: [
    {
      AttributeName: "messageContentId",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "messageContentId",
      KeyType: "HASH",
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  TableName: "MessageMapping",
};
dynamodb.createTable(params, function (err, data) {
  if (err) console.log(err, err.stack);
  // an error occurred
  else console.log(data); // successful response
});
