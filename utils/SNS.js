// Import the SNSClient and PublishCommand from AWS SDK v3
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

// Create an SNS service client
const snsClient = new SNSClient({
    region : process.env.REGION,
    credentials : {
        secretAccessKey : process.env.SECRET_ACCESS_KEY,
        accessKeyId : process.env.ACCESS_KEY,
    }
}); // Replace with your desired region


exports.sendSMS = async (phoneNumber , otp) => {
    try{
        const message = "Your OTP to login in thepineapple.in is " + otp;
        const response = await snsClient.send(
          new PublishCommand({
            Message: message,
            // One of PhoneNumber, TopicArn, or TargetArn must be specified.
            PhoneNumber: "+91"+phoneNumber,
          }),
        );
    }
    catch(err){
        throw new Error("Can not send OTP, please try again");
    }
};
