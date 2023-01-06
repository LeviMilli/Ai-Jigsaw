const { Schema, model } = require("mongoose");


const ImageSchema = new Schema(
    {
      prompt: String,
      imageUrl: String,
      

      // UserId : {
      //   ref: 'User',
      //   type: Schema.Types.ObjectId
      // } 

    },
    
  
  );
  
  const Image = model("Image", ImageSchema);
  
  module.exports = Image;