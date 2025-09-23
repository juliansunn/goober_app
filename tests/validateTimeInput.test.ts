import { strict as assert } from "assert";
import { validateTimeInput } from "../utils/workout-validation";

type TestFn = () => void;

const results: { name: string; error: Error | null }[] = [];

function test(name: string, fn: TestFn) {
  try {
    fn();
    results.push({ name, error: null });
  } catch (error) {
    results.push({ name, error: error as Error });
  }
}

test("allows clearing the field for any time unit", () => {
  assert.equal(validateTimeInput("", "hours"), true);
  assert.equal(validateTimeInput("", "minutes"), true);
  assert.equal(validateTimeInput("", "seconds"), true);
});

test("accepts boundary values for each unit", () => {
  assert.equal(validateTimeInput("0", "hours"), true);
  assert.equal(validateTimeInput("99", "hours"), true);
  assert.equal(validateTimeInput("59", "minutes"), true);
  assert.equal(validateTimeInput("59", "seconds"), true);
});

test("rejects values outside the allowed range", () => {
  assert.equal(validateTimeInput("-1", "hours"), false);
  assert.equal(validateTimeInput("100", "hours"), false);
  assert.equal(validateTimeInput("60", "minutes"), false);
  assert.equal(validateTimeInput("60", "seconds"), false);
});

const failed = results.filter((result) => result.error);

results.forEach((result) => {
  if (result.error) {
    console.error(`✖ ${result.name}`);
    console.error(result.error.message);
  } else {
    console.log(`✔ ${result.name}`);
  }
});

if (failed.length > 0) {
  process.exitCode = 1;
}
