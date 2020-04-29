const Dynamo = require("aws-sdk/clients/dynamodb");
const ContentRepository = require("../repository/contentRepository");
const responseModel = require("../model/response");

const contentRepository = new ContentRepository(new Dynamo.DocumentClient());

module.exports.main = async function (event) {
  const { id } = event.pathParameters;
  const repoResponse = await contentRepository.getMessages(id);
  return responseModel.marshallResponse(repoResponse);
};
