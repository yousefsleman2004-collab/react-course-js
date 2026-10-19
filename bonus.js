import { students } from "./data.js";
import withStatus from "./report.js";

const updatedStudents = withStatus(students);

for (const student of updatedStudents) {
    console.log(`${student.name}: ${student.status}`);
}

console.log(students[0].status);