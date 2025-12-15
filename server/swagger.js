module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Learning Platform API",
    version: "1.0.0",
    description: "API платформы интерактивного обучения",
  },
  servers: [{ url: "/" }],
  paths: {
    "/courses": {
      get: {
        summary: "Получить список курсов",
        responses: {
          200: {
            description: "Список курсов",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Course" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Создать курс",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CourseInput" },
            },
          },
        },
        responses: { 201: { description: "Создано" } },
      },
    },

    "/auth/sign-in": {
      post: {
        summary: "Авторизация",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignInInput" },
            },
          },
        },
        responses: {
          200: { description: "OK" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },

  components: {
    schemas: {
      Course: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          createdAt: { type: "integer" },
        },
      },

      CourseInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
        },
      },

      SignInInput: {
        type: "object",
        required: ["email", "passwordHash"],
        properties: {
          email: { type: "string" },
          passwordHash: { type: "string" },
        },
      },
    },
  },
}
