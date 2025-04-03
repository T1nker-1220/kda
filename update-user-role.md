# Update Supabase Auth User Metadata

This script describes how to update the user metadata to set the role to ADMIN to match what's in the User table.

## Steps to Fix the Role Issue

1. Sign in to Supabase Dashboard
2. Go to Authentication > Users
3. Find the user with ID: dc7d3edf-b728-470e-9c5f-2e59ddae8b33
4. Click Edit User
5. In the metadata field, set the role to ADMIN:
   ```json
   {
     "role": "ADMIN"
   }
   ```
6. Save changes

## Explanation of the Issue

The problem is that the middleware uses `session.user.user_metadata.role` while the dashboard layout checks the User table's role field. This update ensures both are in sync.

## Preventing Future Issues

To prevent this issue in the future, consider implementing one of these approaches:

1. **Database Trigger**: Create a Supabase database trigger that updates the auth metadata whenever the User table role is changed.

2. **Single API Endpoint**: Create a dedicated API endpoint for updating user roles that updates both the User table and auth metadata in a single transaction.

3. **Auth Hook**: Use Supabase Auth Hooks to sync user metadata with the User table when users sign up or when their sessions are refreshed. 