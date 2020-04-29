require('dotenv').config();
const SQS = require("aws-sdk/clients/sqs");
const QueueService = require("./queueService");

const target = new QueueService(new SQS());

it("puts messages into queue", () => {
  const mockInput = getInput();
  target.addMappingsToQueue(mockInput.messageContentId, mockInput.recipientIds);
});

function getInput() {
  const input = {
    messageContentId: "101",
    recipientIds: ["1", "2", "3"],
  };
  return input;
}
