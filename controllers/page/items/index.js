module.exports.renderDashboard = (req, res) => {
  res.render("page/dashboard");
};

module.exports.rendersServices = (req, res) => {
  res.render("page/services");
};

module.exports.renderProducts = (req, res) => {
  res.render("page/products"); 
};

module.exports.renderPayments = (req, res) => {
  res.render("page/payments");
};

module.exports.renderAdmins = (req, res) => {
  res.render("page/admin");
};

module.exports.renderUsers = (req, res) => {
  res.render("page/users");
};

module.exports.renderTeam = (req, res) => {
  res.render("page/Teams"); 
};

module.exports.rendersRequests = (req, res) => {
  res.render("page/requests");
};

module.exports.renderFeedbacks = (req, res) => {
  res.render("page/FeedBacks"); 
};

module.exports.rendersReviews = (req, res) => {
  res.render("page/reviews");
};

module.exports.renderPushNotification = (req, res) => {
  res.render("page/notifications"); 
};
