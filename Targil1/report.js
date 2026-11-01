const withStatus = (studentsArray) => {
    return studentsArray.map(student => ({
        ...student,
        status: student.grade >= 56 ? "pass" : "fail"
    }));
};

export default withStatus;