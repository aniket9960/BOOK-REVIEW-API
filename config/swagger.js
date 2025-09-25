const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express"); 

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book Review API",
      version: "1.0.0",
      description: "API documentation for Book Review App", 
    },
    servers: [
      {
        url: "http://localhost:3000", // Local development
        description: "Local server",
      },
      {
        url: "https://r4wz1z3f-3000.inc1.devtunnels.ms", // Remote dev tunnel
        description: "Remote dev tunnel",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const specs = swaggerJsDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  console.log("📖 Swagger docs available at /api-docs");
};

module.exports = swaggerDocs;
