import express from "express";

const router = express.Router();

router.get("/", (req, res) =>
  res.status(200).send("<h1>Hey! This is File Receiver API.</h1>")
);

router.post("/", (req, res) => {
  console.log("Message from Queue: ", req.body);
  return res.status(200).send("<h1>Hey! This is File Receiver API.</h1>");
});

export default router;
