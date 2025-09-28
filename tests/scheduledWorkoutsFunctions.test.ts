import { strict as assert } from "assert";
import { getScheduledWorkoutsList } from "../functions/scheduled-workouts";
import {
  create,
  deleteScheduledWorkout,
  getAll,
  getById,
  update,
} from "../functions/workout-schedules";
import { WorkoutScheduleFormData } from "../types/workout";
import { WorkoutType } from "../types/workouts";

type TestFn = () => void | Promise<void>;

type TestCase = {
  name: string;
  fn: TestFn;
};

const tests: TestCase[] = [];
const results: { name: string; error: Error | null }[] = [];

function test(name: string, fn: TestFn) {
  tests.push({ name, fn });
}

type FetchCall = {
  input: Parameters<typeof fetch>[0];
  init: Parameters<typeof fetch>[1];
};

type JsonResponse<T> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

function createJsonResponse<T>(body: T, ok = true): JsonResponse<T> {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  };
}

async function withMockedFetch(
  implementation: (
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1]
  ) => Promise<JsonResponse<unknown>>,
  run: () => Promise<void>
) {
  const originalFetch = global.fetch;
  const calls: FetchCall[] = [];

  global.fetch = (async (input, init) => {
    calls.push({ input, init });
    return implementation(input, init);
  }) as typeof fetch;

  try {
    await run();
  } finally {
    global.fetch = originalFetch;
  }

  return calls;
}

test("getScheduledWorkoutsList requests the calendar window", async () => {
  const startDate = new Date("2024-05-01T00:00:00.000Z");
  const endDate = new Date("2024-05-07T23:59:59.000Z");
  const expected = [{ id: "workout-1" }];

  const calls = await withMockedFetch(async (input) => {
    assert.equal(
      input,
      `/api/scheduled-workouts?startDate=${encodeURIComponent(
        startDate.toISOString()
      )}&endDate=${encodeURIComponent(endDate.toISOString())}`
    );

    return createJsonResponse(expected);
  }, async () => {
    const result = await getScheduledWorkoutsList({ startDate, endDate });
    assert.deepEqual(result, expected);
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].init?.method, "GET");
  assert.equal(
    calls[0].init?.headers &&
      (calls[0].init.headers as Record<string, string>)["Content-Type"],
    "application/json"
  );
});

test("getScheduledWorkoutsList propagates API failures", async () => {
  const startDate = new Date("2024-05-01T00:00:00.000Z");
  const endDate = new Date("2024-05-07T23:59:59.000Z");

  await withMockedFetch(
    async () => createJsonResponse({}, false),
    async () => {
      await assert.rejects(
        () => getScheduledWorkoutsList({ startDate, endDate }),
        /Failed to fetch scheduled workouts/
      );
    }
  );
});

test("workout schedule helpers target the skeletons API", async () => {
  const sample: WorkoutScheduleFormData = {
    scheduleTitle: "Test plan",
    startDate: "2024-04-01",
    raceDate: "2024-06-01",
    raceName: "City Marathon",
    raceType: WorkoutType.RUN,
    raceDistance: "26.2",
    customDistance: "",
    customDistanceUnit: "miles",
    restDay: "monday",
    experienceLevel: "beginner",
    goalTime: "03:30:00",
    goalTimeHours: "03",
    goalTimeMinutes: "30",
    goalTimeSeconds: "00",
    additionalNotes: "",
  };

  let callIndex = 0;

  const calls = await withMockedFetch(async (input, init) => {
    switch (callIndex++) {
      case 0:
        assert.equal(input, "/api/workout-skeletons");
        assert.equal(init?.method ?? "GET", "GET");
        return createJsonResponse([sample]);
      case 1:
        assert.equal(input, "/api/workout-skeletons/42");
        assert.equal(init?.method ?? "GET", "GET");
        return createJsonResponse(sample);
      case 2:
        assert.equal(input, "/api/workout-skeletons");
        assert.equal(init?.method, "POST");
        assert.equal(
          init?.headers &&
            (init.headers as Record<string, string>)["Content-Type"],
          "application/json"
        );
        assert.equal(init?.body, JSON.stringify(sample));
        return createJsonResponse({ ...sample, id: 99 });
      case 3:
        assert.equal(input, "/api/workout-skeletons/99");
        assert.equal(init?.method, "PATCH");
        assert.equal(
          init?.headers &&
            (init.headers as Record<string, string>)["Content-Type"],
          "application/json"
        );
        assert.equal(
          init?.body,
          JSON.stringify({ scheduleTitle: "Updated plan" })
        );
        return createJsonResponse({ ...sample, id: 99, scheduleTitle: "Updated plan" });
      case 4:
        assert.equal(input, "/api/workout-skeletons/99");
        assert.equal(init?.method, "DELETE");
        return createJsonResponse(undefined);
      default:
        throw new Error("Unexpected fetch invocation");
    }
  }, async () => {
    assert.deepEqual(await getAll(), [sample]);
    assert.deepEqual(await getById(42), sample);
    assert.deepEqual(await create(sample), { ...sample, id: 99 });
    assert.deepEqual(
      await update(99, { scheduleTitle: "Updated plan" }),
      { ...sample, id: 99, scheduleTitle: "Updated plan" }
    );
    await deleteScheduledWorkout("99");
  });

  assert.equal(calls.length, 5);
});

test("workout schedule helpers surface non-ok responses", async () => {
  const failingCalls = [
    () => getAll(),
    () => getById(1),
    () => create({} as WorkoutScheduleFormData),
    () => update(1, {}),
    () => deleteScheduledWorkout("1"),
  ];

  for (const call of failingCalls) {
    await withMockedFetch(
      async () => createJsonResponse({}, false),
      async () => {
        await assert.rejects(call, /Failed to (fetch|create|update|delete) workout skeletons?/);
      }
    );
  }
});

(async () => {
  for (const { name, fn } of tests) {
    try {
      await fn();
      results.push({ name, error: null });
    } catch (error) {
      results.push({ name, error: error as Error });
    }
  }

  const failed = results.filter((result) => result.error);

  results.forEach((result) => {
    if (result.error) {
      console.error(`\u2716 ${result.name}`);
      console.error(result.error.message);
    } else {
      console.log(`\u2714 ${result.name}`);
    }
  });

  if (failed.length > 0) {
    process.exitCode = 1;
  }
})();
