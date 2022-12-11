const axios = require("axios");

const formatDate = (date) => {
  // Format date as MM/DD/YYYY
  return date.toLocaleDateString();
};

const fetchData = async (url, method = "GET", headers = {}, data = null) => {
  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
    });

    const responseData = response.data;

    if (!responseData) {
      throw new Error("Error fetching data");
    }

    return responseData;
  } catch (err) {
    if (err.response) {
      console.log(err.response);
      throw new Error("something went wrong");
    }
  }
};

module.exports = {
  formatDate,
  fetchData,
};
