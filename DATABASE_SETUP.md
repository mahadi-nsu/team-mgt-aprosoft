# Database Setup Instructions

## ✅ What's Already Done

1. **Environment File Created**: `.env.local` with your MongoDB Atlas connection string
2. **Database Connection**: MongoDB connection utility is ready
3. **Models**: Team and User models are defined
4. **Seed Script**: Ready to populate database with demo data
5. **Test Script**: Database connection test script created

## 🔧 Next Steps - Database Credentials

### Step 1: Update MongoDB Credentials

Edit the `.env.local` file and replace the placeholders:

```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.womk57d.mongodb.net/team-management?retryWrites=true&w=majority&appName=Cluster0
```

**Replace:**

- `<db_username>` with your MongoDB Atlas database username
- `<db_password>` with your MongoDB Atlas database password

### Step 2: Test Database Connection

After updating the credentials, test the connection:

```bash
npm run test-db
```

**Expected Output:**

```
Testing MongoDB connection...
✅ Successfully connected to MongoDB Atlas!
Database connection is working properly.
```

### Step 3: Seed the Database

Once the connection test passes, populate the database with demo data:

```bash
npm run seed
```

**Expected Output:**

```
Connected to MongoDB
Created users: 3
Created teams: 4
Database seeded successfully!
```

### Step 4: Start the Application

```bash
npm run dev
```

## 🎯 Demo Credentials (After Seeding)

- **Manager**: `manager@demo.com` / `password123`
- **Director**: `director@demo.com` / `password123`
- **Member**: `member@demo.com` / `password123`

## 📋 Database Structure

### Collections Created:

- **users**: Stores user accounts with roles
- **teams**: Stores team data with members and approval status

### Demo Data:

- 3 users (Manager, Director, Member)
- 4 teams with various approval states
- Multiple team members per team

## 🔍 Troubleshooting

### Connection Issues:

1. Verify MongoDB Atlas cluster is running
2. Check IP whitelist includes your current IP (0.0.0.0/0 for development)
3. Ensure database user has read/write permissions
4. Verify connection string format

### Common Errors:

- **Authentication failed**: Check username/password
- **Network timeout**: Check IP whitelist
- **Database not found**: The database `team-management` will be created automatically

## 🚀 Ready to Go!

Once you've updated the credentials and run the seed script, your Team Management System will be fully functional with:

- Role-based authentication
- Team CRUD operations
- Three-state approval workflow
- Drag & drop reordering
- Search functionality
- Bulk operations
