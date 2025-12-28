// Utility script to make a user admin
// Usage: node make-admin.js user@example.com

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms-becodemy';

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    default: "user"
  }
});

const User = mongoose.model('User', userSchema);

async function makeAdmin(email) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found');
      console.log('Available users:');
      const users = await User.find({}, 'name email role');
      users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`));
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name} (${user.email}) - Current role: ${user.role}`);
    
    if (user.role === 'admin') {
      console.log('✅ User is already an admin');
    } else {
      user.role = 'admin';
      await user.save();
      console.log('✅ User role updated to admin successfully');
    }
    
    console.log('\nUpdated user details:');
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node make-admin.js user@example.com');
  process.exit(1);
}

makeAdmin(email);