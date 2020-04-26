exports.main = async function (event, context) {

  console.log(JSON.parse(event.body));



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
