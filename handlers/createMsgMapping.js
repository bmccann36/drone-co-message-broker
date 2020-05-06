const MessageMappingRepository = require("../repository/messageMappingRepository");
const Dyanmo = require("aws-sdk/clients/dynamodb");
const response = require("../model/response");
const QueueService = require("../service/queueService");
const SQS = require("aws-sdk/clients/sqs");

const messageMappingRepository = new MessageMappingRepository(
  new Dyanmo.DocumentClient(),
);
const queueService = new QueueService(new SQS());

exports.main = async function (event) {
  let numProcessed = 0;

  const body = JSON.parse(event.body);

  console.log("USE SQS? ", process.env.USE_SQS);
  if (process.env.USE_SQS && process.env.USE_SQS !== "false") {
    console.log("pushing message mappings to SQS queue");
    await queueService.addMappingsToQueue(
      body.messageContentId,
      body.recipientIds,
    );
  }
  if (process.env.USE_SQS == undefined || process.env.USE_SQS == "false") {
    console.log("skipping SQS, writing message mappings direct to dynamoDB");
    await messageMappingRepository.registerMessages(
      body.messageContentId,
      body.recipientIds,
    );
  }

  numProcessed = body.recipientIds.length;

  return response.getSuccessRes(
    `registered ${numProcessed} user to message associations`,
  );
};
