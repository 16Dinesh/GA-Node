const express = require("express");
const router = express.Router();
const items = require("../../../controllers/page/items/index");
// const {isLoggedIn} = require('../../../middleware')
const { isLoggedIn } = require("../../../middleware");

router.get("/dashboard", isLoggedIn, items.renderDashboard);
router.get("/services", isLoggedIn, items.rendersServices);
router.get("/products", isLoggedIn, items.renderProducts);
router.get("/payments", isLoggedIn, items.renderPayments);
router.get("/admins", isLoggedIn, items.renderAdmins);
router.get("/users", isLoggedIn, items.renderUsers);
router.get("/teams", isLoggedIn, items.renderTeam);
router.get("/requests", isLoggedIn, items.rendersRequests);
router.get("/feedbacks", isLoggedIn, items.renderFeedbacks);
router.get("/reviews", isLoggedIn, items.rendersReviews);
router.get("/push-notifications", isLoggedIn, items.renderPushNotification);

module.exports = router;
