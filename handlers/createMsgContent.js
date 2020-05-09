const reponse = require("../model/response");
const Dynamo = require("aws-sdk/clients/dynamodb");
const ContentRepository = require("../repository/contentRepository");

const contentRepository = new ContentRepository(new Dynamo.DocumentClient());
const validateEnvVars = require("./validator/validateEnvVars");

exports.main = async function (event) {

  validateEnvVars();
  
  const msgContentItem = JSON.parse(event.body);
  console.log('putting content: ', msgContentItem);
  await contentRepository.putMessageContent(msgContentItem);

  return reponse.getSuccessRes("message content registered");
};
