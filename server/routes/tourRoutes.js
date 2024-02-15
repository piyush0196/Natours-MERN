const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router();

//Check id param middleware
// router.param('id',tourController.checkID)

// Check body middleware

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.authenticate,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.authenticate,
    authController.restrictTo("admin", "lead-guide"),
    tourController.addNewTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.authenticate,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.authenticate,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
