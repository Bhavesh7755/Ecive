// import { Router } from 'express';
// import { upload } from '../middlewares/multer.middleware.js';
// import { loginRecycler, logoutRecycler, refreshAccessToken, registerRecycler } from '../controllers/recycler-controller.js';
// import { verifyJWTRecycler } from '../middlewares/auth.middleware.js';

// const router = Router();

// router.route("/register-recycler").post(
//     upload.fields([
//         {
//             name: 'avatar',
//             maxCount: 1
//         },
//         {
//             name: 'shopImage',
//             maxCount: 1
//         },
//         {
//             name: 'identity',
//             maxCount: 1
//         }
//     ]),
//     registerRecycler
// );

// router.route("/login-recycler").post(loginRecycler);

// router.route("/logout-recycler").post(verifyJWTRecycler, logoutRecycler);

// router.route("/refresh-token-recycler").post(refreshAccessToken);

// export default router;








import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerRecycler,
    loginRecycler,
    logoutRecycler,
    refreshAccessToken,
    getRecyclerRequests,
    updateRequestStatus,
    getRecyclerProfile,
    updateRecyclerProfile,
    getRecyclerNotifications,
    markRecyclerNotificationAsRead,
    getRecyclerEarnings,
    getRecyclerOrders,
    getRecyclerDashboardStats,
} from "../controllers/recycler-controller.js";
import { verifyJWTRecycler } from "../middlewares/auth.middleware.js";

const router = Router();

// ✅ Register Recycler
router.route("/register-recycler").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "shopImage", maxCount: 1 },
        { name: "identity", maxCount: 1 }
    ]),
    registerRecycler
);

// ✅ Login Recycler
router.route("/recycler-login").post(loginRecycler);

// ✅ Logout Recycler
router.route("/recycler-logout").post(verifyJWTRecycler, logoutRecycler);

// ✅ Refresh Token for Recycler
router.route("/refresh-token-recycler").post(refreshAccessToken);

// ✅ Get Recycler Profile
router.route("/profile").get(verifyJWTRecycler, getRecyclerProfile);

// ✅ Update Recycler Profile
router.route("/profile").patch(verifyJWTRecycler, updateRecyclerProfile);

// ✅ Get All Requests from Users
router.route("/requests/:recyclerId").get(verifyJWTRecycler, getRecyclerRequests);

// ✅ Update particular request status (accept / reject)
router.route("/requests/:requestId/:action").patch(verifyJWTRecycler, updateRequestStatus);

// ✅ Get notifications for Recycler
router.route("/notifications").get(verifyJWTRecycler, getRecyclerNotifications);

// ✅ Mark notification as read
router.route("/notifications/:notificationId/read")
      .patch(verifyJWTRecycler, markRecyclerNotificationAsRead);

// ✅ Get recycler earnings
router.route("/earnings").get(verifyJWTRecycler, getRecyclerEarnings);

// ✅ Orders - all | pending | completed | cancelled
router.route("/orders").get(verifyJWTRecycler, getRecyclerOrders);

// ✅ Dashboard Stats API (Protected)
router.route("/dashboard-stats").get(verifyJWTRecycler, getRecyclerDashboardStats);

export default router;