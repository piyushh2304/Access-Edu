// Debug script to check user role
// Usage: node debug-user-role.js user@example.com

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms-becodemy';

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isVerified: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function debugUserRole(email) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    if (email) {
      // Check specific user
      console.log(`Looking for user with email: ${email}`);
      const user = await User.findOne({ email: email });
      
      if (!user) {
        console.log('❌ User not found');
      } else {
        console.log('\n🔍 User Details:');
        console.log(`- Name: ${user.name}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Verified: ${user.isVerified}`);
        console.log(`- Created: ${user.createdAt}`);
        console.log(`\n🎯 Admin Status: ${user.role === 'admin' ? '✅ ADMIN' : '❌ NOT ADMIN'}`);
      }
    } else {
      // List all users
      console.log('\n📋 All Users:');
      const users = await User.find({}, 'name email role isVerified createdAt');
      
      if (users.length === 0) {
        console.log('No users found in database');
      } else {
        users.forEach((user, index) => {
          console.log(`\n${index + 1}. ${user.name} (${user.email})`);
          console.log(`   Role: ${user.role} ${user.role === 'admin' ? '🟢' : '🔴'}`);
          console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
          console.log(`   Created: ${user.createdAt}`);
        });
        
        const adminCount = users.filter(u => u.role === 'admin').length;
        console.log(`\n📊 Summary:`);
        console.log(`- Total users: ${users.length}`);
        console.log(`- Admin users: ${adminCount}`);
        console.log(`- Regular users: ${users.length - adminCount}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Get email from command line argument (optional)
const email = process.argv[2];

debugUserRole(email);