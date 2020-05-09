module.exports = () => {
    console.log("\n VALIDATING ENV VARS");

    const envVarsNotSet = process.env.MSG_MAPPING_TABLE == "[object Object]" ||
        process.env.CONTENT_TABLE == "[object Object]" ||
        process.env.QUEUE_URL == "[object Object]";

    const envVarsUndef = !process.env.MSG_MAPPING_TABLE ||
        !process.env.CONTENT_TABLE ||
        !process.env.QUEUE_URL;

    if (envVarsNotSet || envVarsUndef) {
        throw new ReferenceError("an environment variable needed for execution is not present, if running locaally make sure you've defined variables in an .env.local file see README for details");
    }

};



