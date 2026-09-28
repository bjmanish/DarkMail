# TODO: Fix Logout Button and Change Email Creation

## Steps to Complete

- [ ] Update App.jsx: Pass setIsAuthenticated to ProtectedApp and modify handleLogout to call setIsAuthenticated(false)
- [ ] Update CreateEmail.jsx: Change UI text to "Create Email for Employees", button text to "Create Email", success message to "Email created for employees!"
- [ ] Update api.js: Rename sendEmailToEmployees to createEmailToEmployees, change endpoint to /emails/create

## Followup Steps
- [ ] Test logout functionality
- [ ] Verify email creation without sending
