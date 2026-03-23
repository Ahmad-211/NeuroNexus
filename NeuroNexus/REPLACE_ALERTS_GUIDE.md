# Replace All Browser Alerts - Quick Guide

## Files Already Updated:
✅ Admin Login - `src/pages/admin/Auth/Login.jsx`
✅ Lab Login - `src/pages/Lab/Auth/Login.jsx`
✅ Lab Signup - `src/pages/Lab/Auth/Signup.jsx`

## Pattern to Follow for All Remaining Files:

### Step 1: Add Imports
```jsx
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
```

### Step 2: Add Hook in Component
```jsx
function YourComponent() {
  const { alert, showSuccess, showError, showWarning, showInfo, closeAlert } = useAlert();
  // ... rest of code
}
```

### Step 3: Replace alert() calls

**Before:**
```jsx
alert('Test deleted successfully!');
```

**After:**
```jsx
showSuccess('Success!', 'Test deleted successfully!');
```

**Before:**
```jsx
alert('Failed to delete test. Please try again.');
```

**After:**
```jsx
showError('Error!', 'Failed to delete test. Please try again.');
```

### Step 4: Add Alert Component in JSX (before closing div)
```jsx
      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
      />
    </div>
  );
}
```

## Files That Need Update:

1. **Lab/Test/TestList.jsx** - Lines 72, 75
   - `alert('Test deleted successfully!')` → `showSuccess('Success!', 'Test deleted successfully!')`
   - `alert('Failed to delete test...')` → `showError('Error!', 'Failed to delete test. Please try again.')`

2. **Lab/Test/AddTest.jsx** - Lines 91, 102
   - `alert('Please login to add tests')` → `showWarning('Login Required', 'Please login to add tests.')`
   - `alert('Test added successfully!')` → `showSuccess('Success!', 'Test added successfully!')`

3. **Lab/Test/EditTest.jsx** - Lines 59, 63, 68, 135, 158
   - Various alerts need replacement

4. **Lab/Reports/LabReports.jsx** - Lines 129, 132
   - `alert('Report shared successfully...')` → `showSuccess('Success!', 'Report shared successfully with patient!')`
   - `alert('Failed to share report...')` → `showError('Error!', 'Failed to share report. Please try again.')`

5. **Lab/Profile/LabProfile.jsx** - Multiple alerts
6. **Lab/Profile/LabSettings.jsx** - Multiple alerts
7. **Lab/Complaints/SubmitComplaint.jsx** - Line 83

## Alert Types:

| Old alert() | New Method | Use For |
|-------------|------------|---------|
| Success message | `showSuccess('Title', 'Message')` | Successful operations |
| Error message | `showError('Title', 'Message')` | Errors and failures |
| Warning | `showWarning('Title', 'Message')` | Warnings |
| Info | `showInfo('Title', 'Message')` | Information |

## Example Complete File Update:

```jsx
import { useState } from 'react';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';

function TestList() {
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  
  const handleDelete = async (id) => {
    try {
      await deleteTest(id);
      showSuccess('Deleted!', 'Test deleted successfully!');
    } catch (error) {
      showError('Error!', 'Failed to delete test. Please try again.');
    }
  };

  return (
    <div>
      {/* Your component JSX */}
      
      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
      />
    </div>
  );
}
```

## Notes:
- All browser `alert()` calls should be replaced
- All `window.confirm()` can also be replaced with custom modals if needed
- The Alert component auto-closes after 3 seconds by default
- For navigation after alert, use setTimeout to wait for user to see the alert
