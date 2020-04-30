
const MessageMappingRepository = require("../repository/messageMappingRepository");
const Dyanmo = require("aws-sdk/clients/dynamodb");

const messageMappingRepository = new MessageMappingRepository(
  new Dyanmo.DocumentClient(),
);

module.exports.main = async (event) => {

  const items = event.Records.map(record => {
    return JSON.parse(record.body);
  });

  const res = await messageMappingRepository.registerQueueMessages(items);
  console.log(res);

};