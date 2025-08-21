import crypto from "crypto";

/**
 * Cookie-based, no-login identity.
 * Assigns a sid cookie if missing.
 */
export default function sessionMiddleware(req, res, next) {
  let sid = req.cookies?.sid;
  if (!sid) {
    sid = crypto.randomUUID();
    // Note: httpOnly true means FE can't read it, which is fine here.
    res.cookie("sid", sid, { httpOnly: true, sameSite: "lax" });
  }
  req.sid = sid;
  next();
}