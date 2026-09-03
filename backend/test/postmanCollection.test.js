const path = require("path");

const userCollection = require(
  path.resolve(__dirname, "../../docs/postman/user-backend-api.postman-collection.json"),
);
const publicCollection = require(
  path.resolve(__dirname, "../../docs/postman/public-backend-api.postman-collection.json"),
);
const adminCollection = require(
  path.resolve(__dirname, "../../docs/postman/admin-backend-api.postman-collection.json"),
);
const userRoutes = require("../src/routes/user.routes");
const lessonRoutes = require("../src/routes/lesson.routes");
const dashboardRoutes = require("../src/routes/dashboard.routes");
const profileRoutes = require("../src/routes/profile.routes");
const quizRoutes = require("../src/routes/quiz.routes");

const routeGroups = [
  ["/api/v1/users", userRoutes],
  ["/api/v1/lessons", lessonRoutes],
  ["/api/v1/dashboard", dashboardRoutes],
  ["/api/v1/profile", profileRoutes],
  ["/api/v1/quizzes", quizRoutes],
];

const flattenRequests = (items) =>
  items.flatMap((item) => (item.request ? [item] : flattenRequests(item.item || [])));

const collectionRequests = [
  ...flattenRequests(userCollection.item),
  ...flattenRequests(publicCollection.item),
  ...flattenRequests(adminCollection.item),
];

const expressRoutes = routeGroups.flatMap(([prefix, router]) =>
  router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) =>
      Object.keys(layer.route.methods).map((method) => ({
        method: method.toUpperCase(),
        path: `${prefix}${layer.route.path === "/" ? "" : layer.route.path}`,
      })),
    ),
);

const pathPattern = (routePath) => {
  const escapedPath = routePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapedPath.replace(/:[^/]+/g, "[^/]+")}$`);
};

describe("Local Backend API Postman collections", () => {
  test("represents every mounted Express route", () => {
    const missingRoutes = expressRoutes.filter((route) => {
      return !collectionRequests.some((item) => {
        const requestPath = `/${item.request.url.path.join("/")}`;
        return item.request.method === route.method && pathPattern(route.path).test(requestPath);
      });
    });

    expect(missingRoutes).toEqual([]);
  });

  test("has post-response tests for every request", () => {
    for (const item of collectionRequests) {
      const testEvent = item.event?.find((event) => event.listen === "test");

      expect(testEvent?.script?.exec?.length).toBeGreaterThan(0);
    }
  });
});
