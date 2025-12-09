import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = 'mongodb://localhost:27017/hearable'
;
  if (!uri) {
    throw new Error('MONGO_URI not set');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
