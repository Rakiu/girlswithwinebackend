import mongoose from "mongoose";
import { slugify } from "../utils/seoHelper.js";

const StateSchema = new mongoose.Schema(
{
  name:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },

  slug:{
    type:String,
    unique:true
  },

  status:{
    type:String,
    enum:["Active","Inactive"],
    default:"Active"
  }

},{timestamps:true});

StateSchema.pre("save",function(next){

  if(!this.slug){
    this.slug = slugify(this.name);
  }

  next();
});

export default mongoose.model("State",StateSchema);