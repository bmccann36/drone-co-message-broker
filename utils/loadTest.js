const axios = require("axios").default;
const uuid = require("uuidv4").uuid;
const sizeof = require("object-sizeof");

const userIds = [];
for (let i = 0; i < 10000; i++) {
  userIds.push(uuid());
}

const GATEWAY_URL =
  "https://e7i538cxc5.execute-api.us-east-1.amazonaws.com/dev/mapping";

// const GATEWAY_URL = "http://localhost:3000/dev/mapping";

// ? to send just 10 for smoke testing
// callEp(userIds.slice(0, 10))
//   .then((res) => {
//     console.log(res.data);
//   })
//   .catch(err => console.log(err));

// ! send 10k
callEp(userIds)
  .then((res) => {
    console.log(res.data);
  })
  .catch(err => console.log(err));

function callEp(listOfIds) {
  const fakeInput = {
    messageContentId: "101",
    recipientIds: listOfIds,
  };
  return axios.post(GATEWAY_URL, fakeInput);
}


