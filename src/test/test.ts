import "mocha";
import "should";
import authCLI from "../";
import { inject } from "../";

const shouldLib = require("should");

const mockDbPool: any = {};
const mockContext = { id: "context-id" };

describe("scuttlespace-cli-auth", () => {
  it("creates a user", async () => {
    inject({
      auth: {} as any
    });

    const resp = await authCLI(
      "user id jeswin",
      "msg-id",
      "sender-id",
      mockDbPool,
      { hostname: "example.com" },
      mockContext
    );

    console.log(resp);
  });
});
