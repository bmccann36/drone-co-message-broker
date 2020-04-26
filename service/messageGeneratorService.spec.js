require('dotenv').config()
const MsgGenSvc = require("./messageGeneratorService");
const Dynamo = require("aws-sdk/clients/dynamodb");

const docClient = new Dynamo.DocumentClient();
const target = new MsgGenSvc(docClient);

describe("some thing", function () {
  it("registers messages", function () {
    const mockPayload = getMockInput();

    target.registerMessages(
      mockPayload.messageContentId,
      mockPayload.recipientIds,
    );
  });
});

function getMockInput() {
  return {
    messageContentId: "101",
    recipientIds: [
      "2024e6e1-e2ad-4298-bf69-af78484d02db",
      "db7e418e-077c-4bda-9acc-1f44f6f3a03a",
      "e0fab512-3270-444a-85c0-cfdebf549ca1",
      "855f9484-d620-4722-a7e3-532496a05ece",
      "eefade72-4b9e-4861-bb28-843a3388be4d",
      "823944e6-9cf2-42a1-8689-4a369e6e41bb",
      "0980eb1e-03cb-4391-9fc2-f1c32e47b302",
      "e363cd52-067c-4f98-adfa-8f15200c44f2",
      "41bd010f-cf7f-4aa2-bcfb-f54d1cacf095",
      "14b930c3-12b4-412c-8102-1a812b132ac1",
    ],
  };
}
