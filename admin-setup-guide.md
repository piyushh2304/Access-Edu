# Admin Authentication Setup Guide

## Current Admin System Overview

The LMS system has a complete admin authentication system in place with the following features:

### 1. Admin Middleware
- **File**: `server/middleware/auth.ts`
- **Function**: `authorizeRoles("admin")`
- **Purpose**: Protects admin routes and ensures only admin users can access them

### 2. Admin Routes
The following routes are protected with admin authentication:

**User Management:**
- `GET /api/get-users` - Get all users (admin only)
- `PUT /api/update-user` - Update user role (admin only)
- `DELETE /api/delete-user` - Delete user (admin only)

**Course Management:**
- `POST /api/create-course` - Create new course (admin only)
- `PUT /api/edit-course/:id` - Edit course (admin only)
- `GET /api/get-admin-courses` - Get admin courses (admin only)
- `DELETE /api/delete-course` - Delete course (admin only)
- `PUT /api/add-reply` - Reply to reviews (admin only)

**Analytics:**
- `GET /api/get-users-analytics` - User analytics (admin only)
- `GET /api/get-courses-analytics` - Course analytics (admin only)
- `GET /api/get-orders-analytics` - Order analytics (admin only)

**Layout Management:**
- `POST /api/create-layout` - Create layout (admin only)
- `PUT /api/edit-layout` - Edit layout (admin only)

**Notifications:**
- `GET /api/get-all-notifications` - Get notifications (admin only)
- `PUT /api/update-notification/:id` - Update notifications (admin only)

**Orders:**
- `GET /api/get-orders` - Get all orders (admin only)

### 3. Admin Dashboard Pages
Located in `client/app/admin/`:
- Dashboard (`/admin`)
- Categories management (`/admin/categories`)
- Courses management (`/admin/courses`)
- Create course (`/admin/create-course`)
- Edit course (`/admin/edit-course/[id]`)
- FAQ management (`/admin/faq`)
- Hero section (`/admin/hero`)
- Invoices (`/admin/invoices`)
- Analytics pages (`/admin/*-analytics`)
- Team management (`/admin/team`)
- Users management (`/admin/users`)

## How to Set Up Admin Access

### Method 1: Update User Role via API (Recommended)

1. **First, create a regular user account** through the registration process

2. **Update the user's role to admin** using the API:

```bash
# Login as admin (if you have admin credentials)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-admin-email@example.com",
    "password": "your-admin-password"
  }'

# Update user role to admin
curl -X PUT http://localhost:8000/api/update-user \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=your-admin-token" \
  -d '{
    "email": "user-to-make-admin@example.com",
    "role": "admin"
  }'
```

### Method 2: Direct Database Update (Development Only)

```javascript
// In MongoDB shell or MongoDB Compass
use your-database-name

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 3: Create Admin User Script

Create a script to make a user admin:

```javascript
// make-admin.js
const mongoose = require('mongoose');
const userModel = require('./server/models/user.model');

async function makeAdmin(email) {
  try {
    await mongoose.connect('your-mongodb-uri');
    
    const user = await userModel.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`User ${email} is now an admin`);
    } else {
      console.log('User not found');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

// Usage: node make-admin.js user@example.com
makeAdmin(process.argv[2]);
```

## Admin Authentication Flow

### Client-Side Admin Check
The admin dashboard uses `AdminProtected` hook (`client/app/hooks/adminProtected.tsx`):

```typescript
export default function AdminProtected({ children }: ProtectedProps) {
    const { user } = useSelector((state: any) => state.auth);

    if (user) {
        const isAdmin = user?.role === "admin"
        return isAdmin ? children : redirect("/")
    }
}
```

### Server-Side Admin Protection
Routes are protected with the `authorizeRoles("admin")` middleware:

```typescript
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403))
        }
        next()
    }
}
```

## Testing Admin Access

1. **Register a new user** through the frontend
2. **Update the user's role** to admin using one of the methods above
3. **Login** with the admin user
4. **Access admin dashboard** at `/admin`
5. **Verify admin features** are working:
   - Admin dashboard button in profile
   - Access to all admin routes
   - Ability to create/edit courses
   - View analytics
   - Manage users

## Troubleshooting

### Admin Dashboard Not Visible
- Check if user role is set to "admin" (lowercase)
- Verify the user object in Redux store has the correct role
- Check browser console for authentication errors

### API Access Denied
- Ensure you're passing the access token in cookies
- Verify the user role in database
- Check server logs for role validation errors

### Database Connection Issues
- Verify MongoDB connection string
- Check if user exists in database
- Ensure proper database permissions

## Security Notes

1. **Never expose admin credentials** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** for admin endpoints
4. **Log admin activities** for security monitoring
5. **Use HTTPS** in production
6. **Implement proper session management**

## Next Steps

Once you have admin access working:

1. **Test all admin features**
2. **Set up proper admin user management**
3. **Implement additional security measures**
4. **Create admin activity logs**
5. **Set up monitoring and alerts**

The admin system is fully functional - you just need to assign the "admin" role to a user to access all admin functionalities!