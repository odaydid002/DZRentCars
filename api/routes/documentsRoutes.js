const express = require("express");
const { getDocs, addDocs, getReq } = require("../controllers/documentsController");

const router = express.Router();

router.get("/getdocs", getDocs);
router.post("/adddocs", addDocs);
router.get("/getreq", getReq);

module.exports = router;
