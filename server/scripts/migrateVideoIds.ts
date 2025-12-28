import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.MONGO_URI as string;

const migrateVideoIds = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('MongoDB connected for migration.');

    const coursesCollection = mongoose.connection.db.collection('courses');

    // Find all courses that have at least one courseData item with a videoUrl field
    const coursesToMigrate = await coursesCollection.find({ "courseData.videoUrl": { $exists: true } }).toArray();

    if (coursesToMigrate.length === 0) {
      console.log('No courses found with "videoUrl" field to migrate.');
      return;
    }

    let modifiedCount = 0;
    for (const course of coursesToMigrate) {
      let courseModified = false;
      const newCourseData = course.courseData.map((item: any) => {
        if (item.videoUrl !== undefined) {
          // Create a new object to avoid modifying the original directly during iteration
          const newItem = { ...item };
          newItem.videoId = newItem.videoUrl;
          delete newItem.videoUrl;
          courseModified = true;
          return newItem;
        }
        return item;
      });

      if (courseModified) {
        await coursesCollection.updateOne(
          { _id: course._id },
          { $set: { courseData: newCourseData } }
        );
        modifiedCount++;
        console.log(`Course "${course._id}" updated.`);
      }
    }

    console.log(`Migration complete. Total courses modified: ${modifiedCount}`);

  } catch (error: any) {
    console.error('Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

migrateVideoIds();
