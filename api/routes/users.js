const express = require("express");
const { 
    getUsers,
    confirmPhone,
    checkPhone,
    checkAccountStat,
    confirmAccount,
    getRentals,
    addFav,
    deleteuser,
    getClients,
    banUser,
    unbanUser,
    getEmployees,
    newbie,
    verifications,
    updateStat,
    getStatics,
    getVerClients,
    updateUser
} = require("../controllers/userController");

const router = express.Router();

//get all users
router.get("/getusers", getUsers);

// Public Routes
router.post("/confirmphone", confirmPhone);
router.post("/confirmaccount", confirmAccount);
router.post("/add/favorite", addFav);
router.get("/checkphone", checkPhone);
router.get("/rentals", getRentals);
router.get("/checkaccountstat", checkAccountStat);
router.delete("/deleteuser/:id", deleteuser);
router.get("/getClients", getClients);
router.get("/:uid/ban", banUser);
router.get("/:uid/unban", unbanUser);
router.get("/update", updateUser);
router.get("/getEmployees", getEmployees);
router.post("/newbie", newbie);
router.get("/verfications", verifications);
router.get("/clients/statics", getStatics);
router.get("/clients/verified", getVerClients);
router.post("/verfications/update", updateStat);

module.exports = router;
