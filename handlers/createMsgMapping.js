const MessageGeneratorService = require("../service/messageGeneratorService");
const Dyanmo = require("aws-sdk/clients/dynamodb");
const response = require('../model/response')

const messageGeneratorService = new MessageGeneratorService(
  new Dyanmo.DocumentClient(),
);

exports.main = async function (event) {
  let numProcessed = 0;

  const body = JSON.parse(event.body);
  await messageGeneratorService.registerMessages(
    body.messageContentId,
    body.recipientIds,
  );
  numProcessed = body.recipientIds.length;

  return response.getSuccessRes(
    `registered ${numProcessed} user to message associations`,
  );
};



