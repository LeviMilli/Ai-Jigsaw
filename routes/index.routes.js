const express = require('express')
const router = express.Router()
let ImageModel = require("../models/Image.model")
let fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


/// image generation controller
const generateImage = async(req,res)=>{
     const {prompt, size} = req.body;
     const imageSize = size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024';
     try {
          const response = await openai.createImage({
               prompt : prompt,
               n: 1,
               size: imageSize
          })
          
          const imageUrl = response.data.data[0].url
          console.log(imageUrl)
          ImageModel.create({prompt: prompt, imageUrl: imageUrl})
          res.status(200).json({
               success: true,
               data: imageUrl
          })
     } catch (error) {
          if (error.response) {
               console.log(error.response.status);
               console.log(error.response.data);
             } else {
               console.log(error.message);
             }
          res.status(400).json({
               success: false, 
               error: "image could not be generated"
          })

     }
}



const editImage = async(req,res)=>{
     const {prompt, filename} = req.body;
     // const imageSize = size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024';
     try {
          const response = await openai.createImageEdit(
               fs.createReadStream("./boots.png"),
               fs.createReadStream("./screenshot.png"),
               "Remove the smile",
               1,
               "512x512"
             );
          
          const imageUrl = response.data.data[0].url
          console.log(imageUrl)
          ImageModel.create({prompt: prompt, imageUrl: imageUrl})
          res.status(200).json({
               success: true,
               data: imageUrl
          })
     } catch (error) {
          if (error.response) {
               console.log(error.response.status);
               console.log(error.response.data);
             } else {
               console.log(error.message);
             }
          res.status(400).json({
               success: false, 
               error: "image could not be generated"
          })

     }
}


router.post('/genterateimage', generateImage)

router.post('/edit', editImage)

router.get("/images", (req, res) => {
     ImageModel.find()
          .then((response) =>{
               res.status(200).json(response)
          })
          .catch((err)=>{
               res.status(500).json({
                    error : "something bad",
                    message : err
               })
               
          })
})




router.get("/", (req, res, next) => {
  res.json("All good in here");
});




router.post("/add", (req, res)=>{
  const {name, description} = req.body
  console.log(req.body)
  ImageModel.create({name: name, description: description})
  .then((response) => {
       res.status(200).json(response)
  })
  .catch((err) => {
       res.status(500).json({
            error: 'Something went wrong',
            message: err
       })
  }) 
})







// You put the next routes here 👇
// example: router.use("/auth", authRoutes)

module.exports = router;
