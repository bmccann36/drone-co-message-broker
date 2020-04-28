const reponse = require("../model/response");
const Dynamo = require("aws-sdk/clients/dynamodb");
const ContentRepository = require("../repository/contentRepository");

const contentRepository = new ContentRepository(new Dynamo.DocumentClient());

exports.main = async function (event) {
  const msgContentItem = JSON.parse(event.body);
  // console.log(msgContentItem);
  contentRepository.putMessageContent(msgContentItem);

  return reponse.getSuccessRes("message content registered");
};
