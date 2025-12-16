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
        summary: "Get courses",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create course",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CourseInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/courses/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get course by id",
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
      put: {
        summary: "Update course",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CourseInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        summary: "Delete course",
        responses: { 204: { description: "Deleted" } },
      },
    },

    "/courses/{id}/tasks": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get course tasks",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/tasks/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get task",
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
      put: {
        summary: "Update task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        summary: "Delete task",
        responses: { 204: { description: "Deleted" } },
      },
    },

    "/courses/{id}/lectures": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get course lectures",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create lecture",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LectureInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/lectures/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get lecture",
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
      put: {
        summary: "Update lecture",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LectureInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        summary: "Delete lecture",
        responses: { 204: { description: "Deleted" } },
      },
    },

    "/courses/{id}/modules": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get course modules",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create module",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ModuleInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/modules/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get module",
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
      put: {
        summary: "Update module",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ModuleInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        summary: "Delete module",
        responses: { 204: { description: "Deleted" } },
      },
    },

    "/users": {
      get: { summary: "Get users", responses: { 200: { description: "OK" } } },
      post: {
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/users/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get user",
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
      put: {
        summary: "Update user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        summary: "Delete user",
        responses: { 204: { description: "Deleted" } },
      },
    },

    "/categories": {
      get: {
        summary: "Get categories",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },

    "/tasks/{id}/testcases": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get task testcases",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create testcase",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TestCaseInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/testcases/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get testcase",
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
      put: {
        summary: "Update testcase",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TestCaseInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        summary: "Delete testcase",
        responses: { 204: { description: "Deleted" } },
      },
    },

    "/tasks/{id}/solutions": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get solutions for task",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create solution",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SolutionInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/solutions/{id}/check-results": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get check results",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create check result",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckResultInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/users/{id}/progress": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get user progress",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Create/update progress",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProgressInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },

    "/users/{userId}/stats": {
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        summary: "Get user statistics",
        description:
          "Получить статистику по прогрессу пользователя (всего задач, выполнено, в процессе)",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserStats" },
              },
            },
          },
        },
      },
    },

    "/courses/{courseId}/stats/{userId}": {
      parameters: [
        {
          name: "courseId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        summary: "Get course statistics for user",
        description: "Получить подробную статистику по каждой задаче в курсе",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CourseStats" },
              },
            },
          },
        },
      },
    },

    "/users/{userId}/solutions": {
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        summary: "Get user solutions history",
        description:
          "Получить историю всех решений пользователя с результатами проверки",
        responses: { 200: { description: "OK" } },
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

      Task: {
        type: "object",
        properties: {
          id: { type: "string" },
          courseId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          meta: { type: "string" },
          ord: { type: "integer" },
        },
      },
      TaskInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          meta: { type: "string" },
          ord: { type: "integer" },
        },
      },

      Lecture: {
        type: "object",
        properties: {
          id: { type: "string" },
          courseId: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          ord: { type: "integer" },
        },
      },
      LectureInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          ord: { type: "integer" },
        },
      },

      Module: {
        type: "object",
        properties: {
          id: { type: "string" },
          courseId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          ord: { type: "integer" },
        },
      },
      ModuleInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          ord: { type: "integer" },
        },
      },

      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
      },
      UserInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
      },

      Category: {
        type: "object",
        properties: { id: { type: "string" }, name: { type: "string" } },
      },
      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" } },
      },

      TestCase: {
        type: "object",
        properties: {
          id: { type: "string" },
          task_id: { type: "string" },
          input: { type: "string" },
          expected_output: { type: "string" },
        },
      },
      TestCaseInput: {
        type: "object",
        properties: {
          input: { type: "string" },
          expected_output: { type: "string" },
        },
      },

      Solution: {
        type: "object",
        properties: {
          id: { type: "string" },
          user_id: { type: "string" },
          task_id: { type: "string" },
          code: { type: "string" },
          created_at: { type: "integer" },
        },
      },
      SolutionInput: {
        type: "object",
        required: ["user_id", "code"],
        properties: { user_id: { type: "string" }, code: { type: "string" } },
      },

      CheckResult: {
        type: "object",
        properties: {
          id: { type: "string" },
          solution_id: { type: "string" },
          status: { type: "string" },
          time_ms: { type: "integer" },
          passed_tests: { type: "integer" },
          error_message: { type: "string" },
        },
      },
      CheckResultInput: {
        type: "object",
        properties: {
          status: { type: "string" },
          time_ms: { type: "integer" },
          passed_tests: { type: "integer" },
          error_message: { type: "string" },
        },
      },

      Progress: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          taskId: { type: "string" },
          status: { type: "string" },
          updatedAt: { type: "integer" },
        },
      },
      ProgressInput: {
        type: "object",
        properties: { taskId: { type: "string" }, status: { type: "string" } },
      },

      SignInInput: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string" }, password: { type: "string" } },
      },

      UserStats: {
        type: "object",
        properties: {
          totalTasks: { type: "integer" },
          completedTasks: { type: "integer" },
          inProgressTasks: { type: "integer" },
          notStartedTasks: { type: "integer" },
          completionRate: {
            type: "integer",
            description: "Процент выполнения (0-100)",
          },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                taskId: { type: "string" },
                taskTitle: { type: "string" },
                status: {
                  type: "string",
                  enum: ["not_started", "in_progress", "completed"],
                },
                updatedAt: { type: "integer" },
              },
            },
          },
        },
      },

      CourseStats: {
        type: "object",
        properties: {
          courseId: { type: "string" },
          userId: { type: "string" },
          totalTasks: { type: "integer" },
          completedTasks: { type: "integer" },
          inProgressTasks: { type: "integer" },
          tasksWithAttempts: { type: "integer" },
          overallCompletionRate: { type: "integer" },
          taskStats: {
            type: "array",
            items: {
              type: "object",
              properties: {
                taskId: { type: "string" },
                taskTitle: { type: "string" },
                status: { type: "string" },
                attempts: { type: "integer" },
                lastAttempt: { type: "integer" },
                checkStatus: { type: "string", enum: ["passed", "failed"] },
                passedTests: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
}
