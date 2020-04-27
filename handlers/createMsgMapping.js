
const MessageGeneratorService = require("../service/messageGeneratorService");
const Dyanmo = require("aws-sdk/clients/dynamodb");

const messageGeneratorService = new MessageGeneratorService(
  new Dyanmo.DocumentClient(),
);

exports.main = async function (event, context) {
  const body = JSON.parse(event.body);
  const dynamoRes = await messageGeneratorService.registerMessages(
    body.messageContentId,
    body.recipientIds,
  );
  // console.log(dynamoRes);

  const headers = {
    "Access-Control-Allow-Origin": "*",
  };
  // Return status code 200 and the newly created item
  const response = {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({ all: "done" }),
  };

  return response;
};
