import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { loginRecycler, logoutRecycler, registerRecycler } from '../controllers/recycler-controller.js';
import { verifyJWTRecycler } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register-recycler").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'shopImage',
            maxCount: 1
        },
        {
            name: 'identity',
            maxCount: 1
        }
    ]),
    registerRecycler
);

router.route("/login-recycler").post(loginRecycler);

router.route("/logout-recycler").post(verifyJWTRecycler, logoutRecycler);

export default router;