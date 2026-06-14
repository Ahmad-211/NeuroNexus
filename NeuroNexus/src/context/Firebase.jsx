// Import the functions you need from the SDKs you need
import { createContext, useContext, useState, useEffect } from "react";
import { uploadImageToCloudinary } from "../utils/uploadCloudinary";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
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
  push,
  onValue,
  off
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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
  const [labStatus, setLabStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.role);
          if (userData.role === 'lab') {
            const labRef = ref(database, `labs/${user.uid}`);
            const labSnap = await get(labRef);
            if (labSnap.exists()) {
              const labData = labSnap.val();
              if (labData.status === "deactivated") {
                setLabStatus("deactivated");
              } else {
                setLabStatus(labData.registrationStatus || null);
              }
            } else {
              setLabStatus(null);
            }
          } else {
            setLabStatus(null);
          }
        } else {
          setUserRole(null);
          setLabStatus(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setLabStatus(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Admin Login Function
  const loginAdmin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user has admin role in database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.role !== "admin") {
          await signOut(auth);
          throw new Error("Unauthorized: Not an admin account");
        }
        await update(userRef, { lastLogin: Date.now() });
      } else {
        // Create admin entry in database if not exists
        await set(userRef, {
          email: email,
          role: "admin",
          status: "active",
          createdAt: Date.now(),
          lastLogin: Date.now()
        });

        await set(ref(database, `admin/${user.uid}`), {
          uid: user.uid,
          name: email.split('@')[0] || "Admin",
          email: email,
          permissions: "full"
        });
      }

      return { success: true, user };
    } catch (error) {
      console.error("Admin login error:", error);
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.code === "auth/invalid-email") {
        return { success: false, error: "Invalid email or password" };
      }
      return { success: false, error: error.message };
    }
  };

  // Lab Login Function
  const loginLab = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = ref(database, `users/${user.uid}`);
      let snapshot = await get(userRef);

      if (!snapshot.exists()) {
        const labRef = ref(database, `labs/${user.uid}`);
        const labSnapshot = await get(labRef);
        const labData = labSnapshot.exists() ? labSnapshot.val() : null;
        if (!labData) {
          await set(ref(database, `labs/${user.uid}`), {
            uid: user.uid,
            email: email,
            name: "Lab",
            registrationStatus: "rejected",
            rejectedAt: Date.now(),
            rejectionReason: "Account data was removed. Please re-submit your information."
          });
        }
        await set(userRef, {
          email: labData?.email || email,
          role: "lab",
          status: "active",
          createdAt: Date.now(),
          lastLogin: Date.now()
        });
        snapshot = await get(userRef);
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

      if (userData.status === "deactivated") {
        const labRef = ref(database, `labs/${user.uid}`);
        const labSnapshot = await get(labRef);
        let labData = labSnapshot.exists() ? labSnapshot.val() : {};
        await update(userRef, { lastLogin: Date.now() });
        return { success: true, user, registrationStatus: "deactivated", labData };
      }

      // Check registration status
      const labRef = ref(database, `labs/${user.uid}`);
      const labSnapshot = await get(labRef);
      
      let regStatus = null;
      if (labSnapshot.exists()) {
        const labData = labSnapshot.val();
        regStatus = labData.registrationStatus;
        if (regStatus === "pending") {
          await signOut(auth);
          throw new Error("Your account is under review. You will be notified upon approval.");
        }
        if (regStatus === "rejected") {
          await update(userRef, { lastLogin: Date.now() });
          return { success: true, user, registrationStatus: "rejected" };
        }
      }

      await update(userRef, { lastLogin: Date.now() });

      return { success: true, user, registrationStatus: regStatus || "approved" };
    } catch (error) {
      console.error("Lab login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Lab Signup Function
  const signupLab = async (labData) => {
    try {
      const { email, password, name, licenseNumber, address, phone, labTiming, city, licenseFile, logoFile, offersInstallments, maxInstallments } = labData;

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let licenseImageUrl = "";
      let profilePicUrl = "";

      // Upload license file if provided
      if (licenseFile) {
        licenseImageUrl = await uploadImageToCloudinary(licenseFile);
      }

      // Upload logo file if provided
      if (logoFile) {
        profilePicUrl = await uploadImageToCloudinary(logoFile);
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
        profilePicUrl: profilePicUrl,
        offersInstallments: offersInstallments || false,
        maxInstallments: maxInstallments || 0
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
  const rejectLab = async (labUid, reason) => {
    try {
      const labRef = ref(database, `labs/${labUid}`);
      const labSnapshot = await get(labRef);
      const labData = labSnapshot.val();

      await update(labRef, {
        registrationStatus: "rejected",
        rejectionReason: reason || "No reason provided",
        rejectedAt: Date.now()
      });

      const adminId = await getAdminId();
      if (adminId && labData) {
        await createNotification({
          recipientUid: adminId,
          type: "REGISTRATION_ACTION",
          title: "Registration Action Completed",
          message: `You rejected the registration of ${labData.name}. Reason: ${reason || 'No reason provided'}`,
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

  // Resubmit Lab Registration (for rejected labs)
  const resubmitLabRegistration = async (labUid, updateData) => {
    try {
      const labRef = ref(database, `labs/${labUid}`);
      const updates = {
        ...updateData,
        registrationStatus: "pending",
        rejectedAt: null,
        rejectionReason: null,
        resubmittedAt: Date.now()
      };
      await update(labRef, updates);
      return { success: true, message: "Application resubmitted. You will be notified upon approval." };
    } catch (error) {
      console.error("Resubmit lab registration error:", error);
      return { success: false, error: error.message };
    }
  };

  const getLabRejectionReason = async (labUid) => {
    try {
      const labRef = ref(database, `labs/${labUid}`);
      const snapshot = await get(labRef);
      if (snapshot.exists()) {
        return { success: true, lab: snapshot.val() };
      }
      return { success: false, error: "Lab not found" };
    } catch (error) {
      console.error("Get lab rejection reason error:", error);
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
      if (profileData.offersInstallments !== undefined) updateData.offersInstallments = profileData.offersInstallments;
      if (profileData.maxInstallments !== undefined) updateData.maxInstallments = profileData.maxInstallments;
      
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
      const downloadURL = await uploadImageToCloudinary(file);
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

  // Deactivate Lab Function
  const deactivateLab = async (labUid, reason) => {
    try {
      const updates = {};
      updates[`labs/${labUid}/status`] = "deactivated";
      updates[`labs/${labUid}/adminReason`] = reason;
      updates[`labs/${labUid}/deactivatedAt`] = Date.now();
      updates[`labs/${labUid}/deactivatedBy`] = currentUser?.uid || "admin";
      updates[`users/${labUid}/status`] = "deactivated";
      await update(ref(database), updates);
      return { success: true };
    } catch (error) {
      console.error("Deactivate lab error:", error);
      return { success: false, error: error.message };
    }
  };

  // Reactivate Lab Function
  const reactivateLab = async (labUid) => {
    try {
      const updates = {};
      updates[`labs/${labUid}/status`] = "active";
      updates[`labs/${labUid}/adminReason`] = null;
      updates[`labs/${labUid}/appealMessage`] = null;
      updates[`labs/${labUid}/appealedAt`] = null;
      updates[`labs/${labUid}/deactivatedAt`] = null;
      updates[`labs/${labUid}/deactivatedBy`] = null;
      updates[`users/${labUid}/status`] = "active";
      await update(ref(database), updates);
      return { success: true };
    } catch (error) {
      console.error("Reactivate lab error:", error);
      return { success: false, error: error.message };
    }
  };

  // Submit Lab Appeal Function
  const submitLabAppeal = async (labUid, message) => {
    try {
      const updates = {};
      updates[`labs/${labUid}/appealMessage`] = message;
      updates[`labs/${labUid}/appealedAt`] = Date.now();
      await update(ref(database), updates);
      return { success: true };
    } catch (error) {
      console.error("Submit appeal error:", error);
      return { success: false, error: error.message };
    }
  };

  // Dismiss Lab Appeal Function
  const dismissLabAppeal = async (labUid) => {
    try {
      const updates = {};
      updates[`labs/${labUid}/appealMessage`] = null;
      updates[`labs/${labUid}/appealedAt`] = null;
      await update(ref(database), updates);
      return { success: true };
    } catch (error) {
      console.error("Dismiss appeal error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout Function
  const logout = async () => {
    try {
      setCurrentUser(null);
      setUserRole(null);
      setLabStatus(null);
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
      const { testName, category, price, description } = testData;

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
        createdBy: labId,
        createdAt: Date.now()
      };

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
      const { testName, category, price, description } = testData;

      // Update test in global tests node
      const testRef = ref(database, `tests/${testId}`);
      const testDetails = {
        testName: testName,
        category: category,
        price: price,
        description: description,
        updatedAt: Date.now()
      };

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
  // PATIENT FUNCTIONS
  // ============================================

  // Get All Patients - fetch from users (role=patient), merge with patients node, count bookings
  const getAllPatients = async () => {
    try {
      // Fetch all users
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (!usersSnapshot.exists()) {
        return { success: true, patients: [] };
      }

      const usersData = usersSnapshot.val();

      // Filter only patient users
      const patientUsers = Object.entries(usersData)
        .filter(([_, user]) => user.role === 'patient')
        .map(([uid, user]) => ({ uid, ...user }));

      if (patientUsers.length === 0) {
        return { success: true, patients: [] };
      }

      // Fetch patients profile data
      const patientsRef = ref(database, 'patients');
      const patientsSnapshot = await get(patientsRef);
      const patientsData = patientsSnapshot.exists() ? patientsSnapshot.val() : {};

      // Fetch all appointments for booking count
      const appointmentsRef = ref(database, 'appointments');
      const appointmentsSnapshot = await get(appointmentsRef);
      const appointmentsData = appointmentsSnapshot.exists() ? appointmentsSnapshot.val() : {};

      // Count bookings per patient
      const bookingCounts = {};
      Object.values(appointmentsData).forEach(appointment => {
        const holderId = appointment.accountHolderId;
        if (holderId) {
          bookingCounts[holderId] = (bookingCounts[holderId] || 0) + 1;
        }
      });

      // Merge data
      const mergedPatients = patientUsers.map(user => {
        const profile = patientsData[user.uid] || {};
        return {
          uid: user.uid,
          name: profile.name || profile.fullName || profile.fullname || user.email?.split('@')[0] || 'N/A',
          email: profile.email || user.email || 'N/A',
          phone: profile.phone || profile.phoneNumber || 'N/A',
          status: user.status || 'active',
          totalBookings: bookingCounts[user.uid] || 0,
          createdAt: user.createdAt || 0
        };
      });

      return { success: true, patients: mergedPatients };
    } catch (error) {
      console.error("Get all patients error:", error);
      return { success: false, error: error.message, patients: [] };
    }
  };

  // Toggle Patient Status (active/blocked)
  const togglePatientStatus = async (patientUid, newStatus) => {
    try {
      const userRef = ref(database, `users/${patientUid}`);
      await update(userRef, {
        status: newStatus
      });
      return { success: true };
    } catch (error) {
      console.error("Toggle patient status error:", error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // ADMIN PROFILE FUNCTIONS
  // ============================================

  const getAdminProfile = async (adminUid) => {
    try {
      const adminRef = ref(database, `admin/${adminUid}`);
      const snapshot = await get(adminRef);
      if (snapshot.exists()) {
        return { success: true, admin: snapshot.val() };
      }
      return { success: false, error: "Admin not found" };
    } catch (error) {
      console.error("Get admin profile error:", error);
      return { success: false, error: error.message };
    }
  };

  const updateAdminProfile = async (adminUid, profileData) => {
    try {
      const adminRef = ref(database, `admin/${adminUid}`);
      await update(adminRef, profileData);
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      console.error("Update admin profile error:", error);
      return { success: false, error: error.message };
    }
  };

  const uploadAdminProfilePicture = async (file) => {
    try {
      const url = await uploadImageToCloudinary(file);
      if (!url) throw new Error('Upload returned no URL');
      return { success: true, url };
    } catch (error) {
      console.error("Upload admin profile picture error:", error);
      return { success: false, error: error.message };
    }
  };

  const updateAdminEmail = async (currentPassword, newEmail) => {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "No user is currently logged in" };

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      try {
        await updateEmail(user, newEmail);
      } catch (emailError) {
        if (emailError.code === 'auth/email-change-needs-verification') {
          await sendEmailVerification(user);
          return { success: false, error: "Your current email needs to be verified before changing. A verification email has been sent to " + user.email + ". Please verify and try again." };
        }
        throw emailError;
      }

      await update(ref(database, `admin/${user.uid}`), { email: newEmail });

      return { success: true, message: "Email updated successfully in both Authentication and Database." };
    } catch (error) {
      console.error("Update admin email error:", error);
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: "Current password is incorrect" };
      }
      if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: "Please log out and log in again before changing email" };
      }
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // DELETE LAB ACCOUNT
  // ============================================

  const deleteLabAccount = async (currentPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "No user is currently logged in" };

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      const uid = user.uid;
      const dbRef = ref(database);

      const updates = {};
      updates[`users/${uid}`] = null;
      updates[`labs/${uid}`] = null;
      updates[`labReports/${uid}`] = null;
      updates[`notifications/${uid}`] = null;
      await update(dbRef, updates);

      await deleteUser(user);

      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      console.error("Delete lab account error:", error);
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: "Current password is incorrect" };
      }
      if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: "Please log out and log in again before deleting" };
      }
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // BOOKING / APPOINTMENT FUNCTIONS
  // ============================================

  // Get All Bookings - fetch all appointments for admin
  const getAllBookings = async () => {
    try {
      const appointmentsRef = ref(database, 'appointments');
      const snapshot = await get(appointmentsRef);

      if (!snapshot.exists()) {
        return { success: true, bookings: [] };
      }

      const allAppointments = snapshot.val();
      const bookingsArray = Object.entries(allAppointments)
        .map(([key, booking]) => ({ ...booking, id: key }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      return { success: true, bookings: bookingsArray };
    } catch (error) {
      console.error("Get all bookings error:", error);
      return { success: false, error: error.message, bookings: [] };
    }
  };

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

  // Get Recent Activities for Admin Dashboard
  const getRecentActivities = async () => {
    try {
      const activities = [];

      const [labsSnap, doctorsSnap, bookingsSnap, complaintsSnap] = await Promise.all([
        get(ref(database, 'labs')),
        get(ref(database, 'doctors')),
        get(ref(database, 'appointments')),
        get(ref(database, 'complaints'))
      ]);

      if (labsSnap.exists()) {
        Object.entries(labsSnap.val()).forEach(([uid, lab]) => {
          if (lab.registrationStatus === 'pending') {
            activities.push({
              type: 'lab_registered',
              icon: 'bi-buildings',
              color: 'primary',
              description: 'Lab Registered',
              user: lab.name || 'Unknown Lab',
              status: 'Pending',
              statusClass: 'warning',
              timestamp: lab.createdAt || 0
            });
          }
        });
      }

      if (doctorsSnap.exists()) {
        Object.entries(doctorsSnap.val()).forEach(([uid, doctor]) => {
          if (doctor.registrationStatus === 'pending') {
            activities.push({
              type: 'doctor_registered',
              icon: 'bi-person-doctor',
              color: 'info',
              description: 'Doctor Registered',
              user: doctor.fullname || doctor.name || 'Unknown Doctor',
              status: 'Pending',
              statusClass: 'warning',
              timestamp: doctor.createdAt || 0
            });
          }
        });
      }

      if (bookingsSnap.exists()) {
        Object.entries(bookingsSnap.val()).forEach(([id, booking]) => {
          activities.push({
            type: 'new_booking',
            icon: 'bi-calendar-check',
            color: 'success',
            description: 'New Booking',
            user: booking.patientName || booking.name || `Booking #${id.slice(-6)}`,
            status: booking.status || 'Pending',
            statusClass: booking.status === 'confirmed' ? 'success' : booking.status === 'completed' ? 'info' : 'warning',
            timestamp: booking.createdAt || 0
          });
        });
      }

      const adminId = await getAdminId();
      if (adminId) {
        const notifSnap = await get(ref(database, `notifications/${adminId}`));
        if (notifSnap.exists()) {
          Object.entries(notifSnap.val()).forEach(([nid, notif]) => {
            const ts = notif.timestamp || notif.createdAt || 0;
            if (notif.type === 'NEW_LAB_REGISTRATION') {
              activities.push({
                type: 'lab_registered_notif',
                icon: 'bi-buildings',
                color: 'primary',
                description: 'New Lab Registration',
                user: notif.senderName || 'Unknown',
                status: 'Pending',
                statusClass: 'warning',
                timestamp: ts
              });
            } else if (notif.type === 'REGISTRATION_ACTION') {
              const isApproval = notif.title?.includes('Approved');
              activities.push({
                type: isApproval ? 'approved' : 'rejected',
                icon: isApproval ? 'bi-check-circle' : 'bi-x-circle',
                color: isApproval ? 'success' : 'danger',
                description: notif.title || (isApproval ? 'Approved' : 'Rejected'),
                user: notif.message?.replace(/^(You approved|You rejected)( the registration of)? /, '') || 'Unknown',
                status: isApproval ? 'Approved' : 'Rejected',
                statusClass: isApproval ? 'success' : 'danger',
                timestamp: ts
              });
            } else if (notif.type === 'NEW_COMPLAINT') {
              activities.push({
                type: 'new_complaint',
                icon: 'bi-exclamation-triangle',
                color: 'danger',
                description: 'Complaint Filed',
                user: notif.senderName || 'Unknown',
                status: 'Open',
                statusClass: 'danger',
                timestamp: ts
              });
            }
          });
        }
      }

      if (complaintsSnap.exists()) {
        Object.entries(complaintsSnap.val()).forEach(([id, complaint]) => {
          activities.push({
            type: 'complaint',
            icon: 'bi-exclamation-triangle',
            color: 'danger',
            description: complaint.subject || 'Complaint Filed',
            user: complaint.username || 'Unknown',
            status: complaint.status === 'pending' ? 'Open' : complaint.status || 'Open',
            statusClass: complaint.status === 'resolved' ? 'success' : 'danger',
            timestamp: complaint.createdAt || 0
          });
        });
      }

      activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      return { success: true, activities: activities.slice(0, 5) };
    } catch (error) {
      console.error("Get recent activities error:", error);
      return { success: false, error: error.message, activities: [] };
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

  // ── Doctor Categories ──────────────────────────────────────────────────────

  const DEFAULT_CATEGORIES = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Practice', 'Gynecology', 'Neurology', 'Oncology',
    'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
    'Pulmonology', 'Radiology', 'Urology', 'ENT (Ear, Nose & Throat)'
  ];

  const initializeDoctorCategories = async () => {
    try {
      const catRef = ref(database, 'doctor_categories');
      const snapshot = await get(catRef);
      if (!snapshot.exists()) {
        const promises = DEFAULT_CATEGORIES.map(name =>
          push(catRef, { name })
        );
        await Promise.all(promises);
      }
    } catch (error) {
      console.error('initializeDoctorCategories error:', error);
    }
  };

  const getDoctorCategories = async () => {
    try {
      const catRef = ref(database, 'doctor_categories');
      const snapshot = await get(catRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const categories = Object.keys(data).map(id => ({ id, name: data[id].name }));
        categories.sort((a, b) => a.name.localeCompare(b.name));
        return { success: true, categories };
      }
      return { success: true, categories: [] };
    } catch (error) {
      console.error('getDoctorCategories error:', error);
      return { success: false, error: error.message };
    }
  };

  const addDoctorCategory = async (name) => {
    try {
      const trimmed = name.trim();
      if (!trimmed) return { success: false, error: 'Category name cannot be empty' };
      const { categories } = await getDoctorCategories();
      const duplicate = categories.some(
        c => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) return { success: false, error: 'Category already exists' };
      const catRef = ref(database, 'doctor_categories');
      await push(catRef, { name: trimmed });
      return { success: true };
    } catch (error) {
      console.error('addDoctorCategory error:', error);
      return { success: false, error: error.message };
    }
  };

  const removeDoctorCategory = async (id) => {
    try {
      await remove(ref(database, `doctor_categories/${id}`));
      return { success: true };
    } catch (error) {
      console.error('removeDoctorCategory error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateDoctorCategory = async (id, newName) => {
    try {
      const trimmed = newName.trim();
      if (!trimmed) return { success: false, error: 'Category name cannot be empty' };
      const { categories } = await getDoctorCategories();
      const duplicate = categories.some(
        c => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) return { success: false, error: 'Category already exists' };
      await update(ref(database, `doctor_categories/${id}`), { name: trimmed });
      return { success: true };
    } catch (error) {
      console.error('updateDoctorCategory error:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadReportFile = async (file) => {
    try {
      const url = await uploadImageToCloudinary(file);
      if (!url) throw new Error('Cloudinary upload returned no URL');
      return { success: true, url };
    } catch (error) {
      console.error('uploadReportFile error:', error);
      return { success: false, error: error.message || 'Upload to Cloudinary failed' };
    }
  };

  const saveLabReport = async (reportData) => {
    try {
      const { patientProfileId, labId } = reportData;
      
      const newRef = push(ref(database, `medical_records/${patientProfileId}/lab_reports`));
      const reportId = newRef.key;
      
      const fullReportData = {
        ...reportData,
        reportId
      };
      
      await set(newRef, fullReportData);
      
      const labIndexRef = ref(database, `labReports/${labId}/${reportId}`);
      await set(labIndexRef, {
        bookingId: reportData.bookingId,
        patientProfileId: reportData.patientProfileId,
        patientName: reportData.patientName,
        testId: reportData.testId,
        testName: reportData.testName,
        fileUrl: reportData.fileUrl,
        issuedDate: reportData.issuedDate
      });
      
      return { success: true, reportId };
    } catch (error) {
      console.error('saveLabReport error:', error);
      return { success: false, error: error.message };
    }
  };

  const getLabReports = async (labId) => {
    try {
      const reportsRef = ref(database, `labReports/${labId}`);
      const snapshot = await get(reportsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reports = Object.keys(data).map(id => ({ id, ...data[id] }));
        reports.sort((a, b) => b.issuedDate - a.issuedDate);
        return { success: true, data: reports };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('getLabReports error:', error);
      return { success: false, error: error.message };
    }
  };

  const notifyReportShared = async (patientUid, labUid, reportData) => {
    try {
      const patientNotifRef = ref(database, `notifications/${patientUid}`);
      await push(patientNotifRef, {
        type: "REPORT_READY",
        title: "New Lab Report Available",
        message: `Your ${reportData.testName} report from ${reportData.labName} is now available.`,
        bookingId: reportData.bookingId,
        reportId: reportData.reportId,
        testId: reportData.testId,
        read: false,
        createdAt: Date.now()
      });

      const labNotifRef = ref(database, `notifications/${labUid}`);
      await push(labNotifRef, {
        type: "REPORT_SHARED",
        title: "Report Shared Successfully",
        message: `${reportData.testName} report shared with ${reportData.patientName}`,
        bookingId: reportData.bookingId,
        reportId: reportData.reportId,
        testId: reportData.testId,
        read: false,
        createdAt: Date.now()
      });
      return { success: true };
    } catch (error) {
      console.error('notifyReportShared error:', error);
      return { success: false, error: error.message };
    }
  };

  const getLabRecentActivities = async (labId) => {
    try {
      const activities = [];

      const [bookingsSnap, complaintsSnap, reportsResult] = await Promise.all([
        get(ref(database, 'appointments')),
        get(ref(database, 'complaints')),
        getLabReports(labId)
      ]);

      if (bookingsSnap.exists()) {
        Object.entries(bookingsSnap.val()).forEach(([id, booking]) => {
          if (booking.labId === labId) {
            let testDisplay = 'Test';
            if (booking.tests) {
              const testArr = Object.values(booking.tests);
              if (testArr.length === 1) {
                testDisplay = testArr[0].testName || 'Test';
              } else if (testArr.length > 1) {
                testDisplay = `${testArr.length} Tests`;
              }
            } else if (booking.testName) {
              testDisplay = booking.testName;
            }
            activities.push({
              type: 'booking',
              patientName: booking.patientName || 'Unknown',
              patientId: booking.patientId || booking.accountHolderId || '',
              testName: testDisplay,
              status: booking.status || 'pending',
              timestamp: booking.createdAt || 0,
              bookingId: id
            });
          }
        });
      }

      if (complaintsSnap.exists()) {
        Object.entries(complaintsSnap.val()).forEach(([id, complaint]) => {
          if (complaint.labId === labId) {
            activities.push({
              type: 'complaint',
              patientName: complaint.username || 'Unknown',
              patientId: '',
              testName: `Complaint: ${complaint.subject || 'N/A'}`,
              status: complaint.status === 'resolved' ? 'resolved' : 'open',
              timestamp: complaint.createdAt || 0,
              bookingId: null
            });
          }
        });
      }

      if (reportsResult.success && reportsResult.data.length > 0) {
        reportsResult.data.forEach(report => {
          activities.push({
            type: 'report',
            patientName: report.patientName || 'Unknown',
            patientId: report.patientId || '',
            testName: report.testName || 'Report',
            status: 'shared',
            timestamp: report.issuedDate || report.createdAt || 0,
            bookingId: report.bookingId || null
          });
        });
      }

      activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      return { success: true, activities: activities.slice(0, 5) };
    } catch (error) {
      console.error('getLabRecentActivities error:', error);
      return { success: false, error: error.message, activities: [] };
    }
  };

  const getAllPayments = async (labId = null) => {
    try {
      const [appointmentsSnap, plansSnap, recordsSnap] = await Promise.all([
        get(ref(database, 'appointments')),
        get(ref(database, 'installment_plans')),
        get(ref(database, 'installment_records'))
      ]);

      const plans = plansSnap.exists() ? plansSnap.val() : {};
      const records = recordsSnap.exists() ? recordsSnap.val() : {};

      const payments = [];

      if (!appointmentsSnap.exists()) {
        return { success: true, payments: [] };
      }

      const allAppointments = appointmentsSnap.val();

      Object.entries(allAppointments).forEach(([bookingId, booking]) => {
        if (labId && booking.labId !== labId) return;

        const pay = booking.payment || {};
        const paymentId = pay.paymentId || `N/A`;
        const amount = pay.amount || 0;
        const currency = pay.currency || 'USD';
        const paymentMethod = pay.paymentMethod || 'N/A';
        const paymentStatus = pay.paymentStatus || 'N/A';
        const transactionDate = pay.transactionDate || 0;

        const patientName = booking.patientNameSnapshot || booking.patientName || 'Unknown';

        const bookingType = (booking.bookingType || '').toLowerCase();
        const isDoctor = bookingType === 'doctor_appointment' || bookingType === 'doctor' || bookingType === 'doctor_consultation' ||
          (!!(booking.doctorName || booking.selectedDoctor || booking.doctorId) && !booking.labName && !booking.labId);

        let testDisplay = 'N/A';
        if (booking.tests) {
          const testArr = Object.values(booking.tests);
          testDisplay = testArr.map(t => t.name || t.testName || 'Test').join(', ');
        } else if (booking.testName) {
          testDisplay = booking.testName;
        } else if (booking.reasonForVisit || booking.reason) {
          testDisplay = booking.reasonForVisit || booking.reason;
        }

        const assignedTo = isDoctor
          ? (booking.doctorName || booking.selectedDoctor || 'N/A')
          : (booking.labName || 'N/A');

        let installmentPlan = null;
        let installmentRecords = [];

        Object.values(plans).forEach(plan => {
          if (plan && plan.bookingId === bookingId) {
            installmentPlan = plan;
            Object.values(records).forEach(rec => {
              if (rec && rec.planId === plan.planId) {
                installmentRecords.push(rec);
              }
            });
          }
        });

        const isInstallment = !!installmentPlan;
        const numInstallments = installmentPlan ? installmentPlan.numInstallments : 0;
        const paidInstallments = installmentRecords.filter(r => r.status === 'paid').length;
        const totalPaid = installmentRecords.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount || 0), 0);
        const totalPending = installmentRecords.filter(r => r.status === 'pending').reduce((s, r) => s + (r.amount || 0), 0);

        let effectiveStatus = paymentStatus;
        if (isInstallment) {
          if (paidInstallments === numInstallments) {
            effectiveStatus = 'paid';
          } else if (paidInstallments > 0) {
            effectiveStatus = 'partial';
          } else {
            effectiveStatus = 'pending';
          }
        }

        payments.push({
          paymentId,
          bookingId,
          patientName,
          type: isDoctor ? 'doctor' : 'lab',
          amount: isInstallment ? (installmentPlan.totalAmount || amount) : amount,
          paidAmount: isInstallment ? totalPaid : (paymentStatus === 'paid' ? amount : 0),
          pendingAmount: isInstallment ? totalPending : (paymentStatus === 'pending' ? amount : 0),
          currency,
          paymentMethod,
          date: transactionDate,
          status: effectiveStatus,
          assignedTo,
          testName: testDisplay,
          isInstallment,
          installmentPlan: installmentPlan ? {
            totalAmount: installmentPlan.totalAmount,
            installmentAmount: installmentPlan.installmentAmount,
            numInstallments: installmentPlan.numInstallments,
            status: installmentPlan.status,
            paidInstallments,
            records: installmentRecords.map(r => ({
              number: r.installmentNumber,
              amount: r.amount,
              status: r.status,
              dueDate: r.dueDate,
              paidAt: r.paidAt
            }))
          } : null
        });
      });

      payments.sort((a, b) => (b.date || 0) - (a.date || 0));

      return { success: true, payments };
    } catch (error) {
      console.error('getAllPayments error:', error);
      return { success: false, error: error.message, payments: [] };
    }
  };

  const value = {
    currentUser,
    userRole,
    labStatus,
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
    getAllBookings,
    getLabBookings,
    getBookingById,
    updateBookingStatus,
    getAllPatients,
    togglePatientStatus,
    getAdminProfile,
    updateAdminProfile,
    uploadAdminProfilePicture,
    updateAdminEmail,
    logout,
    initializeDoctorCategories,
    getDoctorCategories,
    addDoctorCategory,
    removeDoctorCategory,
    updateDoctorCategory,
    saveLabReport,
    getLabReports,
    uploadReportFile,
    notifyReportShared,
    deleteLabAccount,
    resubmitLabRegistration,
    getLabRejectionReason,
    getRecentActivities,
    getLabRecentActivities,
    getAllPayments,
    deactivateLab,
    reactivateLab,
    submitLabAppeal,
    dismissLabAppeal,
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