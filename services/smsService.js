const axios = require("axios");

const sendSMS = async (mobileNumber, message) => {
  try {
    const response = await axios.post(
      process.env.MIM_API_URL,
      {
        apiKey: process.env.MIM_API_KEY,
        userName: process.env.MIM_USERNAME,
        campaignName: "MAFEE",
        senderName: process.env.MIM_SENDER_NAME,
        transactionType: "T",
        mobileNumber: mobileNumber,
        message: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log("MIM SMS Error:", error.response?.data || error.message);
    

    throw error;
  }
};

module.exports = sendSMS;
