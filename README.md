# Team Management System

A comprehensive team management application built with Next.js 15, MongoDB, and Bootstrap. This application provides CRUD operations for teams, role-based authentication, and advanced features like drag-and-drop reordering and three-state approval workflow.

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/mahadi-nsu/team-mgt-aprosoft.git
   cd team-mgt-aprosoft
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   MONGODB_URI=mongodb+srv://mahadinsucse_db_user:dd9OAgUxL1Gr5tAV@cluster0.xoqesm7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   NEXTAUTH_SECRET=PKJO/0axdc9U2q0oAYhd2GyIQnO2m3eJ+cnDGtvOrTY=
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**

   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Data Schema

### Users Collection

```json
{
  "_id": { "$oid": "68ee52f538c627d7683a95fe" },
  "email": "manager@demo.com",
  "password": "$2b$12$wxxzqH6pKeNNhrDUmSmDk.bvr0lPs9ZJPASZE1P3cQc1UhhmQUHqa",
  "role": "manager",
  "name": "John Manager",
  "createdAt": { "$date": { "$numberLong": "1760449269502" } },
  "updatedAt": { "$date": { "$numberLong": "1760449269502" } },
  "__v": { "$numberInt": "0" }
}
```

### Teams Collection

```json
{
  "_id": { "$oid": "68ee52f638c627d7683a9607" },
  "teamName": "Team Beta",
  "teamDescription": "Backend development team",
  "approvedByManager": "pending",
  "approvedByDirector": "approved",
  "members": [
    {
      "name": "Charlie Brown test",
      "gender": "Male",
      "dateOfBirth": { "$date": { "$numberLong": "714268800000" } },
      "contactNo": "5555555555",
      "_id": { "$oid": "68ee8d8e37f275b7d0471f68" }
    }
  ],
  "displayOrder": { "$numberInt": "0" },
  "createdAt": { "$date": { "$numberLong": "1760449270437" } },
  "updatedAt": { "$date": { "$numberLong": "1760464270980" } },
  "__v": { "$numberInt": "0" }
}
```

## Features

### Core Functionality

- **Team CRUD Operations**: Create, read, update, and delete teams
- **Member Management**: Add, edit, and delete team members
- **Role-Based Authentication**: Manager, Director, and Member roles
- **Three-State Approval System**: Pending → Approved → Rejected → Pending cycle
- **Drag & Drop Reordering**: Reorder teams with visual feedback
- **Master-Detail View**: Expandable team rows to show/hide members
- **Bulk Operations**: Select and delete multiple teams
- **Search Functionality**: Search teams and members in real-time

### UI/UX Features

- **Responsive Design**: Mobile-friendly Bootstrap interface
- **Raw HTML Tables**: No external data table libraries
- **Loading States**: Progress indicators during API calls
- **Confirmation Dialogs**: Prevent accidental deletions
- **Toast Notifications**: Success and error messages
- **Form Validation**: Client and server-side validation

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5 (beta)
- **UI Framework**: Bootstrap 5.3
- **Validation**: Zod
- **Styling**: Bootstrap CSS + Custom CSS
- **Icons**: Font Awesome

## Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB instance
- yarn package manager

## Demo Credentials

The seed script creates demo users with the following credentials:

- **Manager**: `manager@demo.com` / `password123`
- **Director**: `director@demo.com` / `password123`
- **Member**: `member@demo.com` / `password123`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── teams/         # Team management endpoints
│   ├── auth/              # Authentication pages
│   ├── teams/             # Team management pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── forms/             # Form components
│   ├── teams/             # Team-related components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # Database connection
│   ├── auth.ts            # NextAuth configuration
│   └── validations.ts     # Zod schemas
├── models/                # Mongoose models
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware
```

## API Endpoints

### Authentication

- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out

### Teams

- `GET /api/teams` - Get all teams (with search and pagination)
- `POST /api/teams` - Create new team
- `GET /api/teams/[id]` - Get single team
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete single team
- `DELETE /api/teams/bulk` - Bulk delete teams
- `PUT /api/teams/reorder` - Update team display order
- `PUT /api/teams/[id]/approve` - Update approval status

## Key Features Explained

### Three-State Approval System

The approval circles cycle through three states:

1. **Gray Circle (○)**: Pending/No Action Taken
2. **Green Check (✓)**: Approved
3. **Red Cross (✗)**: Rejected

Clicking cycles through: Pending → Approved → Rejected → Pending

### Drag & Drop Reordering

- Teams can be reordered by dragging table rows
- Visual feedback during drag operations
- Order is automatically saved to the database

### Master-Detail View

- Click the arrow next to team names to expand/collapse
- Shows team members in nested rows
- Members can be edited and deleted inline

### Role-Based Access Control

- **Managers**: Can approve teams (manager approval)
- **Directors**: Can approve teams (director approval)
- **Members**: Can view and manage teams but cannot approve

## Development

### Running Tests

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

### Database Seeding

To reset and seed the database with demo data:

```bash
npm run seed
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
