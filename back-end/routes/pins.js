const router = require("express").Router();
const Pin = require("../db/Pin");
const axios = require("axios");
const nodemailer = require("nodemailer");

// create a pin
router.post("/create", async (req, res) => {
  try {
    const { title, lat, long } = req.body;

    // Create a new pin instance
    const newPin = new Pin({
      title,
      lat,
      long,
    });

    // Save the pin to the database
    await newPin.save();

    return res.status(201).json({ message: "Pin inserted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

// get all pins
router.get("/pins", async (req, res) => {
  try {
    const pins = await Pin.find();
    res.status(200).json(pins);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Geocoding process
router.post("/geolocation", async (req, res) => {
  const { title, lat, long, email } = req.body;
  // Check if the title already exists

  const existingTitle = await Pin.findOne({ title });
  if (existingTitle) {
    return res.status(400).json({ error: "Title already exists" });
  }
  // if the title not existed
  const params = {
    access_key: "db0141fe274a36c29de2a90da6bdd6f7",
    query: title,
  };
  // Fetch geolocation data from the third-party API
  try {
    axios
      .get("http://api.positionstack.com/v1/forward", { params })
      .then(async (response) => {
        console.log(response.data);
        const newPin = new Pin({
          title,
        });
        newPin.lat = response.data.data[0].latitude;
        newPin.long = response.data.data[0].longitude;
        // Insert the new title
        await newPin.save();

        // sending email if the user provided the email
        if (email) {
          try {
            // validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(email)) {
              console.log("Email format is valid.");
            } else {
               return res.status(500).json("Email format is invalid.");
            }
            // Create a transporter using the Gmail SMTP server
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "your_email@gmail.com", // Your Gmail address
                pass: "your_app_specific_password", // Your app-specific password
              },
            });
           
            // Prepare the email content
            const mailOptions = {
              from: "your_email@gmail.com", // Sender's email address
              to: email, // Recipient's email address from the request body
              subject: "Coordinates for the supplied title", // Subject of the email
              text:
                "the coordinates for the supplied title are: " +
                "lat:" + newPin.lat + " long:" + newPin.long, // Body of the email
            };
            console.log(mailOptions);
            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                res.status(500).json(error);
              } else {
                console.log("Email sent:", info.response);
                return res
                .status(200)
                .json({ newPin, message: "Pin found, inserted successfully and sended to the email supplied" });
              }
            });
          } catch (err) {
            console.error("Error:", err);
            res.status(500).json(err);
          }
        } else {
          return res
          .status(201)
          .json({ newPin, message: "Pin found and inserted successfully" });
        }

       
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json(err);
  }
});

module.exports = router;
