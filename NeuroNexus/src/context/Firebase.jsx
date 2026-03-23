// Import the functions you need from the SDKs you need
import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update,
  remove,
  push
} from "firebase/database";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  listAll
} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeVqHKRlu0NCFwkESSfuOuU4YlqAMerTU",
  authDomain: "colorcalling-2a53d.firebaseapp.com",
  databaseURL: "https://colorcalling-2a53d-default-rtdb.firebaseio.com",
  projectId: "colorcalling-2a53d",
  storageBucket: "colorcalling-2a53d.appspot.com",
  messagingSenderId: "795944039862",
  appId: "1:795944039862:web:96f1b6e113b101bf8cbd17",
  measurementId: "G-Q6LY0F7CT2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Set persistence to LOCAL (keeps user logged in even after browser close)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

const database = getDatabase(app);
const storage = getStorage(app);

// Create Firebase Context
const FirebaseContext = createContext(null);

// Custom Hook to use Firebase
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within FirebaseProvider");
  }
  return context;
};

// Firebase Provider Component
export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user role from database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserRole(snapshot.val().role);
        } else {
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Admin Login Function
  const loginAdmin = async (email, password) => {
    try {
      // Check if credentials match admin credentials
      if (email === "admin@neuronexus.com" && password === "admin2113neuro") {
        // Try to sign in
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Check if user exists in database
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);

          if (!snapshot.exists()) {
            // Create admin entry in database
            await set(userRef, {
              email: email,
              role: "admin",
              status: "active",
              createdAt: Date.now(),
              lastLogin: Date.now()
            });

            // Create admin profile
            await set(ref(database, `admin/${user.uid}`), {
              uid: user.uid,
              name: "Super Admin",
              email: email,
              permissions: "full"
            });
          } else {
            // Update last login
            await update(userRef, {
              lastLogin: Date.now()
            });
          }

          return { success: true, user };
        } catch (error) {
          // If user doesn't exist, create it
          if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create admin entry in users node
            await set(ref(database, `users/${user.uid}`), {
              email: email,
              role: "admin",
              status: "active",
              createdAt: Date.now(),
              lastLogin: Date.now()
            });

            // Create admin profile
            await set(ref(database, `admin/${user.uid}`), {
              uid: user.uid,
              name: "Super Admin",
              email: email,
              permissions: "full"
            });

            return { success: true, user };
          }
          throw error;
        }
      } else {
        throw new Error("Invalid admin credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Lab Login Function
  const loginLab = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user is a lab
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await signOut(auth);
        throw new Error("User not found");
      }

      const userData = snapshot.val();
      if (userData.role !== "lab") {
        await signOut(auth);
        throw new Error("Unauthorized: Not a lab account");
      }

      if (userData.status === "blocked") {
        await signOut(auth);
        throw new Error("Account has been blocked");
      }

      // Check registration status
      const labRef = ref(database, `labs/${user.uid}`);
      const labSnapshot = await get(labRef);
      
      if (labSnapshot.exists()) {
        const labData = labSnapshot.val();
        if (labData.registrationStatus === "pending") {
          await signOut(auth);
          throw new Error("Your account is under review. You will be notified upon approval.");
        }
        if (labData.registrationStatus === "rejected") {
          await signOut(auth);
          throw new Error("Your registration has been rejected. Please contact support for more information.");
        }
      }

      // Update last login
      await update(userRef, {
        lastLogin: Date.now()
      });

      return { success: true, user };
    } catch (error) {
      console.error("Lab login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Lab Signup Function
  const signupLab = async (labData) => {
    try {
      const { email, password, name, licenseNumber, address, phone, labTiming, city, licenseFile, logoFile } = labData;

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let licenseImageUrl = "";
      let profilePicUrl = "";

      // Upload license file if provided
      if (licenseFile) {
        const fileExtension = licenseFile.name.split('.').pop();
        const licensePath = `license_images/labs/${user.uid}.${fileExtension}`;
        const licenseStorageRef = storageRef(storage, licensePath);
        
        await uploadBytes(licenseStorageRef, licenseFile);
        licenseImageUrl = await getDownloadURL(licenseStorageRef);
      }

      // Upload logo file if provided
      if (logoFile) {
        const fileExtension = logoFile.name.split('.').pop();
        const logoPath = `profile_pics/labs/${user.uid}.${fileExtension}`;
        const logoStorageRef = storageRef(storage, logoPath);
        
        await uploadBytes(logoStorageRef, logoFile);
        profilePicUrl = await getDownloadURL(logoStorageRef);
      }

      // Create entry in users node
      await set(ref(database, `users/${user.uid}`), {
        email: email,
        role: "lab",
        status: "active",
        createdAt: Date.now(),
        lastLogin: Date.now()
      });

      // Create lab profile
      await set(ref(database, `labs/${user.uid}`), {
        uid: user.uid,
        name: name,
        email: email,
        phone: phone,
        licenseNumber: licenseNumber,
        address: address,
        city: city,
        labTiming: labTiming,
        registrationStatus: "pending",
        licenseImageUrl: licenseImageUrl,
        profilePicUrl: profilePicUrl
      });

      // Send notification to admin
      const adminId = await getAdminId();
      if (adminId) {
        await createNotification({
          recipientUid: adminId,
          type: "NEW_LAB_REGISTRATION",
          title: "New Lab Registration Request",
          message: `Lab ${name} has submitted a registration request.`,
          senderName: name,
          bookingId: null
        });
      }

      return { success: true, user };
    } catch (error) {
      console.error("Lab signup error:", error);
      return { success: false, error: error.message };
    }
  };

  // Approve Lab Function
  const approveLab = async (labUid) => {
    try {
      // Get lab data first
      const labRef = ref(database, `labs/${labUid}`);
      const labSnapshot = await get(labRef);
      const labData = labSnapshot.val();
      
      await update(labRef, {
        registrationStatus: "approved"
      });

      // Send notification to admin (self-log)
      const adminId = await getAdminId();
      if (adminId && labData) {
        await createNotification({
          recipientUid: adminId,
          type: "REGISTRATION_ACTION",
          title: "Registration Action Completed",
          message: `You approved the registration of ${labData.name}.`,
          senderName: "Admin",
          bookingId: null
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Approve lab error:", error);
      return { success: false, error: error.message };
    }
  };

  // Reject Lab Function
  const rejectLab = async (labUid) => {
    try {
      // Get lab data first
      const labRef = ref(database, `labs/${labUid}`);
      const labSnapshot = await get(labRef);
      const labData = labSnapshot.val();

      // Update registration status to rejected instead of deleting
      await update(labRef, {
        registrationStatus: "rejected",
        rejectedAt: Date.now()
      });

      // Send notification to admin (self-log)
      const adminId = await getAdminId();
      if (adminId && labData) {
        await createNotification({
          recipientUid: adminId,
          type: "REGISTRATION_ACTION",
          title: "Registration Action Completed",
          message: `You rejected the registration of ${labData.name}.`,
          senderName: "Admin",
          bookingId: null
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Reject lab error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get Lab by ID
  const getLabById = async (labUid) => {
    try {
      const labRef = ref(database, `labs/${labUid}`);
      const snapshot = await get(labRef);
      
      if (snapshot.exists()) {
        return { success: true, lab: snapshot.val() };
      } else {
        return { success: false, error: "Lab not found" };
      }
    } catch (error) {
      console.error("Get lab error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update Lab Profile
  const updateLabProfile = async (labUid, profileData) => {
    try {
      const labRef = ref(database, `labs/${labUid}`);
      
      // Prepare update data
      const updateData = {};
      
      if (profileData.labName !== undefined) updateData.labName = profileData.labName;
      if (profileData.phone !== undefined) updateData.phone = profileData.phone;
      if (profileData.labTiming !== undefined) updateData.labTiming = profileData.labTiming;
      if (profileData.labDescription !== undefined) updateData.labDescription = profileData.labDescription;
      if (profileData.profilePicUrl !== undefined) updateData.profilePicUrl = profileData.profilePicUrl;
      
      // Update the lab profile
      await update(labRef, updateData);
      
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      console.error("Update lab profile error:", error);
      return { success: false, error: error.message };
    }
  };

  // Upload Lab Logo to Storage
  const uploadLabLogo = async (labUid, file) => {
    try {
      const fileExtension = file.name.split('.').pop();
      const logoRef = storageRef(storage, `profile_pics/labs/${labUid}.${fileExtension}`);
      await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(logoRef);
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Upload logo error:", error);
      return { success: false, error: error.message };
    }
  };

  // Change Password Function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: "No user is currently logged in" };
      }

      // Create credential with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Reauthenticate user
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error("Change password error:", error);
      
      // Handle specific error messages
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: "Current password is incorrect" };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, error: "New password is too weak" };
      } else if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: "Please log out and log in again before changing password" };
      }
      
      return { success: false, error: error.message };
    }
  };

  // Get All Doctors Function
  const getAllDoctors = async () => {
    try {
      const doctorsRef = ref(database, 'doctors');
      const snapshot = await get(doctorsRef);
      
      if (snapshot.exists()) {
        const doctorsData = snapshot.val();
        const doctorsArray = Object.keys(doctorsData).map(key => ({
          id: key,
          ...doctorsData[key]
        }));
        return { success: true, doctors: doctorsArray };
      } else {
        return { success: true, doctors: [] };
      }
    } catch (error) {
      console.error("Get doctors error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get Doctor by ID
  const getDoctorById = async (doctorUid) => {
    try {
      const doctorRef = ref(database, `doctors/${doctorUid}`);
      const snapshot = await get(doctorRef);
      
      if (snapshot.exists()) {
        return { success: true, doctor: snapshot.val() };
      } else {
        return { success: false, error: "Doctor not found" };
      }
    } catch (error) {
      console.error("Get doctor error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get All Labs Function
  const getAllLabs = async () => {
    try {
      const labsRef = ref(database, 'labs');
      const snapshot = await get(labsRef);
      
      if (snapshot.exists()) {
        const labsData = snapshot.val();
        const labsArray = Object.keys(labsData).map(key => ({
          id: key,
          ...labsData[key]
        }));
        return { success: true, labs: labsArray };
      } else {
        return { success: true, labs: [] };
      }
    } catch (error) {
      console.error("Get all labs error:", error);
      return { success: false, error: error.message };
    }
  };

  // Approve Doctor Function
  const approveDoctor = async (doctorUid) => {
    try {
      // Get doctor details
      const doctorRef = ref(database, `doctors/${doctorUid}`);
      const doctorSnapshot = await get(doctorRef);
      const doctorData = doctorSnapshot.val();

      // Update status
      await update(doctorRef, {
        registrationStatus: "approved"
      });

      // Notify admin
      const adminId = await getAdminId();
      if (adminId) {
        await createNotification({
          recipientUid: adminId,
          type: "REGISTRATION_ACTION",
          title: "Doctor Approved",
          message: `You approved Dr. ${doctorData?.fullname || 'Unknown'}'s registration`,
          senderName: "Admin",
          bookingId: null
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Approve doctor error:", error);
      return { success: false, error: error.message };
    }
  };

  // Reject Doctor Function
  const rejectDoctor = async (doctorUid) => {
    try {
      // Get doctor details
      const doctorRef = ref(database, `doctors/${doctorUid}`);
      const doctorSnapshot = await get(doctorRef);
      const doctorData = doctorSnapshot.val();

      // Update registration status to rejected
      await update(doctorRef, {
        registrationStatus: "rejected",
        rejectedAt: Date.now()
      });

      // Notify admin
      const adminId = await getAdminId();
      if (adminId) {
        await createNotification({
          recipientUid: adminId,
          type: "REGISTRATION_ACTION",
          title: "Doctor Rejected",
          message: `You rejected Dr. ${doctorData?.fullname || 'Unknown'}'s registration`,
          senderName: "Admin",
          bookingId: null
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Reject doctor error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout Function
  const logout = async () => {
    try {
      // Clear states immediately before signing out
      setCurrentUser(null);
      setUserRole(null);
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  // Add Test Function
  const addTest = async (labId, testData) => {
    try {
      const { testName, category, price, description, installments, noOfInstallments } = testData;

      // Generate unique test ID
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create test in global tests node
      const testRef = ref(database, `tests/${testId}`);
      const testDetails = {
        id: testId,
        testName: testName,
        category: category,
        price: price,
        description: description,
        installments: installments,
        createdBy: labId,
        createdAt: Date.now()
      };

      // Add number of installments only if installments is yes
      if (installments === 'yes' && noOfInstallments) {
        testDetails.noOfInstallments = noOfInstallments;
      }

      await set(testRef, testDetails);

      // Add test to lab's test mapping
      const labTestRef = ref(database, `labs/${labId}/tests/${testId}`);
      await set(labTestRef, true);

      // Send notification to lab (confirmation)
      await createNotification({
        recipientUid: labId,
        type: "TEST_ADDED",
        title: "Test Added Successfully",
        message: `You have added the test: ${testName}`,
        senderName: "System",
        bookingId: null
      });

      return { success: true, testId };
    } catch (error) {
      console.error("Add test error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update Test Function
  const updateTest = async (labId, testId, testData) => {
    try {
      const { testName, category, price, description, installments, noOfInstallments } = testData;

      // Update test in global tests node
      const testRef = ref(database, `tests/${testId}`);
      const testDetails = {
        testName: testName,
        category: category,
        price: price,
        description: description,
        installments: installments,
        updatedAt: Date.now()
      };

      // Add or remove number of installments based on selection
      if (installments === 'yes' && noOfInstallments) {
        testDetails.noOfInstallments = noOfInstallments;
      }

      await update(testRef, testDetails);

      // Send notification to lab
      await createNotification({
        recipientUid: labId,
        type: "TEST_UPDATED",
        title: "Test Updated",
        message: `You have updated the test: ${testName}`,
        senderName: "System",
        bookingId: null
      });

      return { success: true };
    } catch (error) {
      console.error("Update test error:", error);
      return { success: false, error: error.message };
    }
  };

  // Delete Test Function
  const deleteTest = async (labId, testId) => {
    try {
      // Get test data before deleting
      const testRef = ref(database, `tests/${testId}`);
      const testSnapshot = await get(testRef);
      const testData = testSnapshot.val();

      // Delete from global tests node
      await remove(testRef);

      // Delete from lab's test mapping
      const labTestRef = ref(database, `labs/${labId}/tests/${testId}`);
      await remove(labTestRef);

      // Send notification to lab
      if (testData) {
        await createNotification({
          recipientUid: labId,
          type: "TEST_REMOVED",
          title: "Test Removed",
          message: `You removed the test: ${testData.testName}`,
          senderName: "System",
          bookingId: null
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Delete test error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get Lab Tests Function
  const getLabTests = async (labId) => {
    try {
      const labTestsRef = ref(database, `labs/${labId}/tests`);
      const snapshot = await get(labTestsRef);

      if (!snapshot.exists()) {
        return { success: true, tests: [] };
      }

      const testIds = Object.keys(snapshot.val());
      const tests = [];

      // Fetch each test details from global tests node
      for (const testId of testIds) {
        const testRef = ref(database, `tests/${testId}`);
        const testSnapshot = await get(testRef);
        if (testSnapshot.exists()) {
          const testData = testSnapshot.val();
          tests.push({ ...testData, id: testId });
        }
      }

      return { success: true, tests };
    } catch (error) {
      console.error("Get lab tests error:", error);
      return { success: false, error: error.message, tests: [] };
    }
  };

  // Submit Complaint Function
  const submitComplaint = async (complaintData) => {
    try {
      const { username, subject, category, description, labId } = complaintData;

      // Generate unique complaint ID
      const complaintId = `CMP${Date.now().toString().slice(-6)}`;

      // Get lab name
      let labName = "Unknown Lab";
      if (labId) {
        const labRef = ref(database, `labs/${labId}`);
        const labSnapshot = await get(labRef);
        const labData = labSnapshot.val();
        if (labData) {
          labName = labData.labName || labData.name || "Unknown Lab";
        }
      }

      // Create complaint in database
      const complaintRef = ref(database, `complaints/${complaintId}`);
      const complaintDetails = {
        id: complaintId,
        username: username,
        subject: subject,
        category: category,
        description: description,
        labId: labId,
        status: 'pending',
        priority: 'NA',
        createdAt: Date.now(),
        responseDate: null,
        adminResponse: null
      };

      await set(complaintRef, complaintDetails);

      // Notify admin about new complaint
      const adminId = await getAdminId();
      if (adminId) {
        await createNotification({
          recipientUid: adminId,
          type: "NEW_COMPLAINT",
          title: "New Complaint Received",
          message: `New complaint from ${labName}: ${subject}`,
          senderName: labName,
          bookingId: null
        });
      }

      return { success: true, complaintId };
    } catch (error) {
      console.error("Submit complaint error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get All Complaints Function
  const getAllComplaints = async () => {
    try {
      const complaintsRef = ref(database, 'complaints');
      const snapshot = await get(complaintsRef);

      if (!snapshot.exists()) {
        return { success: true, complaints: [] };
      }

      const complaintsData = snapshot.val();
      const complaints = Object.values(complaintsData);

      return { success: true, complaints };
    } catch (error) {
      console.error("Get complaints error:", error);
      return { success: false, error: error.message, complaints: [] };
    }
  };

  // Get Single Complaint Function
  const getComplaintById = async (complaintId) => {
    try {
      const complaintRef = ref(database, `complaints/${complaintId}`);
      const snapshot = await get(complaintRef);

      if (!snapshot.exists()) {
        return { success: false, error: 'Complaint not found' };
      }

      return { success: true, complaint: snapshot.val() };
    } catch (error) {
      console.error("Get complaint error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update Complaint Status and Priority Function
  const updateComplaint = async (complaintId, updateData) => {
    try {
      const complaintRef = ref(database, `complaints/${complaintId}`);
      
      // Get complaint data first to access labId and other details
      const complaintSnapshot = await get(complaintRef);
      const complaintData = complaintSnapshot.val();
      
      // Update complaint
      await update(complaintRef, updateData);

      // If admin response is provided, send notification to lab
      if (updateData.adminResponse && complaintData && complaintData.labId) {
        await createNotification({
          recipientUid: complaintData.labId,
          type: "COMPLAINT_RESPONSE",
          title: "Admin Responded to Your Complaint",
          message: `Admin has responded to your complaint: "${complaintData.subject}". Status: ${updateData.status || complaintData.status}`,
          senderName: "Admin",
          bookingId: null
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Update complaint error:", error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // BOOKING / APPOINTMENT FUNCTIONS
  // ============================================

  // Get Lab Bookings - fetch all appointments where labId matches
  const getLabBookings = async (labId) => {
    try {
      const appointmentsRef = ref(database, 'appointments');
      const snapshot = await get(appointmentsRef);

      if (!snapshot.exists()) {
        return { success: true, bookings: [] };
      }

      const allAppointments = snapshot.val();
      const labBookings = Object.entries(allAppointments)
        .filter(([_, booking]) => booking.labId === labId)
        .map(([key, booking]) => ({ ...booking, id: key }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      return { success: true, bookings: labBookings };
    } catch (error) {
      console.error("Get lab bookings error:", error);
      return { success: false, error: error.message, bookings: [] };
    }
  };

  // Get Booking by ID
  const getBookingById = async (bookingId) => {
    try {
      const bookingRef = ref(database, `appointments/${bookingId}`);
      const snapshot = await get(bookingRef);

      if (snapshot.exists()) {
        return { success: true, booking: { ...snapshot.val(), id: bookingId } };
      } else {
        return { success: false, error: "Booking not found" };
      }
    } catch (error) {
      console.error("Get booking error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update Booking Status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const bookingRef = ref(database, `appointments/${bookingId}`);
      await update(bookingRef, {
        status: newStatus,
        updatedAt: Date.now()
      });
      return { success: true };
    } catch (error) {
      console.error("Update booking status error:", error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // NOTIFICATION FUNCTIONS
  // ============================================

  // Helper: Get Admin ID
  const getAdminId = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        console.log('All users in database:', users);
        const adminEntry = Object.entries(users).find(([_, user]) => user.role === 'admin');
        console.log('Found admin entry:', adminEntry);
        const adminId = adminEntry ? adminEntry[0] : null;
        console.log('Admin ID:', adminId);
        return adminId;
      }
      console.log('No users found in database');
      return null;
    } catch (error) {
      console.error("Get admin ID error:", error);
      return null;
    }
  };

  // Create Notification Function
  const createNotification = async (notificationData) => {
    try {
      console.log('Creating notification with data:', notificationData);
      const recipientNotifRef = ref(database, `notifications/${notificationData.recipientUid}`);
      const newNotificationRef = push(recipientNotifRef);
      
      const notification = {
        notificationId: newNotificationRef.key,
        recipientUid: notificationData.recipientUid,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        senderName: notificationData.senderName || "",
        bookingId: notificationData.bookingId || null,
        read: false,
        createdAt: Date.now(),
        timestamp: Date.now()
      };

      console.log('Notification object to be saved:', notification);
      console.log('Notification path:', `notifications/${notificationData.recipientUid}/${newNotificationRef.key}`);
      
      await set(newNotificationRef, notification);
      console.log('Notification created successfully with ID:', newNotificationRef.key);
      return { success: true, notificationId: newNotificationRef.key };
    } catch (error) {
      console.error("Create notification error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get Notifications for User
  const getNotifications = async (userId, userRole) => {
    try {
      console.log('getNotifications called with userId:', userId, 'userRole:', userRole);
      const userNotifRef = ref(database, `notifications/${userId}`);
      const snapshot = await get(userNotifRef);
      
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        console.log('Notifications for user:', notificationsData);
        
        const userNotifications = Object.entries(notificationsData)
          .map(([id, notif]) => {
            // Robust parsing: provide fallbacks for missing fields
            const time = notif.timestamp || notif.createdAt || Date.now();
            return {
              id: id,
              ...notif,
              type: notif.type || 'UNKNOWN',
              title: notif.title || 'Notification',
              message: notif.message || '',
              senderName: notif.senderName || '',
              bookingId: notif.bookingId || null,
              read: notif.read || false,
              createdAt: notif.createdAt || time,
              timestamp: time
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('Sorted notifications for user:', userNotifications);
        return { success: true, notifications: userNotifications };
      }
      
      console.log('No notifications exist for user:', userId);
      return { success: true, notifications: [] };
    } catch (error) {
      console.error("Get notifications error:", error);
      return { success: false, error: error.message };
    }
  };

  // Mark Notification as Read
  const markNotificationAsRead = async (notificationId, recipientUid) => {
    try {
      const notificationRef = ref(database, `notifications/${recipientUid}/${notificationId}`);
      await update(notificationRef, { read: true });
      return { success: true };
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return { success: false, error: error.message };
    }
  };

  // Mark All Notifications as Read
  const markAllNotificationsAsRead = async (userId, userRole) => {
    try {
      const userNotifRef = ref(database, `notifications/${userId}`);
      const snapshot = await get(userNotifRef);
      
      if (snapshot.exists()) {
        const updates = {};
        Object.entries(snapshot.val()).forEach(([id, notif]) => {
          if (!notif.read) {
            updates[`notifications/${userId}/${id}/read`] = true;
          }
        });
        
        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      return { success: false, error: error.message };
    }
  };

  // Clear All Notifications
  const clearAllNotifications = async (userId, userRole) => {
    try {
      const userNotifRef = ref(database, `notifications/${userId}`);
      await remove(userNotifRef);
      
      return { success: true };
    } catch (error) {
      console.error("Clear all notifications error:", error);
      return { success: false, error: error.message };
    }
  };

  // Delete Notification
  const deleteNotification = async (notificationId, recipientUid) => {
    try {
      const notificationRef = ref(database, `notifications/${recipientUid}/${notificationId}`);
      await remove(notificationRef);
      return { success: true };
    } catch (error) {
      console.error("Delete notification error:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    loginAdmin,
    loginLab,
    signupLab,
    approveLab,
    rejectLab,
    getLabById,
    updateLabProfile,
    uploadLabLogo,
    changePassword,
    getAllLabs,
    getAllDoctors,
    getDoctorById,
    approveDoctor,
    rejectDoctor,
    addTest,
    updateTest,
    deleteTest,
    getLabTests,
    submitComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaint,
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    deleteNotification,
    getLabBookings,
    getBookingById,
    updateBookingStatus,
    logout,
    auth,
    database,
    storage
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};

export { auth, database, storage };
export default app;