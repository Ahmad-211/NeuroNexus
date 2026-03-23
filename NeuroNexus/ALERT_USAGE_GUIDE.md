# Alert Component Usage Guide

## Import the Alert Component and Hook

```jsx
import Alert from '../components/Alert/Alert';
import { useAlert } from '../hooks/useAlert';
```

## Basic Usage in Any Component

```jsx
function YourComponent() {
  const { alert, showSuccess, showError, showWarning, showInfo, closeAlert } = useAlert();

  const handleSubmit = () => {
    // Show success alert
    showSuccess(
      'Complaint Submitted!',
      'Your complaint has been received. Admin will review it shortly.'
    );
  };

  const handleError = () => {
    // Show error alert
    showError(
      'Submission Failed!',
      'Unable to submit your complaint. Please try again.'
    );
  };

  const handleWarning = () => {
    // Show warning alert
    showWarning(
      'Warning!',
      'Please fill all required fields before submitting.'
    );
  };

  const handleInfo = () => {
    // Show info alert
    showInfo(
      'Information',
      'Your session will expire in 5 minutes.'
    );
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>

      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
        autoClose={true}
        duration={3000}
      />
    </div>
  );
}
```

## Alert Types

### Success Alert (Green)
```jsx
showSuccess('Success!', 'Operation completed successfully.');
```

### Error Alert (Red)
```jsx
showError('Error!', 'Something went wrong. Please try again.');
```

### Warning Alert (Orange/Yellow)
```jsx
showWarning('Warning!', 'Please review your input before proceeding.');
```

### Info Alert (Blue)
```jsx
showInfo('Information', 'This is an informational message.');
```

## Custom Duration
```jsx
// Alert will auto-close after 5 seconds
showSuccess('Saved!', 'Your changes have been saved.', 5000);
```

## Manual Close (No Auto Close)
```jsx
<Alert
  type="success"
  title="Success!"
  message="Your action was successful."
  isOpen={alert.isOpen}
  onClose={closeAlert}
  autoClose={false}  // User must click close button
/>
```

## Common Use Cases

### Form Submission
```jsx
const handleFormSubmit = async (formData) => {
  try {
    await submitForm(formData);
    showSuccess('Form Submitted!', 'Your form has been successfully submitted.');
  } catch (error) {
    showError('Submission Failed!', error.message);
  }
};
```

### Delete Action
```jsx
const handleDelete = async (id) => {
  try {
    await deleteItem(id);
    showSuccess('Deleted!', 'Item has been deleted successfully.');
  } catch (error) {
    showError('Delete Failed!', 'Unable to delete the item.');
  }
};
```

### Login/Logout
```jsx
const handleLogin = async (credentials) => {
  try {
    await login(credentials);
    showSuccess('Welcome Back!', 'You have successfully logged in.');
  } catch (error) {
    showError('Login Failed!', 'Invalid email or password.');
  }
};
```

### Update/Edit
```jsx
const handleUpdate = async (data) => {
  try {
    await updateData(data);
    showSuccess('Updated!', 'Your changes have been saved.');
  } catch (error) {
    showError('Update Failed!', 'Unable to save changes.');
  }
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | string | 'success' | Alert type: 'success', 'error', 'warning', 'info' |
| title | string | 'Success!' | Alert title |
| message | string | '' | Alert message |
| isOpen | boolean | false | Controls alert visibility |
| onClose | function | - | Callback when alert closes |
| autoClose | boolean | true | Auto-close after duration |
| duration | number | 3000 | Duration in milliseconds before auto-close |
