import mongoose from "mongoose";

export const connectDatabase = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`Database connected successfully at ${connection.connection.host}`);
    }catch(error){
        console.error(`Database connection failed: ${error}`);
        throw error;
    }
};
